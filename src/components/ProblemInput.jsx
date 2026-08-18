import { useState, useRef, useEffect } from 'react'
import { useI18n } from '../i18n/index.jsx'
import { validateImageFile, fileToBase64 } from '../lib/imageUtils'
import { extractTextFromImage } from '../lib/vision'

function ImageThumb({ img, onRemove }) {
  return (
    <div className="relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-border bg-control">
      <img src={img.preview} alt="" className="w-full h-full object-cover" draggable={false} />

      {/* Status overlay */}
      {img.status === 'extracting' && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        </div>
      )}
      {img.status === 'done' && (
        <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      {img.status === 'error' && (
        <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center">
          <svg className="w-4 h-4 text-red-300" viewBox="0 0 14 14" fill="none">
            <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.25" />
          </svg>
        </div>
      )}

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(img.id)}
        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-black/70 text-white/60 hover:text-white flex items-center justify-center transition-colors"
        aria-label="Remover imagem"
      >
        <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
          <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

const CameraIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175
         C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15
         A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169
         a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055
         l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0
         2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
    />
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
    />
  </svg>
)

export function ProblemInput({ onSubmit, onCancel, loading, accentClasses }) {
  const { t } = useI18n()
  const [textValue, setTextValue] = useState('')
  const [images, setImages] = useState([])
  // each image: { id, preview, status: 'extracting'|'done'|'error', text, error }
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)
  const imagesRef = useRef(images)
  useEffect(() => { imagesRef.current = images }, [images])
  useEffect(() => () => {
    imagesRef.current.forEach(img => { if (img.preview) URL.revokeObjectURL(img.preview) })
  }, [])

  const hasImages = images.length > 0
  const anyExtracting = images.some(img => img.status === 'extracting')
  const hasContent = images.some(img => img.status === 'done') || textValue.trim().length > 0
  const canSubmit = hasContent && !anyExtracting && !loading

  async function processFile(file) {
    let validationError = null
    try { validateImageFile(file) } catch (err) { validationError = err.message }

    const id = Date.now() + Math.random()
    const preview = URL.createObjectURL(file)

    if (validationError) {
      setImages(prev => [...prev, { id, preview, status: 'error', text: '', error: validationError }])
      return
    }

    setImages(prev => [...prev, { id, preview, status: 'extracting', text: '', error: null }])

    try {
      const { base64, mimeType } = await fileToBase64(file)
      const text = await extractTextFromImage(base64, mimeType)
      setImages(prev => prev.map(img => img.id === id ? { ...img, status: 'done', text } : img))
    } catch (err) {
      setImages(prev => prev.map(img =>
        img.id === id ? { ...img, status: 'error', text: '', error: err.message } : img
      ))
    }
  }

  function handleFileChange(e) {
    for (const file of e.target.files ?? []) processFile(file)
    e.target.value = ''
  }

  function openFilePicker(source) {
    if (!fileInputRef.current) return
    if (source === 'camera') {
      fileInputRef.current.setAttribute('capture', 'environment')
    } else {
      fileInputRef.current.removeAttribute('capture')
    }
    fileInputRef.current.click()
  }

  function removeImage(id) {
    setImages(prev => {
      const img = prev.find(i => i.id === id)
      if (img?.preview) URL.revokeObjectURL(img.preview)
      return prev.filter(i => i.id !== id)
    })
  }

  function handleSubmit() {
    const parts = images.filter(img => img.status === 'done').map(img => img.text)
    if (textValue.trim()) parts.push(textValue.trim())
    const combined = parts.join('\n\n---\n\n')
    if (!combined || loading) return
    onSubmit(combined)
  }

  function handleCancel() {
    images.forEach(img => { if (img.preview) URL.revokeObjectURL(img.preview) })
    setImages([])
    setTextValue('')
    onCancel?.()
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    for (const file of e.dataTransfer.files ?? []) processFile(file)
  }

  return (
    <div className="space-y-3">

      {hasImages ? (
        /* ── Image mode ── */
        <div
          className="rounded-3xl bg-surface border border-border focus-within:border-accent/40 transition-all duration-200"
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
        >
          {/* Thumbnails row */}
          <div className="flex items-center gap-2 px-4 pt-4 flex-wrap">
            {images.map(img => (
              <ImageThumb key={img.id} img={img} onRemove={removeImage} />
            ))}

            {/* Add more images button */}
            <button
              type="button"
              onClick={() => openFilePicker('file')}
              disabled={loading}
              title={t('input.addImage')}
              className="flex-shrink-0 w-14 h-14 rounded-xl border border-dashed border-border
                         hover:border-accent/40 bg-control hover:bg-accent-soft
                         text-faint hover:text-accent flex items-center justify-center
                         transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Optional additional context */}
          <textarea
            ref={textareaRef}
            value={textValue}
            onChange={e => setTextValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('input.contextPlaceholder')}
            rows={2}
            disabled={loading}
            className="w-full resize-none bg-transparent px-5 pt-3 pb-2
                       text-ink placeholder-faint text-sm leading-relaxed
                       focus:outline-none disabled:opacity-40"
          />

          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 pb-3">
            <div className="hidden sm:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-lg bg-accent-soft border border-border text-accent text-[10px] font-bold">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded-lg bg-accent-soft border border-border text-accent text-[10px] font-bold">↵</kbd>
            </div>
            <div className="sm:hidden" />
            <button
              type="button"
              onClick={() => openFilePicker('camera')}
              disabled={loading}
              title={t('input.usePhoto')}
              aria-label={t('input.usePhotoAriaLabel')}
              className="p-1.5 rounded-xl bg-accent-soft text-accent hover:opacity-80 transition-opacity disabled:opacity-30"
            >
              <CameraIcon />
            </button>
          </div>
        </div>

      ) : (
        /* ── Text mode ── */
        <div
          className="rounded-3xl bg-surface border border-border focus-within:border-accent/40 transition-all duration-200"
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
        >
          <textarea
            ref={textareaRef}
            value={textValue}
            onChange={e => setTextValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('input.placeholder')}
            rows={4}
            disabled={loading}
            className="w-full resize-none bg-transparent px-5 pt-4 pb-2
                       text-ink placeholder-faint text-base leading-relaxed
                       focus:outline-none disabled:opacity-40"
          />
          <div className="flex items-center justify-between px-4 pb-3">
            <div className="hidden sm:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-lg bg-accent-soft border border-border text-accent text-[10px] font-bold">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded-lg bg-accent-soft border border-border text-accent text-[10px] font-bold">↵</kbd>
            </div>
            <div className="sm:hidden" />
            <button
              type="button"
              onClick={() => openFilePicker('camera')}
              disabled={loading}
              title={t('input.usePhoto')}
              aria-label={t('input.usePhotoAriaLabel')}
              className="p-1.5 rounded-xl bg-accent-soft text-accent hover:opacity-80 transition-opacity"
            >
              <CameraIcon />
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Extraction errors */}
      {images.some(img => img.status === 'error') && (
        <div className="space-y-1">
          {images.filter(img => img.status === 'error').map(img => (
            <p key={img.id} className="text-xs text-red-600/80 dark:text-red-400/70 px-1">{img.error}</p>
          ))}
        </div>
      )}

      {/* Submit row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-faint">
          {!hasImages && textValue.length > 0
            ? t('input.chars', { count: textValue.length })
            : hasImages && anyExtracting
              ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border border-muted/40 border-t-accent animate-spin" />
                  {t('input.extractingImages')}
                </span>
              )
              : null
          }
        </span>
        <div className="flex items-center gap-2">
          {hasImages && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-2.5 rounded-[18px] text-sm font-semibold
                         text-muted hover:text-ink bg-control hover:bg-accent-soft
                         border border-border transition-all duration-200"
            >
              {t('input.cancel')}
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[18px] text-sm font-semibold text-white
                        transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed
                        focus-ring shadow-lg ${accentClasses.button} ${accentClasses.glow}`}
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                {t('input.generating')}
              </>
            ) : (
              <>
                {t('input.generate')}
                <span className="opacity-70">→</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import ImageInput from './ImageInput'

export function ProblemInput({ onSubmit, loading, accentClasses }) {
  const [value, setValue] = useState('')
  const [showImageInput, setShowImageInput] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleExtracted(text) {
    setValue(text)
    setShowImageInput(false)
  }

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed || loading) return
    onSubmit(trimmed)
  }

  const canSubmit = value.trim().length > 0 && !loading

  return (
    <div className="space-y-3">
      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex: Como calcular a área de um círculo com raio 5?"
          rows={4}
          disabled={loading}
          className="w-full resize-none rounded-2xl bg-white/[0.06] border border-white/10
                     px-5 py-4 text-white/90 placeholder-white/20 text-base leading-relaxed
                     focus:outline-none focus:border-white/20 focus:bg-white/[0.08]
                     transition-all duration-200 disabled:opacity-40"
        />
        {/* Keyboard hint */}
        <div className="absolute bottom-4 left-4 hidden sm:flex items-center gap-1 pointer-events-none">
          <kbd className="px-1.5 py-0.5 rounded-md bg-white/8 border border-white/10 text-white/20 text-[10px] font-mono">
            ⌘
          </kbd>
          <kbd className="px-1.5 py-0.5 rounded-md bg-white/8 border border-white/10 text-white/20 text-[10px] font-mono">
            ↵
          </kbd>
        </div>

        {/* Camera toggle button */}
        <button
          type="button"
          onClick={() => setShowImageInput(v => !v)}
          className={`absolute bottom-3 right-3 p-1.5 rounded-lg transition-colors
            ${showImageInput
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:text-gray-400 hover:bg-gray-800'}`}
          title="Usar foto"
          aria-label="Usar foto do exercício"
        >
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
        </button>
      </div>

      {/* Image input panel */}
      {showImageInput && (
        <ImageInput
          onExtracted={handleExtracted}
          onClose={() => setShowImageInput(false)}
        />
      )}

      {/* Submit row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/20">
          {value.length > 0 && `${value.length} caracteres`}
        </span>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white
                      transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed
                      focus-ring shadow-lg ${accentClasses.button} ${accentClasses.glow}`}
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              A gerar…
            </>
          ) : (
            <>
              Gerar lição
              <span className="opacity-70">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

import { useImageInput } from '../hooks/useImageInput'

export default function ImageInput({ onExtracted, onClose }) {
  const {
    status,
    preview,
    error,
    fileInputRef,
    handleFileChange,
    handleDrop,
    openFilePicker,
    reset,
  } = useImageInput({ onExtracted })

  const isProcessing = status === 'compressing' || status === 'extracting'

  const statusLabel = {
    compressing: 'A comprimir imagem…',
    extracting: 'A extrair texto…',
  }[status] ?? null

  function handleDragOver(e) {
    e.preventDefault()
  }

  function handleReset() {
    reset()
  }

  return (
    <div className="rounded-2xl bg-white/[0.04] border border-dashed border-indigo-800 overflow-hidden">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {preview ? (
        /* Preview area */
        <div className="relative">
          <img
            src={preview}
            alt="Preview do exercício"
            className="w-full max-h-64 object-contain bg-black/20"
          />

          {/* Processing overlay */}
          {isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3
                            bg-black/60 backdrop-blur-sm">
              <span className="w-8 h-8 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin" />
              <span className="text-sm text-white/70">{statusLabel}</span>
            </div>
          )}

          {/* Reset button */}
          {!isProcessing && (
            <button
              onClick={handleReset}
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center
                         rounded-full bg-black/60 text-white/70 hover:text-white hover:bg-black/80
                         transition-colors text-sm"
              aria-label="Remover imagem"
            >
              ✕
            </button>
          )}
        </div>
      ) : (
        /* Drop zone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => openFilePicker('file')}
          className="flex flex-col items-center justify-center gap-3 py-8 px-4 cursor-pointer
                     hover:bg-white/[0.02] transition-colors"
        >
          <svg className="w-8 h-8 text-indigo-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5
                 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5
                 a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75
                 A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
          <p className="text-sm text-white/30 text-center">
            Arrasta uma foto aqui ou clica para selecionar
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="px-4 py-2 text-sm text-red-400 bg-red-950/20">
          {error}
        </p>
      )}

      {/* Bottom action bar */}
      {!preview && (
        <div className="flex items-center gap-2 px-4 pb-4">
          <button
            onClick={(e) => { e.stopPropagation(); openFilePicker('file') }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60
                       bg-gray-800 hover:bg-gray-700 hover:text-white/80 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>
            Carregar ficheiro
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openFilePicker('camera') }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60
                       bg-indigo-950 hover:bg-indigo-900 hover:text-white/80 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
            Câmera
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-auto text-xs text-white/20 hover:text-white/40 transition-colors"
            >
              Fechar
            </button>
          )}
        </div>
      )}
    </div>
  )
}

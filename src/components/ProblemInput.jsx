import { useState, useRef, useEffect } from 'react'

export function ProblemInput({ onSubmit, loading, accentClasses }) {
  const [value, setValue] = useState('')
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
        <div className="absolute bottom-4 right-4 hidden sm:flex items-center gap-1 pointer-events-none">
          <kbd className="px-1.5 py-0.5 rounded-md bg-white/8 border border-white/10 text-white/20 text-[10px] font-mono">
            ⌘
          </kbd>
          <kbd className="px-1.5 py-0.5 rounded-md bg-white/8 border border-white/10 text-white/20 text-[10px] font-mono">
            ↵
          </kbd>
        </div>
      </div>

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

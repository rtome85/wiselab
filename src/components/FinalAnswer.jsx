export function FinalAnswer({ lesson, accentClasses, onReset }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden animate-fadeIn">
      {/* Success banner */}
      <div className={`flex items-center gap-2.5 px-5 py-3 border-b border-white/8 ${accentClasses.badge}`}>
        <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.25" />
          <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-xs font-semibold tracking-widest uppercase">Lição concluída</span>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        {/* Final Answer */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-sm leading-none">🎯</span>
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest">Resposta Final</h3>
          </div>
          <div className={`px-4 py-3.5 rounded-xl border ${accentClasses.border} bg-white/[0.04]`}>
            <p className="text-white/85 text-sm leading-relaxed">{lesson.final_answer}</p>
          </div>
        </div>

        {/* Real World */}
        {lesson.real_world && (
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-sm leading-none">🌍</span>
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest">No Mundo Real</h3>
            </div>
            <div className="px-4 py-3.5 rounded-xl border border-white/8 bg-white/[0.02]">
              <p className="text-white/55 text-sm leading-relaxed">{lesson.real_world}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-white/8 flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-sm text-white/35 hover:text-white/65 transition-colors duration-200 focus-ring"
        >
          <span>↩</span>
          <span>Novo problema</span>
        </button>
        <span className="text-xs text-white/20">WiseLab</span>
      </div>
    </div>
  )
}

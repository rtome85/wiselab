/* Locked placeholder — skeleton-style, not shimmer-animated to avoid distraction */
function LockedStep({ index }) {
  return (
    <div className="flex items-start gap-4 px-5 py-4 rounded-2xl border border-white/[0.05] opacity-35">
      <div className="w-6 h-6 rounded-full border border-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-[10px] text-white/25 font-mono">{index + 1}</span>
      </div>
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="h-2.5 rounded skeleton w-2/3" />
        <div className="h-2 rounded skeleton w-full" />
        <div className="h-2 rounded skeleton w-4/5" />
      </div>
    </div>
  )
}

export function StepCard({ step, index, isActive, isCompleted, accentClasses }) {
  const isVisible = isActive || isCompleted

  if (!isVisible) return <LockedStep index={index} />

  return (
    <div
      className={`rounded-2xl border backdrop-blur-sm transition-all duration-300 animate-fadeIn overflow-hidden ${
        isActive
          ? `${accentClasses.border} bg-white/[0.07] shadow-xl ${accentClasses.glow}`
          : 'border-white/[0.08] bg-white/[0.04]'
      }`}
    >
      {/* Step header */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-3">
        {/* Number / check circle */}
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all duration-300 ${
            isCompleted
              ? `${accentClasses.badge} border-transparent`
              : isActive
              ? `bg-white/10 ${accentClasses.border}`
              : 'bg-white/8 border-white/15'
          }`}
        >
          {isCompleted ? (
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <span className="text-[10px] font-mono text-white/50">{index + 1}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-white/90 text-sm leading-snug pt-0.5">{step.title}</h3>
      </div>

      {/* Body */}
      <div className="px-5 pb-5 pl-[3.25rem] space-y-3">
        {/* Explanation */}
        <p className="text-white/60 text-sm leading-relaxed">{step.explanation}</p>

        {/* Formula block */}
        {step.formula && (
          <div className="px-4 py-3 rounded-xl bg-black/25 border border-white/8">
            <p className="font-mono text-sm text-white/85 text-center tracking-wide">{step.formula}</p>
          </div>
        )}

        {/* ASCII Visual */}
        {step.visual && (
          <div className="rounded-xl bg-black/30 border border-white/8 overflow-x-auto">
            <pre className="px-4 py-3 font-mono text-xs text-white/65 leading-relaxed whitespace-pre">{step.visual}</pre>
          </div>
        )}

        {/* Tip callout */}
        {step.tip && (
          <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-500/8 border border-amber-500/20">
            <span className="text-base leading-none flex-shrink-0 mt-px">💡</span>
            <p className="text-amber-200/75 text-xs leading-relaxed">{step.tip}</p>
          </div>
        )}
      </div>
    </div>
  )
}

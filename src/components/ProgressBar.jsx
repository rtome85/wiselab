export function ProgressBar({ current, total, accentClasses }) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/30">
          {current === 0
            ? 'Começa pelo primeiro passo'
            : current === total
            ? 'Todos os passos concluídos'
            : `${current} de ${total} passos`}
        </span>
        <span className={`text-xs font-mono font-bold ${accentClasses.text}`}>
          {percent}%
        </span>
      </div>
      <div className="h-0.5 rounded-full bg-white/8 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${accentClasses.progress}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

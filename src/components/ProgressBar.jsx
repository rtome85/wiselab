import { useI18n } from '../i18n/useI18n'

export function ProgressBar({ current, total, accentClasses }) {
  const { t } = useI18n()
  const percent = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted">
          {current === 0
            ? t('progress.startFirst')
            : current === total
            ? t('progress.allCompleted')
            : t('progress.steps', { current, total })}
        </span>
        <span className="text-xs font-extrabold text-accent">
          {percent}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-accent-soft overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${accentClasses.progress}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

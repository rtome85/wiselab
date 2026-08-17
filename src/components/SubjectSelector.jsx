/* Segmented control — component.gallery pattern */
import { useI18n } from '../i18n/index.jsx'
import { SUBJECTS } from '../constants/subjects'

export function SubjectSelector({ subject, onChange }) {
  const { t } = useI18n()
  return (
    <div
      role="radiogroup"
      aria-label={t('subjects.ariaLabel')}
      className="flex items-center bg-white/[0.06] border border-white/10 rounded-xl p-1 gap-0.5"
    >
      {SUBJECTS.map((s) => (
        <button
          key={s.id}
          role="radio"
          aria-checked={subject === s.id}
          onClick={() => onChange(s.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 focus-ring ${
            subject === s.id
              ? s.activeClass
              : 'text-white/35 hover:text-white/60 hover:bg-white/5'
          }`}
        >
          {subject === s.id && (
            <span className={`w-1.5 h-1.5 rounded-full ${s.dotClass} flex-shrink-0`} />
          )}
          <span className="font-mono text-sm leading-none">{s.icon}</span>
          <span className="hidden sm:inline">{t(s.tKey)}</span>
        </button>
      ))}
    </div>
  )
}

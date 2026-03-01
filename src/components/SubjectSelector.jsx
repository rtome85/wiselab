const SUBJECTS = [
  {
    id: 'math',
    label: 'Matemática',
    icon: '∑',
    accent: 'indigo',
    activeClass: 'bg-indigo-500/15 text-indigo-300',
    dotClass: 'bg-indigo-400',
  },
  {
    id: 'physics',
    label: 'Física',
    icon: '⚛',
    accent: 'amber',
    activeClass: 'bg-amber-500/15 text-amber-300',
    dotClass: 'bg-amber-400',
  },
  {
    id: 'chemistry',
    label: 'Química',
    icon: '⚗',
    accent: 'emerald',
    activeClass: 'bg-emerald-500/15 text-emerald-300',
    dotClass: 'bg-emerald-400',
  },
]

export function getAccentClasses(subjectId) {
  const subject = SUBJECTS.find((s) => s.id === subjectId)
  if (!subject) return {}

  const map = {
    indigo: {
      button: 'bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600',
      buttonOutline: 'border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10',
      border: 'border-indigo-500/35',
      text: 'text-indigo-400',
      badge: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20',
      progress: 'bg-indigo-500',
      glow: 'shadow-indigo-500/15',
      ring: 'ring-indigo-500/30',
      gradientBg: 'rgba(99, 102, 241, 0.13)',
      dot: 'bg-indigo-400',
    },
    amber: {
      button: 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600',
      buttonOutline: 'border border-amber-500/40 text-amber-400 hover:bg-amber-500/10',
      border: 'border-amber-500/35',
      text: 'text-amber-400',
      badge: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
      progress: 'bg-amber-500',
      glow: 'shadow-amber-500/15',
      ring: 'ring-amber-500/30',
      gradientBg: 'rgba(245, 158, 11, 0.10)',
      dot: 'bg-amber-400',
    },
    emerald: {
      button: 'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600',
      buttonOutline: 'border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10',
      border: 'border-emerald-500/35',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20',
      progress: 'bg-emerald-500',
      glow: 'shadow-emerald-500/15',
      ring: 'ring-emerald-500/30',
      gradientBg: 'rgba(16, 185, 129, 0.10)',
      dot: 'bg-emerald-400',
    },
  }

  return map[subject.accent] || map.indigo
}

/* Segmented control — component.gallery pattern */
export function SubjectSelector({ subject, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Disciplina"
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
          <span className="hidden sm:inline">{s.label}</span>
        </button>
      ))}
    </div>
  )
}

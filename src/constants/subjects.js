export const DEFAULT_SUBJECT_ID = 'math'

export const SUBJECTS = [
  {
    id: 'math',
    tKey: 'subjects.math',
    icon: '∑',
    accent: 'indigo',
    activeClass: 'bg-indigo-500/15 text-indigo-300',
    dotClass: 'bg-indigo-400',
  },
  {
    id: 'physics',
    tKey: 'subjects.physics',
    icon: '⚛',
    accent: 'amber',
    activeClass: 'bg-amber-500/15 text-amber-300',
    dotClass: 'bg-amber-400',
  },
  {
    id: 'chemistry',
    tKey: 'subjects.chemistry',
    icon: '⚗',
    accent: 'emerald',
    activeClass: 'bg-emerald-500/15 text-emerald-300',
    dotClass: 'bg-emerald-400',
  },
]

export const SUBJECT_ACCENT_CLASSES = {
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

export function getSubjectAccentClasses(subjectId) {
  const subject = SUBJECTS.find((s) => s.id === subjectId)
  if (!subject) return {}

  return SUBJECT_ACCENT_CLASSES[subject.accent] || SUBJECT_ACCENT_CLASSES.indigo
}

export const DEFAULT_ACCENT_CLASSES = getSubjectAccentClasses(DEFAULT_SUBJECT_ID)

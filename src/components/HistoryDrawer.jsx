import { useEffect } from 'react'
import { useI18n, DATE_LOCALES } from '../i18n/index.jsx'

function EmptyState({ t }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-16 px-6 text-center">
      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
        <span className="text-lg">🧠</span>
      </div>
      <p className="text-white/40 text-sm font-medium">{t('history.empty')}</p>
      <p className="text-white/20 text-xs leading-relaxed">
        {t('history.emptyDesc')}
      </p>
    </div>
  )
}

function HistoryItem({ entry, onSelect, onDelete, formatDate, t }) {
  return (
    <div className="group relative px-3">
      <button
        onClick={() => onSelect(entry)}
        className="w-full text-left px-3 py-3 rounded-xl hover:bg-white/[0.05] transition-colors duration-150"
      >
        {/* Date */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-white/25">{formatDate(entry.createdAt)}</span>
        </div>

        {/* Lesson title */}
        <p className="text-white/80 text-sm font-medium leading-snug line-clamp-1">
          {entry.lesson.title}
        </p>

        {/* Problem */}
        <p className="text-white/30 text-xs leading-relaxed line-clamp-2 mt-0.5">
          {entry.problem}
        </p>
      </button>

      {/* Delete button — visible on hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }}
        aria-label={t('history.deleteLesson')}
        className="absolute top-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center
                   text-white/0 group-hover:text-white/35 hover:!text-red-400 hover:bg-red-500/10
                   transition-all duration-150"
      >
        <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}

export function HistoryDrawer({ open, onClose, history, onSelect, onDelete, onClear }) {
  const { t, language } = useI18n()

  function formatDate(iso) {
    const date = new Date(iso)
    const now  = new Date()
    const diffDays = Math.floor((now - date) / 86_400_000)
    const dateLocale = DATE_LOCALES[language] || 'en-GB'

    if (diffDays === 0) {
      const hh = date.getHours().toString().padStart(2, '0')
      const mm = date.getMinutes().toString().padStart(2, '0')
      return t('history.today', { time: `${hh}:${mm}` })
    }
    if (diffDays === 1) return t('history.yesterday')
    return date.toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  /* Close on Escape */
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  /* Prevent body scroll while open */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300
                    ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t('history.ariaLabel')}
        className={`fixed top-0 left-0 z-40 h-full w-72 sm:w-80
                    bg-[#0d0d14] border-r border-white/[0.07]
                    flex flex-col
                    transition-transform duration-300 ease-out
                    ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base leading-none">🧠</span>
            <h2 className="font-semibold text-white/90 text-sm">{t('history.title')}</h2>
            {history.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-white/8 text-white/35 text-[10px] font-mono">
                {history.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label={t('history.close')}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/35
                       hover:text-white/70 hover:bg-white/8 transition-colors focus-ring"
          >
            <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
          {history.length === 0 ? (
            <EmptyState t={t} />
          ) : (
            history.map((entry) => (
              <HistoryItem
                key={entry.id}
                entry={entry}
                onSelect={(e) => { onSelect(e); onClose() }}
                onDelete={onDelete}
                formatDate={formatDate}
                t={t}
              />
            ))
          )}
        </div>

        {/* Footer — clear all */}
        {history.length > 0 && (
          <div className="px-5 py-4 border-t border-white/[0.07] flex-shrink-0">
            <button
              onClick={onClear}
              className="text-xs text-white/25 hover:text-red-400 transition-colors duration-200 focus-ring"
            >
              {t('history.clearAll')}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

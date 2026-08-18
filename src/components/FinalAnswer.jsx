import { useState } from 'react'
import { MathText } from './MathText'
import { useI18n } from '../i18n/index.jsx'
import { copyLesson, downloadLesson } from '../lib/exportLesson'

export function FinalAnswer({ lesson, accentClasses, onReset }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await copyLesson(lesson)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — silently ignore
    }
  }

  function handleDownload() {
    downloadLesson(lesson)
  }

  return (
    <div className="rounded-3xl border border-border bg-surface overflow-hidden animate-fadeIn">
      {/* Success banner */}
      <div className={`flex items-center gap-2.5 px-5 py-3 border-b border-border ${accentClasses.badge}`}>
        <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.25" />
          <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-xs font-semibold tracking-widest uppercase">{t('finalAnswer.completed')}</span>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        {/* Final Answer */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-sm leading-none">🎯</span>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-widest">{t('finalAnswer.title')}</h3>
          </div>
          <div className={`px-4 py-3.5 rounded-xl border ${accentClasses.border} bg-accent-soft`}>
            <MathText className="text-ink text-sm leading-relaxed">{lesson.final_answer}</MathText>
          </div>
        </div>

        {/* Real World */}
        {lesson.real_world && (
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-sm leading-none">🌍</span>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-widest">{t('finalAnswer.realWorld')}</h3>
            </div>
            <div className="px-4 py-3.5 rounded-xl border border-border bg-control">
              <MathText className="text-muted text-sm leading-relaxed">{lesson.real_world}</MathText>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-border flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors duration-200 focus-ring"
        >
          <span>↩</span>
          <span>{t('finalAnswer.newProblem')}</span>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            title={copied ? t('finalAnswer.copied') : t('finalAnswer.copy')}
            aria-label={copied ? t('finalAnswer.copied') : t('finalAnswer.copy')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted hover:text-ink hover:bg-control transition-colors duration-200 focus-ring"
          >
            {copied ? (
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                <rect x="5" y="1" width="8" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
                <path d="M9 11v1.5A1.5 1.5 0 017.5 14h-6A1.5 1.5 0 010 12.5v-8A1.5 1.5 0 011.5 3H3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
              </svg>
            )}
            <span>{copied ? t('finalAnswer.copied') : t('finalAnswer.copy')}</span>
          </button>
          <button
            onClick={handleDownload}
            title={t('finalAnswer.download')}
            aria-label={t('finalAnswer.download')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted hover:text-ink hover:bg-control transition-colors duration-200 focus-ring"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1 10v1.5A1.5 1.5 0 002.5 13h9a1.5 1.5 0 001.5-1.5V10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
            </svg>
            <span>{t('finalAnswer.download')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

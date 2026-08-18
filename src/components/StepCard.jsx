/* Collapsed stack card — compact summary for a completed step tucked behind the active card */
const COLLAPSED_HEIGHT = 56

// How much of a collapsed card stays visible (its header) once the card in front of it overlaps it.
export function collapsedPeek(depth) {
  return Math.max(44 - (depth - 1) * 8, 16)
}

// Negative margin (toward the neighbor in front) needed to produce that peek.
export function collapsedOverlap(depth) {
  return -(COLLAPSED_HEIGHT - collapsedPeek(depth))
}

export function CollapsedStepCard({ step, index, depth, isFirst, side, isCompleted, accentClasses, onClick }) {
  const { t } = useI18n()
  const scale = Math.max(1 - depth * 0.03, 0.9)
  const opacity = Math.max(1 - depth * 0.12, 0.45)

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t('lesson.goToStep', { number: index + 1, title: step.title })}
      className="relative w-full h-14 flex items-center gap-3 px-5 rounded-3xl border border-border bg-surface
                 transition-all duration-300 ease-out cursor-pointer hover:brightness-[0.98] focus-ring"
      style={{
        marginTop: isFirst ? 0 : collapsedOverlap(depth),
        zIndex: 40 - depth,
        transform: `scale(${scale})`,
        opacity,
        transformOrigin: side === 'below' ? 'top center' : 'bottom center',
      }}
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border ${
          isCompleted ? `${accentClasses.badge} border-transparent` : 'bg-control border-border'
        }`}
      >
        {isCompleted ? (
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span className="text-[10px] font-bold">{index + 1}</span>
        )}
      </div>
      <h3 className="font-bold text-ink text-sm truncate">{step.title}</h3>
    </button>
  )
}

import { useState, useEffect, useId } from 'react'
import { MathBlock } from './MathBlock'
import { MathText } from './MathText'
import { simplifyExplanation, askConfusedHelp } from '../lib/ollama'
import { useConfusedChat } from '../hooks/useConfusedChat'
import { ConfusedChat } from './ConfusedChat'
import { useI18n } from '../i18n/index.jsx'

function SimplifyButton({ stepTitle, stepExplanation }) {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [simplified, setSimplified] = useState(null)
  const [error, setError] = useState(null)

  const handleClick = async () => {
    if (isOpen) {
      setIsOpen(false)
      return
    }

    if (simplified) {
      setIsOpen(true)
      return
    }

    setIsLoading(true)
    setError(null)
    setIsOpen(true)

    try {
      const result = await simplifyExplanation(stepTitle, stepExplanation)
      setSimplified(result)
    } catch (err) {
      setError(err.message || t('step.simplifyError'))
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-ink hover:bg-control transition-all duration-200"
      >
        <span>{isOpen ? '▲' : '▼'}</span>
        <span>{t('step.simplify')}</span>
        {isLoading && (
          <span className="animate-spin ml-1">⏳</span>
        )}
      </button>

      {isOpen && (
        <div className="mt-2 p-3.5 rounded-2xl bg-accent-soft border border-accent/25 animate-fadeIn">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🧒</span>
            <span className="text-xs font-bold text-accent uppercase tracking-wide">{t('step.simpleVersion')}</span>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-2.5 rounded skeleton w-full" />
              <div className="h-2 rounded skeleton w-4/5" />
            </div>
          ) : error ? (
            <p className="text-red-600/90 dark:text-red-400/80 text-sm">{error}</p>
          ) : simplified ? (
            <MathText className="text-muted text-sm leading-relaxed">{simplified}</MathText>
          ) : null}
        </div>
      )}
    </div>
  )
}

function ConfusedChatWrapper({ stepIndex, stepContext, forceOpenSignal, prefillMessage }) {
  const { t } = useI18n()
  const { getConversation, setConversations, setPendingStep, isLoading } = useConfusedChat()
  const conversation = getConversation(stepIndex)
  const loading = isLoading(stepIndex)

  const handleSendMessage = async (idx, context, message) => {
    setConversations(prev => ({
      ...prev,
      [idx]: [...(prev[idx] || []), { role: 'user', content: message }]
    }))

    setPendingStep(idx)

    try {
      const history = conversation || []
      const response = await askConfusedHelp(context, message, history)
      
      setConversations(prev => ({
        ...prev,
        [idx]: [...(prev[idx] || []), { role: 'assistant', content: response }]
      }))
    } catch (err) {
      setConversations(prev => ({
        ...prev,
        [idx]: [
          ...(prev[idx] || []),
          { role: 'error', content: t('step.errorHelp') }
        ]
      }))
    } finally {
      setPendingStep(null)
    }
  }

  return (
    <ConfusedChat
      stepIndex={stepIndex}
      stepContext={stepContext}
      conversation={conversation}
      onSendMessage={handleSendMessage}
      isLoading={loading}
      forceOpenSignal={forceOpenSignal}
      prefillMessage={prefillMessage}
    />
  )
}

function Challenge({ challenge, onComplete, onAskTutor }) {
  const { t } = useI18n()
  const questionId = useId()
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  useEffect(() => {
    setSelected(null)
    setShowResult(false)
    setIsCorrect(false)
  }, [challenge])

  const handleSelect = (index) => {
    if (showResult) return
    setSelected(index)
  }

  const handleSubmit = () => {
    if (selected === null) return
    setIsCorrect(selected === challenge.correct)
    setShowResult(true)
  }

  const selectedExplanation = challenge.explanations?.[selected]
  const correctExplanation = challenge.explanations?.[challenge.correct]

  return (
    <div className="mt-4 p-4 rounded-[18px] bg-peach">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">🎯</span>
        <span className="text-xs font-extrabold text-ink uppercase tracking-wide">{t('step.challenge')}</span>
      </div>
      <p id={questionId} className="text-ink text-sm leading-relaxed mb-3">{challenge.question}</p>
      <div role="radiogroup" aria-labelledby={questionId} className="space-y-2">
        {challenge.options.map((option, index) => {
          const isSelected = selected === index
          const isCorrectOption = showResult && index === challenge.correct
          const isWrongOption = showResult && isSelected && !isCorrect

          return (
            <button
              key={index}
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(index)}
              disabled={showResult}
              className={`w-full text-left px-3.5 py-2.5 rounded-[14px] text-sm font-semibold transition-all duration-200 border focus-ring
                ${showResult
                  ? isCorrectOption
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-200'
                    : isWrongOption
                    ? 'bg-red-500/15 border-red-500/40 text-red-600 dark:text-red-200'
                    : 'bg-surface border-border text-muted'
                  : isSelected
                    ? 'bg-accent-soft border-border text-ink'
                    : 'bg-surface border-border text-ink dark:text-accent hover:bg-accent-soft'
                }
                ${showResult ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <span className="font-extrabold mr-2">{String.fromCharCode(65 + index)}.</span>
              {option}
            </button>
          )
        })}
      </div>
      {!showResult && (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className={`mt-3 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
            ${selected !== null
              ? 'bg-accent text-white dark:text-app hover:opacity-90'
              : 'bg-control text-faint cursor-not-allowed'
            }
          `}
        >
          {t('step.verify')}
        </button>
      )}
      {showResult && (
        <div className="mt-3 space-y-2.5">
          <div
            role="status"
            className={`flex items-center gap-2 text-sm font-semibold ${
              isCorrect ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-600 dark:text-red-300'
            }`}
          >
            <span>{isCorrect ? '✓' : '✗'}</span>
            <span>{isCorrect ? t('step.correct') : t('step.incorrect')}</span>
          </div>

          {!isCorrect && selectedExplanation && (
            <p className="text-sm text-red-700 dark:text-red-200/80 leading-relaxed">
              <span className="font-extrabold mr-1">{String.fromCharCode(65 + selected)}.</span>
              {selectedExplanation}
            </p>
          )}

          {correctExplanation && (
            <p className="text-sm text-muted leading-relaxed">
              <span className="font-extrabold text-ink mr-1">{String.fromCharCode(65 + challenge.correct)}.</span>
              {correctExplanation}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={onComplete}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-accent text-white dark:text-app hover:opacity-90 transition-all duration-200"
            >
              {t('step.continue')}
            </button>
            {!isCorrect && (
              <button
                onClick={() => onAskTutor?.(challenge)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-violet-700 dark:text-violet-200 bg-violet-500/10 hover:bg-violet-500/20 transition-all duration-200"
              >
                <span>❓</span>
                <span>{t('step.stillNotSure')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function StepCard({ step, index, isActive, isCompleted, accentClasses, challengeCompleted, onCompleteChallenge }) {
  const { t } = useI18n()
  const [tutorNudge, setTutorNudge] = useState({ signal: 0, prefill: '' })

  const handleAskTutor = (challenge) => {
    setTutorNudge({
      signal: Date.now(),
      prefill: t('chat.challengeHelpPrompt', { question: challenge.question }),
    })
  }

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 animate-fadeIn overflow-hidden ${
        isActive
          ? `border-accent bg-[var(--color-active-bg)] shadow-xl ${accentClasses.glow}`
          : 'border-border bg-surface'
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
              ? 'bg-accent-soft text-accent border-transparent'
              : 'bg-control border-border'
          }`}
        >
          {isCompleted ? (
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <span className="text-[10px] font-bold">{index + 1}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-extrabold text-ink text-[15px] leading-snug pt-0.5">{step.title}</h3>
      </div>

      {/* Body */}
      <div className="px-5 pb-5 pl-[3.25rem] space-y-3">
        {/* Explanation */}
        <MathText className="text-muted text-sm leading-relaxed">{step.explanation}</MathText>

        {/* Formula block */}
        {step.formula && <MathBlock formula={step.formula} />}

        {/* ASCII Visual */}
        {step.visual && (
          <div className="rounded-xl bg-control border border-border overflow-x-auto">
            <pre className="px-4 py-3 font-mono text-xs text-ink leading-relaxed whitespace-pre">{step.visual}</pre>
          </div>
        )}

        {/* Tip callout */}
        {step.tip && (
          <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
            <span className="text-base leading-none flex-shrink-0 mt-px">💡</span>
            <MathText className="text-amber-700 dark:text-amber-200/75 text-xs leading-relaxed">{step.tip}</MathText>
          </div>
        )}

        {/* Challenge */}
        {isActive && step.challenge && !challengeCompleted?.has(index) && (
          <Challenge
            challenge={step.challenge}
            onComplete={() => onCompleteChallenge?.(index)}
            onAskTutor={handleAskTutor}
          />
        )}

        {/* Simplify toggle */}
        {isActive && (
          <SimplifyButton stepTitle={step.title} stepExplanation={step.explanation} />
        )}

        {/* Confused chat */}
        {isActive && (
          <ConfusedChatWrapper
            stepIndex={index}
            stepContext={{
              title: step.title,
              explanation: step.explanation,
              formula: step.formula,
              visual: step.visual,
              tip: step.tip,
            }}
            forceOpenSignal={tutorNudge.signal}
            prefillMessage={tutorNudge.prefill}
          />
        )}
      </div>
    </div>
  )
}

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

import { useState, useRef, useEffect } from 'react'
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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white/70 hover:bg-white/[0.04] transition-all duration-200"
      >
        <span>{isOpen ? '▲' : '▼'}</span>
        <span>{t('step.simplify')}</span>
        {isLoading && (
          <span className="animate-spin ml-1">⏳</span>
        )}
      </button>

      {isOpen && (
        <div className="mt-2 p-3.5 rounded-xl bg-sky-500/8 border border-sky-500/20 animate-fadeIn">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🧒</span>
            <span className="text-xs font-medium text-sky-200/80 uppercase tracking-wide">{t('step.simpleVersion')}</span>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-2.5 rounded skeleton w-full" />
              <div className="h-2 rounded skeleton w-4/5" />
            </div>
          ) : error ? (
            <p className="text-red-400/80 text-sm">{error}</p>
          ) : simplified ? (
            <MathText className="text-white/70 text-sm leading-relaxed">{simplified}</MathText>
          ) : null}
        </div>
      )}
    </div>
  )
}

function ConfusedChatWrapper({ stepIndex, stepContext }) {
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
    />
  )
}

function Challenge({ challenge, onComplete }) {
  const { t } = useI18n()
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    setSelected(null)
    setShowResult(false)
    setIsCorrect(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [challenge])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleSelect = (index) => {
    if (showResult) return
    setSelected(index)
  }

  const handleSubmit = () => {
    if (selected === null) return
    const correct = selected === challenge.correct
    setIsCorrect(correct)
    setShowResult(true)
    if (correct) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => onComplete(), 600)
    }
  }

  const handleRetry = () => {
    setSelected(null)
    setShowResult(false)
    setIsCorrect(false)
  }

  return (
    <div className="mt-4 p-4 rounded-xl bg-indigo-500/8 border border-indigo-500/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">🎯</span>
        <span className="text-xs font-medium text-indigo-200/80 uppercase tracking-wide">{t('step.challenge')}</span>
      </div>
      <p className="text-white/70 text-sm leading-relaxed mb-3">{challenge.question}</p>
      <div className="space-y-2">
        {challenge.options.map((option, index) => {
          const isSelected = selected === index
          const isCorrectOption = showResult && index === challenge.correct
          const isWrongOption = showResult && isSelected && !isCorrect
          
          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={showResult}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 border
                ${showResult
                  ? isCorrectOption
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                    : isWrongOption
                    ? 'bg-red-500/15 border-red-500/40 text-red-200'
                    : 'bg-white/[0.03] border-white/8 text-white/50'
                  : isSelected
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-white/90'
                    : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06] hover:border-white/20'
                }
                ${showResult ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
              {option}
            </button>
          )
        })}
      </div>
      {!showResult && (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${selected !== null
              ? 'bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30'
              : 'bg-white/[0.03] text-white/30 cursor-not-allowed'
            }
          `}
        >
          {t('step.verify')}
        </button>
      )}
      {showResult && !isCorrect && (
        <button
          onClick={handleRetry}
          className="mt-3 px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.05] text-white/70 hover:bg-white/[0.08] transition-all duration-200"
        >
          {t('step.tryAgain')}
        </button>
      )}
      {showResult && isCorrect && (
        <div className="mt-3 flex items-center gap-2 text-emerald-300 text-sm">
          <span>✓</span>
          <span>{t('step.correct')}</span>
        </div>
      )}
    </div>
  )
}

export function StepCard({ step, index, isActive, isCompleted, accentClasses, challengeCompleted, onCompleteChallenge }) {
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
        <MathText className="text-white/60 text-sm leading-relaxed">{step.explanation}</MathText>

        {/* Formula block */}
        {step.formula && <MathBlock formula={step.formula} />}

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
            <MathText className="text-amber-200/75 text-xs leading-relaxed">{step.tip}</MathText>
          </div>
        )}

        {/* Challenge */}
        {isActive && step.challenge && !challengeCompleted?.has(index) && (
          <Challenge
            challenge={step.challenge}
            onComplete={() => onCompleteChallenge?.(index)}
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
          />
        )}
      </div>
    </div>
  )
}

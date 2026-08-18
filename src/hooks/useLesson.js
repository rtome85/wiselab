import { useState, useCallback } from 'react'
import { generateLesson } from '../lib/ollama'
import { clearConfusedConversations } from './useConfusedChat'
import { useI18n } from '../i18n/useI18n'

const ERROR_CODE_KEYS = {
  auth: 'errors.auth',
  network: 'errors.network',
  rateLimit: 'errors.rateLimit',
  server: 'errors.server',
  malformed: 'errors.malformed',
}

export function useLesson() {
  const { t } = useI18n()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [activeStep, setActiveStep] = useState(0)
  const [maxStepReached, setMaxStepReached] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [showAnswer, setShowAnswer] = useState(false)
  const [challengeCompleted, setChallengeCompleted] = useState(new Set())

  const generate = useCallback(async (problem, onSuccess) => {
    clearConfusedConversations()
    setLoading(true)
    setProgress(0)
    setError(null)
    setLesson(null)
    setActiveStep(0)
    setMaxStepReached(0)
    setCompletedSteps(new Set())
    setShowAnswer(false)
    setChallengeCompleted(new Set())

    try {
      const data = await generateLesson(problem, setProgress)
      setLesson(data)
      onSuccess?.(data)
    } catch (err) {
      setError(t(ERROR_CODE_KEYS[err.code] || 'errors.generic'))
    } finally {
      setLoading(false)
    }
  }, [t])

  const restore = useCallback((lessonData) => {
    clearConfusedConversations()
    setLesson(lessonData)
    setActiveStep(0)
    setMaxStepReached(0)
    setCompletedSteps(new Set())
    setShowAnswer(false)
    setChallengeCompleted(new Set())
    setError(null)
    setLoading(false)
  }, [])

  const completeChallenge = useCallback((stepIndex) => {
    setChallengeCompleted((prev) => {
      const next = new Set(prev)
      next.add(stepIndex)
      return next
    })
  }, [])

  const hasChallenge = useCallback((stepIndex) => {
    return lesson?.steps?.[stepIndex]?.challenge != null
  }, [lesson])

  const canProceed = useCallback((stepIndex) => {
    if (!lesson?.steps?.[stepIndex]?.challenge) return true
    return challengeCompleted.has(stepIndex)
  }, [lesson, challengeCompleted])

  const goToStep = useCallback((stepIndex) => {
    if (!lesson) return
    if (stepIndex < 0 || stepIndex > maxStepReached) return
    setActiveStep(stepIndex)
    setShowAnswer(false)
  }, [lesson, maxStepReached])

  const nextStep = useCallback(() => {
    if (!lesson) return
    if (!canProceed(activeStep)) return

    setCompletedSteps((prev) => {
      const next = new Set(prev)
      next.add(activeStep)
      return next
    })

    if (activeStep < lesson.steps.length - 1) {
      const nextIndex = activeStep + 1
      setActiveStep(nextIndex)
      setMaxStepReached((prev) => Math.max(prev, nextIndex))
    } else {
      setShowAnswer(true)
    }
  }, [activeStep, lesson, canProceed])

  const reset = useCallback(() => {
    clearConfusedConversations()
    setLesson(null)
    setLoading(false)
    setError(null)
    setActiveStep(0)
    setMaxStepReached(0)
    setCompletedSteps(new Set())
    setShowAnswer(false)
    setChallengeCompleted(new Set())
  }, [])

  return {
    lesson,
    loading,
    progress,
    error,
    activeStep,
    maxStepReached,
    completedSteps,
    showAnswer,
    challengeCompleted,
    hasChallenge,
    canProceed,
    generate,
    restore,
    nextStep,
    goToStep,
    reset,
    completeChallenge,
  }
}
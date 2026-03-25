import { useState, useCallback } from 'react'
import { generateLesson } from '../lib/ollama'

export function useLesson() {
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [showAnswer, setShowAnswer] = useState(false)
  const [challengeCompleted, setChallengeCompleted] = useState(new Set())

  const generate = useCallback(async (problem, onSuccess) => {
    setLoading(true)
    setProgress(0)
    setError(null)
    setLesson(null)
    setActiveStep(0)
    setCompletedSteps(new Set())
    setShowAnswer(false)
    setChallengeCompleted(new Set())

    try {
      const data = await generateLesson(problem, setProgress)
      setLesson(data)
      onSuccess?.(data)
    } catch (err) {
      setError(err.message || 'Erro ao gerar a lição.')
    } finally {
      setLoading(false)
    }
  }, [])

  const restore = useCallback((lessonData) => {
    setLesson(lessonData)
    setActiveStep(0)
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

  const nextStep = useCallback(() => {
    if (!lesson) return
    if (!canProceed(activeStep)) return

    setCompletedSteps((prev) => {
      const next = new Set(prev)
      next.add(activeStep)
      return next
    })

    if (activeStep < lesson.steps.length - 1) {
      setActiveStep((prev) => prev + 1)
    } else {
      setShowAnswer(true)
    }
  }, [activeStep, lesson, canProceed])

  const reset = useCallback(() => {
    setLesson(null)
    setLoading(false)
    setError(null)
    setActiveStep(0)
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
    completedSteps,
    showAnswer,
    challengeCompleted,
    hasChallenge,
    canProceed,
    generate,
    restore,
    nextStep,
    reset,
    completeChallenge,
  }
}
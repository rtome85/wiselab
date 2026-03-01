import { useState, useCallback } from 'react'
import { generateLesson } from '../lib/ollama'

export function useLesson() {
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [showAnswer, setShowAnswer] = useState(false)

  const generate = useCallback(async (subject, problem) => {
    setLoading(true)
    setError(null)
    setLesson(null)
    setActiveStep(0)
    setCompletedSteps(new Set())
    setShowAnswer(false)

    try {
      const data = await generateLesson(subject, problem)
      setLesson(data)
    } catch (err) {
      setError(err.message || 'Erro ao gerar a lição.')
    } finally {
      setLoading(false)
    }
  }, [])

  const nextStep = useCallback(() => {
    if (!lesson) return

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
  }, [activeStep, lesson])

  const reset = useCallback(() => {
    setLesson(null)
    setLoading(false)
    setError(null)
    setActiveStep(0)
    setCompletedSteps(new Set())
    setShowAnswer(false)
  }, [])

  return {
    lesson,
    loading,
    error,
    activeStep,
    completedSteps,
    showAnswer,
    generate,
    nextStep,
    reset,
  }
}

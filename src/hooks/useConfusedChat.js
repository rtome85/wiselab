import { useState, useCallback, useEffect } from 'react'

let conversationCache = {}
let pendingStepCache = null

export function clearConfusedConversations() {
  conversationCache = {}
  sessionStorage.removeItem('confusedConversations')
}

export function useConfusedChat() {
  const [conversations, setConversations] = useState(conversationCache)
  const [pendingStep, setPendingStep] = useState(pendingStepCache)

  useEffect(() => {
    // Lesson state is not persisted across page refreshes, so any stored
    // chat data is stale — clear it on mount instead of loading it back.
    clearConfusedConversations()
    setConversations({})
  }, [])

  useEffect(() => {
    if (Object.keys(conversations).length > 0) {
      sessionStorage.setItem('confusedConversations', JSON.stringify(conversations))
    }
  }, [conversations])

  useEffect(() => {
    pendingStepCache = pendingStep
  }, [pendingStep])

  const getConversation = useCallback((stepIndex) => {
    return conversations[stepIndex] || []
  }, [conversations])

  const hasConversation = useCallback((stepIndex) => {
    return (conversations[stepIndex]?.length || 0) > 0
  }, [conversations])

  const isLoading = useCallback((stepIndex) => {
    return pendingStep === stepIndex
  }, [pendingStep])

  const clearConversations = useCallback(() => {
    setConversations({})
    conversationCache = {}
    sessionStorage.removeItem('confusedConversations')
  }, [])

  return {
    getConversation,
    hasConversation,
    isLoading,
    clearConversations,
    setConversations,
    setPendingStep,
  }
}
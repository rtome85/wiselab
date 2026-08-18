import { useState, useCallback, useEffect } from 'react'

let conversationCache = {}
let pendingStepCache = null

export function clearConfusedConversations() {
  conversationCache = {}
  pendingStepCache = null
  sessionStorage.removeItem('confusedConversations')
}

export function useConfusedChat() {
  const [conversations, setConversations] = useState(conversationCache)
  const [pendingStep, setPendingStep] = useState(pendingStepCache)

  useEffect(() => {
    // Lesson state is not persisted across page refreshes, so any stored
    // chat data is stale — clear it on mount instead of loading it back.
    // conversationCache is only ever assigned {}, so the initial useState
    // above already seeds `conversations` correctly; this just clears the
    // external sessionStorage copy.
    clearConfusedConversations()
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
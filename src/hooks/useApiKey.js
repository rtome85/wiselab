import { useState, useCallback } from 'react'

const STORAGE_KEY = 'wiselab_api_key'

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || ''
  })

  const setApiKey = useCallback((key) => {
    if (key) {
      localStorage.setItem(STORAGE_KEY, key)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setApiKeyState(key || '')
  }, [])

  const clearApiKey = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setApiKeyState('')
  }, [])

  const hasApiKey = Boolean(apiKey)
  const isConfigured = hasApiKey

  const getEffectiveKey = useCallback(() => {
    return apiKey
  }, [apiKey])

  return {
    apiKey,
    setApiKey,
    clearApiKey,
    hasApiKey,
    isConfigured,
    getEffectiveKey,
  }
}
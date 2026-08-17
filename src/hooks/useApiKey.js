import { useState, useCallback } from 'react'
import { API_KEY_STORAGE_KEY } from '../constants/storage'

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState(() => {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || ''
  })

  const setApiKey = useCallback((key) => {
    if (key) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key)
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY)
    }
    setApiKeyState(key || '')
  }, [])

  const clearApiKey = useCallback(() => {
    localStorage.removeItem(API_KEY_STORAGE_KEY)
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

import { useState, useCallback } from 'react'
import { MAX_HISTORY_ITEMS } from '../constants/history'
import { HISTORY_STORAGE_KEY } from '../constants/storage'

function load() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function useHistory() {
  const [history, setHistory] = useState(load)

  const persist = useCallback((items) => {
    setHistory(items)
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items))
  }, [])

  const saveLesson = useCallback(
    (entry) => {
      // entry shape: { id, subject, problem, lesson, createdAt }
      const current = load()
      const updated = [entry, ...current].slice(0, MAX_HISTORY_ITEMS)
      persist(updated)
    },
    [persist]
  )

  const deleteLesson = useCallback(
    (id) => {
      persist(load().filter((e) => e.id !== id))
    },
    [persist]
  )

  const clearHistory = useCallback(() => {
    persist([])
  }, [persist])

  return { history, saveLesson, deleteLesson, clearHistory }
}

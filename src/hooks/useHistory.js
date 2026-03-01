import { useState, useCallback } from 'react'

const STORAGE_KEY = 'wiselab_history'
const MAX_ITEMS = 10

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function useHistory() {
  const [history, setHistory] = useState(load)

  const persist = useCallback((items) => {
    setHistory(items)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [])

  const saveLesson = useCallback(
    (entry) => {
      // entry shape: { id, subject, problem, lesson, createdAt }
      const current = load()
      const updated = [entry, ...current].slice(0, MAX_ITEMS)
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

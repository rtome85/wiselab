import { useEffect, useState } from 'react'
import { loadKatex } from '../lib/katexLoader'

export function useKatex() {
  const [katex, setKatex] = useState(null)

  useEffect(() => {
    let cancelled = false
    loadKatex().then((mod) => {
      if (!cancelled) setKatex(mod.default ?? mod)
    })
    return () => { cancelled = true }
  }, [])

  return katex
}

let katexPromise = null

export function loadKatex() {
  if (!katexPromise) katexPromise = import('katex')
  return katexPromise
}

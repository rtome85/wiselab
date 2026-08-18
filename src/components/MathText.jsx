import { useKatex } from '../hooks/useKatex'
import { INLINE_MATH_RE } from '../constants/math'

export function MathText({ children, className = '' }) {
  const katex = useKatex()
  if (!children) return null
  const text = String(children)

  const parts = []
  let lastIndex = 0

  for (const match of text.matchAll(INLINE_MATH_RE)) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'math', content: match[1] })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) })
  }

  if (parts.length === 0 || parts.every(p => p.type === 'text')) {
    return <span className={className}>{text}</span>
  }

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.type === 'text') return <span key={i}>{part.content}</span>
        try {
          const html = katex?.renderToString(part.content, {
            displayMode: false,
            throwOnError: false,
            strict: false,
          })
          if (!html) throw new Error('katex not loaded yet')
          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />
        } catch {
          return <span key={i} className="font-mono">${part.content}$</span>
        }
      })}
    </span>
  )
}

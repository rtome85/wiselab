import katex from 'katex'

const INLINE_MATH_RE = /\$([^$]+)\$/g

export function MathText({ children, className = '' }) {
  if (!children) return null
  const text = String(children)

  const parts = []
  let lastIndex = 0
  let match

  INLINE_MATH_RE.lastIndex = 0
  while ((match = INLINE_MATH_RE.exec(text)) !== null) {
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
          const html = katex.renderToString(part.content, {
            displayMode: false,
            throwOnError: false,
            strict: false,
          })
          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />
        } catch {
          return <span key={i} className="font-mono">${part.content}$</span>
        }
      })}
    </span>
  )
}

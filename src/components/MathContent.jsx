import { useKatex } from '../hooks/useKatex'

// Split text on $$...$$ display math blocks
function parseDisplaySegments(text) {
  const segments = []
  const DISPLAY_RE = /\$\$([\s\S]+?)\$\$/g
  let lastIndex = 0
  let match

  DISPLAY_RE.lastIndex = 0
  while ((match = DISPLAY_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'display', content: match[1].trim() })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) })
  }
  return segments
}

// Split a text line on $...$ inline math
function parseInlineParts(line) {
  const INLINE_RE = /\$([^$\n]+)\$/g
  const parts = []
  let lastIndex = 0
  let match

  INLINE_RE.lastIndex = 0
  while ((match = INLINE_RE.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: line.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'inline', content: match[1] })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < line.length) {
    parts.push({ type: 'text', content: line.slice(lastIndex) })
  }
  return parts
}

function renderInline(katex, formula) {
  try {
    return katex?.renderToString(formula, { displayMode: false, throwOnError: false, strict: false }) ?? null
  } catch {
    return null
  }
}

function renderDisplay(katex, formula) {
  try {
    return katex?.renderToString(formula, { displayMode: true, throwOnError: false, strict: false }) ?? null
  } catch {
    return null
  }
}

function TextSegment({ katex, content, hideVisualContext }) {
  const lines = content.split('\n')

  return (
    <>
      {lines.map((line, lineIdx) => {
        if (!line.trim()) {
          // blank line — add spacing
          return <span key={lineIdx} className="block h-2" />
        }

        // Detect visual context annotation
        const isVisualContext = line.trimStart().startsWith('[Visual context:')
        if (isVisualContext && hideVisualContext) return null

        const parts = parseInlineParts(line)

        return (
          <span key={lineIdx} className={`block leading-relaxed ${isVisualContext ? 'text-faint text-sm italic mt-2' : ''}`}>
            {parts.map((part, i) => {
              if (part.type === 'text') return <span key={i}>{part.content}</span>
              const html = renderInline(katex, part.content)
              if (html) return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />
              return <span key={i} className="font-mono text-sm">${part.content}$</span>
            })}
          </span>
        )
      })}
    </>
  )
}

function DisplaySegment({ katex, content }) {
  const html = renderDisplay(katex, content)
  if (html) {
    return (
      <div
        className="my-3 px-4 py-3 rounded-xl bg-control border border-border overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }
  return (
    <div className="my-3 px-4 py-3 rounded-xl bg-control border border-border font-mono text-sm text-ink text-center">
      {content}
    </div>
  )
}

export function MathContent({ children, className = '', hideVisualContext = false }) {
  const katex = useKatex()
  if (!children) return null
  const text = String(children)
  const segments = parseDisplaySegments(text)

  return (
    <div className={className}>
      {segments.map((seg, i) =>
        seg.type === 'display'
          ? <DisplaySegment key={i} katex={katex} content={seg.content} />
          : <TextSegment key={i} katex={katex} content={seg.content} hideVisualContext={hideVisualContext} />
      )}
    </div>
  )
}

import katex from 'katex'

export function MathBlock({ formula }) {
  let html
  try {
    html = katex.renderToString(formula, {
      displayMode: true,
      throwOnError: false,
      strict: false,
    })
  } catch {
    return (
      <div className="px-4 py-3 rounded-xl bg-control border border-border">
        <p className="font-mono text-sm text-ink text-center tracking-wide">{formula}</p>
      </div>
    )
  }

  return (
    <div
      className="px-4 py-3 rounded-xl bg-control border border-border overflow-x-auto katex-block"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

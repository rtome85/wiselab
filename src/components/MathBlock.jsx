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
      <div className="px-4 py-3 rounded-xl bg-black/25 border border-white/8">
        <p className="font-mono text-sm text-white/85 text-center tracking-wide">{formula}</p>
      </div>
    )
  }

  return (
    <div
      className="px-4 py-3 rounded-xl bg-black/25 border border-white/8 overflow-x-auto katex-block"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

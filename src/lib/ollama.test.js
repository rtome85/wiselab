import { describe, it, expect } from 'vitest'
import { repairJson } from './ollama'

// repairJson runs on raw model output before JSON.parse. Bare LaTeX backslashes
// (single \, not properly doubled for JSON) collide with real JSON string
// escapes — some silently corrupt into control characters, others make
// JSON.parse throw outright. These cases previously caused a KaTeX box to
// render "\rac{N_H}{N_O}" instead of a fraction (see PR #29).
describe('repairJson', () => {
  it('escapes bare LaTeX commands that collide with \\b / \\f control escapes', () => {
    expect(JSON.parse(repairJson('{"x": "a \\frac{1}{2} b"}')).x).toBe('a \\frac{1}{2} b')
    expect(JSON.parse(repairJson('{"x": "\\begin{matrix}"}')).x).toBe('\\begin{matrix}')
  })

  it('escapes bare LaTeX commands that collide with \\r / \\t / \\u escapes', () => {
    expect(JSON.parse(repairJson('{"x": "a \\rho b"}')).x).toBe('a \\rho b')
    expect(JSON.parse(repairJson('{"x": "a \\right b"}')).x).toBe('a \\right b')
    expect(JSON.parse(repairJson('{"x": "a \\tau b"}')).x).toBe('a \\tau b')
    expect(JSON.parse(repairJson('{"x": "a \\theta b"}')).x).toBe('a \\theta b')
    expect(JSON.parse(repairJson('{"x": "a \\times b"}')).x).toBe('a \\times b')
    expect(JSON.parse(repairJson('{"x": "a \\underline{b}"}')).x).toBe('a \\underline{b}')
  })

  it('leaves genuine JSON escapes untouched', () => {
    expect(JSON.parse(repairJson('{"x": "say \\"hi\\""}')).x).toBe('say "hi"')
    expect(JSON.parse(repairJson('{"x": "a\\\\b"}')).x).toBe('a\\b')
  })

  it('preserves already-correctly-escaped LaTeX (idempotent)', () => {
    expect(JSON.parse(repairJson('{"x": "already \\\\frac{ok}{ok} escaped"}')).x)
      .toBe('already \\frac{ok}{ok} escaped')
  })

  it('converts literal newline/carriage-return bytes inside strings to escapes', () => {
    const raw = '{"x": "line1\nline2"}' // actual newline byte, not an escape sequence
    expect(JSON.parse(repairJson(raw)).x).toBe('line1\nline2')
  })

  it('does not touch structural whitespace outside strings', () => {
    const pretty = '{\n  "x": "ok"\n}'
    expect(JSON.parse(repairJson(pretty)).x).toBe('ok')
  })

  it('keeps \\n as a real newline, even though it collides with \\nu/\\nabla', () => {
    // Deliberate tradeoff: multi-line ASCII "visual" content relies on genuine
    // \n line breaks far more often than formulas use \nu/\nabla/\neq.
    const parsed = JSON.parse(repairJson('{"x": "a \\nu b"}')).x
    expect(parsed).toBe('a \nu b')
  })
})

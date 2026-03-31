import { getApiKey } from './ollama'

const VISION_MODEL = 'ministral-3:3b-cloud'
const API_URL = '/api/v1/chat/completions'

const EXTRACTION_PROMPT = `You are an expert vision assistant for a math and science tutoring app.
Analyze the image and identify all numbered or labeled exercises/problems.

Respond using EXACTLY this format — three sections, nothing else:

<<<FIRST_PROBLEM>>>
<the complete text of the FIRST exercise only, exactly as written. Format ALL mathematical expressions using LaTeX notation: wrap inline expressions with $...$ (e.g. $x^2 + y^2 = r^2$) and wrap standalone/display equations with $$...$$ on their own line (e.g. $$\\int_0^1 f(x)\\,dx$$). Preserve the original text structure and wording.>
<<<OTHER_PROBLEMS>>>
<if there are additional exercises beyond the first, write each one separated by a line containing only "---". Use the same LaTeX notation. Write "none" if there is only one problem.>
<<<VISUAL>>>
<a concise natural-language description of any visual elements: graphs (axes, labels, curve shape), geometric figures (shape names, labeled sides/angles), tables (column headers and values), diagrams (arrows, forces, labels). Write "none" if there are no visual elements.>

If the image does not contain a math, science, or logic exercise, respond with exactly: NOT_A_PROBLEM`

function parseExtractionResponse(raw) {
  const FIRST_TAG  = '<<<FIRST_PROBLEM>>>'
  const OTHER_TAG  = '<<<OTHER_PROBLEMS>>>'
  const VISUAL_TAG = '<<<VISUAL>>>'

  const firstIdx  = raw.indexOf(FIRST_TAG)
  const otherIdx  = raw.indexOf(OTHER_TAG)
  const visualIdx = raw.indexOf(VISUAL_TAG)

  // fallback: model ignored new format — treat entire response as the problem
  if (firstIdx === -1 || otherIdx === -1 || visualIdx === -1) {
    return { text: raw.trim(), moreProblems: [] }
  }

  const firstPart  = raw.slice(firstIdx + FIRST_TAG.length, otherIdx).trim()
  const otherPart  = raw.slice(otherIdx + OTHER_TAG.length, visualIdx).trim()
  const visualPart = raw.slice(visualIdx + VISUAL_TAG.length).trim()

  const hasVisual = visualPart && visualPart.toLowerCase() !== 'none'
  const text = hasVisual
    ? `${firstPart}\n\n[Visual context: ${visualPart}]`
    : firstPart

  const moreProblems =
    !otherPart || otherPart.toLowerCase() === 'none'
      ? []
      : otherPart.split(/\n---\n/).map(p => p.trim()).filter(Boolean)

  return { text, moreProblems }
}

/**
 * Extract text from an image using the Ollama vision model.
 * @param {string} base64Image - base64-encoded image (no data: prefix)
 * @param {string} mimeType - e.g. 'image/jpeg'
 * @returns {Promise<string>} extracted text
 */
export async function extractTextFromImage(base64Image, mimeType) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      stream: false,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: EXTRACTION_PROMPT },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Erro do modelo de visão (${response.status}): ${text}`)
  }

  const data = await response.json()
  const raw = data.choices?.[0]?.message?.content?.trim() ?? ''
  const result = parseExtractionResponse(raw)

  if (!result.text || result.text === 'NOT_A_PROBLEM') {
    throw new Error('A imagem não parece conter um exercício reconhecível.')
  }

  return result
}

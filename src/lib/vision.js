import { getApiKey } from './ollama'
import { CHAT_COMPLETIONS_API_PATH } from '../constants/api'
import { EXTRACTION_PROMPT, VISION_MODEL } from '../constants/vision'

function parseExtractionResponse(raw) {
  const TEXT_TAG   = '<<<TEXT>>>'
  const VISUAL_TAG = '<<<VISUAL>>>'

  const textIdx   = raw.indexOf(TEXT_TAG)
  const visualIdx = raw.indexOf(VISUAL_TAG)

  if (textIdx === -1 || visualIdx === -1) {
    return raw.trim() // fallback: model ignored format, return raw
  }

  const textPart   = raw.slice(textIdx + TEXT_TAG.length, visualIdx).trim()
  const visualPart = raw.slice(visualIdx + VISUAL_TAG.length).trim()

  const hasVisual = visualPart && visualPart.toLowerCase() !== 'none'

  return hasVisual
    ? `${textPart}\n\n[Visual context: ${visualPart}]`
    : textPart
}

/**
 * Extract text from an image using the Ollama vision model.
 * @param {string} base64Image - base64-encoded image (no data: prefix)
 * @param {string} mimeType - e.g. 'image/jpeg'
 * @returns {Promise<string>} extracted text
 */
export async function extractTextFromImage(base64Image, mimeType) {
  const response = await fetch(CHAT_COMPLETIONS_API_PATH, {
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
  const text = parseExtractionResponse(raw)

  if (!text || text === 'NOT_A_PROBLEM') {
    throw new Error('A imagem não parece conter um exercício reconhecível.')
  }

  return text
}

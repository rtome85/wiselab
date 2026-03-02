const VISION_MODEL = 'ministral-3:3b-cloud'
const API_URL = '/v1/chat/completions'  // proxied by Vite → https://ollama.com
const API_KEY = import.meta.env.VITE_OLLAMA_API_KEY

const EXTRACTION_PROMPT = `You are an OCR assistant. Extract the exercise or problem text from this image exactly as written.
Return ONLY the extracted text, with no additional commentary, formatting, or explanation.
If the image does not contain a math/science/logic exercise or problem, return exactly: NOT_A_PROBLEM`

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
      'Authorization': `Bearer ${API_KEY}`,
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
  const text = data.choices?.[0]?.message?.content?.trim() ?? ''

  if (!text || text === 'NOT_A_PROBLEM') {
    throw new Error('A imagem não parece conter um exercício reconhecível.')
  }

  return text
}

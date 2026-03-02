const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export function validateImageFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipo de ficheiro não suportado. Use JPEG, PNG ou WebP.')
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Ficheiro demasiado grande. Tamanho máximo: 10MB.')
  }
}

/**
 * Compress an image file via Canvas API and return base64 (without data: prefix).
 * @param {File} file
 * @param {number} maxWidth
 * @param {number} quality
 * @returns {Promise<{ base64: string, mimeType: string }>}
 */
export function fileToBase64(file, maxWidth = 1024, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const scale = img.width > maxWidth ? maxWidth / img.width : 1
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)

      // Always output JPEG for compressed output (smaller), unless WebP source
      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const dataUrl = canvas.toDataURL(mimeType, quality)
      // Strip "data:<mime>;base64," prefix
      const base64 = dataUrl.split(',')[1]
      resolve({ base64, mimeType })
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Não foi possível carregar a imagem.'))
    }

    img.src = objectUrl
  })
}

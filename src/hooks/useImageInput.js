import { useState, useRef, useCallback } from 'react'
import { validateImageFile, fileToBase64 } from '../lib/imageUtils'
import { extractTextFromImage } from '../lib/vision'

export function useImageInput({ onExtracted }) {
  const [status, setStatus] = useState('idle') // idle | compressing | extracting | done | error
  const [preview, setPreview] = useState(null)  // object URL for preview
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const reset = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setStatus('idle')
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [preview])

  const processFile = useCallback(async (file) => {
    setError(null)

    try {
      validateImageFile(file)
    } catch (err) {
      setError(err.message)
      return
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setStatus('compressing')

    try {
      const { base64, mimeType } = await fileToBase64(file)
      setStatus('extracting')

      const text = await extractTextFromImage(base64, mimeType)
      setStatus('done')
      onExtracted(text)
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }, [onExtracted])

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const openFilePicker = useCallback((source) => {
    if (!fileInputRef.current) return
    if (source === 'camera') {
      fileInputRef.current.setAttribute('capture', 'environment')
    } else {
      fileInputRef.current.removeAttribute('capture')
    }
    fileInputRef.current.click()
  }, [])

  return {
    status,
    preview,
    error,
    fileInputRef,
    handleFileChange,
    handleDrop,
    openFilePicker,
    reset,
  }
}

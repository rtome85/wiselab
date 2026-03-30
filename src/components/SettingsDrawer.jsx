import { useState, useEffect, useRef, useCallback } from 'react'
import { Settings, Check, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { cn } from '../utils/cn'
import { getModel } from '../lib/ollama'

function TestResult({ status, message }) {
  if (!status) return null

  const isSuccess = status === 'success'
  const isError = status === 'error'

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg p-3 text-sm',
        isSuccess && 'bg-emerald-500/10 border border-emerald-500/20',
        isError && 'bg-red-500/10 border border-red-500/20'
      )}
    >
      {isSuccess && <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />}
      {isError && <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />}
      <span className={cn(isSuccess && 'text-emerald-300', isError && 'text-red-300')}>
        {message}
      </span>
    </div>
  )
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function SettingsDrawer({ open, onOpenChange, apiKey, onSetApiKey, onClearApiKey, hasEnvKey }) {
  const [inputValue, setInputValue] = useState(apiKey || '')
  const [testStatus, setTestStatus] = useState(null)
  const [testMessage, setTestMessage] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const drawerRef = useRef(null)
  const previousFocusRef = useRef(null)

  const handleClose = useCallback(() => {
    setInputValue(apiKey || '')
    setTestStatus(null)
    setTestMessage('')
    onOpenChange(false)
  }, [apiKey, onOpenChange])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, handleClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement
      if (drawerRef.current) {
        const focusable = drawerRef.current.querySelector(FOCUSABLE_SELECTOR)
        focusable?.focus()
      }
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [open])

  const handleKeyDown = useCallback((e) => {
    if (e.key !== 'Tab' || !drawerRef.current) return

    const focusable = drawerRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  const handleSave = () => {
    if (inputValue.trim()) {
      onSetApiKey(inputValue.trim())
      setTestStatus('success')
      setTestMessage('API key saved')
    }
  }

  const handleClear = () => {
    onClearApiKey()
    setInputValue('')
    setTestStatus(null)
    setTestMessage('')
  }

  const handleTest = async () => {
    if (!inputValue.trim()) {
      setTestStatus('error')
      setTestMessage('Please enter an API key first')
      return
    }

    setIsTesting(true)
    setTestStatus(null)
    setTestMessage('')

    try {
      const response = await fetch('/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${inputValue.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: getModel(),
          messages: [{ role: 'user', content: 'Say "ok"' }],
          max_tokens: 5,
          stream: false,
        }),
      })

      if (response.ok) {
        setTestStatus('success')
        setTestMessage('Connection successful! Your API key is valid.')
      } else {
        const errorText = await response.text()
        let errorMsg = `Connection failed (${response.status})`
        try {
          const errorJson = JSON.parse(errorText)
          if (errorJson.error?.message) {
            errorMsg = errorJson.error.message
          }
        } catch {
          // Keep default error message
        }
        setTestStatus('error')
        setTestMessage(errorMsg)
      }
    } catch (error) {
      setTestStatus('error')
      setTestMessage(`Network error: ${error.message}`)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={handleClose}
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300
                    ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer panel */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        className={`fixed top-0 right-0 z-40 h-full w-72 sm:w-80
                    bg-[#0d0d14] border-l border-white/[0.07]
                    flex flex-col outline-none
                    transition-transform duration-300 ease-out
                    ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-white/70" />
            <h2 className="font-semibold text-white/90 text-sm">Settings</h2>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close settings"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/35
                       hover:text-white/70 hover:bg-white/8 transition-colors focus-ring"
          >
            <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {hasEnvKey && !apiKey && (
            <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-sm">
              <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span className="text-blue-300">
                Using API key from environment. You can override it below.
              </span>
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="api-key">Ollama Cloud API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your API key..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-white/35">
              Stored locally in your browser. Used to authenticate API requests.
            </p>
          </div>

          {testStatus && <TestResult status={testStatus} message={testMessage} />}

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleTest}
                disabled={isTesting || !inputValue.trim()}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
              <Button
                onClick={handleSave}
                disabled={!inputValue.trim() || inputValue === apiKey}
              >
                Save
              </Button>
            </div>

            {(apiKey || hasEnvKey) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-white/40 hover:text-red-400"
              >
                Clear saved key
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
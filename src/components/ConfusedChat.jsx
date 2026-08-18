import { useState, useRef, useEffect } from 'react'
import { MathText } from './MathText'
import { useI18n } from '../i18n/useI18n'

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const isError = message.role === 'error'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
        isError
          ? 'bg-red-500/15 text-red-600 dark:text-red-300 border border-red-500/20'
          : isUser
          ? 'bg-control text-ink'
          : 'bg-violet-500/15 text-violet-700 dark:text-violet-200 border border-violet-500/20'
      }`}>
        {!isUser && !isError && <span className="text-xs mr-1">🧠</span>}
        <MathText>{message.content}</MathText>
      </div>
    </div>
  )
}

export function ConfusedChat({ stepIndex, stepContext, conversation, onSendMessage, isLoading, forceOpenSignal, prefillMessage }) {
  const { t } = useI18n()
  const QUICK_PROMPTS = [
    t('chat.quickPrompt1'),
    t('chat.quickPrompt2'),
    t('chat.quickPrompt3'),
  ]
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const messagesContainerRef = useRef(null)

  // A wrong challenge answer can nudge the student here directly, already
  // asking about the specific question they got wrong. forceOpenSignal is a
  // one-shot trigger (timestamp) from the parent; prefillMessage always
  // arrives set together with it, so it's read here rather than depended on.
  useEffect(() => {
    if (!forceOpenSignal) return
    setIsOpen(true)
    if (prefillMessage) setInput(prefillMessage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceOpenSignal])

  const hasMessages = conversation && conversation.length > 0

  useEffect(() => {
    const el = messagesContainerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [conversation])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const message = input.trim()
    setInput('')
    await onSendMessage(stepIndex, stepContext, message)
  }

  const handleQuickPrompt = (prompt) => {
    setInput(prompt)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-ink hover:bg-control transition-all duration-200"
      >
        <span>{isOpen ? '▲' : '▼'}</span>
        <span>{t('step.confused')}</span>
        {hasMessages && <span className="text-violet-500 dark:text-violet-400 ml-1">({conversation.length})</span>}
      </button>

      {isOpen && (
        <div className="mt-2 rounded-xl bg-violet-500/8 border border-violet-500/20 animate-fadeIn">
          <div className="flex items-center gap-2 px-3.5 pt-3.5 pb-2">
            <span className="text-sm">❓</span>
            <span className="text-xs font-medium text-violet-700 dark:text-violet-200/80 uppercase tracking-wide">{t('step.virtualTutor')}</span>
          </div>

          <div ref={messagesContainerRef} role="log" aria-live="polite" className="px-3.5 pb-2 space-y-2 max-h-48 overflow-y-auto">
            {!hasMessages && (
              <p className="text-faint text-xs text-center py-2">
                {t('chat.instruction')}
              </p>
            )}
            {conversation && conversation.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-violet-500/15 border border-violet-500/20 px-3 py-2 rounded-xl">
                  <span className="text-xs text-violet-600 dark:text-violet-300 animate-pulse">{t('chat.thinking')}</span>
                </div>
              </div>
            )}
          </div>

          {!hasMessages && (
            <div className="px-3.5 pb-2 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="px-2 py-1 rounded-md text-xs bg-control text-muted hover:bg-border/60 hover:text-ink transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="px-3.5 pb-3.5 pt-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.placeholder')}
                className="flex-1 px-3 py-2 rounded-lg text-sm bg-control border border-border text-ink placeholder:text-faint focus:outline-none focus:border-violet-500/40"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-violet-500/20 text-violet-700 dark:text-violet-200 hover:bg-violet-500/30'
                    : 'bg-control text-faint cursor-not-allowed'
                }`}
              >
                {t('chat.send')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
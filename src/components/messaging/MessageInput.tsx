'use client'

import { useState, useRef, useEffect } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '@/i18n'

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  disabled?: boolean
  placeholder?: string
}

const MAX_LENGTH = 2000

export function MessageInput({
  onSend,
  disabled = false,
  placeholder,
}: MessageInputProps) {
  const { t } = useTranslation()
  const resolvedPlaceholder = placeholder || t('messages.typeMessage')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAtMaxHeight, setIsAtMaxHeight] = useState(false)

  // Auto-expand textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 80), 200)
      textareaRef.current.style.height = `${newHeight}px`
      setIsAtMaxHeight(newHeight >= 200)
    }
  }, [content])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = content.trim()
    if (!trimmed) return

    if (trimmed.length > MAX_LENGTH) {
      setError(`Message cannot exceed ${MAX_LENGTH} characters`)
      return
    }

    setIsSending(true)
    setError(null)

    try {
      await onSend(trimmed)
      setContent('')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMsg)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 p-6 border-t border-border/50 bg-card h-full">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end flex-1">
        <div className="flex-1 relative flex flex-col">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              setError(null)
            }}
            placeholder={resolvedPlaceholder}
            disabled={disabled || isSending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey && !disabled && !isSending && content.trim()) {
                handleSubmit(e)
              }
            }}
            className={`w-full flex-1 px-4 py-3 rounded-xl border transition-all resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-auto bg-background ${
              error
                ? 'border-destructive/50 focus:ring-destructive/50'
                : 'border-border/50'
            }`}
            maxLength={MAX_LENGTH}
            aria-label="Message content"
            rows={1}
            style={{ height: '100%', minHeight: '180px' }}
          />
          {isAtMaxHeight && (
            <div className="absolute bottom-3 right-3 text-muted-foreground/40 text-xs pointer-events-none">
              ⋮
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={disabled || isSending || !content.trim()}
          className="flex-shrink-0 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
          title={isSending ? 'Sending...' : 'Send message (Ctrl+Enter)'}
        >
          <PaperAirplaneIcon className="h-5 w-5" />
          <span className="hidden sm:inline">{isSending ? 'Sending...' : 'Send'}</span>
        </button>
      </form>

      {error && (
        <p className="text-destructive font-medium text-xs">{error}</p>
      )}
    </div>
  )
}

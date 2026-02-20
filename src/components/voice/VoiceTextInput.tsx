'use client'
import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { parseVoiceCommand, smartCapitalization, shouldAddSpace } from '@/utils/voiceCommands'

type VoiceState = 'idle' | 'listening' | 'processing' | 'error'

interface VoiceTextInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    rows?: number
    className?: string
    disabled?: boolean
    required?: boolean
    name?: string
    id?: string
}

export function VoiceTextInput({
    value,
    onChange,
    placeholder,
    rows = 4,
    className = '',
    disabled = false,
    required = false,
    name,
    id,
}: VoiceTextInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const recognitionRef = useRef<any>(null)
    const restartRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const cursorRef = useRef(0)
    const valueRef = useRef(value)
    const stateRef = useRef<VoiceState>('idle')

    const [voiceState, setVoiceState] = useState<VoiceState>('idle')
    const [interim, setInterim] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    // Keep valueRef in sync
    useEffect(() => { valueRef.current = value }, [value])

    // Keep stateRef in sync
    const updateState = useCallback((s: VoiceState) => {
        stateRef.current = s
        setVoiceState(s)
    }, [])

    // Build the recognition object lazily on first use
    const getRecognition = useCallback(() => {
        if (recognitionRef.current) return recognitionRef.current

        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SR) return null

        const rec = new SR()
        rec.continuous = true
        rec.interimResults = true
        rec.lang = 'en-US'
        rec.maxAlternatives = 1

        rec.onstart = () => { updateState('listening'); setErrorMsg('') }

        rec.onresult = (event: any) => {
            let finalText = ''
            let interimText = ''
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript
                if (event.results[i].isFinal) finalText += t
                else interimText += t
            }
            if (interimText) { setInterim(interimText); updateState('listening') }
            if (finalText) {
                const cmd = parseVoiceCommand(finalText)
                if (cmd.type === 'punctuation' || cmd.type === 'formatting') {
                    insertText(cmd.value)
                } else if (cmd.type === 'edit') {
                    if (finalText.toLowerCase().includes('clear')) onChange('')
                } else {
                    const prev = valueRef.current
                    const prevChar = prev.slice(-1)
                    const space = shouldAddSpace(prevChar, finalText.charAt(0)) && prev ? ' ' : ''
                    const capitalized = smartCapitalization(finalText, prev)
                    insertText(space + capitalized)
                }
                setInterim('')
                updateState('processing')
                setTimeout(() => { if (stateRef.current !== 'idle') updateState('listening') }, 300)
            }
        }

        rec.onerror = (event: any) => {
            if (event.error === 'no-speech' || event.error === 'aborted') return
            if (event.error === 'not-allowed') {
                setErrorMsg('Mic access denied — allow microphone in browser settings')
                updateState('error'); return
            }
            setErrorMsg(`Error: ${event.error}`)
            updateState('error')
        }

        rec.onend = () => {
            const s = stateRef.current
            if (s === 'listening' || s === 'processing') {
                restartRef.current = setTimeout(() => {
                    try { rec.start() } catch { }
                }, 400)
            } else {
                updateState('idle')
            }
        }

        recognitionRef.current = rec
        return rec
    }, [onChange, updateState])

    const insertText = useCallback((text: string) => {
        if (!textareaRef.current) return
        const pos = cursorRef.current
        const before = valueRef.current.substring(0, pos)
        const after = valueRef.current.substring(pos)
        const newVal = before + text + after
        onChange(newVal)
        const newPos = pos + text.length
        cursorRef.current = newPos
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.selectionStart = newPos
                textareaRef.current.selectionEnd = newPos
            }
        }, 0)
    }, [onChange])

    const startListening = useCallback(() => {
        const rec = getRecognition()
        if (!rec) {
            setErrorMsg('Voice input requires Chrome, Edge, or Safari')
            updateState('error'); return
        }
        try { rec.start(); cursorRef.current = textareaRef.current?.selectionStart ?? value.length } catch { }
    }, [getRecognition, updateState, value])

    const stopListening = useCallback(() => {
        if (restartRef.current) { clearTimeout(restartRef.current); restartRef.current = null }
        try { recognitionRef.current?.stop() } catch { }
        setInterim('')
        updateState('idle')
    }, [updateState])

    const handleMicClick = (e: React.MouseEvent) => {
        e.preventDefault()
        if (disabled) return
        if (voiceState === 'listening' || voiceState === 'processing') stopListening()
        else startListening()
    }

    const trackCursor = () => {
        if (textareaRef.current) cursorRef.current = textareaRef.current.selectionStart
    }

    // Cleanup on unmount
    useEffect(() => () => {
        if (restartRef.current) clearTimeout(restartRef.current)
        try { recognitionRef.current?.abort() } catch { }
    }, [])

    const isListening = voiceState === 'listening'
    const isError = voiceState === 'error'

    return (
        <div className="relative group">
            {/* Textarea — left-padding to make room for mic button */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => { onChange(e.target.value); trackCursor() }}
                onClick={trackCursor}
                onKeyUp={trackCursor}
                placeholder={placeholder}
                rows={rows}
                required={required}
                disabled={disabled}
                name={name}
                id={id}
                className={cn(
                    // same base styles as shadcn <Textarea>
                    'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50',
                    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                    'dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent',
                    'pl-8 pr-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none',
                    'focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-y',
                    className
                )}
            />

            {/* Mic button — always visible, top-left of the textarea */}
            <button
                type="button"
                onMouseDown={handleMicClick}
                disabled={disabled}
                className={cn(
                    'absolute top-[7px] left-[6px] z-10',
                    'flex items-center justify-center w-5 h-5 rounded',
                    'transition-all duration-150',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isError ? 'text-destructive opacity-60' : isListening ? 'text-red-500' : 'text-muted-foreground hover:text-foreground',
                    disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/60',
                )}
                title={
                    isError ? errorMsg :
                        isListening ? 'Stop recording (click to stop)' :
                            'Click to dictate (Chrome / Edge / Safari)'
                }
                aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            >
                {isError
                    ? <MicOff className="w-3.5 h-3.5" />
                    : <Mic className={cn('w-3.5 h-3.5', isListening && 'animate-pulse')} />
                }
            </button>

            {/* Live waveform dots while listening */}
            {isListening && (
                <div className="absolute top-[10px] left-7 flex items-center gap-[2px] pointer-events-none">
                    {[5, 9, 12, 9, 5].map((h, i) => (
                        <div
                            key={i}
                            className="w-[2px] bg-red-400 rounded-full"
                            style={{ height: `${h}px`, animation: `pulse 0.8s ease-in-out ${i * 0.12}s infinite alternate` }}
                        />
                    ))}
                </div>
            )}

            {/* Interim transcript preview */}
            {interim && (
                <div className="absolute bottom-2 left-8 right-2 pointer-events-none">
                    <span className="inline-block max-w-full truncate bg-muted/90 border rounded px-2 py-0.5 text-xs text-muted-foreground italic">
                        {interim}
                    </span>
                </div>
            )}

            {/* Status hint below field */}
            {isListening && (
                <p className="mt-1 text-xs text-muted-foreground">
                    Listening… speak naturally. Say &quot;period&quot;, &quot;new line&quot;, or &quot;clear&quot;.
                </p>
            )}
            {isError && errorMsg && (
                <p className="mt-1 text-xs text-destructive">{errorMsg}</p>
            )}
        </div>
    )
}

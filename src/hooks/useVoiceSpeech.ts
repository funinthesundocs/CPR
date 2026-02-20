'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { parseVoiceCommand, smartCapitalization, shouldAddSpace } from '@/utils/voiceCommands'

export type VoiceState = 'idle' | 'listening' | 'processing' | 'paused' | 'error'

interface UseVoiceSpeechOptions {
    onTranscript?: (text: string, isFinal: boolean) => void
    onError?: (error: string) => void
    language?: string
    continuous?: boolean
    currentText?: string
}

interface UseVoiceSpeechReturn {
    state: VoiceState
    isSupported: boolean
    interimTranscript: string
    startListening: () => void
    stopListening: () => void
    toggleListening: () => void
    error: string | null
}

export function useVoiceSpeech(options: UseVoiceSpeechOptions = {}): UseVoiceSpeechReturn {
    const { onTranscript, onError, language = 'en-US', continuous = true, currentText = '' } = options

    const [state, setState] = useState<VoiceState>('idle')
    const [interimTranscript, setInterimTranscript] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isSupported, setIsSupported] = useState(false)

    const recognitionRef = useRef<SpeechRecognition | null>(null)
    const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const stateRef = useRef<VoiceState>('idle')
    const onTranscriptRef = useRef(onTranscript)
    const onErrorRef = useRef(onError)
    const currentTextRef = useRef(currentText)

    // Keep refs in sync without re-creating recognition
    useEffect(() => { onTranscriptRef.current = onTranscript }, [onTranscript])
    useEffect(() => { onErrorRef.current = onError }, [onError])
    useEffect(() => { currentTextRef.current = currentText }, [currentText])
    useEffect(() => { stateRef.current = state }, [state])

    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

        if (!SpeechRecognition) {
            setIsSupported(false)
            setError('Speech recognition is not supported. Please use Chrome, Edge, or Safari.')
            return
        }

        setIsSupported(true)

        const recognition = new SpeechRecognition()
        recognition.continuous = continuous
        recognition.interimResults = true
        recognition.maxAlternatives = 1
        recognition.lang = language

        recognition.onstart = () => { setState('listening'); setError(null) }

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interim = ''
            let final = ''
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i]
                const transcriptText = result[0].transcript
                if (result.isFinal) { final += transcriptText } else { interim += transcriptText }
            }
            if (interim) { setInterimTranscript(interim); setState('listening') }
            if (final) {
                const command = parseVoiceCommand(final)
                if (command.type === 'punctuation' || command.type === 'formatting') {
                    onTranscriptRef.current?.(command.value, true)
                } else if (command.type === 'text') {
                    const prev = currentTextRef.current
                    const previousChar = prev.slice(-1)
                    const needsSpace = shouldAddSpace(previousChar, final.charAt(0))
                    const spacer = needsSpace && prev ? ' ' : ''
                    const capitalizedText = smartCapitalization(final, prev)
                    onTranscriptRef.current?.(spacer + capitalizedText, true)
                }
                setInterimTranscript('')
                setState('processing')
                setTimeout(() => { if (stateRef.current !== 'idle') setState('listening') }, 300)
            }
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error === 'no-speech') { setState('listening'); return }
            if (event.error === 'aborted') { setState('idle'); return }
            if (event.error === 'not-allowed') {
                setError('Microphone access denied. Allow microphone in browser settings.')
                setState('error'); onErrorRef.current?.('Microphone access denied'); return
            }
            if (event.error === 'network') {
                setError('Network error. Check your internet connection.')
                setState('error'); onErrorRef.current?.('Network error')
                restartTimeoutRef.current = setTimeout(() => {
                    try { recognition.start() } catch (e) { /* silent */ }
                }, 2000)
                return
            }
            setError(`Speech error: ${event.error}`)
            setState('error'); onErrorRef.current?.(event.error)
        }

        recognition.onend = () => {
            const s = stateRef.current
            if (s === 'listening' || s === 'processing') {
                restartTimeoutRef.current = setTimeout(() => {
                    try { recognition.start() } catch (e) { setState('idle') }
                }, 500)
            } else {
                setState('idle')
            }
        }

        recognitionRef.current = recognition

        return () => {
            if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current)
            try { recognitionRef.current?.stop() } catch (e) { /* silent */ }
        }
    }, [language, continuous]) // Only recreate when language/continuous changes

    const startListening = useCallback(() => {
        if (!recognitionRef.current || !isSupported) return
        try { recognitionRef.current.start(); setError(null) } catch (e) {
            if ((e as Error).message?.includes('already started')) setState('listening')
        }
    }, [isSupported])

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return
        if (restartTimeoutRef.current) { clearTimeout(restartTimeoutRef.current); restartTimeoutRef.current = null }
        try { recognitionRef.current.stop(); setState('idle'); setInterimTranscript('') } catch (e) { /* silent */ }
    }, [])

    const toggleListening = useCallback(() => {
        if (state === 'listening' || state === 'processing') { stopListening() } else { startListening() }
    }, [state, startListening, stopListening])

    return { state, isSupported, interimTranscript, startListening, stopListening, toggleListening, error }
}

---
name: voice-to-text
description: Add browser-native voice dictation to any textarea in a React + Tailwind project. Creates 3 files and makes 1 integration edit. Zero external dependencies beyond lucide-react. Use when the user asks to add voice input, microphone button, or speech-to-text to any form field.
---

# Voice-to-Text Textarea Skill

> **Purpose:** Add a browser-native voice dictation microphone to any `<textarea>` in a React + Tailwind project.
> **Zero external dependencies** beyond React and a single icon (`lucide-react` for `Mic`).
> **Works in:** Chrome, Edge, Safari (any browser supporting the Web Speech API).

---

## Run It

**As a human:** Tell the agent which field you want, then say "use the voice-to-text skill."

**As an AI agent dispatch:**
> "Follow the voice-to-text skill. Add voice input to [DESCRIBE TARGET — e.g., the `case_summary` textarea in `src/app/cases/new/page.tsx`]."

The agent will create 3 files and make 1 integration edit. No model preference required — works with any agent.

---

## Dependencies (install once)

```powershell
# Check if lucide-react is already installed (it likely is in this project)
npm ls lucide-react

# If missing:
npm install lucide-react
```

**No env vars required.** Uses browser-native `SpeechRecognition` API — no API keys.

---

## Critical Rules (do not deviate)

- **Never use `sleep()` or fixed timeouts** for "waiting for speech" — the hook uses event-based state (`onresult`, `onend`) instead
- **`onChange` in `VoiceTextInput` receives a `string` directly**, not a React `ChangeEvent` — callers must pass `(value: string) => void`, not `(e) => setState(e.target.value)`
- **Cursor position is tracked manually** via `cursorPosRef` — text is inserted at cursor, not appended to end
- **Import paths are relative** — adjust if the project uses path aliases like `@/hooks/` vs `../../hooks/`; this project uses `@/` aliases, so use `@/hooks/useVoiceSpeech` and `@/utils/voiceCommands`
- **This is a Windows project** — use Windows paths (`c:\...`), never Linux paths
- **Do not add `useEffect` dependencies that cause re-registration** of the `SpeechRecognition` handlers on every render — only `language` and `continuous` should trigger recreation
- **Fallback gracefully** — if `SpeechRecognition` is not available, render a plain `<textarea>` with no mic button (already handled in the component)
- **`lucide-react` is already in this project** — do not re-install

---

## Architecture Overview

```
voiceCommands.ts  (pure utility)
  - punctuation/formatting/edit command parsing
  - smart capitalization and spacing
        |
useVoiceSpeech.ts  (React hook)
  - wraps SpeechRecognition API
  - state machine: idle -> listening -> processing -> error
  - auto-restart on silence/disconnect
  - interim transcript for live preview
        |
VoiceTextInput.tsx  (drop-in component)
  - mic button (top-left of textarea)
  - animated waveform bars while listening
  - interim transcript overlay
  - cursor-position-aware text insertion
  - graceful fallback if API unsupported
```

---

## Error Table

| Error | Cause | Fix |
|-------|-------|-----|
| `not-allowed` | Mic permission denied | Show error message, set state to `error` — do not retry |
| `no-speech` | Silence detected | Ignore, stay in `listening` state |
| `aborted` | Manually stopped | Set state to `idle`, expected |
| `network` | Internet issue | Show error, auto-retry after 2s |
| `already started` exception | `start()` called twice | Catch silently, set state to `listening` |
| Component renders plain textarea | Browser doesn't support `SpeechRecognition` | Expected fallback — no action needed |
| Text inserted at end instead of cursor | `cursorPosRef` not updated on click/keyup | Ensure `onClick` and `onKeyUp` update `cursorPosRef.current` |

## Success Criteria

- [ ] Mic icon appears top-left of the specified textarea
- [ ] Clicking mic turns it red and starts listening
- [ ] Spoken words appear as interim text, then commit to field
- [ ] "period", "comma", "new line" commands work
- [ ] "delete that" / "undo" / "clear" commands work
- [ ] Clicking mic again stops listening
- [ ] Text is inserted at cursor position, not appended
- [ ] Unsupported browsers render a plain textarea (no errors)
- [ ] No TypeScript build errors

## Performance Baseline (normal = healthy)

| Phase | Expected | Investigate if |
|-------|----------|----------------|
| Mic button click → listening | < 500ms | > 2s |
| Spoken word → interim transcript | < 300ms | > 1s |
| Final transcript commit | < 500ms | > 2s |
| "delete that" response | < 100ms | > 500ms |

---

## Voice Commands Reference

| Say This | Result |
|----------|--------|
| "period" | `. ` |
| "comma" | `, ` |
| "question mark" | `? ` |
| "exclamation point" | `! ` |
| "colon" | `: ` |
| "semicolon" | `; ` |
| "dash" | ` - ` |
| "hyphen" | `-` |
| "new line" | line break |
| "new paragraph" | double line break |
| "delete that" / "scratch that" / "remove that" | removes last sentence or 5 words |
| "undo" | restores previous text |
| "clear" | clears entire field |

## Visual Behavior

| State | Mic Icon | Extra UI |
|-------|----------|----------|
| Idle | Gray | Nothing |
| Listening | Red + pulse | Waveform bars + hint text below field |
| Processing | Yellow flash | Brief |
| Error | Gray | Red error text below field |
| Unsupported | Hidden | Plain `<textarea>` |

---

## First-Time Setup

### File 1: `src/utils/voiceCommands.ts`

```typescript
export interface VoiceCommand {
  type: 'punctuation' | 'formatting' | 'edit' | 'text';
  value: string;
}

const punctuationMap: Record<string, string> = {
  'period': '. ',
  'comma': ', ',
  'question mark': '? ',
  'exclamation point': '! ',
  'exclamation mark': '! ',
  'colon': ': ',
  'semicolon': '; ',
  'dash': ' - ',
  'hyphen': '-',
  'quote': '"',
  'apostrophe': "'",
  'open parenthesis': '(',
  'close parenthesis': ')',
  'open bracket': '[',
  'close bracket': ']',
};

const formattingMap: Record<string, string> = {
  'new line': '\n',
  'new paragraph': '\n\n',
  'line break': '\n',
  'paragraph break': '\n\n',
  'tab': '\t',
};

const editCommands = [
  'delete that',
  'scratch that',
  'undo',
  'clear',
  'remove that',
];

export function parseVoiceCommand(text: string): VoiceCommand {
  const lowerText = text.toLowerCase().trim();
  if (punctuationMap[lowerText]) return { type: 'punctuation', value: punctuationMap[lowerText] };
  if (formattingMap[lowerText]) return { type: 'formatting', value: formattingMap[lowerText] };
  if (editCommands.includes(lowerText)) return { type: 'edit', value: lowerText };
  return { type: 'text', value: text };
}

export function applyEditCommand(
  command: string,
  currentText: string,
  history: string[]
): { text: string; newHistory: string[] } {
  switch (command) {
    case 'delete that':
    case 'scratch that':
    case 'remove that': {
      const sentences = currentText.split(/([.!?]\s+)/);
      if (sentences.length > 2) {
        sentences.splice(-2, 2);
        return { text: sentences.join(''), newHistory: [...history, currentText] };
      }
      const words = currentText.trim().split(' ');
      if (words.length > 5) {
        words.splice(-5);
        return { text: words.join(' ') + ' ', newHistory: [...history, currentText] };
      }
      return { text: '', newHistory: [...history, currentText] };
    }
    case 'undo': {
      if (history.length > 0) {
        const previousText = history[history.length - 1];
        return { text: previousText, newHistory: history.slice(0, -1) };
      }
      return { text: currentText, newHistory: history };
    }
    case 'clear':
      return { text: '', newHistory: [...history, currentText] };
    default:
      return { text: currentText, newHistory: history };
  }
}

export function capitalizeFirstLetter(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function smartCapitalization(text: string, previousText: string): string {
  if (!previousText || /[.!?]\s*$/.test(previousText)) {
    return capitalizeFirstLetter(text);
  }
  return text;
}

export function shouldAddSpace(previousChar: string, nextChar: string): boolean {
  if (!previousChar) return false;
  const noSpaceBefore = ['.', ',', '!', '?', ':', ';', ')', ']', "'"];
  const noSpaceAfter = ['(', '[', '"'];
  if (noSpaceBefore.includes(nextChar)) return false;
  if (noSpaceAfter.includes(previousChar)) return false;
  if (previousChar === '\n') return false;
  return true;
}
```

---

### File 2: `src/hooks/useVoiceSpeech.ts`

```typescript
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  parseVoiceCommand,
  applyEditCommand,
  smartCapitalization,
  shouldAddSpace,
} from '@/utils/voiceCommands';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'paused' | 'error';

interface UseVoiceSpeechOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  language?: string;
  continuous?: boolean;
  currentText?: string;
}

interface UseVoiceSpeechReturn {
  state: VoiceState;
  isSupported: boolean;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  error: string | null;
}

export function useVoiceSpeech(options: UseVoiceSpeechOptions = {}): UseVoiceSpeechReturn {
  const {
    onTranscript,
    onError,
    language = 'en-US',
    continuous = true,
    currentText = '',
  } = options;

  const [state, setState] = useState<VoiceState>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = language;

    recognition.onstart = () => {
      setState('listening');
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;
        if (result.isFinal) {
          final += transcriptText;
        } else {
          interim += transcriptText;
        }
      }

      if (interim) {
        setInterimTranscript(interim);
        setState('listening');
      }

      if (final) {
        const command = parseVoiceCommand(final);

        if (command.type === 'punctuation' || command.type === 'formatting') {
          onTranscript?.(command.value, true);
        } else if (command.type === 'text') {
          const previousChar = currentText.slice(-1);
          const needsSpace = shouldAddSpace(previousChar, final.charAt(0));
          const spacer = needsSpace && currentText ? ' ' : '';
          const capitalizedText = smartCapitalization(final, currentText);
          onTranscript?.(spacer + capitalizedText, true);
        }

        setInterimTranscript('');
        setState('processing');
        setTimeout(() => {
          if (state !== 'idle') setState('listening');
        }, 300);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') { setState('listening'); return; }
      if (event.error === 'aborted') { setState('idle'); return; }
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access in your browser settings.');
        setState('error');
        onError?.('Microphone access denied');
        return;
      }
      if (event.error === 'network') {
        setError('Network error. Please check your internet connection.');
        setState('error');
        onError?.('Network error');
        restartTimeoutRef.current = setTimeout(() => {
          try { recognition.start(); } catch (e) { /* silent */ }
        }, 2000);
        return;
      }
      setError(`Speech recognition error: ${event.error}`);
      setState('error');
      onError?.(event.error);
    };

    recognition.onend = () => {
      if (state === 'listening' || state === 'processing') {
        restartTimeoutRef.current = setTimeout(() => {
          try { recognition.start(); } catch (e) { setState('idle'); }
        }, 500);
      } else {
        setState('idle');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [language, continuous]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;
    try {
      recognitionRef.current.start();
      setError(null);
    } catch (e) {
      if ((e as Error).message?.includes('already started')) setState('listening');
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    try {
      recognitionRef.current.stop();
      setState('idle');
      setInterimTranscript('');
    } catch (e) { /* silent */ }
  }, []);

  const toggleListening = useCallback(() => {
    if (state === 'listening' || state === 'processing') {
      stopListening();
    } else {
      startListening();
    }
  }, [state, startListening, stopListening]);

  return { state, isSupported, interimTranscript, startListening, stopListening, toggleListening, error };
}
```

---

### File 3: `src/components/voice/VoiceTextInput.tsx`

```tsx
'use client';
import React, { useRef, useEffect, useState } from 'react';
import { Mic } from 'lucide-react';
import { useVoiceSpeech } from '@/hooks/useVoiceSpeech';

interface VoiceTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showWaveform, setShowWaveform] = useState(false);
  const cursorPosRef = useRef<number>(0);

  const { state, isSupported, interimTranscript, startListening, stopListening, error } =
    useVoiceSpeech({
      currentText: value,
      onTranscript: (newText) => {
        if (!textareaRef.current) return;
        const cursorPos = cursorPosRef.current;
        const before = value.substring(0, cursorPos);
        const after = value.substring(cursorPos);
        const newValue = before + newText + after;
        onChange(newValue);
        const newCursorPos = before.length + newText.length;
        cursorPosRef.current = newCursorPos;
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = newCursorPos;
            textareaRef.current.selectionEnd = newCursorPos;
            textareaRef.current.focus();
          }
        }, 0);
      },
      onError: (err) => console.error('Voice input error:', err),
    });

  useEffect(() => {
    setShowWaveform(state === 'listening');
  }, [state]);

  const handleToggleVoice = () => {
    if (disabled || !textareaRef.current) return;
    cursorPosRef.current = textareaRef.current.selectionStart;
    if (state === 'listening' || state === 'processing') {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    cursorPosRef.current = e.target.selectionStart;
  };

  const trackCursor = () => {
    if (textareaRef.current) cursorPosRef.current = textareaRef.current.selectionStart;
  };

  const getIconColor = () => {
    switch (state) {
      case 'listening': return 'text-red-500';
      case 'processing': return 'text-yellow-500';
      case 'error': return 'text-gray-400';
      default: return 'text-muted-foreground';
    }
  };

  if (!isSupported) {
    return (
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaChange}
        placeholder={placeholder}
        rows={rows}
        className={className}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
      />
    );
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaChange}
        onClick={trackCursor}
        onKeyUp={trackCursor}
        placeholder={placeholder}
        rows={rows}
        className={`${className}`}
        style={{ paddingLeft: '2.75rem' }}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
      />

      {/* Mic button */}
      <button
        type="button"
        onClick={handleToggleVoice}
        disabled={disabled}
        className={`absolute top-2 left-2 p-1.5 rounded-lg transition-all duration-200
          hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title={state === 'listening' ? 'Stop voice input' : error ?? 'Start voice input'}
        aria-label={state === 'listening' ? 'Stop voice input' : 'Start voice input'}
      >
        <Mic className={`w-4 h-4 ${getIconColor()} ${state === 'listening' ? 'animate-pulse' : ''}`} />
      </button>

      {/* Waveform */}
      {showWaveform && (
        <div className="absolute top-3 left-10 flex items-center gap-0.5 pointer-events-none">
          {[8, 12, 16, 12, 8].map((h, i) => (
            <div
              key={i}
              className="w-0.5 bg-red-500 rounded-full animate-pulse"
              style={{ height: `${h}px`, animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      )}

      {/* Interim transcript overlay */}
      {interimTranscript && (
        <div className="absolute bottom-2 left-2 right-2 bg-muted/80 border rounded px-2 py-1 text-xs text-muted-foreground italic pointer-events-none">
          {interimTranscript}
        </div>
      )}

      {/* Status hints */}
      {error && state === 'error' && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
      {state === 'listening' && (
        <p className="mt-1 text-xs text-muted-foreground">
          Listening… say "period", "new line", "delete that", or "clear"
        </p>
      )}
    </div>
  );
}
```

---

## Integration: How to Swap a Target Textarea

### Option A — Replace a `<textarea>` directly

```tsx
// BEFORE
<textarea
  value={form.case_summary}
  onChange={(e) => updateForm({ case_summary: e.target.value })}
  placeholder="Describe what happened..."
  rows={6}
  className="w-full px-4 py-3 border rounded-lg resize-none"
/>

// AFTER
import { VoiceTextInput } from '@/components/voice/VoiceTextInput'

<VoiceTextInput
  value={form.case_summary}
  onChange={(val) => updateForm({ case_summary: val })}
  placeholder="Describe what happened..."
  rows={6}
  className="w-full px-4 py-3 border rounded-lg resize-none"
/>
```

Key: `onChange` receives `(value: string)` not an event object.

### Option B — Wrap the shared `<Textarea>` component

If the project has a shared `ui/textarea.tsx`, wrap it once and every field gets voice automatically. Add `'use client'` at the top before wrapping with this hook-based component.

---

## Customization Points

| What | Where | How |
|------|-------|-----|
| Icon color per state | `VoiceTextInput.tsx` `getIconColor()` | Change Tailwind classes |
| Waveform bars | `VoiceTextInput.tsx` waveform section | Adjust heights/delays/colors |
| Voice commands | `voiceCommands.ts` `punctuationMap`/`formattingMap` | Add or change mappings |
| Language | `useVoiceSpeech` `language` option | Pass `language="es-ES"` etc. |
| Button position | `VoiceTextInput.tsx` button `className` | Change `top-2 left-2` |
| Mic size | `Mic` icon | Change `w-4 h-4` to `w-5 h-5` |

'use client'

import { useRef, useState, useEffect } from 'react'
import { XMarkIcon, SpeakerWaveIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '@/i18n'

interface FloatingAudioPlayerProps {
  audioUrl: string
  caseTitle: string
  onClose: () => void
}

export function FloatingAudioPlayer({ audioUrl, caseTitle, onClose }: FloatingAudioPlayerProps) {
  const { t } = useTranslation()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [minimized, setMinimized] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => setPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play()
    }
    setPlaying(!playing)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const seekTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Number(e.target.value)
  }

  if (minimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-700)] text-white rounded-full shadow-lg hover:bg-[var(--accent-500)] transition-colors"
        >
          <SpeakerWaveIcon className="h-4 w-4" />
          <span className="text-xs font-medium">{playing ? t('casePage.playing') : t('casePage.paused')}</span>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <SpeakerWaveIcon className="h-4 w-4 text-[var(--accent-500)] shrink-0" />
          <span className="text-xs text-white/70 truncate">{caseTitle}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setMinimized(true)}
            className="p-1 text-white/40 hover:text-white transition-colors"
            aria-label="Minimize"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-1 text-white/40 hover:text-white transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-[var(--accent-500)] flex items-center justify-center text-white hover:bg-[var(--accent-300)] transition-colors shrink-0"
          >
            {playing ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
          </button>
          <div className="flex-1 min-w-0">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={seekTo}
              className="w-full h-1 accent-[var(--accent-500)] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/40 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

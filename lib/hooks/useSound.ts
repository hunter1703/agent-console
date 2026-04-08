/**
 * useSound Hook
 * 
 * Plays UI sounds with volume control and settings integration.
 */

'use client'

import { useCallback, useEffect, useRef } from 'react'

export type SoundName = 
  | 'click'
  | 'hover'
  | 'success'
  | 'error'
  | 'notification'
  | 'send'
  | 'receive'
  | 'thinking'

interface UseSoundOptions {
  /**
   * Volume level (0-1)
   * @default 0.5
   */
  volume?: number
  
  /**
   * Whether sounds are enabled
   * @default true
   */
  enabled?: boolean
  
  /**
   * Whether to preload the sound
   * @default false
   */
  preload?: boolean
}

const SOUND_PATHS: Record<SoundName, string> = {
  click: '/sounds/click.mp3',
  hover: '/sounds/hover.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  notification: '/sounds/notification.mp3',
  send: '/sounds/send.mp3',
  receive: '/sounds/receive.mp3',
  thinking: '/sounds/thinking.mp3',
}

export function useSound(
  soundName: SoundName,
  { volume = 0.5, enabled = true, preload = false }: UseSoundOptions = {}
) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const audio = new Audio(SOUND_PATHS[soundName])
    audio.volume = volume
    
    if (preload) {
      audio.preload = 'auto'
    }

    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [soundName, volume, preload])

  const play = useCallback(() => {
    if (!enabled || !audioRef.current) return

    // Reset audio to start if already playing
    audioRef.current.currentTime = 0
    
    // Play the sound
    audioRef.current.play().catch((error) => {
      // Ignore errors (e.g., user hasn't interacted with page yet)
      console.debug('Sound play failed:', error)
    })
  }, [enabled])

  const stop = useCallback(() => {
    if (!audioRef.current) return

    audioRef.current.pause()
    audioRef.current.currentTime = 0
  }, [])

  return { play, stop }
}

/**
 * Preload commonly used sounds
 */
export function preloadSounds(soundNames: SoundName[]) {
  if (typeof window === 'undefined') return

  soundNames.forEach((soundName) => {
    const audio = new Audio(SOUND_PATHS[soundName])
    audio.preload = 'auto'
  })
}

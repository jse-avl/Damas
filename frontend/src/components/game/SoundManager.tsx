import { useEffect, useRef } from 'react'

const SOUNDS = {
  move: { freq: 523.25, duration: 0.12, type: 'sine' as OscillatorType },
  capture: { freq: 261.63, duration: 0.2, type: 'triangle' as OscillatorType },
  king: { freq: 783.99, duration: 0.25, type: 'sine' as OscillatorType },
  win: { freq: 1046.5, duration: 0.4, type: 'sine' as OscillatorType },
  lose: { freq: 155.56, duration: 0.4, type: 'sawtooth' as OscillatorType },
}

function playSound(type: keyof typeof SOUNDS) {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    const s = SOUNDS[type]
    osc.type = s.type
    osc.frequency.value = s.freq
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + s.duration)
    osc.start()
    osc.stop(ctx.currentTime + s.duration)
    setTimeout(() => ctx.close(), 600)
  } catch {}
}

interface SoundManagerProps {
  lastEvent: { type: 'move' | 'capture' | 'king' | 'win' | 'lose' } | null
}

export default function SoundManager({ lastEvent }: SoundManagerProps) {
  const prevEvent = useRef(lastEvent)

  useEffect(() => {
    if (lastEvent && lastEvent !== prevEvent.current) {
      playSound(lastEvent.type)
      prevEvent.current = lastEvent
    }
  }, [lastEvent])

  return null
}

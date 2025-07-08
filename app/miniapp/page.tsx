'use client'

import { useEffect, useState, useRef } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export default function MiniApp() {
  const [isReady, setIsReady] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const [animate, setAnimate] = useState(false)

  const tapSoundsRef = useRef<HTMLAudioElement[]>([])
  const soundIndexRef = useRef(0)
  const resetSoundRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create a pool of 5 audio elements for rapid tapping
    tapSoundsRef.current = Array.from({ length: 5 }, () => new Audio('/tap.mp3'))
    resetSoundRef.current = new Audio('/reset.mp3')
  }, [])

  useEffect(() => {
    sdk.actions.ready().then(() => {
      setIsReady(true)
    })
  }, [])

  const handleTap = () => {
    setTapCount(prev => prev + 1)
    setAnimate(true)

    const currentSound = tapSoundsRef.current[soundIndexRef.current]
    if (currentSound) {
      currentSound.currentTime = 0
      currentSound.play().catch(() => {})
      soundIndexRef.current = (soundIndexRef.current + 1) % tapSoundsRef.current.length
    }
  }

  const handleReset = () => {
    setTapCount(0)
    resetSoundRef.current?.play().catch(() => {})
  }

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setAnimate(false), 300)
      return () => clearTimeout(timer)
    }
  }, [animate])

  if (!isReady) {
    return (
      <div style={{ padding: 20, textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <h1>🎮 Loading Farcaster Tapping Game...</h1>
        <p>Please wait while we initialize your mini app.</p>
      </div>
    )
  }

  const getMessage = () => {
    if (tapCount === 0) return "Start tapping to see your score!"
    if (tapCount < 20) return "Keep going! You're doing great!"
    if (tapCount < 50) return "Wow! You're on fire! 🔥"
    return "Amazing! You're a tapping champion! 🏆"
  }

  return (
    <div style={{ padding: 20, textAlign: 'center', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>🎮 Farcaster Tapping Game</h1>

      <div style={{ backgroundColor: '#FFD700', padding: '40px', borderRadius: '15px', margin: '20px 0', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <h2
          className={animate ? 'pop' : ''}
          style={{ color: 'navy', fontSize: '48px', margin: '0 0 20px 0' }}
        >
          Taps: {tapCount}
        </h2>

        <button
          onClick={handleTap}
          style={{
            fontSize: '24px',
            padding: '15px 30px',
            margin: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          🎯 TAP ME!
        </button>

        <button
          onClick={handleReset}
          style={{
            fontSize: '18px',
            padding: '10px 20px',
            margin: '10px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
          }}
        >
          🔄 Reset
        </button>
      </div>

      <p style={{ color: '#666', fontSize: '16px' }}>{getMessage()}</p>

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#555' }}>
        <p>🚀 Keep tapping and challenge your friends!</p>
        <p>If you liked the game, follow <strong>@vinu07</strong></p>
      </div>

      <style global jsx>{`
        .pop {
          animation: pop 0.3s ease-in-out;
        }
        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

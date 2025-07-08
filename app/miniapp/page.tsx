'use client'

import { useEffect, useState, useRef } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export default function MiniApp() {
  const [isReady, setIsReady] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15)
  const [gameEnded, setGameEnded] = useState(false)
  const [animate, setAnimate] = useState(false)

  const tapSoundRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    tapSoundRef.current = new Audio('/tap.mp3')
  }, [])

  useEffect(() => {
    sdk.actions.ready().then(() => setIsReady(true))
  }, [])

  const startGame = () => {
    setTapCount(0)
    setTimeLeft(15)
    setGameEnded(false)
    setIsPlaying(true)

    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          setIsPlaying(false)
          setGameEnded(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleTap = () => {
    if (!isPlaying) return
    setTapCount((prev) => prev + 1)
    setAnimate(true)
    tapSoundRef.current?.play().catch(() => {})
  }

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setAnimate(false), 150)
      return () => clearTimeout(timer)
    }
  }, [animate])

  const tps = tapCount / 15
  const title =
    tapCount < 10 ? '🐼 Panda Tapper' :
    tapCount < 30 ? '🐯 Tiger Tapper' :
    '🐆 Cheetah Tapper'

  if (!isReady) {
    return (
      <div style={{ padding: 20, textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <h1>🎮 Loading Farcaster Tapping Game...</h1>
        <p>Please wait while we initialize your mini app.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 20, textAlign: 'center', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>🎮 Farcaster Tapping Game</h1>

      {!isPlaying && !gameEnded && (
        <button
          onClick={startGame}
          style={{
            fontSize: '24px',
            padding: '15px 30px',
            margin: '20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          ▶️ Start Game
        </button>
      )}

      {isPlaying && (
        <>
          <div style={{ fontSize: '20px', marginBottom: '10px' }}>⏱️ Time Left: {timeLeft}s</div>

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
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            🎯 TAP!
          </button>
        </>
      )}

      {gameEnded && (
        <div style={{ marginTop: '30px', backgroundColor: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '10px' }}>{title}</h2>
          <p style={{ fontSize: '24px' }}>🧮 Total Taps: {tapCount}</p>
          <p style={{ fontSize: '24px' }}>⚡ TPS: {tps.toFixed(1)}</p>

          <button
            onClick={startGame}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              fontSize: '18px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            🔁 Play Again
          </button>

          <button
            onClick={() => {
              const text = `I scored ${tapCount} taps in 15 seconds with ${tps.toFixed(1)} TPS on the Farcaster Tapping Game! 🕹️🔥\nTry it now!`
              sdk.cast.publish({ text })
            }}
            style={{
              marginTop: '10px',
              marginLeft: '10px',
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            📤 Share Your Score
          </button>
        </div>
      )}

      <style jsx>{`
        .pop {
          animation: pop 0.2s ease-in-out;
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

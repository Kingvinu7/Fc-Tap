'use client'

import { useEffect, useState, useRef } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export default function MiniApp() {
  const [isReady, setIsReady] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const [animate, setAnimate] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [tps, setTps] = useState(0)

  const tapSoundRef = useRef<HTMLAudioElement | null>(null)
  const resetSoundRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    tapSoundRef.current = new Audio('/tap.mp3')
    resetSoundRef.current = new Audio('/reset.mp3')
  }, [])

  useEffect(() => {
    sdk.actions.ready().then(() => setIsReady(true))
  }, [])

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(t => t - 1)
      }, 1000)
    } else if (gameStarted && timeLeft === 0) {
      setGameOver(true)
      setGameStarted(false)
      setTps(tapCount / 15)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [gameStarted, timeLeft])

  const handleTap = () => {
    if (!gameStarted || gameOver) return
    setTapCount(prev => prev + 1)
    setAnimate(true)
    const tap = new Audio('/tap.mp3')
    tap.play().catch(() => {})
  }

  const handleStart = () => {
    setTapCount(0)
    setTimeLeft(15)
    setGameStarted(true)
    setGameOver(false)
  }

  const handleReset = () => {
    setTapCount(0)
    setTps(0)
    setTimeLeft(15)
    setGameStarted(false)
    setGameOver(false)
    resetSoundRef.current?.play().catch(() => {})
  }

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setAnimate(false), 300)
      return () => clearTimeout(timer)
    }
  }, [animate])

  const getPerformanceText = () => {
    if (tps < 1.5) return "🐼 You're tapping like a panda!"
    if (tps < 3.5) return "🙉 Pretty quick!"
    return "🐆 You're a cheetah!"
  }

  if (!isReady) {
    return (
      <div style={{ padding: 20, textAlign: 'center', fontFamily: 'Arial' }}>
        <h1>🎮 Loading Farcaster Tapping Game...</h1>
        <p>Please wait while we initialize your mini app.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 20, textAlign: 'center', fontFamily: 'Arial', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>🎯 Farcaster Tapping Game</h1>

      {!gameOver ? (
        <>
          <h2 style={{ fontSize: '22px', color: '#444' }}>
            {gameStarted ? `⏱️ Time Left: ${timeLeft}s` : 'Tap as fast as you can for 15 seconds!'}
          </h2>

          <div style={{ backgroundColor: '#FFD700', padding: '30px', borderRadius: '15px', marginTop: '20px' }}>
            <h2 className={animate ? 'pop' : ''} style={{ fontSize: '48px', color: 'navy' }}>
              Taps: {tapCount}
            </h2>

            <button
              onClick={handleTap}
              disabled={!gameStarted}
              style={{
                fontSize: '24px',
                padding: '15px 30px',
                margin: '15px',
                backgroundColor: gameStarted ? '#4CAF50' : '#aaa',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: gameStarted ? 'pointer' : 'default',
              }}
            >
              🚀 TAP!
            </button>

            {!gameStarted && (
              <button
                onClick={handleStart}
                style={{
                  fontSize: '18px',
                  padding: '10px 25px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                }}
              >
                ▶️ Start
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <h2 style={{ fontSize: '26px', color: '#222', marginTop: '20px' }}>
            ⏱️ Time's up!
          </h2>
          <p style={{ fontSize: '20px', margin: '10px 0' }}>
            You scored <strong>{tapCount}</strong> taps
          </p>
          <p style={{ fontSize: '20px', margin: '10px 0' }}>
            TPS: <strong>{tps.toFixed(1)}</strong>
          </p>
          <p style={{ fontSize: '18px', color: '#555', marginTop: '10px' }}>
            {getPerformanceText()}
          </p>

          <div style={{ marginTop: 20 }}>
            <button
              onClick={handleReset}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                marginRight: '10px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
              }}
            >
              🔁 Play Again
            </button>

            <button
              onClick={() => {
                const text = `I scored ${tapCount} taps in 15 seconds with ${tps.toFixed(1)} TPS on the Farcaster Tapping Game! 🕹️🔥\nTry it now!`
                sdk.actions.share({ text })
              }}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
              }}
            >
              📤 Share Your Score
            </button>
          </div>
        </>
      )}

      <style jsx>{`
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

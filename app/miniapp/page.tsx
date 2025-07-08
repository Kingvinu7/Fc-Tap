'use client'

import { useEffect, useState, useRef } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export default function MiniApp() {
  const [isReady, setIsReady] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const [animate, setAnimate] = useState(false)
  const [isGameRunning, setIsGameRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15)
  const [tps, setTps] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const tapSoundRef = useRef<HTMLAudioElement | null>(null)
  const resetSoundRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    tapSoundRef.current = new Audio('/tap.mp3')
    resetSoundRef.current = new Audio('/reset.mp3')
  }, [])

  useEffect(() => {
    sdk.actions.ready().then(() => {
      setIsReady(true)
    })
  }, [])

  useEffect(() => {
    if (gameOver) {
      const tpsFinal = tapCount / 15
      setTps(tpsFinal)
    }
  }, [gameOver, tapCount])

  const startGame = () => {
    setTapCount(0)
    setTimeLeft(15)
    setIsGameRunning(true)
    setGameOver(false)

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          setIsGameRunning(false)
          setGameOver(true)
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleTap = () => {
    if (!isGameRunning || timeLeft <= 0) return
    setTapCount((prev) => prev + 1)
    setAnimate(true)
    if (tapSoundRef.current) {
      tapSoundRef.current.pause()
      tapSoundRef.current.currentTime = 0
      tapSoundRef.current.play().catch(() => {})
    }
  }

  const handleReset = () => {
    setTapCount(0)
    setTps(0)
    setIsGameRunning(false)
    setGameOver(false)
    setTimeLeft(15)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    if (resetSoundRef.current) {
      resetSoundRef.current.pause()
      resetSoundRef.current.currentTime = 0
      resetSoundRef.current.play().catch(() => {})
    }
  }

  const getRank = () => {
    if (tps < 3) return '🐢 Turtle'
    if (tps < 5) return '🐼 Panda'
    if (tps < 7) return '🐇 Rabbit'
    if (tps < 9) return '🐆 Cheetah'
    return '⚡️ Flash'
  }

  const handleShareScore = async () => {
    try {
      const rank = getRank()
      const text = `🎮 Just scored ${tapCount} taps in 15 seconds! 

⚡️ ${tps.toFixed(1)} TPS | ${rank}

Can you beat my score? 🔥`

      await sdk.actions.composeCast({ text })
    } catch (error) {
      console.error("Error sharing score:", error)
    }
  }

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setAnimate(false), 300)
      return () => clearTimeout(timer)
    }
  }, [animate])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  if (!isReady) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h1>🎮 Loading Farcaster Tapping Game...</h1>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: 20,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
        minHeight: '100vh'
      }}
    >
      <h1 style={{ marginBottom: '30px' }}>🎮 Farcaster Tapping Game</h1>

      {!gameOver && (
        <div>
          <h2 style={{ fontSize: '24px', marginBottom: 10 }}>⏱️ Time Left: {timeLeft}s</h2>
          <h2
            className={animate ? 'pop' : ''}
            style={{ fontSize: '48px', margin: '0 0 20px 0' }}
          >
            Taps: {tapCount}
          </h2>

          <button
            onClick={handleTap}
            disabled={!isGameRunning}
            style={{
              fontSize: '24px',
              padding: '15px 30px',
              margin: '10px',
              backgroundColor: isGameRunning ? '#4CAF50' : '#888',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: isGameRunning ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
            }}
          >
            🎯 TAP ME!
          </button>

          {!isGameRunning && timeLeft === 15 && (
            <button
              onClick={startGame}
              style={{
                fontSize: '18px',
                padding: '10px 20px',
                margin: '10px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              ▶️ Start Game
            </button>
          )}

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
      )}

      {gameOver && (
        <div
          style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '12px',
            marginTop: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <h2 style={{ fontSize: '32px', marginBottom: 10 }}>⏰ Time's up!</h2>
          <p style={{ fontSize: '24px' }}>Total Taps: <strong>{tapCount}</strong></p>
          <p style={{ fontSize: '24px' }}>TPS: <strong>{tps.toFixed(1)}</strong></p>
          <p style={{ fontSize: '20px' }}>Rank: <strong>{getRank()}</strong></p>

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
              fontWeight: 'bold',
            }}
          >
            🔁 Play Again
          </button>

          <button
            onClick={handleShareScore}
            style={{
              marginTop: '10px',
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            📣 Share Your Score
          </button>
        </div>
      )}

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

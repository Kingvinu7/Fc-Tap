'use client'

import { useEffect, useState, useRef } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'
import { supabase } from '@/lib/supabaseClient'

export default function MiniApp() {
  const [isReady, setIsReady] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const [animate, setAnimate] = useState(false)
  const [isGameRunning, setIsGameRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15)
  const [tps, setTps] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [username, setUsername] = useState('')
  const [leaderboard, setLeaderboard] = useState<{ username: string, taps: number, tps: number }[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const tapSoundRef = useRef<HTMLAudioElement | null>(null)
  const resetSoundRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const rawTapCountRef = useRef(0)

  useEffect(() => {
    tapSoundRef.current = new Audio('/tap.mp3')
    tapSoundRef.current.load()
    resetSoundRef.current = new Audio('/reset.mp3')
    resetSoundRef.current.load()
  }, [])

  useEffect(() => {
    sdk.actions.ready().then(() => setIsReady(true))
    fetchLeaderboard()
  }, [])

  useEffect(() => {
    if (gameOver) {
      const finalTps = rawTapCountRef.current / 15
      setTps(finalTps)

      setTimeout(() => {
        let storedName = localStorage.getItem('fc-username')

        if (!storedName) {
          storedName = prompt(
            'Fc Taps Game says:\n\nEnter your Farcaster username for some benefits.\n(Tip: enter it correctly, you won’t be able to change it later!)'
          )?.trim() || ''

          if (storedName) {
            localStorage.setItem('fc-username', storedName)
          }
        }

        if (storedName) {
          setUsername(storedName)
          supabase
            .from('leaderboard')
            .insert([{ username: storedName, taps: rawTapCountRef.current, tps: finalTps }])
            .then(({ error }) => {
              if (error) console.error('Error saving score to Supabase:', error)
              fetchLeaderboard()
            })
        }
      }, 100)
    }
  }, [gameOver])

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('username, taps, tps')
      .order('taps', { ascending: false })
      .limit(10)

    if (!error && data) setLeaderboard(data)
  }

  const startGame = () => {
    rawTapCountRef.current = 0
    setTapCount(0)
    setTimeLeft(15)
    setIsGameRunning(true)
    setGameOver(false)

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
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
    rawTapCountRef.current += 1
    setTapCount(prev => prev + 1)
    setAnimate(true)

    const clone = tapSoundRef.current?.cloneNode() as HTMLAudioElement
    clone?.play().catch(() => {})
  }

  const handleReset = () => {
    rawTapCountRef.current = 0
    setTapCount(0)
    setTps(0)
    setIsGameRunning(false)
    setGameOver(false)
    setTimeLeft(15)
    clearInterval(timerRef.current!)
    resetSoundRef.current?.play().catch(() => {})
  }

  const getRank = () => {
    if (tps < 3) return { name: '🐢 Turtle', message: 'Slow and steady!' }
    if (tps < 5) return { name: '🐼 Panda', message: 'Chill but strong!' }
    if (tps < 7) return { name: '🐇 Rabbit', message: 'Quick on your feet!' }
    if (tps < 9) return { name: '🐆 Cheetah', message: 'Blazing fast!' }
    return { name: '⚡️ Flash', message: 'You tapped like lightning!' }
  }

  const handleShareScore = async () => {
    try {
      const rank = getRank()
      const text = `🎮 Just scored ${tapCount} taps in 15 seconds!
⚡️ ${tps.toFixed(1)} TPS | ${rank.name}
Can you beat my score? 🔥
👉 Play here: https://farcaster.xyz/miniapps/jcV0ojRAzBKZ/fc-tap-game`
      await sdk.actions.composeCast({ text })
    } catch (error) {
      console.error('Error sharing score:', error)
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
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  if (!isReady) {
    return (
      <div style={{ padding: 20, textAlign: 'center', backgroundColor: '#800080', minHeight: '100vh', color: '#ffe241' }}>
        <h1>🎮 Loading Farcaster Tapping Game...</h1>
      </div>
    )
  }

  const rank = getRank()

  return (
    <div
      style={{
        padding: 20,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#800080',
        minHeight: '100vh',
        color: '#ffe241'
      }}
    >
      <h1 style={{ marginBottom: '30px' }}>🎮 Farcaster Tapping Game</h1>

      <button
        onClick={() => setShowLeaderboard(!showLeaderboard)}
        style={{
          margin: '10px 0',
          padding: '8px 16px',
          borderRadius: '8px',
          backgroundColor: '#333',
          color: '#ffe241',
          cursor: 'pointer'
        }}
      >
        {showLeaderboard ? '🎮 Back to Game' : '🏆 Leaderboard'}
      </button>

      {showLeaderboard ? (
        <div style={{ marginTop: 20 }}>
          <h2>🏆 Leaderboard</h2>
          {leaderboard.length === 0 ? (
            <p>No scores yet.</p>
          ) : (
            leaderboard.map((entry, i) => (
              <div
                key={`${entry.username}-${i}`}
                style={{
                  margin: '8px auto',
                  padding: '10px',
                  maxWidth: '320px',
                  borderRadius: '8px',
                  backgroundColor: '#222',
                  border: '1px solid #555'
                }}
              >
                <strong>{i + 1}. @{entry.username}</strong>
                <div>{entry.taps} taps ({entry.tps.toFixed(1)} TPS)</div>
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          {!gameOver ? (
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: 10 }}>⏱️ Time Left: {timeLeft}s</h2>
              <h2 className={animate ? 'pop' : ''} style={{ fontSize: '48px', marginBottom: 20 }}>Taps: {tapCount}</h2>

              <button
                onClick={handleTap}
                disabled={!isGameRunning}
                style={{
                  fontSize: '24px',
                  padding: '15px 30px',
                  backgroundColor: isGameRunning ? '#FFD700' : '#aaa',
                  color: '#000',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: isGameRunning ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold',
                  marginBottom: '20px'
                }}
              >
                🎯 TAP ME!
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {!isGameRunning && timeLeft === 15 && (
                  <button
                    onClick={startGame}
                    style={{
                      width: '200px',
                      fontSize: '18px',
                      padding: '10px 20px',
                      marginBottom: '10px',
                      backgroundColor: '#00BFFF',
                      color: '#ffe241',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    ▶️ Start Game
                  </button>
                )}

                <button
                  onClick={handleReset}
                  style={{
                    width: '200px',
                    fontSize: '18px',
                    padding: '10px 20px',
                    backgroundColor: '#f44336',
                    color: '#ffe241',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Reset
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#22223b',
                padding: '30px',
                borderRadius: '12px',
                marginTop: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                color: '#ffe241'
              }}
            >
              <h2 style={{ fontSize: '32px', marginBottom: 10 }}>⏰ Time's up!</h2>
              <p style={{ fontSize: '24px' }}>You're a <strong>{rank.name}</strong></p>
              <p style={{ fontSize: '20px', fontStyle: 'italic' }}>{rank.message}</p>
              <p style={{ fontSize: '22px' }}>You tapped <strong>{tapCount}</strong> times with <strong>{tps.toFixed(1)} TPS</strong></p>
              <button onClick={startGame} style={{
                marginTop: '20px', padding: '10px 20px', fontSize: '18px',
                backgroundColor: '#4CAF50', color: '#ffe241', border: 'none', borderRadius: '10px',
                cursor: 'pointer', fontWeight: 'bold'
              }}>🔁 Play Again</button>
              <button onClick={handleShareScore} style={{
                marginTop: '10px', padding: '12px 24px', fontSize: '16px',
                backgroundColor: '#8B5CF6', color: '#ffe241', border: 'none',
                borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold'
              }}>📣 Share Your Score</button>
            </div>
          )}
        </>
      )}

      <p style={{ marginTop: '40px', fontSize: '14px', color: '#ffe241' }}>
        Built by <a href="https://farcaster.xyz/vinu07" target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700', textDecoration: 'none' }}>@vinu07</a>
      </p>

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

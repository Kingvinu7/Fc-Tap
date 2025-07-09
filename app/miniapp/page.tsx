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
  const [leaderboard, setLeaderboard] = useState([])
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
      .select('*')
      .order('tps', { ascending: false })
      .limit(10)

    if (!error && data) {
      setLeaderboard(data)
    }
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
      <div style={{ padding: 20, textAlign: 'center', backgroundColor: '#800080', minHeight: '100vh', color: 'white' }}>
        <h1>🎮 Loading Farcaster Tapping Game...</h1>
      </div>
    )
  }

  const rank = getRank()

  return (
    <div style={{ padding: 20, textAlign: 'center', fontFamily: 'Arial, sans-serif', backgroundColor: '#800080', minHeight: '100vh', color: 'white' }}>
      <h1 style={{ marginBottom: '20px' }}>🎮 Farcaster Tapping Game</h1>

      <button onClick={() => {
        setShowLeaderboard(prev => !prev)
        if (!showLeaderboard) fetchLeaderboard()
      }} style={{
        fontSize: '16px', padding: '8px 16px', marginBottom: '20px',
        backgroundColor: showLeaderboard ? '#4CAF50' : '#444', color: 'white',
        border: 'none', borderRadius: '8px', cursor: 'pointer'
      }}>
        {showLeaderboard ? '🎮 Back to Game' : '🏆 View Leaderboard'}
      </button>

      {showLeaderboard ? (
        <div>
          <h2>🏆 Top Players</h2>
          {leaderboard.length === 0 ? (
            <p>No scores yet.</p>
          ) : (
            leaderboard.map((entry, index) => (
              <div key={index} style={{
                padding: '8px', margin: '6px auto', maxWidth: '400px',
                backgroundColor: '#222', borderRadius: '6px',
                border: entry.username === username ? '2px solid #FFD700' : '1px solid #555'
              }}>
                <strong>{index + 1}. @{entry.username}</strong><br />
                {entry.taps} taps · {entry.tps.toFixed(1)} TPS
              </div>
            ))
          )}
        </div>
      ) : (
        !gameOver ? (
          <div>
            <h2>⏱️ Time Left: {timeLeft}s</h2>
            <h2 className={animate ? 'pop' : ''} style={{ fontSize: '48px' }}>Taps: {tapCount}</h2>
            <button onClick={handleTap} disabled={!isGameRunning} style={{
              fontSize: '24px', padding: '15px 30px',
              backgroundColor: isGameRunning ? '#FFD700' : '#aaa', color: '#000',
              border: 'none', borderRadius: '10px', cursor: isGameRunning ? 'pointer' : 'not-allowed', fontWeight: 'bold'
            }}>🎯 TAP ME!</button>
            {!isGameRunning && timeLeft === 15 && (
              <button onClick={startGame} style={{
                fontSize: '18px', padding: '10px 20px', margin: '10px',
                backgroundColor: '#00BFFF', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer'
              }}>▶️ Start Game</button>
            )}
            <button onClick={handleReset} style={{
              fontSize: '18px', padding: '10px 20px', margin: '10px',
              backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer'
            }}>🔄 Reset</button>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#22223b', padding: '30px', borderRadius: '12px',
            marginTop: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', color: 'white'
          }}>
            <h2 style={{ fontSize: '32px', marginBottom: 10 }}>⏰ Time's up!</h2>
            <p style={{ fontSize: '24px' }}>You're a <strong>{rank.name}</strong></p>
            <p style={{ fontSize: '20px', fontStyle: 'italic' }}>{rank.message}</p>
            <p style={{ fontSize: '22px' }}>You tapped <strong>{tapCount}</strong> times with <strong>{tps.toFixed(1)} TPS</strong></p>
            <button onClick={startGame} style={{
              marginTop: '20px', padding: '10px 20px', fontSize: '18px',
              backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '10px',
              cursor: 'pointer', fontWeight: 'bold'
            }}>🔁 Play Again</button>
            <button onClick={handleShareScore} style={{
              marginTop: '10px', padding: '12px 24px', fontSize: '16px',
              backgroundColor: '#8B5CF6', color: 'white', border: 'none',
              borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold'
            }}>📣 Share Your Score</button>
          </div>
        )
      )}

      <p style={{ marginTop: '40px', fontSize: '14px', color: '#eee' }}>
        Built by <a href="https://farcaster.xyz/vinu07" target="_blank" style={{ color: '#FFD700', textDecoration: 'none' }}>@vinu07</a>
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

'use client'

import { useEffect, useState, useRef } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'
import { supabase } from '@/lib/supabaseClient'

interface LeaderboardEntry {
  id: number
  username: string
  taps: number
  tps: number
  created_at: string
}

export default function MiniApp() {
  const [isReady, setIsReady] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const [animate, setAnimate] = useState(false)
  const [isGameRunning, setIsGameRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15)
  const [tps, setTps] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [username, setUsername] = useState('')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
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

  useEffect(() => {
    if (gameOver) {
      const finalTps = rawTapCountRef.current / 15
      setTps(finalTps)

      setTimeout(async () => {
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

          const { data: existing } = await supabase
            .from('leaderboard')
            .select('*')
            .eq('username', storedName)
            .order('taps', { ascending: false })
            .limit(1)

          const currentBest = existing?.[0]

          if (!currentBest || rawTapCountRef.current > currentBest.taps) {
            await supabase
              .from('leaderboard')
              .upsert(
                [{ username: storedName, taps: rawTapCountRef.current, tps: finalTps }],
                { onConflict: 'username' }
              )
            fetchLeaderboard()
          }
        }
      }, 100)
    }
  }, [gameOver])

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
    rawTapCountRef.current++
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
    const rank = getRank()
    const text = `🎮 Just scored ${tapCount} taps in 15 seconds!\n⚡️ ${tps.toFixed(1)} TPS | ${rank.name}\nCan you beat me?\n👉 https://farcaster.xyz/miniapps/jcV0ojRAzBKZ/fc-tap-game`
    await sdk.actions.composeCast({ text })
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
    <div style={{ padding: 20, textAlign: 'center', backgroundColor: '#800080', minHeight: '100vh', color: '#FFD966' }}>
      <h1 style={{ marginBottom: 20 }}>🎮 Farcaster Tapping Game</h1>

      {showLeaderboard ? (
        <div style={{ backgroundColor: '#2e2e3a', padding: 20, borderRadius: 12, marginBottom: 20 }}>
          <h2 style={{ marginBottom: 12 }}>🏆 Leaderboard</h2>
          {leaderboard.length === 0 ? (
            <p>No scores yet.</p>
          ) : (
            leaderboard.map((entry, index) => (
              <div key={entry.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid #555',
                fontSize: 16
              }}>
                <span>#{index + 1} @{entry.username}</span>
                <span>{entry.taps} taps ({entry.tps.toFixed(1)} TPS)</span>
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          {!gameOver ? (
            <div>
              <h2>⏱️ Time Left: {timeLeft}s</h2>
              <h2 className={animate ? 'pop' : ''} style={{ fontSize: '48px' }}>Taps: {tapCount}</h2>
              <button onClick={handleTap} disabled={!isGameRunning} style={{
                fontSize: '24px', padding: '15px 30px', marginBottom: '20px',
                backgroundColor: isGameRunning ? '#FFD700' : '#aaa',
                color: '#000', border: 'none', borderRadius: '10px',
                cursor: isGameRunning ? 'pointer' : 'not-allowed', fontWeight: 'bold'
              }}>🎯 TAP ME!</button>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button onClick={startGame} style={{
                  fontSize: '18px', padding: '10px 20px',
                  backgroundColor: '#00BFFF', color: 'white',
                  border: 'none', borderRadius: '10px', cursor: 'pointer', width: 130
                }}>▶️ Start Game</button>
                <button onClick={handleReset} style={{
                  fontSize: '18px', padding: '10px 20px',
                  backgroundColor: '#f44336', color: 'white',
                  border: 'none', borderRadius: '10px', cursor: 'pointer', width: 130
                }}>🔄 Reset</button>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#2e2e3a', padding: 20, borderRadius: 12, marginTop: 20
            }}>
              <h2>⏰ Time's up!</h2>
              <p>You are a <strong>{rank.name}</strong></p>
              <p style={{ fontStyle: 'italic' }}>{rank.message}</p>
              <p><strong>{tapCount}</strong> taps with <strong>{tps.toFixed(1)} TPS</strong></p>
              <button onClick={startGame} style={{
                marginTop: 10, padding: '10px 20px', backgroundColor: '#4CAF50',
                color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer'
              }}>🔁 Play Again</button>
              <button onClick={handleShareScore} style={{
                marginTop: 10, padding: '10px 20px', backgroundColor: '#8B5CF6',
                color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer'
              }}>📣 Share Your Score</button>
            </div>
          )}
        </>
      )}

      <button onClick={() => setShowLeaderboard(prev => !prev)} style={{
        marginTop: 30,
        backgroundColor: '#333',
        color: '#FFD966',
        padding: '10px 20px',
        borderRadius: 8,
        cursor: 'pointer',
        border: 'none'
      }}>
        {showLeaderboard ? '🎮 Back to Game' : '🏆 Show Leaderboard'}
      </button>

      <p style={{ marginTop: 40, fontSize: 14 }}>
        Built by <a href="https://farcaster.xyz/vinu07" target="_blank" style={{ color: '#FFD700' }}>@vinu07</a>
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

'use client'

import { useEffect, useState, useRef } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'
import { supabase } from '@/lib/supabaseClient'

interface LeaderboardEntry {
  id: number
  username: string
  score: number
  tps: number
  created_at: string
}

interface UserProfile {
  fid: number
  username: string
}

export default function MiniApp() {
  const [isReady, setIsReady] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const [animate, setAnimate] = useState(false)
  const [isGameRunning, setIsGameRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15)
  const [tps, setTps] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
    const init = async () => {
      await sdk.actions.ready()
      setIsReady(true)

      try {
        const context = await sdk.context
        const user = context.user
        if (user?.fid) {
          const profile = await sdk.actions.viewProfile({ fid: user.fid })
          if (profile?.username) {
            setCurrentUser({ fid: user.fid, username: profile.username })
          }
        }
      } catch (e) {
        console.error('Error fetching user context:', e)
      }

      fetchLeaderboard()
    }

    init()
  }, [])

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('tps', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error loading leaderboard:', error)
    } else {
      setLeaderboard(data || [])
    }
  }

  useEffect(() => {
    if (gameOver) {
      const finalTps = rawTapCountRef.current / 15
      setTps(finalTps)
      saveScore(finalTps)
    }
  }, [gameOver])

  const saveScore = async (finalTps: number) => {
    if (!currentUser) return

    setIsLoading(true)
    const { error } = await supabase.from('leaderboard').insert([
      {
        username: currentUser.username,
        score: rawTapCountRef.current,
        tps: finalTps
      }
    ])
    if (error) {
      console.error('Failed to save score:', error)
    } else {
      fetchLeaderboard()
    }
    setIsLoading(false)
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
    rawTapCountRef.current++
    setTapCount(prev => prev + 1)
    setAnimate(true)

    const tap = tapSoundRef.current?.cloneNode() as HTMLAudioElement
    tap?.play().catch(() => {})
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
    if (!currentUser) return
    const rank = getRank()
    const text = `🎮 Scored ${tapCount} taps in 15s!\n⚡️ ${tps.toFixed(1)} TPS | ${rank.name}\nCan you beat me?\n👉 https://farcaster.xyz/miniapps/jcV0ojRAzBKZ/fc-tap-game`
    await sdk.actions.composeCast({ text })
  }

  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setAnimate(false), 300)
      return () => clearTimeout(t)
    }
  }, [animate])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const rank = getRank()

  return (
    <div style={{ padding: 20, textAlign: 'center', backgroundColor: '#800080', color: 'white', minHeight: '100vh' }}>
      <h1>🎮 Farcaster Tapping Game</h1>

      <button
        onClick={() => setShowLeaderboard(!showLeaderboard)}
        style={{ margin: '10px 0', padding: '8px 16px', borderRadius: '8px', backgroundColor: '#333', color: 'white', cursor: 'pointer' }}
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
              <div key={entry.id} style={{
                margin: '8px 0',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: entry.username === currentUser?.username ? '#4CAF5020' : '#222',
                border: entry.username === currentUser?.username ? '2px solid #4CAF50' : '1px solid #555'
              }}>
                <strong>{i + 1}. @{entry.username}</strong> — {entry.score} taps ({entry.tps.toFixed(1)} TPS)
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
            <div style={{ backgroundColor: '#222', padding: 20, borderRadius: '10px', marginTop: 20 }}>
              <h2>⏰ Time's up!</h2>
              <p>You are a <strong>{rank.name}</strong></p>
              <p style={{ fontStyle: 'italic' }}>{rank.message}</p>
              <p><strong>{tapCount}</strong> taps with <strong>{tps.toFixed(1)} TPS</strong></p>
              {isLoading && <p>💾 Saving...</p>}
              <button onClick={startGame} style={{
                marginTop: '10px', padding: '10px 20px', backgroundColor: '#4CAF50',
                color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer'
              }}>🔁 Play Again</button>
              <button onClick={handleShareScore} style={{
                marginTop: '10px', padding: '10px 20px', backgroundColor: '#8B5CF6',
                color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer'
              }}>📣 Share Your Score</button>
            </div>
          )}
        </>
      )}

      <p style={{ marginTop: 40, fontSize: 14 }}>Built by <a href="https://farcaster.xyz/vinu07" target="_blank" style={{ color: '#FFD700' }}>@vinu07</a></p>

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

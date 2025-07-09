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
  const [userBestScore, setUserBestScore] = useState<LeaderboardEntry | null>(null)

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
    const initialize = async () => {
      try {
        await sdk.actions.ready()
        setIsReady(true)

        const context = await sdk.context
        const user = context?.user

        if (user?.fid) {
          const profile = await sdk.actions.viewProfile(user.fid)
          if (profile?.username) {
            const username = profile.username
            setCurrentUser({ fid: user.fid, username })
            await fetchUserBestScore(username)
          }
        }

        await fetchLeaderboard()
      } catch (err) {
        console.error('Init error:', err)
        setIsReady(true)
      }
    }

    initialize()
  }, [])

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('tps', { ascending: false })
      .limit(10)

    if (error) console.error(error)
    else setLeaderboard(data || [])
  }

  const fetchUserBestScore = async (username: string) => {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('username', username)
      .order('tps', { ascending: false })
      .limit(1)

    if (error) console.error(error)
    else if (data?.length) setUserBestScore(data[0])
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

    const { error } = await supabase.from('leaderboard').insert([
      {
        username: currentUser.username,
        score: rawTapCountRef.current,
        tps: finalTps
      }
    ])

    if (error) console.error('Insert error:', error)
    else {
      await fetchLeaderboard()
      await fetchUserBestScore(currentUser.username)
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
    setTimeLeft(15)
    setIsGameRunning(false)
    setGameOver(false)
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
      const pos = leaderboard.findIndex(e => e.username === currentUser?.username) + 1
      const text = `🎮 Just scored ${tapCount} taps in 15 seconds!
⚡️ ${tps.toFixed(1)} TPS | ${rank.name}${pos ? ` | #${pos} on leaderboard` : ''}
👉 Play here: https://farcaster.xyz/miniapps/jcV0ojRAzBKZ/fc-tap-game`
      await sdk.actions.composeCast({ text })
    } catch (err) {
      console.error('Share error:', err)
    }
  }

  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setAnimate(false), 300)
      return () => clearTimeout(t)
    }
  }, [animate])

  useEffect(() => {
    return () => timerRef.current && clearInterval(timerRef.current)
  }, [])

  if (!isReady) {
    return <div style={{ padding: 20, textAlign: 'center', backgroundColor: '#800080', minHeight: '100vh', color: 'white' }}>
      <h1>🎮 Loading Farcaster Tapping Game...</h1>
    </div>
  }

  const rank = getRank()

  return (
    <div style={{ padding: 20, textAlign: 'center', fontFamily: 'Arial, sans-serif', backgroundColor: '#800080', minHeight: '100vh', color: 'white' }}>
      <h1 style={{ marginBottom: 30 }}>🎮 Farcaster Tapping Game</h1>

      {!gameOver ? (
        <div>
          <h2 style={{ fontSize: 24, marginBottom: 10 }}>⏱️ Time Left: {timeLeft}s</h2>
          <h2 className={animate ? 'pop' : ''} style={{ fontSize: 48, margin: '0 0 20px' }}>Taps: {tapCount}</h2>
          <button onClick={handleTap} disabled={!isGameRunning} style={{
            fontSize: 24, padding: '15px 30px', margin: '10px',
            backgroundColor: isGameRunning ? '#FFD700' : '#aaa', color: '#000',
            border: 'none', borderRadius: '10px', cursor: isGameRunning ? 'pointer' : 'not-allowed', fontWeight: 'bold'
          }}>🎯 TAP ME!</button>
          {!isGameRunning && timeLeft === 15 && (
            <button onClick={startGame} style={{
              fontSize: 18, padding: '10px 20px', margin: '10px',
              backgroundColor: '#00BFFF', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer'
            }}>▶️ Start Game</button>
          )}
          <button onClick={handleReset} style={{
            fontSize: 18, padding: '10px 20px', margin: '10px',
            backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer'
          }}>🔄 Reset</button>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#22223b', padding: '30px', borderRadius: '12px',
          marginTop: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', color: 'white'
        }}>
          <h2 style={{ fontSize: 32, marginBottom: 10 }}>⏰ Time's up!</h2>
          <p style={{ fontSize: 24 }}>You're a <strong>{rank.name}</strong></p>
          <p style={{ fontSize: 20, fontStyle: 'italic' }}>{rank.message}</p>
          <p style={{ fontSize: 22 }}>You tapped <strong>{tapCount}</strong> times with <strong>{tps.toFixed(1)} TPS</strong></p>
          {userBestScore && tps > userBestScore.tps && (
            <p style={{ fontSize: 18, color: '#4CAF50', fontWeight: 'bold' }}>
              🎉 New Personal Best! (+{(tps - userBestScore.tps).toFixed(1)} TPS)
            </p>
          )}
          <button onClick={startGame} style={{
            marginTop: 20, padding: '10px 20px', fontSize: 18,
            backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '10px',
            cursor: 'pointer', fontWeight: 'bold'
          }}>🔁 Play Again</button>
          <button onClick={handleShareScore} style={{
            marginTop: 10, padding: '12px 24px', fontSize: 16,
            backgroundColor: '#8B5CF6', color: 'white', border: 'none',
            borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold'
          }}>📣 Share Your Score</button>
        </div>
      )}

      <p style={{ marginTop: 40, fontSize: 14, color: '#eee' }}>
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

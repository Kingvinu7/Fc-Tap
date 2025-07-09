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
    sdk.actions.ready().then(() => {
      setIsReady(true)
    })
  }, [])

  useEffect(() => {
    if (gameOver) {
      const finalTps = rawTapCountRef.current / 15
      setTps(finalTps)

      // Prompt for username and submit to Supabase
      const inputName = prompt('Enter your username for the leaderboard:')
      if (inputName && inputName.trim()) {
        setUsername(inputName.trim())
        saveScore(inputName.trim(), rawTapCountRef.current, finalTps)
      }
    }
  }, [gameOver])

  const saveScore = async (name: string, taps: number, tps: number) => {
    const { error } = await supabase.from('leaderboard').insert([{ username: name, taps, tps }])
    if (error) {
      console.error('Error saving score to Supabase:', error)
    }
  }

  const startGame = () => {
    rawTapCountRef.current = 0
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
    rawTapCountRef.current += 1
    setTapCount((prev) => prev + 1)
    setAnimate(true)

    if (tapSoundRef.current) {
      const clone = tapSoundRef.current.cloneNode() as HTMLAudioElement
      clone.play().catch(() => {})
    }
  }

  const handleReset = () => {
    rawTapCountRef.current = 0
    setTapCount(0)
    setTps(0)
    setIsGameRunning(false)
    setGameOver(false)
    setTimeLeft(15)
    if (timerRef.current) clearInterval(timerRef.current)
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
      <h1 style={{ marginBottom: '30px' }}>🎮 Farcaster Tapping Game</h1>

      {!gameOver ? (
        <div>
          <h2 style={{ fontSize: '24px', marginBottom: 10 }}>⏱️ Time Left: {timeLeft}s</h2>
          <h2 className={animate ? 'pop' : ''} style={{ fontSize: '48px', margin: '0 0 20px 0' }}>Taps: {tapCount}</h2>
          <button onClick={handleTap} disabled={!isGameRunning} style={{
            fontSize: '24px', padding: '15px 30px', margin: '10px',
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
      )}

      <p style={{ marginTop: '40px', fontSize: '14px', color: '#eee' }}>
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

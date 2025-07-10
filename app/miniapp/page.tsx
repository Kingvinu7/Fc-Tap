'use client'

import { useEffect, useState, useRef } from 'react'
import confetti from 'canvas-confetti'
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

  // Font styles
  const fontStyles = {
    gameTitle: { fontFamily: 'Press Start 2P, monospace' },
    vtText: { fontFamily: 'VT323, monospace' },
    normalText: { fontFamily: 'Arial, sans-serif' }
  }

  useEffect(() => {
    tapSoundRef.current = new Audio('/tap.mp3')
    tapSoundRef.current.load()
    resetSoundRef.current = new Audio('/reset.mp3')
    resetSoundRef.current.load()
  }, [])

  useEffect(() => {
    sdk.actions.ready().then(() => {
      setIsReady(true)

      if (typeof window !== 'undefined' && window?.location?.hash === '#reset-user') {
        localStorage.removeItem('fc-username')
        alert('✅ Username reset! You will be asked to enter a new one after your next game.')
      }

      fetchLeaderboard()
    })
  }, [])

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        if (typeof window !== 'undefined') {
          const hasBeenPrompted = localStorage.getItem('add-app-prompted')
          if (!hasBeenPrompted) {
            await sdk.actions.addMiniApp()
            localStorage.setItem('add-app-prompted', 'true')
          }
        }
      } catch (err) {
        const error = err as { name?: string }
        if (error.name === 'RejectedByUser') {
          if (typeof window !== 'undefined') {
            localStorage.setItem('add-app-prompted', 'true')
          }
        }
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleAddToFarcaster = async () => {
    try {
      await sdk.actions.addMiniApp()
      if (typeof window !== 'undefined') {
        localStorage.setItem('add-app-prompted', 'true')
      }
    } catch (err) {
      const error = err as { name?: string }
      if (error.name === 'RejectedByUser') {
        if (typeof window !== 'undefined') {
          localStorage.setItem('add-app-prompted', 'true')
        }
      }
    }
  }

  useEffect(() => {
    if (gameOver) {
      const finalTps = rawTapCountRef.current / 15
      setTps(finalTps)

      setTimeout(async () => {
        let storedName = ''
        
        if (typeof window !== 'undefined') {
          storedName = localStorage.getItem('fc-username') || ''
        }

        if (!storedName) {
          storedName = prompt(
            'Fc Taps Game says:\n\nEnter your Farcaster username for some benefits.\n(Tip: enter it correctly, you won\'t be able to change it later!)'
          )?.trim() || ''

          if (storedName && typeof window !== 'undefined') {
            localStorage.setItem('fc-username', storedName)
          }
        }

        if (storedName) {
          setUsername(storedName)

          const { data: previous } = await supabase
            .from('leaderboard')
            .select('taps')
            .eq('username', storedName)
            .order('taps', { ascending: false })
            .limit(1)

          const isPersonalBest = !previous?.length || rawTapCountRef.current > previous[0].taps

          // Only update leaderboard if it's a personal best
          if (isPersonalBest) {
            await supabase
              .from('leaderboard')
              .delete()
              .eq('username', storedName)

            await supabase.from('leaderboard').insert([
              { username: storedName, taps: rawTapCountRef.current, tps: finalTps }
            ])

            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#ffcc00', '#ff66cc', '#66ccff', '#99ff99']
            })
          }

          // Always refresh leaderboard to show current data
          fetchLeaderboard()
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
👉 Try beating me: https://farcaster.xyz/miniapps/jcV0ojRAzBKZ/fc-tap-game\u200B`;

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

  const rank = getRank()

  if (!isReady) {
    return (
      <div style={{ 
        padding: 20, 
        textAlign: 'center', 
        backgroundColor: '#800080', 
        minHeight: '100vh', 
        color: '#ffe241',
        ...fontStyles.vtText
      }}>
        <h1 style={{ fontSize: '1.5rem' }}>🎮 Loading Farcaster Tapping Game...</h1>
      </div>
    )
  }

  return (
    <div
      style={{
        backgroundImage: "url('/retropxbg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        position: 'relative',
        fontFamily: 'VT323, monospace'
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          zIndex: 0
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: 20,
          textAlign: 'center',
          color: '#ffe241'
        }}
      >
        <h1 style={{ 
          ...fontStyles.gameTitle,
          fontSize: '2rem', 
          margin: '20px 0', 
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          lineHeight: '1.2'
        }}>
          🎮 Farcaster Tap Game
        </h1>

        {!isGameRunning && !gameOver && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>Ready to test your tapping speed?</h2>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
              <button
                onClick={startGame}
                style={{
                  ...fontStyles.vtText,
                  fontSize: '1.5rem',
                  padding: '15px 30px',
                  backgroundColor: '#ffe241',
                  color: '#800080',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(255, 226, 65, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 226, 65, 0.5)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 226, 65, 0.3)'
                }}
              >
                🚀 Start Game
              </button>
              <button
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                style={{
                  ...fontStyles.vtText,
                  fontSize: '1.2rem',
                  padding: '12px 24px',
                  backgroundColor: '#ffcc00',
                  color: '#800080',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(255, 204, 0, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 204, 0, 0.5)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 204, 0, 0.3)'
                }}
              >
                🏆 Leaderboard
              </button>
            </div>
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={handleAddToFarcaster}
                style={{
                  ...fontStyles.vtText,
                  fontSize: '1.1rem',
                  padding: '10px 20px',
                  backgroundColor: '#66ccff',
                  color: '#800080',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(102, 204, 255, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 204, 255, 0.5)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 204, 255, 0.3)'
                }}
              >
                📱 Add to Farcaster
              </button>
            </div>
          </div>
        )}

        {isGameRunning && (
          <div style={{ marginBottom: '30px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px', fontWeight: 'bold' }}>
              ⏱️ {timeLeft}s
            </div>
            <div style={{ fontSize: '2rem', marginBottom: '20px' }}>
              Taps: {tapCount}
            </div>
            <button
              onClick={handleTap}
              style={{
                ...fontStyles.vtText,
                fontSize: '2rem',
                width: '200px',
                height: '200px',
                backgroundColor: animate ? '#ff66cc' : '#ffe241',
                color: '#800080',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 8px 30px rgba(255, 226, 65, 0.5)',
                transform: animate ? 'scale(0.95)' : 'scale(1)',
                transition: 'all 0.1s ease'
              }}
            >
              TAP ME😼
            </button>
          </div>
        )}

        {gameOver && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#ff66cc', marginBottom: '20px', fontSize: '2rem' }}>🎉 Game Over!</h2>
            <div style={{ fontSize: '2rem', marginBottom: '15px' }}>
              Final Score: {tapCount} taps
            </div>
            <div style={{ fontSize: '1.5rem', marginBottom: '15px' }}>
              Speed: {tps.toFixed(1)} TPS
            </div>
            <div style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
              Rank: {rank.name}
            </div>
            <div style={{ fontSize: '1.2rem', marginBottom: '20px', fontStyle: 'italic' }}>
              {rank.message}
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleReset}
                style={{
                  ...fontStyles.vtText,
                  fontSize: '1.2rem',
                  padding: '12px 24px',
                  backgroundColor: '#66ccff',
                  color: '#800080',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🔄 Play Again
              </button>
              <button
                onClick={handleShareScore}
                style={{
                  ...fontStyles.vtText,
                  fontSize: '1.2rem',
                  padding: '12px 24px',
                  backgroundColor: '#99ff99',
                  color: '#800080',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🚀 Share Score
              </button>
              <button
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                style={{
                  ...fontStyles.vtText,
                  fontSize: '1.2rem',
                  padding: '12px 24px',
                  backgroundColor: '#ffcc00',
                  color: '#800080',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🏆 Leaderboard
              </button>
            </div>
          </div>
        )}

        {showLeaderboard && (
          <div style={{ 
            marginTop: '30px', 
            backgroundColor: 'rgba(255, 226, 65, 0.1)', 
            padding: '20px', 
            borderRadius: '15px',
            maxWidth: '500px',
            margin: '30px auto'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#ffcc00', fontSize: '1.5rem' }}>🏆 Top 10 Leaderboard</h3>
            {leaderboard.length === 0 ? (
              <p style={{ fontSize: '1.2rem' }}>No scores yet. Be the first to play!</p>
            ) : (
              <div>
                {leaderboard.map((entry, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      marginBottom: '8px',
                      backgroundColor: index < 3 ? 'rgba(255, 204, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      fontSize: '1.2rem'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 'bold' }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                      </span>
                      <span style={{ marginLeft: '10px' }}>{entry.username}</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 'bold' }}>{entry.taps}</span>
                      <span style={{ marginLeft: '10px', fontSize: '1rem', opacity: 0.8 }}>
                        ({entry.tps.toFixed(1)} TPS)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '40px', fontSize: '1.1rem', opacity: 0.8 }}>
          <p>Tap as fast as you can in 15 seconds!</p>
          <p>TPS = Taps Per Second</p>
          <p style={{ 
            ...fontStyles.normalText,
            marginTop: '10px', 
            color: '#99ff99',
            fontSize: '0.9rem'
          }}>
            Built by{' '}
            <a 
              href="https://farcaster.xyz/vinu07" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#99ff99', 
                textDecoration: 'underline',
                fontWeight: 'bold'
              }}
            >
              @vinu07
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

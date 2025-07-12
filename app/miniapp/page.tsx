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
  
  // New states for button protection and staggered results
  const [buttonsDisabled, setButtonsDisabled] = useState(false)
  const [showDetailedResults, setShowDetailedResults] = useState(false)
  
  // Autoclicker detection states
  const [autoclickerWarning, setAutoclickerWarning] = useState(false)
  const [showAutoclickerMessage, setShowAutoclickerMessage] = useState(false)

  // Music states
  const [isMusicEnabled, setIsMusicEnabled] = useState(true)
  const [isGameOverMusicPlaying, setIsGameOverMusicPlaying] = useState(false)

  const tapSoundRef = useRef<HTMLAudioElement | null>(null)
  const resetSoundRef = useRef<HTMLAudioElement | null>(null)
  const bgMusicRef = useRef<HTMLAudioElement | null>(null)
  const gameOverMusicRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const rawTapCountRef = useRef(0)
  const audioPoolRef = useRef<HTMLAudioElement[]>([])
  const audioIndexRef = useRef(0)
  
  // Autoclicker detection refs
  const tapTimestampsRef = useRef<number[]>([])
  const lastTapTimeRef = useRef(0)

  // Font styles
  const fontStyles = {
    gameTitle: { fontFamily: 'Press Start 2P, monospace' },
    vtText: { fontFamily: 'VT323, monospace' },
    normalText: { fontFamily: 'Arial, sans-serif' }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Create audio pool for tap sounds (multiple instances for overlapping)
      audioPoolRef.current = []
      for (let i = 0; i < 10; i++) {
        const audio = new Audio('/tap.mp3')
        audio.preload = 'auto'
        audio.volume = 0.3 // Prevent audio distortion at high speeds
        audioPoolRef.current.push(audio)
      }
      
      // Single reset sound
      resetSoundRef.current = new Audio('/reset.mp3')
      resetSoundRef.current.preload = 'auto'
      resetSoundRef.current.volume = 0.5

      // Background music
      bgMusicRef.current = new Audio('/bg-music.mp3')
      bgMusicRef.current.preload = 'auto'
      bgMusicRef.current.volume = 0.3
      bgMusicRef.current.loop = true

      // Game over music
      gameOverMusicRef.current = new Audio('/game-over.mp3')
      gameOverMusicRef.current.preload = 'auto'
      gameOverMusicRef.current.volume = 0.5
      gameOverMusicRef.current.loop = false

      // Load music preference from localStorage
      const savedMusicPref = localStorage.getItem('fc-music-enabled')
      if (savedMusicPref !== null) {
        setIsMusicEnabled(savedMusicPref === 'true')
      }
    }
  }, [])

  // Music control effect
  useEffect(() => {
    if (bgMusicRef.current && isMusicEnabled && !isGameOverMusicPlaying) {
      bgMusicRef.current.play().catch(() => {})
    } else if (bgMusicRef.current) {
      bgMusicRef.current.pause()
    }
  }, [isMusicEnabled, isGameOverMusicPlaying])

  // Save music preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fc-music-enabled', isMusicEnabled.toString())
    }
  }, [isMusicEnabled])

  const toggleMusic = () => {
    setIsMusicEnabled(!isMusicEnabled)
  } 
const getRank = () => {
    if (tps < 3) return { name: '🐢 Turtle', message: 'Slow and steady!' }
    if (tps < 5) return { name: '🐼 Panda', message: 'Chill but strong!' }
    if (tps < 7) return { name: '🐇 Rabbit', message: 'Quick on your feet!' }
    if (tps < 9) return { name: '🐆 Cheetah', message: 'Blazing fast!' }
    return { name: '⚡️ Flash', message: 'You tapped like lightning!' }
  }

  const handleShareScore = async () => {
    if (buttonsDisabled) return
    
    try {
      const text = `🎮 Just scored ${tapCount} taps in 15 seconds!
👉 Try beating me:
https://farcaster.xyz/miniapps/jcV0ojRAzBKZ/fc-tap-game`
      await sdk.actions.composeCast({ text })
    } catch (error) {
      console.error('Error sharing score:', error)
    }
  }

  const handleLeaderboardToggle = () => {
    if (buttonsDisabled) return
    setShowLeaderboard(!showLeaderboard)
  }

  const toggleBackgroundMusic = () => {
    if (bgMusicRef.current) {
      if (isMusicPlaying) {
        bgMusicRef.current.pause()
        setIsMusicPlaying(false)
      } else {
        bgMusicRef.current.play().catch(() => {})
        setIsMusicPlaying(true)
      }
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
      // Clean up audio on unmount
      if (bgMusicRef.current) {
        bgMusicRef.current.pause()
      }
      if (gameOverMusicRef.current) {
        gameOverMusicRef.current.pause()
      }
    }
  }, [])

  // Button style function that handles disabled state
  const getButtonStyle = (baseStyle: React.CSSProperties) => ({
    ...baseStyle,
    opacity: buttonsDisabled ? 0.5 : 1,
    backgroundColor: buttonsDisabled ? '#888888' : baseStyle.backgroundColor,
    cursor: buttonsDisabled ? 'not-allowed' : 'pointer',
    transform: buttonsDisabled ? 'none' : baseStyle.transform,
    transition: 'all 0.3s ease'
  })

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

      {/* Music Toggle Button */}
      <button
        onClick={toggleBackgroundMusic}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 10,
          ...fontStyles.vtText,
          fontSize: '1.5rem',
          padding: '10px 15px',
          backgroundColor: 'rgba(255, 226, 65, 0.9)',
          color: '#800080',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 4px 15px rgba(255, 226, 65, 0.3)',
          transition: 'all 0.3s ease',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 226, 65, 0.5)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 226, 65, 0.3)'
        }}
      >
        {isMusicPlaying ? '🔊' : '🔇'}
      </button>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>

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
                disabled={buttonsDisabled}
                style={getButtonStyle({
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
                })}
                onMouseOver={(e) => {
                  if (!buttonsDisabled) {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 226, 65, 0.5)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!buttonsDisabled) {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 226, 65, 0.3)'
                  }
                }}
              >
                {buttonsDisabled ? 'Wait...' : '🚀 Start Game'}
              </button>
              <button
                onClick={handleLeaderboardToggle}
                disabled={buttonsDisabled}
                style={getButtonStyle({
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
                })}
                onMouseOver={(e) => {
                  if (!buttonsDisabled) {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 204, 0, 0.5)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!buttonsDisabled) {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 204, 0, 0.3)'
                  }
                }}
              >
                {buttonsDisabled ? 'Wait...' : '🏆 Leaderboard'}
              </button>
            </div>
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={handleAddToFarcaster}
                disabled={buttonsDisabled}
                style={getButtonStyle({
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
                })}
                onMouseOver={(e) => {
                  if (!buttonsDisabled) {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 204, 255, 0.5)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!buttonsDisabled) {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 204, 255, 0.3)'
                  }
                }}
              >
                {buttonsDisabled ? 'Wait...' : '📱 Add to Farcaster'}
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
            
            {/* Autoclicker Warning Message */}
            {showAutoclickerMessage && (
              <div style={{
                backgroundColor: 'rgba(255, 165, 0, 0.9)',
                color: '#000',
                padding: '12px 20px',
                borderRadius: '10px',
                margin: '15px auto',
                maxWidth: '400px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                border: '2px solid #ff8c00',
                animation: 'pulse 2s infinite'
              }}>
                ⚠️ Autoclicker detected! Playing for fun is great, but this affects leaderboard fairness.
              </div>
            )}
            
            <button
              onClick={handleTap}
              onTouchStart={handleTap}
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
                transition: 'all 0.1s ease',
                userSelect: 'none',
                touchAction: 'manipulation'
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
            
            {/* Show detailed results only after delay */}
            {showDetailedResults && (
              <>
                <div style={{ fontSize: '1.5rem', marginBottom: '15px' }}>
                  Speed: {tps.toFixed(1)} TPS
                </div>
                <div style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
                  Rank: {rank.name}
                </div>
                <div style={{ fontSize: '1.2rem', marginBottom: '20px', fontStyle: 'italic' }}>
                  {rank.message}
                </div>
              </>
            )}

            {/* Show waiting message if buttons are disabled */}
            {buttonsDisabled && !showDetailedResults && (
              <div style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#ffcc00' }}>
                Please wait to see your full results...
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleReset}
                disabled={buttonsDisabled}
                style={getButtonStyle({
                  ...fontStyles.vtText,
                  fontSize: '1.2rem',
                  padding: '12px 24px',
                  backgroundColor: '#66ccff',
                  color: '#800080',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                })}
              >
                {buttonsDisabled ? 'Wait...' : '🔄 Play Again'}
              </button>
              <button
                onClick={handleShareScore}
                disabled={buttonsDisabled}
                style={getButtonStyle({
                  ...fontStyles.vtText,
                  fontSize: '1.2rem',
                  padding: '12px 24px',
                  backgroundColor: '#99ff99',
                  color: '#800080',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                })}
              >
                {buttonsDisabled ? 'Wait...' : '🚀 Share Score'}
              </button>
              <button
                onClick={handleLeaderboardToggle}
                disabled={buttonsDisabled}
                style={getButtonStyle({
                  ...fontStyles.vtText,
                  fontSize: '1.2rem',
                  padding: '12px 24px',
                  backgroundColor: '#ffcc00',
                  color: '#800080',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                })}
              >
                {buttonsDisabled ? 'Wait...' : '🏆 Leaderboard'}
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
                {leaderboard.map((entry, index) => {
                  const rankColor =
                    index === 0 ? '#FFD700' : // Gold
                    index === 1 ? '#C0C0C0' : // Silver
                    index === 2 ? '#CD7F32' : // Bronze
                    '#ffe241';               // Default

                  return (
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
                        fontSize: '1.2rem',
                        color: rankColor
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
                  )
                })}
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
        )}
      </div>
    </div>
  )
}

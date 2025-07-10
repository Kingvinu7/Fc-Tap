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

  useEffect(() => {
    tapSoundRef.current = new Audio('/tap.mp3')
    tapSoundRef.current.load()
    resetSoundRef.current = new Audio('/reset.mp3')
    resetSoundRef.current.load()
  }, [])

  useEffect(() => {
    sdk.actions.ready().then(() => {
      setIsReady(true)

      if (window?.location?.hash === '#reset-user') {
        localStorage.removeItem('fc-username')
        alert('✅ Username reset! You will be asked to enter a new one after your next game.')
      }

      fetchLeaderboard()
    })
  }, [])

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const hasBeenPrompted = localStorage.getItem('add-app-prompted')
        if (!hasBeenPrompted) {
          await sdk.actions.addMiniApp()
          localStorage.setItem('add-app-prompted', 'true')
        }
      } catch (err) {
        const error = err as { name?: string }
        if (error.name === 'RejectedByUser') {
          localStorage.setItem('add-app-prompted', 'true')
        }
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleAddToFarcaster = async () => {
    try {
      await sdk.actions.addMiniApp()
      localStorage.setItem('add-app-prompted', 'true')
    } catch (err) {
      const error = err as { name?: string }
      if (error.name === 'RejectedByUser') {
        localStorage.setItem('add-app-prompted', 'true')
      }
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
            'Fc Taps Game says:\n\nEnter your Farcaster username for some benefits.\n(Tip: enter it correctly, you won\'t be able to change it later!)'
          )?.trim() || ''

          if (storedName) {
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
⚡️ ${tps.toFixed(1)} TPS | ${rank.name}
How is it ? 🔥
👉 Try beating me: https://farcaster.xyz/miniapps/jcV0ojRAzBKZ/fc-tap-game`
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
      <div style={{ padding: 20, textAlign: 'center', backgroundColor: '#800080', minHeight: '100vh', color: '#ffe241' }}>
        <h1>🎮 Loading Farcaster Tapping Game...</h1>
      </div>
    )
  }

  return (
    <div style={{ padding: 20, textAlign: 'center', fontFamily: 'Arial, sans-serif', backgroundColor: '#800080', minHeight: '100vh', color: '#ffe241' }}>
      {/* ... your game JSX ... */}

      <div className="footer-text" style={{ marginTop: '40px', fontSize: '0.9rem', opacity: 0.8 }}>
        <p>Tap as fast as you can in 15 seconds!</p>
        <p>TPS = Taps Per Second</p>
        <p style={{ marginTop: '10px', color: '#99ff99' }}>
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
  )
}

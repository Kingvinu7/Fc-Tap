'use client'

import { useEffect, useRef, useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export default function MiniApp() {
  const [isReady, setIsReady] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const tapSoundRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    sdk.actions.ready().then(() => setIsReady(true))
    tapSoundRef.current = new Audio('/tap.mp3')
  }, [])

  const handleTap = () => {
    setTapCount(tapCount + 1)
    if (tapSoundRef.current) {
      tapSoundRef.current.currentTime = 0
      tapSoundRef.current.play()
    }
  }

  if (!isReady) {
    return <div className="text-center mt-10">Loading...</div>
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Tap Game</h1>
      <p className="text-lg mb-4">Taps: {tapCount}</p>
      <button
        onClick={handleTap}
        className="bg-blue-600 text-white px-6 py-3 rounded-full text-xl shadow hover:bg-blue-700 transition"
      >
        Tap Me
      </button>
    </div>
  )
}

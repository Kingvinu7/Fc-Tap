'use client'

import { useEffect, useState } from 'react'
import { createFrames } from 'frames.js/next'

const frames = createFrames()

export default function MiniApp() {
  const [isReady, setIsReady] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const [lastTapValue, setLastTapValue] = useState(0)

  useEffect(() => {
    frames.ready().then(() => {
      setIsReady(true)
    })
  }, [])

  const handleTap = () => {
    const nextTap = tapCount + 1
    setTapCount(nextTap)
    setLastTapValue(nextTap)
  }

  const handleReset = () => {
    setTapCount(0)
    setLastTapValue(0)
  }

  if (!isReady) {
    return (
      <div style={{ 
        padding: 20, 
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>🎮 Loading FC-TAP Game...</h1>
        <p>Please wait while we initialize your mini app.</p>
      </div>
    )
  }

  return (
    <div style={{ 
      padding: 20, 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>🎮 FC-TAP Clicker Mini App</h1>
      
      <div style={{
        backgroundColor: '#FFD700',
        padding: '40px',
        borderRadius: '15px',
        margin: '20px 0',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '40px', color: 'green', marginBottom: '10px' }}>
          +{lastTapValue}
        </h2>
        <p style={{ fontSize: '24px' }}>Total Taps: {tapCount}</p>
        
        <button 
          onClick={handleTap}
          style={{
            fontSize: '24px',
            padding: '15px 30px',
            margin: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🎯 TAP ME!
        </button>
        
        <button 
          onClick={handleReset}
          style={{
            fontSize: '18px',
            padding: '10px 20px',
            margin: '10px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer'
          }}
        >
          🔄 Reset
        </button>
      </div>
      
      <p style={{ color: '#666', fontSize: '16px' }}>
        {tapCount === 0 ? "Start tapping to see your score!" : 
         tapCount < 10 ? "Keep going! You're doing great!" :
         tapCount < 50 ? "Wow! You're on fire! 🔥" :
         "Amazing! You're a tapping champion! 🏆"}
      </p>
      
      <div style={{ marginTop: '30px', fontSize: '14px', color: '#888' }}>
        <p>🎉 Your Farcaster Mini App is running successfully!</p>
        <p>Try the frame version at <a href="/api/frames" style={{ color: '#4CAF50' }}>/api/frames</a></p>
      </div>
    </div>
  )
}

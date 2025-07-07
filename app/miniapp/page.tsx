'use client'

import { useEffect } from 'react'
import { createFrames } from 'frames.js/next'

const frames = createFrames()

export default function MiniApp() {
  useEffect(() => {
    frames.ready()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Fc-TAP Clicker Mini App</h1>
      <p>Your Mini App is running!</p>
      <p>This is where your tap game will live.</p>
    </div>
  )
}

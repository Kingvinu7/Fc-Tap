'use client'

import { useEffect } from 'react'
import { createFrames } from 'frames.js'

const frames = createFrames()

export default function MiniApp() {
  useEffect(() => {
    frames.ready()
  }, [])

  return (
    <div>
      <h1>Your Mini App</h1>
    </div>
  )
}

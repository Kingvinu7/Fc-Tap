// app/miniapp/page.tsx
'use client'

import { useEffect } from 'react'
import { actions } from 'frames.js'

export default function MiniApp() {
  useEffect(() => {
    actions.ready()
    console.log('Mini App is ready')
  }, [])

  return (
    <div style={{ background: 'yellow', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h1>🎮 FC Tap Game</h1>
    </div>
  )
}

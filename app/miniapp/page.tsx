'use client'

import { useEffect } from 'react'

export default function MiniApp() {
  useEffect(() => {
    // Mini app is ready
    console.log('Mini app ready')
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Fc-TAP Clicker Mini App</h1>
      <p>Your Mini App is running!</p>
      <p>This is where your tap game will live.</p>
    </div>
  )
}

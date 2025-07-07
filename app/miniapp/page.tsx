'use client';

import { useEffect } from 'react';
import { createFrames } from 'frames.js'; // <-- Correct import for v0.19.0

export default function MiniApp() {
  useEffect(() => {
    const frames = createFrames();  // <-- Initialize SDK
    frames.ready();                 // <-- Notify Farcaster client
    console.log('MiniApp SDK ready');
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#FFD700',
      color: 'navy',
      fontFamily: 'Arial, sans-serif',
    }}>
      <h1>🎮 FC Tap Game</h1>
      <p>Tap to play. Let's go!</p>
    </div>
  );
}

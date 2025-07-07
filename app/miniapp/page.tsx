'use client';

import { useEffect } from 'react';
import { createFrames } from 'frames.js';

export default function MiniApp() {
  useEffect(() => {
    const { actions } = createFrames();
    actions.ready(); // Must be called once you're ready
    console.log('Mini App is ready');
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

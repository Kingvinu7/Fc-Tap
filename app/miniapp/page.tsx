'use client';

import { useEffect } from 'react';

export default function MiniApp() {
  useEffect(() => {
    import('frames.js')
      .then((sdk) => {
        sdk.actions?.ready?.(); // This works with v0.19.0
        console.log('MiniApp SDK ready');
      })
      .catch((err) => {
        console.warn('frames.js not available', err);
      });
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

'use client';

import { useEffect } from 'react';

export default function MiniApp() {
  useEffect(() => {
    // Placeholder: if you want to trigger something like ready(), import from valid SDK
    console.log('MiniApp loaded');
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#FFD700',
        color: 'navy',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1>🎮 FC Tap Game Mini App</h1>
      <p>This is just a shell to support the Mini App preview.</p>
    </div>
  );
}

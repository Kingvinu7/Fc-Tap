'use client';

import { useEffect } from 'react';

export default function MiniApp() {
  useEffect(() => {
    import('@farcaster/frames').then((sdk) => {
      sdk.actions.ready();
    });
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

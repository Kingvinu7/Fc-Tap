// app/api/frames/route.tsx
import { createFrames, Button } from 'frames.js/next';

const frames = createFrames();

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const handler = frames(async () => {
  return {
    image: (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: '#800080',
        fontSize: '60px',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>🎮 FC TAP GAME</h1>
        <p style={{ fontSize: '24px', marginTop: '20px' }}>Tap as fast as you can!</p>
      </div>
    ),
    buttons: [
      <Button action="link" target="https://fc-taps.vercel.app/miniapp">▶️ Launch Game</Button>,
    ],
    title: "FC Tap Game",
    description: "A fast-tapping challenge. Launch to play!",
    imageOptions: {
      aspectRatio: "1.91:1",
    },
  };
});

export const GET = handler;
export const POST = handler;

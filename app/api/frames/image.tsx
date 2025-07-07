// app/api/frames/image.tsx
import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const count = Number(searchParams.get('count') || 0);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#FFD700',
          fontSize: 60,
          color: 'navy',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <h1 style={{ marginBottom: 20 }}>🎮 FC Tap Game</h1>
        <p style={{ fontSize: 48, fontWeight: 'bold' }}>Clicks: {count}</p>
        <p style={{ fontSize: 24 }}>
          {count === 0 ? 'Start tapping!' : 'Great job! Keep going!'}
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

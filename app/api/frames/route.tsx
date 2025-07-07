// app/api/frames/route.tsx
import { frames } from 'frames.js/next';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const handler = frames(async (ctx) => {
  const count = ctx.state?.count ?? 0;
  let newCount = count;

  if (ctx.message?.buttonIndex === 1) newCount++;
  if (ctx.message?.buttonIndex === 2) newCount = 0;

  return {
    image: `/api/frames/image?count=${newCount}`,
    buttons: [
      { label: '🎯 Click Me!', action: 'post' },
      { label: '🔄 Reset', action: 'post' },
      { label: '🏠 Home', action: 'link', target: 'https://fc-taps.vercel.app' },
    ],
    state: { count: newCount },
    title: 'FC Tap Game',
    description: 'A fun clicking game on Farcaster!',
    imageOptions: {
      aspectRatio: '1.91:1',
    },
  };
});

export const GET = handler;
export const POST = handler;

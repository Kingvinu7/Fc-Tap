// app/api/frames/route.tsx

import { frames } from '../../frames/index'; // Corrected import path
// No ImageResponse import as it's not used natively by frames.js

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const handler = frames(async (ctx) => {
  const count = ctx.state?.count ? Number(ctx.state.count) : 0;
  
  const newCount = ctx.message?.buttonIndex === 1 ? count + 1 : 0;

  return {
    image: (
      // Corrected and simplified JSX for image
      <div>{'Hello Farcaster! Clicks: '}{newCount}</div> 
    ),
    buttons: [
      {
        label: `Click Me!`,
        action: 'post',
        target: `/api/frames?count=${newCount}`, // FIX IS HERE: target is a string URL
      },
      {
        label: `Reset`,
        action: 'post',
        target: `/api/frames?count=0`, // FIX IS HERE: target is a string URL
      },
      {
        label: `Link`,
        action: 'link',
        target: 'https://framesjs.org',
      }
    ],
  };
});

export const GET = handler;
export const POST = handler;

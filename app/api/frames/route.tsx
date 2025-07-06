// app/api/frames/route.tsx

import { frames } from '../../frames/index';
// No ImageResponse import as it's not used natively by frames.js
import { JsonObject } from '@framesjs/next/types'; // NEW IMPORT for JsonObject type

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const handler = frames(async (ctx) => {
  // FIX IS HERE: Cast ctx.state to JsonObject to safely access its properties
  const state = ctx.state as JsonObject; 
  const count = state?.count ? Number(state.count) : 0;
  
  const newCount = ctx.message?.buttonIndex === 1 ? count + 1 : 0;

  return {
    state: { count: newCount }, // State moved to top level

    image: (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '100%', 
        height: '100%', 
        backgroundColor: '#FFD700', 
        fontSize: 60, 
        color: 'navy' 
      }}>
        <h1>Frames.js Clicker</h1>
        <p>Clicks: {newCount}</p>
      </div>
    ),
    buttons: [
      {
        label: `Click Me!`,
        action: 'post',
        target: '/api/frames', 
        state: { count: newCount },
      },
      {
        label: `Reset`,
        action: 'post',
        target: '/api/frames',
        state: { count: 0 },
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

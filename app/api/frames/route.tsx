// app/api/frames/route.tsx

import { frames } from '../../frames/index'; // Corrected import path
// No ImageResponse import as it's not used natively by frames.js

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const handler = frames(async (ctx) => {
  // Access state from ctx.state (which is automatically managed by frames.js)
  const count = ctx.state?.count ? Number(ctx.state.count) : 0;
  
  const newCount = ctx.message?.buttonIndex === 1 ? count + 1 : 0;

  return {
    // Top-level state is crucial for Frames.js
    state: { count: newCount }, // FIX IS HERE: State moved to top level

    image: (
      // This uses standard JSX directly for the image, as Frames.js expects this.
      // The text content is an explicit string literal combined with a variable.
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
        target: '/api/frames', // FIX IS HERE: Add target URL for post actions
      },
      {
        label: `Reset`,
        action: 'post',
        target: '/api/frames', // FIX IS HERE: Add target URL for post actions
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

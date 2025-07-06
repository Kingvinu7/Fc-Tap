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
      // This uses explicit string and separate variable for content.
      // This is the most robust way to avoid the 'Unexpected token' error.
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
        // FIX IS HERE: For action 'post', target should just be the base URL
        // Frames.js handles state propagation automatically when action is 'post'.
        target: '/api/frames', 
      },
      {
        label: `Reset`,
        action: 'post',
        // FIX IS HERE: For action 'post', target should just be the base URL
        // State will be handled by setting it to 0 initially in frames() handler.
        target: '/api/frames', 
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

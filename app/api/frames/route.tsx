// app/api/frames/route.tsx

import { frames } from '../../frames/index'; // Corrected import path
import { Button } from 'frames.js/core'; // Correct import for Button helper

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const handler = frames(async (ctx) => {
  const count = ctx.state?.count ? Number(ctx.state.count) : 0;
  
  const newCount = ctx.message?.buttonIndex === 1 ? count + 1 : 0;

  return {
    state: { count: newCount }, // CORRECT: State moved to top level

    image: (
      // Corrected JSX for image
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
      Button({ // CORRECT: Using Button helper
        action: 'post',
        label: 'Click Me!',
        target: '/api/frames', // CORRECT: Target URL for post action
      }),
      Button({ // CORRECT: Using Button helper
        action: 'post', 
        label: 'Reset',
        target: '/api/frames', // CORRECT: Target URL for post action
      }),
      Button({ // CORRECT: Using Button helper
        action: 'link',
        target: 'https://framesjs.org',
        label: 'Link',
      }),
    ],
  };
});

export const GET = handler;
export const POST = handler;

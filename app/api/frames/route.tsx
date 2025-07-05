import { frames } from '../../frames/route';
import { ImageResponse } from '@vercel/og'; // NEW IMPORT!

const handler = frames(async (ctx) => {
  const count = ctx.state?.count ? Number(ctx.state.count) : 0;

  const newCount = ctx.message?.buttonIndex === 1 ? count + 1 : 0;

  return {
    image: new ImageResponse( // NEW: Wrap JSX in ImageResponse
      (
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
      {
        width: 1200, // NEW: Image dimensions
        height: 630, // NEW: Image dimensions
      }
    ), // End of ImageResponse wrapper
    buttons: [
      {
        label: `Click Me!`,
        action: 'post',
        target: { state: { count: newCount } },
      },
      {
        label: `Reset`,
        action: 'post',
        target: { state: { count: 0 } },
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

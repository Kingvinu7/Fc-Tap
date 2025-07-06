import { frames } from '../../frames/index';
import { button } from 'frames.js/core';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const handler = frames(async (ctx) => {
  const count = ctx.state?.count ? Number(ctx.state.count) : 0;
  
  const newCount = ctx.message?.buttonIndex === 1 ? count + 1 : 0;

  return {
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
      button({
        action: 'post',
        label: 'Click Me!',
      }),
      button({
        action: 'post', 
        label: 'Reset',
      }),
      button({
        action: 'link',
        target: 'https://framesjs.org',
        label: 'Link',
      }),
    ],
    state: { count: newCount },
  };
});

export const GET = handler;
export const POST = handler;

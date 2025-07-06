import { createFrames, Button } from "frames.js/next";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const frames = createFrames({
  basePath: "/api/frames",
});

const handler = frames(async (ctx) => {
  const count = ctx.state && typeof ctx.state === 'object' && 'count' in ctx.state ? Number(ctx.state.count) : 0;
  
  const newCount = ctx.message?.buttonIndex === 1 ? count + 1 : 0;

  return {
    image: (
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%', 
          height: '100%', 
          backgroundColor: '#FFD700', 
          fontSize: '60px', 
          color: 'navy',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        <h1 style={{ margin: '0 0 20px 0' }}>Frames.js Clicker</h1>
        <p style={{ margin: '0', fontSize: '48px', fontWeight: 'bold' }}>Clicks: {newCount}</p>
      </div>
    ),
    buttons: [
      <Button action="post" key="click">Click Me!</Button>,
      <Button action="post" key="reset">Reset</Button>,
      <Button action="link" target="https://framesjs.org" key="link">Link</Button>,
    ],
    state: { count: newCount },
  };
});

export const GET = handler;
export const POST = handler;

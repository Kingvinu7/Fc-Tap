import { createFrames, Button } from "frames.js/next";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const frames = createFrames({
  basePath: "/api/frames",
  // Add these metadata configurations
  debug: process.env.NODE_ENV === 'development',
  middleware: [
    // Add middleware to ensure proper headers
    async (ctx, next) => {
      return next();
    },
  ],
});

const handler = frames(async (ctx) => {
  const count = ctx.state && typeof ctx.state === 'object' && 'count' in ctx.state ? Number(ctx.state.count) : 0; // More robust state access
  
  let newCount = count;
  
  // Handle button interactions
  if (ctx.message?.buttonIndex === 1) {
    newCount = count + 1; // Click Me button
  } else if (ctx.message?.buttonIndex === 2) {
    newCount = 0; // Reset button
  }

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
          fontFamily: 'Arial, sans-serif' // Added font-family for better rendering
        }}
      >
        <h1 style={{ margin: '0 0 20px 0' }}>🎮 FC Tap Game</h1>
        <p style={{ margin: '0', fontSize: '48px', fontWeight: 'bold' }}>Clicks: {newCount}</p>
        <p style={{ margin: '10px 0 0 0', fontSize: '24px' }}>
          {newCount === 0 ? "Start tapping!" : `Great job! Keep going!`}
        </p>
      </div>
    ),
    buttons: [
      <Button action="post" key="click">🎯 Click Me!</Button>,
      <Button action="post" key="reset">🔄 Reset</Button>,
      <Button action="link" target="https://fc-taps.vercel.app" key="link">🏠 Home</Button>,
    ],
    state: { count: newCount },
    // Add these important metadata fields
    title: "FC Tap Game",
    description: "A fun clicking game on Farcaster! See how many clicks you can get!",
    // Make sure the image aspect ratio is correct
    imageOptions: {
      aspectRatio: "1.91:1",
    },
  };
});

export const GET = handler;
export const POST = handler;

// app/api/frames/route.tsx

import { createFrames, Button } from "frames.js/next"; // Import Button as a JSX component

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const frames = createFrames({
  basePath: "/api/frames",
  debug: process.env.NODE_ENV === 'development',
});

const handler = frames(async (ctx) => {
  // FIX IS HERE: Ensure this initial GET request always returns a valid Frame definition
  if (!ctx.message) {
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
          <h1 style={{ margin: '0 0 20px 0' }}>🎮 FC Tap Game</h1>
          <p style={{ margin: '0', fontSize: '48px', fontWeight: 'bold' }}>Clicks: 0</p>
          <p style={{ margin: '10px 0 0 0', fontSize: '24px' }}>Start tapping!</p>
        </div>
      ),
      buttons: [
        <Button action="post" target="/api/frames" key="click">🎯 Click Me!</Button>,
        <Button action="post" target="/api/frames" key="reset">🔄 Reset</Button>,
        <Button action="link" target="https://fc-taps.vercel.app" key="link">🏠 Home</Button>, // Use your actual base URL here
      ],
      // Ensure these metadata fields are present for the initial GET request
      title: "FC Tap Game",
      description: "A fun clicking game on Farcaster! See how many clicks you can get!",
      imageOptions: {
        aspectRatio: "1.91:1",
      },
      // state is not supported on initial GET, so it's not here
    };
  }

  // Handle runtime requests (actual user interactions via POST)
  const count = ctx.state && typeof ctx.state === 'object' && 'count' in ctx.state ? Number(ctx.state.count) : 0;
  
  let newCount = count;
  
  if (ctx.message?.buttonIndex === 1) {
    newCount = count + 1;
  } else if (ctx.message?.buttonIndex === 2) {
    newCount = 0;
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
          fontFamily: 'Arial, sans-serif'
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
      <Button action="post" target="/api/frames" key="click">🎯 Click Me!</Button>,
      <Button action="post" target="/api/frames" key="reset">🔄 Reset</Button>,
      <Button action="link" target="https://fc-taps.vercel.app" key="link">🏠 Home</Button>, // Use your actual base URL here
    ],
    state: { count: newCount }, // State is for POST requests
    title: "FC Tap Game",
    description: "A fun clicking game on Farcaster! See how many clicks you can get!",
    imageOptions: {
      aspectRatio: "1.91:1",
    },
  };
});

export const GET = handler;
export const POST = handler;

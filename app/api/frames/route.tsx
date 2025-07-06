import { frames } from 'frames.js/next';
import { Button } from 'frames.js/next';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const handler = frames(async (ctx) => {
  try {
    // --- Initial GET request logic ---
    if (!ctx.message) {

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
            fontSize: '60px', 
            color: 'navy',
            fontFamily: 'Arial, sans-serif'
          }}>
            <h1 style={{ margin: '0 0 20px 0' }}>🎮 FC Tap Game</h1>
            <p style={{ margin: '0', fontSize: '48px', fontWeight: 'bold' }}>Clicks: 0</p>
            <p style={{ margin: '10px 0 0 0', fontSize: '24px' }}>Start tapping!</p>
          </div>
        ),
        buttons: [
          <Button action="post" target="/api/frames" key="click">🎯 Click Me!</Button>,
          <Button action="post" target="/api/frames" key="reset">🔄 Reset</Button>,
          <Button action="link" target="https://fc-taps.vercel.app" key="link">🏠 Home</Button>,
        ],
        title: "FC Tap Game",
        description: "A fun clicking game on Farcaster! See how many clicks you can get!",
        imageOptions: {
          aspectRatio: "1.91:1",
        },
      };
    }

    // --- Handle runtime requests (actual user interactions via POST) ---
    const count = ctx.state && typeof ctx.state === 'object' && 'count' in ctx.state ? Number(ctx.state.count) : 0;

    let newCount = count;

    if (ctx.message?.buttonIndex === 1) {
      newCount = count + 1;
    } else if (ctx.message?.buttonIndex === 2) {
      newCount = 0;
    }

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
          fontSize: '60px', 
          color: 'navy',
          fontFamily: 'Arial, sans-serif'
        }}>
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
        <Button action="link" target="https://fc-taps.vercel.app" key="link">🏠 Home</Button>,
      ],
      state: { count: newCount },
      title: "FC Tap Game",
      description: "A fun clicking game on Farcaster! See how many clicks you can get!",
      imageOptions: {
        aspectRatio: "1.91:1",
      },
    };

  } catch (error) {
    console.error('Frame handler error:', error);
    
    // Return a fallback response in case of any errors
    return {
      image: (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%', 
          height: '100%', 
          backgroundColor: '#FF6B6B', 
          fontSize: '48px', 
          color: 'white',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h1 style={{ margin: '0 0 20px 0' }}>⚠️ Error</h1>
          <p style={{ margin: '0', fontSize: '24px' }}>Something went wrong</p>
        </div>
      ),
      buttons: [
        <Button action="post" target="/api/frames" key="retry">🔄 Try Again</Button>,
      ],
      title: "FC Tap Game - Error",
      description: "An error occurred in the game",
      imageOptions: {
        aspectRatio: "1.91:1",
      },
    };
  }
});

export const GET = handler;
export const POST = handler

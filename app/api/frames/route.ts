import { frames } from '../../frames/route'; // Adjust path if needed

const handler = frames(async (ctx) => {
  // Get current count from state, default to 0 if not present
  const count = ctx.state?.count ? Number(ctx.state.count) : 0;

  // Determine new count based on button pressed
  // If button 1 ('Click Me!') is pressed, increment count. Otherwise, reset to 0.
  const newCount = ctx.message?.buttonIndex === 1 ? count + 1 : 0;

  // Return the Farcaster Frame configuration (image and buttons)
  return {
    image: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#FFD700', fontSize: 60, color: 'navy' }}>
        <h1>Frames.js Clicker</h1>
        <p>Clicks: {newCount}</p>
      </div>
    ),
    buttons: [
      {
        label: `Click Me!`,
        action: 'post',
        target: { state: { count: newCount } }, // Pass the updated count in the state for the next frame
      },
      {
        label: `Reset`,
        action: 'post',
        target: { state: { count: 0 } }, // Reset count in state
      },
      {
        label: `Link`,
        action: 'link',
        target: 'https://framesjs.org', // Example external link
      }
    ],
  };
});

// Export GET and POST handlers as required by Next.js API Routes
export const GET = handler;
export const POST = handler;

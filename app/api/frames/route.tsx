import { frames } from '../../frames';
import { ImageResponse } from '@vercel/og';
import { sdk } from '@farcaster/frame-sdk';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const handler = frames(async (ctx) => {
  // --- Initial GET request logic ---
  if (!ctx.message) {
    // Call ready() when the interface is ready to be displayed
    await sdk.actions.ready();
    return {
      image: (
        <div>{'Hello Farcaster! Clicks: '}{0}</div> 
      ),
      buttons: [
        { label: `Click Me!`, action: 'post', target: '/api/frames', state: { count: 0 } },
        { label: `Reset`, action: 'post', target: '/api/frames', state: { count: 0 } },
        { label: `Link`, action: 'link', target: 'https://framesjs.org' }
      ],
      title: "FC Tap Game",
      description: "A fun clicking game on Farcaster! See how many clicks you can get!",
      imageOptions: {
        aspectRatio: "1.91:1",
      },
    };
  }

  // --- Handle POST requests (user interactions) ---
  const count = ctx.state && typeof ctx.state === 'object' && 'count' in ctx.state 
    ? Number(ctx.state.count) : 0;
  let newCount = count;

  if (ctx.message?.buttonIndex === 1) {
    newCount = count + 1;
  } else if (ctx.message?.buttonIndex === 2) {
    newCount = 0;
  }

  // Call ready() when the interface is ready to be displayed
  await sdk.actions.ready();

  return {
    image: (
      <div>{`Hello Farcaster! Clicks: ${newCount}`}</div>
    ),
    buttons: [
      { label: `Click Me!`, action: 'post', target: '/api/frames', state: { count: newCount } },
      { label: `Reset`, action: 'post', target: '/api/frames', state: { count: 0 } },
      { label: `Link`, action: 'link', target: 'https://framesjs.org' }
    ],
    state: { count: newCount },
    title: "FC Tap Game",
    description: "A fun clicking game on Farcaster! See how many clicks you can get!",
    imageOptions: {
      aspectRatio: "1.91:1",
    },
  };
});

export const GET = handler;
export const POST = handler;

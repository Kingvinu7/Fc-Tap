import { frames } from '../../frames/route';
import { ImageResponse } from '@vercel/og';

const handler = frames(async (ctx) => {
  const count = ctx.state?.count ? Number(ctx.state.count) : 0;
  
  const newCount = ctx.message?.buttonIndex === 1 ? count + 1 : 0;

  return {
    image: new ImageResponse(
      // THIS IS THE SIMPLIFIED JSX. It uses a template literal directly as the div's content.
      // This should definitively resolve the 'Unexpected token' error.
      (
        <div>{`Hello Farcaster! Clicks: ${newCount}`}</div>
      ),
      {
        width: 1200,
        height: 630,
      }
    ),
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

import type { Metadata } from 'next'
import { headers } from 'next/headers'; 

const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // Fallback for local development
  const host = headers().get('host');
  if (host) return `http://${host}`;
  return `http://localhost:${process.env.PORT || 3000}`;
};

export const metadata: Metadata = {
  title: 'FC Tap Game',
  description: 'A fun clicking game on Farcaster',
  // FIX IS HERE: Add metadataBase property to correctly resolve absolute URLs during build
  metadataBase: new URL(getBaseUrl()), 
  openGraph: {
    title: 'FC Tap Game',
    description: 'A fun clicking game on Farcaster! See how many clicks you can get!',
    images: [
      {
        url: '/icon.png', // This will now correctly resolve to https://your-domain/icon.png
        width: 955,
        height: 500,
        alt: 'FC Tap Game',
      },
    ],
  },
  other: {
    'fc:frame': 'vNext',
    // FIX IS HERE: Point fc:frame:image to a STATIC, reliably served image like icon.png
    // This avoids a build-time fetch to the dynamic /api/frames endpoint.
    'fc:frame:image': `${getBaseUrl()}/icon.png`, 
    'fc:frame:button:1': 'Click Me!',
    'fc:frame:button:1:action': 'post',
    'fc:frame:button:1:target': `${getBaseUrl()}/api/frames`, 
    'fc:frame:button:2': 'Reset',
    'fc:frame:button:2:action': 'post',
    'fc:frame:button:2:target': `${getBaseUrl()}/api/frames`, 
    'fc:frame:button:3': 'Link',
    'fc:frame:button:3:action': 'link',
    'fc:frame:button:3:target': 'https://framesjs.org',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

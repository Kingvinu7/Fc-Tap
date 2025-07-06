// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FC Tap Game',
  description: 'A fun clicking game on Farcaster',
  openGraph: {
    title: 'FC Tap Game',
    description: 'A fun clicking game on Farcaster! See how many clicks you can get!',
    images: [
      {
        url: '/icon.png',
        width: 955,
        height: 500,
        alt: 'FC Tap Game',
      },
    ],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': '/icon.png',
    'fc:frame:button:1': 'Click Me!',
    'fc:frame:button:1:action': 'post',
    'fc:frame:button:1:target': '/api/frames',
    'fc:frame:button:2': 'Reset',
    'fc:frame:button:2:action': 'post',
    'fc:frame:button:2:target': '/api/frames',
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

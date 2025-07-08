// app/layout.tsx
import type { Metadata } from 'next'
import { headers } from 'next/headers'

export async function generateMetadata(): Promise<Metadata> {
  const host = headers().get('host') || 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`

  return {
    title: 'FC Tap Game',
    description: 'A fun clicking game on Farcaster',
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: 'FC Tap Game',
      description: 'Tap as fast as you can!',
      images: [
        {
          url: '/og.png', // this is the one that matters
          width: 1200,
          height: 630,
          alt: 'FC Tap Game Preview',
        },
      ],
    },
    other: {
      'fc:frame': 'vNext',
      'fc:frame:image': `${baseUrl}/og.png`, // <--- THE KEY LINE
      'fc:frame:button:1': 'Click Me!',
      'fc:frame:button:1:action': 'post',
      'fc:frame:button:1:target': `${baseUrl}/api/frames`,
    },
  }
}

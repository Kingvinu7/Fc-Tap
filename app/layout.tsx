// app/layout.tsx
import type { Metadata } from 'next'
import { headers } from 'next/headers' // Import headers

export async function generateMetadata(): Promise<Metadata> {
  const host = headers().get('host') || 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`

  return {
    title: 'FC Tap Game',
    description: 'A fun clicking game on Farcaster',
    metadataBase: new URL(baseUrl), // Dynamically build metadataBase at runtime
    openGraph: {
      title: 'FC Tap Game',
      description: 'A fun clicking game on Farcaster! See how many clicks you can get!',
      images: [
        {
          url: '/icon.png', // This now correctly resolves using metadataBase
          width: 955,
          height: 500,
          alt: 'FC Tap Game',
        },
      ],
    },
    other: {
      'fc:frame': 'vNext',
      'fc:frame:image': `${baseUrl}/icon.png`, // Use dynamic baseUrl for frame image
      'fc:frame:button:1': 'Click Me!',
      'fc:frame:button:1:action': 'post',
      'fc:frame:button:1:target': `${baseUrl}/api/frames`,
      'fc:frame:button:2': 'Reset',
      'fc:frame:button:2:action': 'post',
      'fc:frame:button:2:target': `${baseUrl}/api/frames`,
      'fc:frame:button:3': 'Link',
      'fc:frame:button:3:action': 'link',
      'fc:frame:button:3:target': 'https://framesjs.org',
    },
  }
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

// app/layout.tsx
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const host = headers().get('host') || 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`

  return {
    title: 'FC Tap Game',
    description: 'Tap as fast as you can!',
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: 'FC Tap Game',
      description: 'Tap as fast as you can!',
      images: [
        {
          url: '/og.png',
          width: 1200,
          height: 630,
          alt: 'FC Tap Game Preview',
        },
      ],
    },
    other: {
      'fc:frame': 'vNext',
      'fc:frame:image': `${baseUrl}/og.png`,
      'fc:frame:button:1': 'Start tapping now',
      'fc:frame:button:1:action': 'post',
      'fc:frame:button:1:target': `${baseUrl}/api/frames`,
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="pixel-font">
        {children}
      </body>
    </html>
  )
}

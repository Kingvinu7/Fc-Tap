// app/layout.tsx
import type { Metadata } from 'next'
import { headers } from 'next/headers'

export async function generateMetadata(): Promise<Metadata> {
  const host = headers().get('host') || 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`

  return {
    title: 'FC Tap Game',
    description: 'Tap Harder! App built by @vinu07',
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: 'FC Tap Game',
      description: 'Tap Harder! App built by @vinu07',
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
      'fc:miniapp': 'true',
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
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              version: 'next',
              imageUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://fc-taps.vercel.app'}/og.png`,
              button: {
                title: 'Start tapping now',
                action: {
                  type: 'launch_miniapp',
                  url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://fc-taps.vercel.app'}/miniapp`,
                },
              },
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}

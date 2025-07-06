import type { Metadata } from 'next'

    export const metadata: Metadata = {
      title: 'FC Tap Game',
      description: 'A fun clicking game on Farcaster',
      // FIX IS HERE: Add metadataBase property
      metadataBase: new URL(
        process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : `http://localhost:${process.env.PORT || 3000}` // Fallback for local
      ),
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

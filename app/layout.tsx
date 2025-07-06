import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FC Tap Game',
  description: 'A fun clicking game on Farcaster',
  openGraph: {
    title: 'FC Tap Game',
    description: 'A fun clicking game on Farcaster! See how many clicks you can get!',
    images: [
      {
        url: '/icon.png', // This should be your frame image
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

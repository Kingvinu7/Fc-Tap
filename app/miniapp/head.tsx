export default function Head() {
  return (
    <>
      {/* Standard meta tags */}
      <title>FC Tap Game</title>
      <meta
        name="description"
        content="Tap as much as you can in 15 seconds. Miniapp built by @Vinu07"
      />

      {/* Open Graph for Telegram, Discord, LinkedIn */}
      <meta property="og:title" content="FC Tap Game" />
      <meta
        property="og:description"
        content="Tap as much as you can in 15 seconds. Miniapp built by @Vinu07"
      />
      <meta property="og:image" content="https://fc-taps.vercel.app/og.png" />
      <meta property="og:url" content="https://fc-taps.vercel.app/miniapp" />

      {/* Twitter card for rich preview */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="FC Tap Game" />
      <meta
        name="twitter:description"
        content="Tap as much as you can in 15 seconds. Miniapp built by @Vinu07"
      />
      <meta name="twitter:image" content="https://fc-taps.vercel.app/og.png" />

      {/* Farcaster miniapp metadata */}
      <meta name="fc:miniapp" content="true" />
      <script
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            version: "next",
            imageUrl: "https://fc-taps.vercel.app/og.png",
            button: {
              title: "Start tapping now",
              action: {
                type: "launch_miniapp",
                url: "https://fc-taps.vercel.app/miniapp"
              }
            }
          })
        }}
      />
    </>
  )
}

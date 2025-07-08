export default function Head() {
  return (
    <>
      <meta name="fc:miniapp" content="true" />
      <script
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            version: "next",
            imageUrl: "https://fc-taps.vercel.app/og.png",
            button: {
              title: "Play Tap Game",
              action: {
                type: "launch_miniapp",
                url: "https://fc-taps.vercel.app/miniapp/"
              }
            }
          })
        }}
      />
    </>
  );
}

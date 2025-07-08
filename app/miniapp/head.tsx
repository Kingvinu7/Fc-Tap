export default function Head() {
  return (
    <>
      <meta
        name="fc:miniapp"
        content='{
          "version": "next",
          "imageUrl": "https://fc-taps.vercel.app/splash.png",
          "button": {
            "title": "Play Tap Game",
            "action": {
              "type": "launch_miniapp",
              "url": "https://fc-taps.vercel.app/miniapp"
            }
          }
        }'
      />
    </>
  );
}

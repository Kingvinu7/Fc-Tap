import { fetchMetadata } from 'frames.js/next';

export async function generateMetadata() {
  // This is where your Farcaster Frame's initial image and metadata are generated.
  return {
    title: "Fc-TAP Clicker",
    description: "A simple Farcaster Frames clicker game.",
    other: {
      ...(await fetchMetadata(
        new URL(
          "/api/frames",
          process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000"
        )
      )),
    },
  };
}

export default function Page() {
  // This is the HTML that a regular web browser would see if it opened your root URL.
  // For Farcaster, the metadata generated above is what counts.
  return (
    <div style={{ padding: 20 }}>
      <h1>Fc-TAP Clicker Game</h1>
      <p>Your Farcaster Mini App is deployed!</p>
      <p>Check it out in the Farcaster app via the /api/frames endpoint.</p>
    </div>
  );
}

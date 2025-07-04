import { fetchMetadata } from 'frames.js/dist/next';

export async function generateMetadata() {
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
  return (
    <div style={{ padding: 20 }}>
      <h1>Fc-TAP Clicker Game</h1>
      <p>Your Farcaster Mini App is deployed!</p>
      <p>Check it out in the Farcaster app via the /api/frames endpoint.</p>
    </div>
  );
}

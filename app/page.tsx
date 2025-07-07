import { fetchMetadata } from 'frames.js/next';

export async function generateMetadata() {
  try {
    const frameMetadata = await fetchMetadata(
      new URL(
        "/api/frames",
        process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000"
      )
    );
    
    return {
      title: "Fc-TAP Clicker",
      description: "A simple Farcaster Frames clicker game.",
      other: {
        ...frameMetadata,
      },
    };
  } catch (error) {
    console.error('Failed to fetch frame metadata:', error);
    return {
      title: "Fc-TAP Clicker",
      description: "A simple Farcaster Frames clicker game.",
    };
  }
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

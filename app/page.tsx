import { fetchMetadata } from "frames.js";

export async function generateMetadata() {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  return {
    title: "Fc-TAP Clicker",
    description: "A simple Farcaster Frames clicker game.",
    other: {
      ...(await fetchMetadata(new URL("/api/frames", baseUrl))),
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

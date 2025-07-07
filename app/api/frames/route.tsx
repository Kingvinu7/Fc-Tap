// app/api/frames/route.ts
import { NextRequest } from "next/server";
import { getFrameHtmlResponse } from "frames.js";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clicks = parseInt(searchParams.get("clicks") || "0");

  return new Response(
    getFrameHtmlResponse({
      buttons: [
        { label: "🎯 Click Me!" },
        { label: "🔄 Reset" },
        { label: "🏠 Home" },
      ],
      image: {
        src: `https://fc-taps.vercel.app/image?clicks=${clicks}`,
      },
      postUrl: "https://fc-taps.vercel.app/api/frames",
    }),
    {
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const buttonIndex = formData.get("buttonIndex");

  let clicks = parseInt(formData.get("clicks")?.toString() || "0");

  if (buttonIndex === "0") clicks++;
  if (buttonIndex === "1") clicks = 0;

  return new Response(
    getFrameHtmlResponse({
      buttons: [
        { label: "🎯 Click Me!" },
        { label: "🔄 Reset" },
        { label: "🏠 Home" },
      ],
      image: {
        src: `https://fc-taps.vercel.app/image?clicks=${clicks}`,
      },
      postUrl: "https://fc-taps.vercel.app/api/frames",
    }),
    {
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}

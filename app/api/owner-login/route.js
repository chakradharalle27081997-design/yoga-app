import { NextResponse } from "next/server";

// Owner PIN is verified here, server-side, using an environment variable.
// It never ships to the browser bundle — set OWNER_PIN in Vercel:
// Project Settings -> Environment Variables -> OWNER_PIN
export async function POST(req) {
  try {
    const { pin } = await req.json();

    if (!process.env.OWNER_PIN) {
      return NextResponse.json(
        { error: "Owner PIN is not configured on the server. Set OWNER_PIN in Vercel env vars." },
        { status: 500 }
      );
    }

    if (!pin || pin !== process.env.OWNER_PIN) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

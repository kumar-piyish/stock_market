import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { symbol, company } = await req.json();

    await connectToDatabase();

    const item = await Watchlist.create({
      userId: session.user.id,
      symbol,
      company,
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Already in watchlist" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to add" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { symbol } = await req.json();

    await connectToDatabase();

    await Watchlist.deleteOne({
      userId: session.user.id,
      symbol,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove" }, { status: 500 });
  }
}

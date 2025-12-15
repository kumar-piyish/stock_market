'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    // Better Auth stores users in the "user" collection
    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

export async function addToWatchlist(symbol: string, company: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await connectToDatabase();

  try {
    const item = await Watchlist.create({
      userId: session.user.id,
      symbol,
      company,
    });

    return item;
  } catch (e: any) {
    if (e.code === 11000) return null; // already exists
    throw e;
  }
}

export async function removeFromWatchlist(symbol: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await connectToDatabase();

  await Watchlist.deleteOne({
    userId: session.user.id,
    symbol,
  });

  return true;
}

export async function getWatchlist() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await connectToDatabase();

  const items = await Watchlist.find({
    userId: session.user.id,
  })
    .sort({ addedAt: -1 })
    .lean();

  return items;
}

export async function isSymbolInWatchlist(symbol: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return false;

  await connectToDatabase();

  const exists = await Watchlist.exists({
    userId: session.user.id,
    symbol: symbol.toUpperCase(),
  });

  return Boolean(exists);
}

import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return NextResponse.json({ ok: false, error: 'NEXT_PUBLIC_CONVEX_URL missing' }, { status: 500 });

  const body = await req.json();
  const { ideaId, score, userId, comment } = body;
  if (!ideaId || !score || !userId) {
    return NextResponse.json({ ok: false, error: 'ideaId, score, userId required' }, { status: 400 });
  }

  const client = new ConvexHttpClient(url);
  await client.mutation('projects:rateProject' as any, {
    ideaId: Number(ideaId),
    score: Number(score),
    userId: String(userId),
    comment: comment ? String(comment) : undefined,
  });

  return NextResponse.json({ ok: true });
}

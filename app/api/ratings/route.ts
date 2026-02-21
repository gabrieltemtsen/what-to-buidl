import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';

export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  const id = Number(req.nextUrl.searchParams.get('ideaId'));
  if (!url) return NextResponse.json({ count: 0, avg: 0, rows: [] });
  if (!id) return NextResponse.json({ error: 'ideaId required' }, { status: 400 });

  const client = new ConvexHttpClient(url);
  const result = await client.query('projects:getIdeaRatings' as any, { ideaId: id });
  return NextResponse.json(result);
}

"use client";

import { useMemo, useState } from 'react';
import { allIdeas } from '@/lib/ideas';

type RatingState = { avg: number; count: number };

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [track, setTrack] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [ratings, setRatings] = useState<Record<number, RatingState>>({});

  const tracks = useMemo(() => Array.from(new Set(allIdeas.map((i) => i.track))), []);
  const levels = useMemo(() => Array.from(new Set(allIdeas.map((i) => i.difficulty))), []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return allIdeas.filter((i) => {
      const hay = `${i.title} ${i.description} ${i.suggested_stack} ${i.track}`.toLowerCase();
      return (!q || hay.includes(q)) && (!track || i.track === track) && (!difficulty || i.difficulty === difficulty);
    });
  }, [query, track, difficulty]);

  async function refreshRating(ideaId: number) {
    const res = await fetch(`/api/ratings?ideaId=${ideaId}`);
    const data = await res.json();
    setRatings((prev) => ({ ...prev, [ideaId]: { avg: data.avg || 0, count: data.count || 0 } }));
  }

  async function rate(ideaId: number, score: number) {
    const userId = localStorage.getItem('wtb_user') || crypto.randomUUID();
    localStorage.setItem('wtb_user', userId);

    await fetch('/api/rate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ideaId, score, userId }),
    });

    await refreshRating(ideaId);
  }

  return (
    <main className="container">
      <h1>🚀 What to Buidl — Next.js Explorer</h1>
      <p className="muted">{filtered.length} / {allIdeas.length} ideas • with Convex ratings</p>

      <div className="row">
        <input
          placeholder="Search projects..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ minWidth: 320, flex: 1 }}
        />
        <select value={track} onChange={(e) => setTrack(e.target.value)}>
          <option value="">All tracks</option>
          {tracks.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">All levels</option>
          {levels.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {filtered.slice(0, 150).map((idea) => {
        const r = ratings[idea.id];
        return (
          <div className="card" key={idea.id}>
            <h3>{idea.id}. {idea.title}</h3>
            <p>{idea.description}</p>
            <p className="muted"><b>Why now:</b> {idea.why_now}</p>
            <p className="muted">
              <span className="badge">{idea.track}</span> <span className="badge">{idea.difficulty}</span> <span className="badge">{idea.time_estimate}</span>
            </p>
            <p className="muted"><b>Stack:</b> {idea.suggested_stack}</p>

            <div className="row">
              <button onClick={() => refreshRating(idea.id)}>Load rating</button>
              {[1,2,3,4,5].map((s) => (
                <button key={s} onClick={() => rate(idea.id, s)}>⭐ {s}</button>
              ))}
              <span className="muted">Avg: {r ? r.avg.toFixed(2) : '-'} ({r?.count || 0} votes)</span>
            </div>
          </div>
        );
      })}
    </main>
  );
}

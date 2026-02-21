"use client";

import { useEffect, useMemo, useState } from 'react';
import { allIdeas } from '@/lib/ideas';

type RatingState = { avg: number; count: number };

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [track, setTrack] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [ratings, setRatings] = useState<Record<number, RatingState>>({});
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const tracks = useMemo(() => Array.from(new Set(allIdeas.map((i) => i.track))), []);
  const levels = useMemo(() => Array.from(new Set(allIdeas.map((i) => i.difficulty))), []);

  const [page, setPage] = useState(1);
  const pageSize = 50;

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return allIdeas.filter((i) => {
      const hay = `${i.title} ${i.description} ${i.suggested_stack} ${i.track}`.toLowerCase();
      return (!q || hay.includes(q)) && (!track || i.track === track) && (!difficulty || i.difficulty === difficulty);
    });
  }, [query, track, difficulty]);

  const featuredAgentic = useMemo(
    () => allIdeas.filter((i) => i.track === 'ai-agent' || i.track === 'hackathon').slice(0, 6),
    []
  );

  useEffect(() => {
    const saved = (localStorage.getItem('wtb_theme') as 'dark' | 'light' | null) || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

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

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('wtb_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  const pageNumbers = Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
    const start = Math.max(1, Math.min(page - 3, totalPages - 6));
    return start + i;
  });

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <strong>What to Buidl</strong>
          <div className="row" style={{ marginBottom: 0 }}>
            <a className="link" href="#ideas">Explorer</a>
            <a className="link" href="https://github.com/gabrieltemtsen/what-to-buidl" target="_blank" rel="noreferrer">GitHub</a>
            <button onClick={toggleTheme}>{theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</button>
          </div>
        </div>
      </nav>

      <main className="container">
        <section className="hero">
          <h1 className="title">🚀 What to Buidl Explorer</h1>
          <p className="subtitle">A curated discovery engine for technical project ideas in the AI/onchain era.</p>
        </section>

        <section className="panel" style={{ marginBottom: 14 }}>
          <h3 style={{ marginTop: 0 }}>🔥 Agentic Hackathon Ideas</h3>
          <div className="row" style={{ marginBottom: 0 }}>
            {featuredAgentic.map((idea) => (
              <span key={idea.id} className="badge">{idea.title}</span>
            ))}
          </div>
        </section>

        <section id="ideas" className="panel">
          <p className="muted" style={{ marginTop: 0 }}>{filtered.length} / {allIdeas.length} ideas • page {page}/{totalPages} • with Convex ratings</p>

        <div className="row">
          <input
            placeholder="Search projects by title, stack, track..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            style={{ minWidth: 320, flex: 1 }}
          />
          <select value={track} onChange={(e) => { setTrack(e.target.value); setPage(1); }}>
            <option value="">All tracks</option>
            {tracks.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}>
            <option value="">All levels</option>
            {levels.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Prev</button>
          <span className="muted">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next →</button>
        </div>
        <div className="row" style={{ justifyContent: 'center' }}>
          {pageNumbers.map((n) => (
            <button key={n} onClick={() => setPage(n)} style={{ opacity: n === page ? 1 : 0.75 }}>
              {n}
            </button>
          ))}
        </div>
      </section>

      {paged.map((idea) => {
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

        <footer className="footer">
          Built by <a className="link" href="https://github.com/gabrieltemtsen" target="_blank" rel="noreferrer">gabedev.eth</a> ·
          {' '}<a className="link" href="https://github.com/gabrieltemtsen/what-to-buidl" target="_blank" rel="noreferrer">GitHub Repo</a>
        </footer>
      </main>
    </>
  );
}

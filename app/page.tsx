"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { allIdeas } from '@/lib/ideas';

type RatingState = { avg: number; count: number };

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState('');
  const [track, setTrack] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [ratings, setRatings] = useState<Record<number, RatingState>>({});
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [preset, setPreset] = useState<'all' | 'expert' | 'mindblowing' | 'agenticHackathon'>('all');

  const tracks = useMemo(() => Array.from(new Set(allIdeas.map((i) => i.track))), []);
  const levels = useMemo(() => Array.from(new Set(allIdeas.map((i) => i.difficulty))), []);

  const [page, setPage] = useState(1);
  const pageSize = 50;

  const updateUrl = (next: { query?: string; track?: string; difficulty?: string; preset?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    const qv = next.query ?? query;
    const tv = next.track ?? track;
    const dv = next.difficulty ?? difficulty;
    const pv = next.preset ?? preset;
    const pg = next.page ?? page;

    qv ? params.set('q', qv) : params.delete('q');
    tv ? params.set('track', tv) : params.delete('track');
    dv ? params.set('difficulty', dv) : params.delete('difficulty');
    pv && pv !== 'all' ? params.set('preset', pv) : params.delete('preset');
    pg > 1 ? params.set('page', String(pg)) : params.delete('page');

    router.replace(`?${params.toString()}`);
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return allIdeas.filter((i) => {
      const hay = `${i.title} ${i.description} ${i.suggested_stack} ${i.track}`.toLowerCase();
      const base = (!q || hay.includes(q)) && (!track || i.track === track) && (!difficulty || i.difficulty === difficulty);
      if (!base) return false;

      if (preset === 'expert') return i.difficulty === 'advanced';
      if (preset === 'mindblowing') return i.difficulty === 'advanced' && /autonomous|agentic|zero-knowledge|cryptoeconomic|adversarial|meta|neural/i.test(i.title + ' ' + i.description);
      if (preset === 'agenticHackathon') return i.track === 'ai-agent' || i.track === 'hackathon';
      return true;
    });
  }, [query, track, difficulty, preset]);

  const featuredAgentic = useMemo(
    () => allIdeas.filter((i) => i.track === 'ai-agent' || i.track === 'hackathon').slice(0, 6),
    []
  );

  useEffect(() => {
    const saved = (localStorage.getItem('wtb_theme') as 'dark' | 'light' | null) || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);

    const q = searchParams.get('q') || '';
    const t = searchParams.get('track') || '';
    const d = searchParams.get('difficulty') || '';
    const p = (searchParams.get('preset') as 'all' | 'expert' | 'mindblowing' | 'agenticHackathon' | null) || 'all';
    const pg = Number(searchParams.get('page') || '1');

    setQuery(q);
    setTrack(t);
    setDifficulty(d);
    setPreset(p);
    setPage(Number.isFinite(pg) && pg > 0 ? pg : 1);
  }, [searchParams]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
      updateUrl({ page: totalPages });
    }
  }, [page, totalPages]);

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
              const v = e.target.value;
              setQuery(v);
              setPage(1);
              updateUrl({ query: v, page: 1 });
            }}
            style={{ minWidth: 320, flex: 1 }}
          />
          <select value={track} onChange={(e) => { const v = e.target.value; setTrack(v); setPage(1); updateUrl({ track: v, page: 1 }); }}>
            <option value="">All tracks</option>
            {tracks.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select value={difficulty} onChange={(e) => { const v = e.target.value; setDifficulty(v); setPage(1); updateUrl({ difficulty: v, page: 1 }); }}>
            <option value="">All levels</option>
            {levels.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="row" style={{ marginTop: -4 }}>
          <button onClick={() => { setPreset('all'); setPage(1); updateUrl({ preset: 'all', page: 1 }); }} style={{ opacity: preset === 'all' ? 1 : 0.7 }}>All</button>
          <button onClick={() => { setPreset('expert'); setPage(1); updateUrl({ preset: 'expert', page: 1 }); }} style={{ opacity: preset === 'expert' ? 1 : 0.7 }}>Expert-only</button>
          <button onClick={() => { setPreset('mindblowing'); setPage(1); updateUrl({ preset: 'mindblowing', page: 1 }); }} style={{ opacity: preset === 'mindblowing' ? 1 : 0.7 }}>Mindblowing / Frontier</button>
          <button onClick={() => { setPreset('agenticHackathon'); setPage(1); updateUrl({ preset: 'agenticHackathon', page: 1 }); }} style={{ opacity: preset === 'agenticHackathon' ? 1 : 0.7 }}>Agentic Hackathon</button>
        </div>

        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <button disabled={page <= 1} onClick={() => { const np = Math.max(1, page - 1); setPage(np); updateUrl({ page: np }); }}>← Prev</button>
          <span className="muted">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span>
          <button disabled={page >= totalPages} onClick={() => { const np = Math.min(totalPages, page + 1); setPage(np); updateUrl({ page: np }); }}>Next →</button>
        </div>
        <div className="row" style={{ justifyContent: 'center' }}>
          {pageNumbers.map((n) => (
            <button key={n} onClick={() => { setPage(n); updateUrl({ page: n }); }} style={{ opacity: n === page ? 1 : 0.75 }}>
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

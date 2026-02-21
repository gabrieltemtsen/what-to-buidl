# what-to-buidl

A Next.js + Convex project explorer for technical ideas builders can discover and rate.

## Features

- Browse 1,200+ project ideas
- Search + filters (track, difficulty)
- Rating system (1–5 stars) backed by Convex
- Ready for hackathon/vibe-coding inspiration

## Stack

- Next.js (App Router)
- React
- Convex (database + mutations/queries)

## Setup

```bash
npm install
cp .env.example .env.local
# set NEXT_PUBLIC_CONVEX_URL from Convex dashboard
```

## Run

```bash
npm run dev
```

Open http://localhost:3000

## Convex setup

```bash
npx convex dev
```

This will generate Convex types under `convex/_generated` and sync schema/functions.

## Existing data

- `data/ideas.json` contains the core dataset.
- `ideas/` contains long-form markdown specs.

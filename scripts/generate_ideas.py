import json
import random

random.seed(42)

prefixes = [
    "Agentic", "Autonomous", "Realtime", "Onchain", "Local-first", "Collaborative", "Privacy-first", "AI-native",
    "Composable", "Serverless", "Multimodal", "Edge", "No-code", "Open-source", "Zero-knowledge", "Social"
]

nouns = [
    "Grant Scout", "Bug Bounty Co-pilot", "Research Briefing Bot", "Code Review Arena", "Mentor Matchmaker",
    "Learning Path Builder", "Startup Idea Validator", "Hackathon Team Finder", "Spec-to-App Generator",
    "Prompt Playground", "Ops Runbook Agent", "Changelog Narrator", "Community Pulse Monitor", "Trend Radar",
    "Wallet Risk Monitor", "DeFi Strategy Simulator", "Personal Finance Coach", "Onchain Reputation Passport",
    "DevRel Campaign Planner", "Contract Audit Assistant", "DAO Governance Copilot", "Meme Tracker",
    "Creator Monetization Engine", "Podcast Clipper", "Video Repurposer", "Voice Tutor", "Career Coach",
    "Interview Simulator", "SaaS Onboarding Agent", "Customer Support Deflector", "RFP Writer", "Proposal Builder",
    "Data Labeling Factory", "Synthetic User Tester", "API Contract Verifier", "Infra Cost Optimizer",
    "Incident Triage Bot", "Cloud Security Auditor", "PRD Generator", "Feature Prioritizer",
    "A/B Test Analyst", "Crypto Tax Assistant", "Cross-border Payroll Bot", "Remittance Router",
    "Gig Worker Assistant", "Legal Clause Analyzer", "Compliance Checklist Agent", "Medical Intake Assistant",
    "Mental Wellness Journal", "Habit Accountability Bot", "Travel Planner", "Event Ops Assistant"
]

problems = [
    "helps teams ship faster with fewer meetings",
    "turns messy docs into actionable build plans",
    "automates repetitive ops work for lean teams",
    "reduces decision fatigue using explainable AI",
    "bridges onchain data with human-friendly UX",
    "creates high-signal insights from noisy social feeds",
    "improves hackathon productivity from idea to demo",
    "lets solo builders punch above their weight",
    "transforms raw APIs into conversational workflows",
    "keeps communities informed with proactive summaries",
]

stacks = [
    "Telegram + TypeScript + Supabase",
    "Next.js + Postgres + OpenAI/Anthropic",
    "React Native + Firebase + Whisper",
    "Node.js + Redis + Temporal",
    "Python FastAPI + LangGraph + pgvector",
    "ElizaOS + Farcaster + Celo",
    "Cloudflare Workers + D1 + KV",
    "Solana + Anchor + Next.js",
    "Base + viem + wagmi",
    "Rust + Tauri + SQLite",
]

tracks = ["vibe-coding", "hackathon", "startup", "open-source", "ai-agent", "onchain", "consumer", "b2b"]
levels = ["beginner", "intermediate", "advanced"]

ideas = []
for i in range(1, 1201):
    p = random.choice(prefixes)
    n = random.choice(nouns)
    title = f"{p} {n}"
    desc = f"A project that {random.choice(problems)}. Great for {random.choice(['weekend builds', 'hackathon demos', 'portfolio projects', 'MVP experiments'])}."
    idea = {
        "id": i,
        "title": title,
        "description": desc,
        "why_now": random.choice([
            "LLMs + cheap infra made this feasible.",
            "APIs are mature and builders want faster iteration.",
            "Communities need practical AI tools, not demos.",
            "Cross-platform workflows are exploding in demand."
        ]),
        "suggested_stack": random.choice(stacks),
        "difficulty": random.choice(levels),
        "time_estimate": random.choice(["1 weekend", "3-5 days", "1-2 weeks", "2-4 weeks"]),
        "track": random.choice(tracks),
    }
    ideas.append(idea)

with open("/home/gabrieltemtsen/.openclaw/workspace/what-to-buidl/data/ideas.json", "w") as f:
    json.dump(ideas, f, indent=2)

print(f"Generated {len(ideas)} ideas")

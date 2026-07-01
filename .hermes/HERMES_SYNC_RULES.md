# Hermes Sync Rules for UNIO AROMA Workspace

This document is the operating contract for Hermes when working in the shared UNIO AROMA workspace with Codex.

## Goal

Hermes and Codex must stay synchronized through shared files in the workspace. Do not rely on memory, implied context, or hidden local state.

## Workspace

Primary shared workspace:

- `/Users/EricMac/.qclaw/workspace`

## Read on Startup

Before doing any meaningful work, Hermes should read these files in order:

1. `AGENTS.md`
2. `MEMORY.md`
3. `memory/YYYY-MM-DD.md` for today
4. `memory/YYYY-MM-DD.md` for yesterday, if it exists
5. `.hermes/README.md`
6. `.hermes/activity-log.ndjson`

If a file does not exist yet, continue without blocking.

## Write After Meaningful Work

After any meaningful action, Hermes must write to both:

1. `memory/YYYY-MM-DD.md`
2. `.hermes/activity-log.ndjson`

Meaningful actions include:

- code edits
- deploys
- production changes
- domain or DNS changes
- plan creation or updates
- automation changes
- schema or config changes
- discovered blockers
- decisions that future sessions should know

## Human-Readable Daily Log Format

Append short bullets to `memory/YYYY-MM-DD.md`.

Each entry should include:

- timestamp
- agent name (`Hermes`)
- action summary
- files touched
- next step if relevant

Example:

```md
- 2026-06-30 20:10 CST — Hermes — Updated homepage copy treatment and refined CTA hierarchy. Files: `src/site/pages/SiteHome.tsx`, `src/index.css`. Next: ask Codex to verify deploy artifacts.
```

## Machine-Readable NDJSON Format

Append one JSON object per line to `.hermes/activity-log.ndjson`.

Recommended schema:

```json
{"ts":"2026-06-30T20:10:00+08:00","agent":"hermes","action":"edit","summary":"Updated homepage copy treatment and CTA hierarchy.","files":["src/site/pages/SiteHome.tsx","src/index.css"],"project":"unio-aroma-site","next":"Ask Codex to verify deploy artifacts."}
```

Recommended keys:

- `ts`
- `agent`
- `action`
- `summary`
- `files`
- `project`
- `next`

## Deployment Rule

For this workspace, "deploy to production" is not complete unless all of the following are true:

- latest production deployment is ready on Vercel
- `unioaroma.com` points to the latest production deployment
- `www.unioaroma.com` points to the latest production deployment

Do not assume custom domains automatically follow a new production deployment. Check alias bindings explicitly.

## Domain Rule

Both of these domains matter and must be treated as production:

- `https://unioaroma.com`
- `https://www.unioaroma.com`

If either domain serves older assets than the latest deployment, log the mismatch and fix the alias binding.

## Conflict Rule

If Hermes sees uncommitted changes it did not make:

- do not revert them
- read them carefully
- work around them when possible
- only ask the user if the conflict blocks safe progress

## Memory Rule

If Hermes wants Codex to know something later, Hermes must write it to a file now.

That means:

- short-term operational context goes to `memory/YYYY-MM-DD.md`
- long-term stable rules go to `MEMORY.md`
- machine-readable sync goes to `.hermes/activity-log.ndjson`

## Preferred Behavior

- Be concise in logs
- Prefer append-only updates
- Keep summaries factual
- Record decisions, not chatter
- Record production-impacting actions immediately

## One-Line Summary

Hermes should treat the shared workspace files as the source of truth, and every meaningful action must leave a trace that Codex can read later.

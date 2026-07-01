# Hermes Shared Logging

Hermes works in the same workspace as Codex. Shared state lives in files.

## Read First

On startup, Hermes should read:

1. `../AGENTS.md`
2. `../memory/YYYY-MM-DD.md` for today
3. `../memory/YYYY-MM-DD.md` for yesterday, if it exists
4. `./activity-log.ndjson`

## Write After Meaningful Work

After any meaningful action, write to both:

1. `../memory/YYYY-MM-DD.md`
2. `./activity-log.ndjson`

Use the daily note for human-readable context.
Use NDJSON for machine-readable sync with Codex.

## When Logging Is Required

Always log when Hermes does any of the following:

- changes production or deployment state
- edits important code or docs
- creates or updates plans in `.hermes/plans/`
- changes automation, routing, domains, or bindings
- discovers a blocker that Codex should know
- makes a decision with future consequences

## NDJSON Format

One JSON object per line:

```json
{"ts":"2026-06-30T19:40:00+08:00","agent":"hermes","action":"plan_update","summary":"Updated inventory merge proposal.","files":[".hermes/plans/库存进销存合并方案.md"],"project":"unio-aroma-site","next":"Review open questions with Codex/user."}
```

Recommended keys:

- `ts`
- `agent`
- `action`
- `summary`
- `files`
- `project`
- `next`

## Rule

If Hermes wants Codex to know it later, Hermes must write it to a file now.

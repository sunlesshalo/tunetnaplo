---
name: archive-memory
description: Archive old sessions and completed tasks to git history. Use weekly or when memory files get too large. Keeps active memory lean while preserving full history.
---

# Archive Memory

## Goal
Keep active memory files lean and focused while preserving full history in git. Based on Anthropic's research on long-running agents: git history IS the archive.

**Source:** Anthropic Engineering - "Building effective agents for software development" (2025). Key insight: "compaction isn't sufficient" - you need structured artifacts and git history for session continuity.

## When to Use
- Weekly maintenance
- When CONTEXT.md exceeds ~300 lines
- When STATE.json has many completed tasks
- Before starting a major new feature
- When context feels "cluttered"

## The Principle

From Anthropic's research:
- Don't delete completed items, mark them complete
- Git commits = primary archive (searchable, rollback-capable)
- Commit messages should summarize what's being archived
- Keep active files focused on current state

## Steps

### 1. Check Current State

Review what needs archiving:
- How many sessions are in CONTEXT.md?
- How many completed tasks in STATE.json?
- Any sessions older than 2 weeks?

### 2. Create Archive Commit

Create a descriptive commit that captures what's being archived:

```bash
git add -A
git commit -m "Archive: [date range] sessions and completed tasks

Sessions archived:
- [Session 1 date]: [brief summary]
- [Session 2 date]: [brief summary]

Completed tasks archived:
- [Task 1]
- [Task 2]

Active work continues: [current focus]"
```

### 3. Clean STATE.json

Remove completed tasks from the `tasks` array. Keep only:
- `pending` tasks
- `in_progress` tasks
- `blocked` tasks

### 4. Trim CONTEXT.md

Keep:
- Last 5-7 sessions (or last 2 weeks)
- The "Notes" section with tags
- The "Reference" section
- Any important discoveries/decisions

Remove:
- Older session entries (they're in git history now)

### 5. Commit the Cleanup

```bash
git add -A
git commit -m "Memory cleanup: kept last N sessions, removed M completed tasks

Archived content searchable in git history.
Next archive due: [date + 1 week]"
```

### 6. Report What Was Archived

Tell the user:
- How many sessions were archived
- How many tasks were removed
- Current active task count
- Next suggested archive date

## Finding Archived Content

To find archived sessions or tasks:

```bash
# Search commit messages
git log --grep="Archive:" --oneline

# Search for specific content in history
git log -p --all -S "keyword" -- memory/

# View a specific archived version
git show <commit>:memory/CONTEXT.md
```

## Frequency

| Situation | Archive Frequency |
|-----------|-------------------|
| Heavy daily use | Weekly |
| Moderate use | Bi-weekly |
| Light use | Monthly |
| Before major feature | Always |

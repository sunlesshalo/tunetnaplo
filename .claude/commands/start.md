Read all memory files and provide a session briefing.

Based on Anthropic's research on long-running agents: session startup should include reading progress files AND git history to understand what happened in recent sessions.

## Steps

1. Read these files:
   - memory/STATE.json
   - memory/CONTEXT.md

2. Check recent git history:
   ```bash
   git log --oneline -10
   ```
   This shows what was committed recently (archived content, checkpoints, changes).

3. Summarize in this format:

**Last Session:** [from Session Log in CONTEXT.md]

**Current Focus:** [current_focus from STATE.json]

**Open Tasks:** [pending/in_progress tasks from STATE.json]

**Recent Activity:** [brief summary from git log - what was committed]

**Relevant Context:** [recent notes from CONTEXT.md if any]

4. If there are signs of incomplete work (uncommitted changes, in_progress tasks from previous session), note this:
   - Check `git status` for uncommitted changes
   - Flag any tasks marked in_progress that weren't updated recently

5. Ask: "What would you like to focus on?"

Do NOT start any work until the user responds.

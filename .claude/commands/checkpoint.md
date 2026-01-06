Save current progress and prepare for session end.

## Steps

1. **Update memory/CONTEXT.md Session Log:**
   - Add today's date as a new session entry under "# Session Log"
   - Summarize what was accomplished
   - Note any blockers or open questions
   - Suggest what the next session should focus on

2. **Update memory/STATE.json:**
   - Update task statuses (pending → in_progress → completed)
   - Add any new tasks discovered during the session
   - Set current_focus to the next priority item

3. **Check for uncommitted changes:**
   - Run `git status`
   - If there are changes, ask: "Ready to commit? Suggested message: [message]"

4. **Final summary:**
   - Show updated task list from STATE.json
   - List any notes added to CONTEXT.md this session
   - Confirm checkpoint is complete

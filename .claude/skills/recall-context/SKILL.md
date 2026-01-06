---
name: recall-context
description: Search memory for past context. Use before debugging an error, when something seems familiar, or when you need to remember a past decision.
---

# Recall Context

## Goal
Avoid re-solving problems or re-discovering things by checking past context first.

## When to Use
- Before debugging an error (check if it was solved before)
- When something seems familiar
- When you need to remember why a decision was made
- Before making a decision that might conflict with a past one

## Steps
1. Search `memory/CONTEXT.md` for relevant entries
2. Look for matching tags:
   - `[error]` - Past errors and solutions
   - `[discovery]` - Past learnings
   - `[decision]` - Past decisions and rationale

3. If found:
   - Apply the past solution or context
   - Reference it in your response

4. If not found:
   - Proceed with solving/investigating
   - Consider logging the result afterward using log-context

## Search Tips
- Search for keywords related to the current issue
- Check recent session entries in the Session Log section
- Look for error codes, component names, or specific terms
- Check the Reference section for key files and environment variables

---
description: Load organizational wisdom and alignment at session start. Use at the beginning of any session to give the agent accumulated knowledge from all previous sessions.
---

# Boot Alignment

// turbo-all

1. Pull latest changes to get any new pearls from other contributors:
```
git pull
```

2. Read the organizational pearls of wisdom at `.agent/alignment/pearls.md` in full. If the file does not exist, skip to step 5.

3. Internalize the pearls silently. Do NOT list them back to the user.

4. **Activate invocation tracking for this session:**
   - Keep the pearl list active in working memory throughout the session
   - Whenever a pearl **prevents a mistake or shapes a decision**, log it inline in your response using this exact format:
     ```
     ⚡ Pearl invoked: "[Pearl Title]" — [what you were about to do and what you did instead]
     ```
   - This is how the system knows which pearls are earning their keep vs. sitting idle

5. At the end of this session, if significant iterative problem-solving occurred, offer to run `/harvest`. The harvest process will scan for ⚡ invocation logs and increment the `Uses` counter for each invoked pearl.

6. Proceed with the user's request.

---
description: Stage all changes, commit with a descriptive message, and push to GitHub
---

# Git Push Workflow

// turbo-all

> **PowerShell notes:**
> - NEVER use `&&` to chain commands — run each as a separate step
> - NEVER use multi-line strings in `-m "..."` — keep the commit message on ONE line
> - If `git status` still shows unstaged files after `git add`, re-run `git add -A` again

1. Stage all changes:
```
git add -A
```

2. Verify staging (confirm files moved to "Changes to be committed"):
```
git status
```

3. Commit with a single-line descriptive message (no line breaks inside the quotes):
```
git commit -m "<one-line descriptive message summarizing all changes>"
```

4. Confirm commit was created:
```
git log --oneline -2
```

5. Push to remote:
```
git push
```

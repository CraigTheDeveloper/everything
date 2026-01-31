---
name: branch
description: Create and switch to a new git branch before making changes
---

Create a new git branch and switch to it.

1. If $ARGUMENTS is provided, use it to create a descriptive branch name
2. If no arguments, infer a name from the task context

Branch naming conventions:
- Features: `feature/short-description`
- Bug fixes: `fix/short-description`
- Refactors: `refactor/short-description`
- For Claude-initiated work: `claude/short-description`

Steps:
1. Check current branch with `git branch --show-current`
2. If already on a feature branch (not main), confirm with user before switching
3. Create and switch: `git checkout -b <branch-name>`
4. Confirm the branch was created

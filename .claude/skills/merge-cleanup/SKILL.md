---
name: merge-cleanup
description: Merge a PR and clean up local and remote branches
---

Complete the post-PR workflow to merge and clean up branches.

1. **Merge the PR:**
   - Use GitHub CLI: `gh pr merge <pr-number> --merge --delete-branch`
   - `--delete-branch` automatically deletes both local and remote branches

2. **Switch to main and pull:**
   - Run `git checkout main && git fetch --prune && git pull`
   - `--prune` removes stale remote-tracking refs

3. **Confirm completion** by showing `git branch -a` and `git status`

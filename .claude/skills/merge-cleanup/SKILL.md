---
name: merge-cleanup
description: Merge a PR and clean up local and remote branches
---

Complete the post-PR workflow to merge and clean up branches.

1. **Merge the PR and delete remote branch:**
   - Use GitHub CLI: `gh pr merge <pr-number> --merge --delete-branch`
   - The `--delete-branch` flag automatically deletes the remote branch after merge

2. **Switch to main:**
   - Run `git checkout main`

3. **Fetch and pull:**
   - Run `git fetch --prune && git pull`
   - `--prune` removes stale remote-tracking refs
   - This must happen before deleting local branch so git knows it's merged

4. **Delete local branch:**
   - Run `git branch -d <branch-name>`
   - Using `-d` (not `-D`) ensures git verifies the branch was merged

5. **Confirm completion** by showing the current branch and status

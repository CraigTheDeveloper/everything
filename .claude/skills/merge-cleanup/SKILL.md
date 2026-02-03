---
name: merge-cleanup
description: Merge a PR and clean up local and remote branches
---

Complete the post-PR workflow to merge and clean up branches.

1. **Merge the PR:**
   - Use GitHub CLI: `gh pr merge <pr-number> --merge`

2. **Delete remote branch:**
   - Run `git push origin --delete <branch-name>`

3. **Switch to main:**
   - Run `git checkout main`

4. **Fetch and pull:**
   - Run `git fetch --prune && git pull`
   - This must happen before deleting local branch so git knows it's merged

5. **Delete local branch:**
   - Run `git branch -d <branch-name>`
   - Using `-d` (not `-D`) ensures git verifies the branch was merged

6. **Confirm completion** by showing the current branch and status

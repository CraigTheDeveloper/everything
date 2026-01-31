---
name: commit-push-pr
description: Commit changes, push to remote, and create a pull request
---

Complete the git workflow to commit, push, and create a PR.

1. **Check branch status:**
   - Run `git branch --show-current`
   - If on `main`, use the `/branch` skill to create a new branch first

2. **Prepare commit:**
   - Run `git status` to see changes
   - Run `git diff` to review what changed
   - Run `git log --oneline -3` to see recent commit style

3. **Commit:**
   - Stage relevant files with `git add`
   - Create commit with descriptive message
   - Include the standard footer:
     ```
     🤖 Generated with [Claude Code](https://claude.com/claude-code)

     Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
     ```

4. **Push:**
   - Push with upstream tracking: `git push -u origin <branch-name>`

5. **Create PR:**
   - Use GitHub CLI: `gh pr create --title "..." --body "..."`
   - Title: concise description of the change
   - Body: include Summary, Test plan sections, and the Claude Code footer

6. **Return the PR URL** so the user can review it

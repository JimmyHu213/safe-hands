# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated issues, mention them — don't fix them.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan with verification at each step.

## 5. Project Context

<!-- Fill in per project -->
<!-- - Tech stack: -->
<!-- - Architecture overview: -->
<!-- - Key dependencies: -->
<!-- - Directory structure conventions: -->

## 6. Coding Standards

- Follow existing patterns in the codebase.
- No premature abstractions — three similar lines beat one speculative helper.
- Prefer readability over cleverness.
- Error handling at system boundaries only (user input, external APIs).

## 7. Git Workflow

- Conventional Commits required: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, `build:`, `perf:`, `style:`
- Keep PRs small and focused — one concern per PR.
- Write meaningful commit messages explaining why, not what.
- Never force-push to shared branches.

## 8. PR Expectations

- Fill out the PR template completely.
- Ensure all CI checks pass before requesting review.
- Respond to CodeRabbit/Copilot findings — dismiss with a reason or fix.

## 9. File Organization

<!-- Fill in per project -->
<!-- - Describe your directory structure conventions here -->
- Co-locate related files.
- Avoid deep nesting.

## 10. Debugging & Verification

**Do not use Chrome browser automation (`mcp__claude-in-chrome__*`) by default.**

Verify with the cheapest tool that actually proves the point:
- `npx tsc --noEmit`, `npx vitest run`, `npm run build` — correctness and compilation.
- `curl` against a running server — what the server actually sends. Set an
  explicit `Accept` header when the response varies by content negotiation.
- Inspect build output on disk (`.next/static`) — what will really ship.
- Server logs and `console.log` over live DOM inspection.

Only launch the browser when I explicitly ask for it ("open the browser",
"screenshot it"), or when the question is genuinely visual and nothing else can
answer it — rendered layout, computed styles, contrast against real backgrounds.

When you do use it, remember the browser lies about assets: a stale HTTP cache
or `.next/cache/images` entry will happily serve an old file under an unchanged
URL. Confirm against the server or the file on disk before concluding the code
is wrong.

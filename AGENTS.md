<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Everything Claude Code (ECC) — Agent instructions (Cursor)

This project includes **ECC**-derived hooks (`.cursor/hooks/`), shared scripts (`scripts/`), and Cursor rules under `.cursor/rules/` (common + TypeScript). **Project-specific stack rules** live in `.cursor/rules/eletrotec.mdc` (Next.js App Router, TanStack Query, Zod, Ky, etc.) — follow them when they apply.

## Core principles

1. **Agent-first** — Delegate to specialized agents for domain tasks.
2. **Test-driven** — Prefer tests before implementation; aim for strong coverage as the stack matures.
3. **Security-first** — No secrets in code; validate inputs; safe auth and cookies.
4. **Plan before execute** — Plan complex features before large refactors.

## Available agents (when to use)

| Agent | Purpose | When to use |
|-------|---------|-------------|
| planner | Implementation planning | Complex features, refactors |
| architect | System design | Architecture and scalability |
| tdd-guide | TDD workflow | New features, bug fixes |
| code-reviewer | Quality and maintainability | After substantive edits |
| security-reviewer | Vulnerabilities | Before commits, sensitive areas |
| build-error-resolver | Build/type errors | When build or typecheck fails |
| e2e-runner | Playwright E2E | Critical user flows |
| refactor-cleaner | Dead code | Maintenance passes |
| doc-updater | Docs and codemaps | Documentation updates |
| docs-lookup | Docs/API via Context7 | API and library questions |
| database-reviewer | DB / Supabase | Schema, queries, performance |
| typescript-reviewer | TS/JS review | TypeScript and React code |
| loop-operator | Autonomous loops | Long-running agent loops |
| harness-optimizer | Harness tuning | Reliability and cost |

**Language-specific agents** (cpp-, go-, kotlin-, python-, java-, rust-, pytorch-) apply only if the repo uses those stacks.

## Orchestration (heuristic)

- Complex feature → **planner** (then implement per `eletrotec.mdc`).
- After meaningful code changes → **code-reviewer**.
- Bug or new behavior → **tdd-guide** where tests exist or are planned.
- Security-sensitive paths → **security-reviewer**.

## Security (baseline)

- No hardcoded secrets; use env / secret managers.
- Validate inputs at boundaries (e.g. Zod); parameterized queries; XSS/CSRF awareness for web.
- On critical findings: stop, fix, rotate exposed secrets if any.

## Git and commits

- Prefer **Conventional Commits** (`feat:`, `fix:`, `refactor:`, etc.) aligned with team policy.
- Hooks may block `git` commands that skip verification (`--no-verify`) — intentional.

## ECC runtime

- **Hook profile:** `ECC_HOOK_PROFILE=minimal|standard|strict` (default `standard`).
- **Disable specific hooks:** `ECC_DISABLED_HOOKS` (comma-separated IDs, see ECC docs).
- Session/skill persistence used by hooks targets the user’s `~/.claude` layout where applicable.

## References

- Upstream ECC: [everything-claude-code](https://github.com/affaan-m/everything-claude-code)
- Project rules: `.cursor/rules/eletrotec.mdc`, `.cursor/rules/common-*.md`, `.cursor/rules/typescript-*.md`

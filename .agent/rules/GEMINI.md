# Compound Project - Agent Configuration

## Project Overview

This project implements the Compound Learning System for {PROJECT_NAME} - a self-improving knowledge system based on the "Compounding Engineering" philosophy.

## Core Principle

> **Each unit of engineering work should make subsequent units of work easier—not harder.**

## Workflows Available

> **Full index:** See [plugin/.agent/workflows/README.md](plugin/.agent/workflows/README.md) for all commands and quick start guide.

Use these commands for systematic development:

| Command | When |
|---------|------|
| `plugin/explore` | Deep investigation before planning |
| `plugin/specs` | Before multi-week initiatives |
| `plugin/plan` | Before starting significant work |
| `plugin/work` | Execute plans systematically |
| `plugin/review` | Before merging, self-review |
| `plugin/compound` | After solving problems ("that worked!") |
| `plugin/housekeeping` | Before git push (cleanup & archive) |

## Knowledge Persistence

Solutions are documented in `plugin/docs/solutions/` and explorations in `plugin/docs/explorations/` with:
- YAML frontmatter for searchability
- Categorized by problem type
- Schema validated (`schema.yaml`)

**Before solving a problem:** Search `plugin/docs/solutions/` and `plugin/docs/explorations/` for prior knowledge.

**After solving a problem:** Run `plugin/compound` to document it.

## Compounding Loop

```
/plugin/explore (optional) → /plugin/specs (large) → /plugin/plan (per phase) → /plugin/work → /plugin/review → /plugin/compound → /plugin/housekeeping → repeat
```

## Important Directories

```
.agent/workflows/     # All workflow commands
plugin/docs/solutions/       # Persistent knowledge base
plugin/docs/explorations/    # Deep investigations & research
plugin/docs/decisions/       # Project-wide ADRs
├── patterns/         # Critical patterns (READ FIRST)
├── schema.yaml       # Validation schema
└── {categories}/     # Categorized solutions
plugin/docs/features/        # Feature documentation (New features, READMEs)
plugin/skills/               # Modular capabilities
├── file-todos/       # Todo management
├── compound-docs/    # Solution documentation
└── session-resume/   # Context resume
plugin/plans/                # Implementation plans from /plan
├── archive/          # Completed plans
plugin/todos/                # Work items from /review
├── archive/          # Completed todos
plugin/docs/specs/           # Multi-session specifications
├── archive/          # Completed specs
```

## Agent Behavior

-1. **Resume Context** - At the start of EVERY new session, read `plugin/skills/session-resume/SKILL.md` and follow the checklist to establish state.
0. **Check active specs** - Before starting significant work, run `ls plugin/docs/specs/*/README.md` to find active multi-session initiatives
1. **Search before solving** - Check `plugin/docs/solutions/` and `plugin/docs/explorations/` for similar problems (use `plugin/skills/compound-docs/SKILL.md`)
2. **Deep Explore** - Use `/explore` for complex problems to avoid assumption-based planning.
3. **Document after solving** - Trigger `/compound` on success phrases
4. **Follow patterns** - Reference `plugin/docs/patterns/critical-patterns.md`
5. **Use workflows** - Prefer `/specs` (large) or `/plan` (small) → `/work` over ad-hoc coding (see `plugin/skills/` for specific domain help)
6. **Todos for deferred work** - If you close/reject/defer work, create a todo file in `plugin/todos/` (use `plugin/skills/file-todos/SKILL.md`). Implementation plans document decisions; todos track actionable follow-up.
7. **Housekeeping before push** - Run `/housekeeping` or the pre-push hook will block until cleanup is done.
8. **Weekly health check** - Every Monday, run `./scripts/compound-health.sh` and address any warnings. Target: >50% coverage.
9. **Record architectural decisions** - When making technology/pattern/schema choices, create ADRs in `plugin/docs/decisions/`. Check existing ADRs before re-debating.
10. **Check health daily** - Run `./scripts/compound-dashboard.sh` at session start. Target: Grade B or higher.
11. **Instrument Skills** - Every new skill MUST include an `## Instrumentation` section in `SKILL.md` calling `./scripts/log-skill.sh`.

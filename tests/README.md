# tests/

Project tests live under this directory.

```text
tests/
├── unit/          # Vitest — utilities, validation, services, repositories
├── integration/   # Vitest — API / DB / auth boundary tests
└── e2e/           # Playwright — critical user journeys
```

## Commands

```bash
pnpm test
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm test:coverage
```

Follow `.cursor/rules/testing.mdc` and `AGENTS.md` when adding tests.

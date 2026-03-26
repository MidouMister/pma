# AGENTS.md — PMA Implementation Bible

> **Version:** 5.1.0 · **Updated:** March 2026
> This file is the single source of truth for all agents. Read it fully before every task.

---

## ⚠️ Important: Next.js 16 uses proxy.ts

In **Next.js 16**, the middleware file has been renamed from `middleware.ts` to `proxy.ts`.

| Next.js 15                     | Next.js 16                         |
| ------------------------------ | ---------------------------------- |
| `middleware.ts`                | `proxy.ts`                         |
| `export function middleware()` | `export default clerkMiddleware()` |
| Edge Runtime (default)         | Node.js Runtime (default)          |

**Location:** The proxy file must be inside the `app/` directory: `app/proxy.ts`

**Do NOT use `middleware.ts`** — it's deprecated in Next.js 16 and will show a warning.

---

## 1. Build, Lint & Test Commands

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `pnpm dev`           | Start development server (Turbopack) |
| `pnpm build`         | Production build                     |
| `pnpm start`         | Start production server              |
| `pnpm lint`          | Run ESLint on entire project         |
| `pnpm lint:fix`      | Auto-fix ESLint issues               |
| `pnpm typecheck`     | TypeScript type checking only        |
| `pnpm format`        | Format all files with Prettier       |
| `pnpm test`          | Run unit/integration tests           |
| `pnpm test:e2e`      | Run Playwright E2E tests             |
| `pnpm component:add` | Add Kibo UI components               |
| `pnpm db:reset`      | Reset database and apply migrations  |
| `pnpm db:seed`       | Run seed scripts                     |

> **Package Manager:** This project uses **pnpm**. Do NOT use npm or yarn.

---

## 2. Code Style Guidelines

_(... keep existing content ...)_

### Component Libraries

- **shadcn/ui** : used for all base UI primitives (buttons, dialogs, etc.)
- **Kibo UI** : used for **Gantt** and **Kanban** components only.
  - Install with `pnpm component:add gantt` or `pnpm component:add kanban`
  - Do not modify Kibo UI source files directly — customize via props and CSS overrides
  - For Gantt, use the `grouping` feature to display SubPhases under Phases
  - For Kanban, use the `draggable` columns and customize card content to match PMA’s task schema

---

## 3. Testing Strategy

### Unit / Integration Tests (Vitest)

- All Server Actions must have unit tests covering:
  - Business rules (BR-05, BR-10, etc.)
  - Permission checks (RBAC)
  - Plan limit enforcement
- Use `prisma` with a test database (`DATABASE_URL_TEST`)
- Tests must be placed in `__tests__` folders next to the code they test, or in `tests/`

### End-to-End Tests (Playwright)

- Critical user flows must have E2E tests:
  - Onboarding → Company creation → Unit creation → Project creation
  - Task assignment and Kanban drag & drop
  - Production recording and variance alerts
- Use `playwright.config.ts` and store fixtures in `tests/e2e/`

### Visual Regression

- Use Playwright’s `toHaveScreenshot()` for Gantt and Kanban components after key changes.

---

## 4. Review & Quality Gates

### Before marking a task as ✅

1. **All tests must pass** (unit, integration, E2E)
2. **Linting and typecheck must pass** (`pnpm lint`, `pnpm typecheck`)
3. **A reviewer agent** (see `.opencode/agents/reviewer.md`) must have validated the changes and produced a report.
4. **If the task touches UI**, visual confirmation via Devtools MCP or Playwright screenshot must be attached.

### Reviewer Agent Responsibilities

- Verify that modifications are limited to files listed in the task’s “Touches” field
- Check that `AGENTS.md` was updated if new patterns/routes/models were introduced
- Ensure that all new code follows the style guide
- Validate that no `any` type is used
- Confirm that tenant isolation (`companyId` filtering) is present in every query

---

## 5. Dependency Management & Caching

_(... keep existing content ...)_

- **Cache tags** are defined in `lib/cache.ts`. All mutations must call `revalidateTag()` with the appropriate tags.
- **`unstable_noStore()`** must be used for: notifications, comments, activity logs, and any data that must be fresh.
- **Static data** (plans, wilayas, etc.) uses `cacheLife("static")`.

---

## 6. Git Hooks (Husky + lint-staged)

- Pre-commit: run `lint-staged` (eslint + prettier on staged files)
- Pre-push: run `typecheck` and `test`

---

## 7. Open Issues & Milestone Tracking

| Milestone | Status   | Notes                           |
| --------- | -------- | ------------------------------- |
| M00       | ✅ Done  | Foundation & Dependencies       |
| M01       | ✅ Done  | Prisma Schema & Database        |
| M02       | ✅ Done  | Clerk Authentication            |
| M03       | ✅ Done  | Root Layout & Global Components |
| M04       | 🚧 To Do | Onboarding Wizard               |
| M05       | 🚧 To Do | Company Management              |
| M06       | 🚧 To Do | Subscription & Billing          |
| M07       | 🚧 To Do | Team & Invitations              |
| M08       | 🚧 To Do | Client CRM                      |
| M09       | 🚧 To Do | Project Management              |
| M10       | 🚧 To Do | **Gantt (Kibo UI)**             |
| M11       | 🚧 To Do | Production Monitoring           |
| M12       | 🚧 To Do | **Kanban (Kibo UI)**            |
| M13       | 🚧 To Do | Task Comments & @Mentions       |
| M14       | 🚧 To Do | Time Tracking                   |
| M15       | 🚧 To Do | Notifications System            |
| M16       | 🚧 To Do | Document Management             |
| M17       | 🚧 To Do | Activity Logs                   |
| M18       | 🚧 To Do | User Workspace (USER)           |
| M19       | 🚧 To Do | Unit Dashboard (ADMIN)          |
| M20       | 🚧 To Do | Public Landing Page             |
| M21       | 🚧 To Do | Polish & Quality                |
| M22       | 🚧 To Do | Caching & Performance           |

---

_End of AGENTS.md v5.0.0_

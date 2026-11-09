# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — dev server at http://localhost:4000 (Turbopack; port is set in the script). Note: `next dev` rewrites the agent-rules block in `AGENTS.md`.
- `npm run build` — production build; also the main type-check gate (there is no separate `tsc` script).
- `npm run lint` — ESLint 9 flat config (`eslint.config.mjs`, `next/core-web-vitals` + `next/typescript`). Lint one file: `npx eslint app/page.tsx`.
- No test framework is set up yet.
- Prisma: the config file is named `prisma7.config.ts` (not the default `prisma.config.ts`), so the CLI won't pick it up automatically — pass `--config prisma7.config.ts` (e.g. `npx prisma migrate dev --config prisma7.config.ts`). It reads `DATABASE_URL` from `.env` (gitignored). After schema changes run `prisma generate` — the client is output to `app/generated/prisma` (gitignored), so a fresh checkout must generate it before anything compiles.

## Stack and project state

Next.js 16.4, React 19.3, TypeScript strict, Tailwind CSS v4, Prisma 7 on Postgres via the Neon driver adapter, shadcn/ui (`base-nova` style, built on `@base-ui/react`, lucide icons), LINE LIFF SDK (`@line/liff`, not wired up yet), npm.

Early-stage app ("phon-dee", a loan-management app with USER and ADMIN roles). Code is still being scaffolded, and some files reference modules that don't exist yet: `@/app/actions/auth` (`SessionUser`), `@/lib/session` (`getSessionUser`), and `@/components/site-header/site-header`. Expect build errors until those land. `app/page.tsx` is still the create-next-app placeholder.

## Architecture

- **Route groups:** `app/(main)/(user)/` (user-facing, `/home`) and `app/(main)/manage/` (admin, `/manage`). Each has its own layout wrapping `SidebarProvider` + a role-specific sidebar (`components/sidebar/user-sidebar.tsx` / `manage-sidebar.tsx`) + `SiteHeader`. Shared sidebar pieces are `nav-group`, `nav-menu`, `nav-user`.
- **Auth/role gating:** `proxy.ts` (Next 16's replacement for `middleware.ts`) matches `/home/*` and `/manage/*`. It reads a JSON `phondee_user` cookie (`{ role }`): no cookie → redirect to `/`; non-`ADMIN` on `/manage` → redirect to `/home`. The comment in that file notes this is an optimistic check only — server actions/data access must re-verify the session.
- **Data layer:** `prisma/schema.prisma` models `User` (role is a plain string, `"USER"` default), `Loan` (products with allowed `installments`), `LoanApplication` (status string, `"PENDING"` default), `Debt`, `Installment`, `Setting` (key/value). There are no Prisma relations — `userId`/`loanId`/`debtId` are bare string columns, so integrity is not enforced by the DB. Use the singleton client from `lib/prisma.ts` (`import prisma from "@/lib/prisma"`), which builds `PrismaClient` with the `PrismaNeon` adapter and caches on `globalThis` in dev.
- **UI:** shadcn components live in `components/ui` (config in `components.json`; aliases `@/components`, `@/lib/utils`, `@/hooks`). Add new ones with `npx shadcn add <name>`. Code style in app code is 4-space indent with double quotes (the scaffolded `layout.tsx`/`page.tsx` use 2 spaces).

Things that differ from older Next.js conventions — check `node_modules/next/dist/docs/` before relying on memory:

- **App Router only**, no `src/` directory. Path alias `@/*` maps to the repo root.
- **`cacheComponents: true`** and **`partialPrefetching: true`** are enabled in `next.config.ts`, which changes caching/rendering semantics (data fetching is dynamic by default; caching is opt-in via `"use cache"`, and uncached dynamic data must sit under `<Suspense>`). Read the caching docs before adding data fetching.
- `experimental.agentFeedback` is enabled.
- Route props use the globally generated helper types (e.g. `LayoutProps<"/">`, `PageProps<"/...">`) rather than hand-written prop interfaces.
- **Tailwind is wired through a Turbopack loader rule** (`@tailwindcss/turbopack` on `*.css` in `next.config.ts`), not PostCSS — there is no `postcss.config`. Theme tokens are defined with `@theme inline` in `app/globals.css` (CSS variables for background/foreground and the Geist fonts loaded via `next/font/google` in the root layout); there is no `tailwind.config` file.

## Agent skills

`.agents/skills/`, `.claude/skills/` and `.windsurf/skills/` contain vendored Prisma skills (tracked by `skills-lock.json`); they are tooling, not app code.

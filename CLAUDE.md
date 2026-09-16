# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `bun dev` — start the dev server on **port 5173** (not 3000/3001 — the backend's CORS is hardcoded to `http://localhost:5173`; see below). Uses Turbopack.
- `bun run build` — production build (also runs the TypeScript check).
- `bun start` — serve the production build, also pinned to port 5173.
- `bun run lint` / `bunx biome check --write .` — lint + format via Biome (not ESLint/Prettier). Always run this after editing before considering a change done.
- `bunx tsc --noEmit` — typecheck only. Note: after deleting `.next/`, a fresh `tsc --noEmit` will falsely error on `LayoutProps`/`PageProps` (the generic comes from generated `.next/types`) until you run `bun run build` or `bun dev` once to regenerate them.
- No test runner is configured in this repo.

## Architecture

This is the frontend only for **ReCvify**, an AI CV builder. The backend is a separate NestJS + PostgreSQL + Redis API (not in this repo) running at `http://localhost:3000` in dev, with Swagger docs at `/api/docs`. Do not modify backend code from here.

### Why port 5173

The backend's CORS allow-list is fixed to `http://localhost:5173` (Vite's historical default), not whatever port Next picks. The `dev`/`start` scripts are pinned there so browser requests aren't silently blocked — don't "fix" this back to the Next.js default.

### Auth model

- Access token (JWT, short-lived) lives **only in memory**, in the Zustand store at `lib/store/auth-store.ts` — never localStorage, per the backend's own security requirement.
- Refresh token is an httpOnly cookie the backend sets/reads itself; the frontend never touches it directly and always sends `credentials: "include"`.
- On every page load, `lib/hooks/use-auth-bootstrap.ts` (wired in `app/providers.tsx`) silently calls `POST /auth/refresh` to re-derive an access token from the cookie, then fetches `/users/me`. Until that resolves, `useAuthStore.isInitialized` is false.
- `components/app/auth-guard.tsx` is the actual route guard: it blocks render (showing a spinner) until `isInitialized`, then redirects to `/login` if there's no token. Both the `(app)` and `(focus)` layouts wrap their children in it — don't duplicate this logic in individual pages.

### API client layer (`lib/api/`)

- `http.ts` is the only place that talks to `fetch` directly. `publicFetch` (no auth header) and `authedFetch` (attaches the bearer token) both unwrap the backend's `{success, data}` / `{success: false, error: {code, message}}` envelope and throw `ApiError` on failure. `ApiError.fieldMessages` splits the backend's `"; "`-joined validation messages.
- `authedFetch` handles a 401 by calling `POST /auth/refresh` once (deduped across concurrent callers via a shared in-flight promise) and retrying the original request a single time before giving up.
- Request bodies are JSON by default; passing a `FormData` instance (used by `lib/api/uploads.ts`) skips JSON-encoding and lets the browser set the multipart `Content-Type` with boundary — don't manually set `Content-Type` on those calls.
- Everything else is one file per backend resource (`cvs.ts`, `templates.ts`, `ai-suggestions.ts`, `job-descriptions.ts`, `exports.ts`, `uploads.ts`, `public-cvs.ts`, `users.ts`, `auth.ts`) exporting plain async functions, not classes. `lib/api/types.ts` holds every shared DTO shape.

### Route groups under `app/`

- `(auth)` — centered-card layout for sign-up/login/forgot/reset-password. No auth guard (these are the public entry points).
- `(app)` — the standard authenticated shell: `AuthGuard` + `AppShell` (persistent sidebar/mobile topbar from `components/app/`). Dashboard and the template gallery live here.
- `(focus)` — authenticated but **no sidebar**, full-screen: the CV editor (`cvs/[cvId]`), tailor-to-job (`cvs/[cvId]/tailor`), the onboarding path selector (`new`), and the upload-and-parse flow (`upload`). These mirror the mockups' "nav suppressed for focused task" screens. Add new full-canvas screens here, not to `(app)`.
- `app/share/[slug]/` — public, unauthenticated, outside every group. Server-rendered (not client-fetched) so link previews/crawlers see real content. Hits `GET /public/cvs/:shareSlug` via `publicFetch`.
- Dynamic route pages (`[cvId]`, `[slug]`) are plain async server components that `await params` and hand a string prop to a client component doing the real work — this project does **not** use the generated `PageProps<"...">` / `LayoutProps<"...">` generics for anything under route groups (parenthesized segments make that generic's key ambiguous); those generics are only used on the true root layout, which the scaffold already had.

### CV editor internals (`components/editor/`)

`CvEditor` composes `EditorTopBar` + `ContentPanel` (left, section/entry CRUD) + `PreviewPanel` (right, live rendering), plus two overlay panels toggled by top-bar buttons: `ImproveWithAiPanel` and `ExportModal`.

- **Resume rendering is shared, not duplicated**: `ResumeDocument` (the actual "paper" markup) is used by both `PreviewPanel` (editor) and `app/share/[slug]/page.tsx` (public page). If you change how a section type renders, edit `ResumeDocument`, not a copy.
- **AI suggestions are shared between two features**: `SuggestionCard` and `ApplySuggestionsFooter` back both `ImproveWithAiPanel` (source `IMPROVE`, suggestions fetched via `GET /cvs/:id/ai-suggestions`) and `TailorToJob`'s suggestion list (source `JD_TAILOR`, suggestions come embedded in the `JobDescriptionAnalysis` response, *not* the general ai-suggestions list endpoint — that endpoint is documented as IMPROVE-only). Accept/reject/edit/apply hit the same `PATCH .../ai-suggestions/:id` and `POST .../apply` endpoints regardless of source.
- Per-section-type entry field editing (`EntryFieldsForm`) and field defaults (`lib/utils/default-entry-fields.ts`) switch on `SectionType` (`SUMMARY | EXPERIENCE | EDUCATION | SKILLS | CERTIFICATIONS | CUSTOM`) — the `fieldsJson` shape is determined by the parent section's type, not tagged on the entry itself.
- Section/entry reordering uses up/down buttons calling the backend's `reorder` endpoints (full new `{id, sortOrder}[]` array each time), not a drag-and-drop library — none is installed.
- Debounced autosave (title, personal details, entry fields, style) goes through `lib/hooks/use-debounced-callback.ts`, ~600ms.

### Design system (`app/globals.css`)

Tailwind v4, config lives entirely in the `@theme` block (no `tailwind.config.js`). Tokens replicate the Stitch mockups' "Forge Professional" MD3-style palette (`primary`, `on-surface`, `surface-container-*`, etc.) and a custom typography scale (`text-headline-xl`, `text-body-md`, `text-label-md`, ...) — use these semantic tokens instead of raw Tailwind colors/sizes when matching a mockup. `components/ui/` (`Button`, `Input`, `Textarea`, `Icon`) are the shared primitives; `Icon` renders Material Symbols Outlined spans, loaded via a `<link>` in `app/layout.tsx` (not `next/font`, since it's a ligature icon font).

### Intentionally disabled, not broken

Several UI elements are visibly present but disabled with a `title="Coming soon"`-style tooltip because the backend has no endpoint/data model for them: Google OAuth sign-in, JD tailoring via URL/file upload (paste-only is backed), cover letters, per-field rich-text/inline "AI Rewrite", dark canvas rendering for the `theme` style override, and the sidebar's "AI Credits"/"Settings" nav items. Don't wire these up without a corresponding backend contract — check the brief/Swagger first.

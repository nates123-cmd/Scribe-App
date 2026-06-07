# Scribe — build state & autonomous-phase instructions

Scribe is a single-user, Claude-connected notes/reference app (desktop), sibling
to Course in the Personal OS suite. This file is the handoff between the **infra
pass** (done, human-in-the-loop) and the **autonomous pass** (port the screens).

## Stack
- Vite + React 19 + `@supabase/supabase-js`. Plain JS/JSX (no TS).
- Theming: CSS variables in `src/styles.css` (light/dark), toggled via the
  `[data-theme]` attribute on `<html>`. Components read `t.*` from
  `src/theme/tokens.js`, which resolves to `var(--*)`. Do NOT re-introduce a
  per-render token object — theme switching is attribute-only.
- Shared suite Supabase project `xsmnfcmtbpeaccnyinkr` (same as Cue/Course/etc).
  Auth = 8-digit email OTP (`src/auth/AuthGate.jsx`), per-user RLS.
- Claude = JWT-gated `claude` edge proxy (`src/lib/claude.js`, `claudeComplete`).

## DONE (infra pass)
- Project scaffold, `.env` (real suite creds), `.gitignore`, `index.html`
  (Hanken Grotesk + Tabler icons webfont CDNs).
- `src/lib/supabase.js`, `src/lib/claude.js`, `src/auth/AuthGate.jsx`.
- `src/styles.css` — full token system (both themes) + globals + auth styles.
- `src/theme/tokens.js`, `src/ScribeCtx.jsx` (context + useScribe + useIsMobile).
- `src/data.js` — ALL mock fixtures + helpers, ported verbatim (the data contract).
- `src/kit.jsx` — primitives: Icon, KIND, Label, Tag, Person, KindBadge, Btn,
  Stepper, StatusPill.
- `src/App.jsx` — shell: Sidebar, TopBar (global Ask), router, theme + route
  persistence (scribe-theme, scribe-route in localStorage).
- `src/screens/Library.jsx` — fully ported (reference for the pattern).
- Build is green; GitHub repo created; deployed via GitHub Pages.

## TODO (autonomous pass) — port the 6 stubbed screens
Each file in `src/screens/` is currently a stub. Replace with a faithful 1:1 port
of the matching prototype component in `design_ref/design_files/`. The prototype
uses `window.*` globals and a `t` from context — translate those to ES imports:
- `window.bind()` / `window.useScribe()` -> import { useScribe } from '../ScribeCtx'
  and const { route, go } = useScribe().
- `window.FONT`, token `t` -> import { t, FONT } from '../theme/tokens'.
- `window.Icon/Label/Tag/Person/Btn/Stepper/StatusPill/KIND` -> from '../kit'.
- `window.NOTES/AREAS/INBOX/...` and all helpers -> from '../data'.
- Keep every hex/size/spacing exactly as in the prototype (high-fidelity).

Mapping (stub -> source component):
| Stub file     | Source                                   |
|---------------|------------------------------------------|
| Inbox.jsx     | scribe-screens-1.jsx  -> InboxScreen     |
| Capture.jsx   | scribe-screens-1.jsx  -> CaptureScreen   |
| Note.jsx      | scribe-screens-2a.jsx -> NoteScreen      |
| Project.jsx   | scribe-screens-2b.jsx -> ProjectScreen   |
| Ask.jsx       | scribe-screens-3.jsx  -> AskScreen       |
| Compose.jsx   | scribe-screens-3.jsx  -> ComposeScreen   |

Use Library.jsx as the canonical example of the translation. After each screen,
run `npm run build` to keep it green. Verify both themes and click-through nav.

## TODO (later, separate pass — NOT part of the screen port)
- Data wiring: replace src/data.js fixtures with real Supabase queries. Tables
  don't exist yet — design them from the data shapes in design_ref/README.md
  ("Data shapes (the contract)"). Per-user RLS (auth.uid() = user_id). Related
  links resolve by id in production (not by title).
- Claude wiring: Synthesize / Generate briefing / Ask / Compose are faked with
  setTimeout in the prototype. Wire to claudeComplete, keep the same running->done
  state machine and the "briefings do NOT auto-run" rule.
- Mobile layout: desktop-only for now. useIsMobile() exists as a starting point.
- Out of scope (per brief): block editor, graph view, board/timeline/calendar
  tables, in-app docx/pptx export, sharing/collab/permissions. Do not build.

## Run
- `npm run dev` — local dev.
- `npm run build` — production build.
- `npm run build:gh-pages` — Pages build with /Scribe-App/ base.

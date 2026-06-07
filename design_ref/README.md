# Handoff: Scribe — Claude-connected notes & reference app (desktop)

## Overview
Scribe is a single-user, Claude-connected app for durable work and reference notes — notes, meetings, knowledge entries, brainstorms, and the deliverables composed from them. It is **not** a quick-capture app and **not** a database UI; structured project/task records live in a sibling app ("Course"). Scribe owns *documents*.

The product is **retrieval-first**: the primary way you navigate is by **asking** ("what did Jon say about SGS last week?"), not browsing. Three design principles drive everything:
- **Calm and low-chrome** — the default state is just text; no clutter competing with content.
- **Agency-first** — no streaks, nags, gamification, or engagement notifications.
- **Retrieval-first** — Ask is an always-present surface, not buried in search.

This bundle covers the **desktop** experience (sidebar + main pane). Mobile is **not** in this package — see *Responsive / Out of Scope* below.

## About the Design Files
The files in `design_files/` are **design references created in HTML/React-via-Babel** — runnable prototypes that show the intended look and behavior. They are **not** production code to copy directly. The Babel-in-browser setup, the `window.*` globals used to share components across `<script type="text/babel">` blocks, and the inline-style approach are all prototype conveniences, **not** patterns to carry into production.

Your task is to **recreate these designs in the target codebase's existing environment** (React, Vue, Svelte, SwiftUI, etc.) using its established component library, styling system, and conventions. If no environment exists yet, pick the most appropriate framework and implement there. Keep the **visual system, layout, copy, and interaction model**; discard the prototype's implementation mechanics.

To run the prototype locally: open `design_files/Scribe.html` in a browser (it loads React + Babel + the Tabler icon webfont + the Hanken Grotesk Google Font from CDNs). Theme and current screen persist in `localStorage` (`scribe-theme`, `scribe-route`).

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and interactions. Recreate the UI pixel-accurately using the codebase's libraries. All hex values, font sizes, and spacing below are exact and taken from the prototype.

---

## Design Tokens

One token set drives **both light and dark** themes. Source of truth: `tk(theme)` in `scribe-kit.jsx`. Implement as CSS variables / a theme object.

### Color — Light
| Token | Hex | Use |
|---|---|---|
| `bg` | `#f4f5f6` | App background |
| `panel` | `#fbfbfc` | Sidebar, rails, section headers |
| `card` | `#ffffff` | Cards, inputs, raised surfaces |
| `line` | `#e7e9eb` | Hairline dividers, row borders |
| `line2` | `#d6dadd` | Stronger borders (inputs, outline buttons) |
| `t1` | `#1b2024` | Primary text |
| `t2` | `#5a626a` | Secondary text |
| `t3` | `#8b939b` | Tertiary text / metadata / placeholders |
| `accent` | `#2e3439` | **Signature accent (inky graphite)** — primary buttons, active nav, links |
| `onAccent` | `#ffffff` | Text/icons on accent fills |
| `accentBg` | `rgba(46,52,57,0.06)` | Tinted surfaces (summary card, briefing, suggestion strip) |
| `accentLine` | `rgba(46,52,57,0.16)` | Borders on tinted surfaces, focus ring |
| `sel` | `#e9ebed` | Hover/selected row background |
| `tagBg` | `#eceef0` | Tag chip background |
| `tagText` | `#4a525a` | Tag chip text |
| `shadow` | `0 1px 2px rgba(20,24,28,.05), 0 8px 30px rgba(20,24,28,.07)` | Elevation |

### Color — Dark
| Token | Hex | Use |
|---|---|---|
| `bg` | `#121517` | App background |
| `panel` | `#171b1e` | Sidebar, rails, section headers |
| `card` | `#1a1e22` | Cards, inputs |
| `raise` | `#1f242a` | Slightly raised |
| `line` | `#262b30` | Hairline dividers |
| `line2` | `#333a40` | Stronger borders |
| `t1` | `#e4e8eb` | Primary text |
| `t2` | `#8b949d` | Secondary text |
| `t3` | `#5c656d` | Tertiary text / metadata |
| `accent` | `#c7ced4` | **Signature accent** (light graphite in dark mode) |
| `onAccent` | `#121517` | Text/icons on accent fills |
| `accentBg` | `rgba(199,206,212,0.10)` | Tinted surfaces |
| `accentLine` | `rgba(199,206,212,0.22)` | Borders on tinted surfaces |
| `sel` | `#222a30` | Hover/selected row background |
| `tagBg` | `#232a2f` | Tag chip background |
| `tagText` | `#9fb0bd` | Tag chip text |
| `shadow` | `0 1px 2px rgba(0,0,0,.4), 0 8px 30px rgba(0,0,0,.35)` | Elevation |

> The accent is deliberately **monochrome graphite** (not a hue). It was chosen from a study of six options (pine, ink blue, slate, plum, terracotta, graphite) — see `Scribe — Visual Directions.html` for that exploration. The brief explicitly forbids the Apple-Notes yellow / soft-row look.

### Typography
- **Single family throughout: `Hanken Grotesk`** (Google Fonts), weights 400/500/600/700. This was "Direction B — single humanist sans" from the visual study. No serif, no monospace.
- Type scale (size / weight / notes), all in px:
  - Page H1: **28 / 700**, `letter-spacing: -0.02em` (note editor title: **30 / 700**, `-0.025em`, `line-height: 1.12`)
  - Section/card title: 15.5–18 / 600–700
  - Row title: 14–14.5 / 600
  - Body copy: **15 / 400**, `line-height: 1.75`
  - Summary/briefing body: 14.5 / 400, `line-height: 1.6–1.65`
  - Secondary/meta: 11–12.5 / 500
  - **Eyebrow label** ("LIBRARY", "SUMMARY", "RELATED · DERIVED"): **10 / 600**, `letter-spacing: 0.09em`, `text-transform: uppercase`, color `t3`
  - Tag chip: 11.5 / 500
- `::selection` background: `rgba(46,52,57,0.14)`.

### Spacing, radius, motion
- Screen content max-width: **1000px** (Library), **760px** (Project dashboard), **720px** (Ask), **740px** (Compose/Capture), **640px** (Note editor reading column). Centered with `margin: 0 auto`.
- Screen padding: ~`28px 40px 60px` top/sides/bottom.
- Radius: inputs/buttons **8–9px**; cards **11–12px**; chips **6px**; pills/person-chips **20px**.
- Sidebar width **232px**; Related panel **252px**; Claude rail **232px** (all `flex: none`, `1px solid line` divider).
- Borders are **1px solid `line`** hairlines everywhere.
- Transitions: background/border/color **0.12–0.14s**. Spinner: `@keyframes spin` 0.9s linear infinite on loading icons.

### Icons
[Tabler Icons](https://tabler.io/icons) (webfont in the prototype). Names used: `stack-2, inbox, sparkles, folder, chevron-down/right/left, cloud-check, search, tag, plus, x, sun, moon, file-text, users, bulb, bolt, file-export, user, list, checkbox, pencil, circle-check, refresh, loader-2, arrow-up, arrow-up-right, arrow-right, link, git-fork, folder-off, clipboard, brand-apple, mail, clipboard-text, layout-board, layout-grid`. Use the codebase's icon set; map by meaning.

---

## Information Architecture

- **Persistent surfaces:** Ask (retrieval), Library, Inbox.
- **Structural nav:** an **Areas › Projects** tree. A note's home is a **Project**, or an **Area** when there's no project, or **neither** (lives loose in Library). Filter by **kind**: note / meeting / knowledge / brainstorm (and `artifact` for composed deliverables).
- **Cross-cutting:** free-text **tags** plus a fixed **Topic** set.
- **Deliberately absent:** folder hierarchies; Notion-style board/timeline/calendar view tables; block-based editor; graph view; in-app Office export; any sharing/collab/permissions.

### Two IA decisions worth preserving exactly
1. **Multi-project meetings.** A meeting that spans projects is **homed at the Area** (`project: null`, `area: 'arrow'`) and carries a `projects: ['csp','sgs']` array. Each **action item** is routed to a specific project via `action.project`. The meeting then appears as a **"linked"** meeting on each project's dashboard, and its action items roll up to the correct project. See `arrow-sync` in `scribe-kit.jsx` and the helpers `linkedMeetings(id)` / `actionsForProject(id)`.
2. **Action-item roll-up is by assignment, not by meeting ownership.** `actionsForProject(pid)` includes an action if `action.project === pid`, else falls back to the meeting's home project.

---

## Screens / Views

> Layout shell (all screens): **fixed left Sidebar (232px)** + **main column**. The main column has a **persistent top Ask bar** (the global retrieval surface) and a scrollable content region below it. Note editor is the exception — its main column scrolls internally and it adds right-hand panels.

### Shell — Sidebar (`Scribe.html` → `Sidebar`)
- 232px, `panel` bg, `1px solid line` right border, `18px 12px` padding, flex column.
- Wordmark "**scribe**" — 21px / 700, `letter-spacing: -0.02em`, color `t1`.
- Primary nav rows: **Library**, **Inbox** (right-aligned count badge), **Ask**. Each: 13px, icon + label, `8px 10px` padding, radius 8. **Active** = `sel` bg, `t1` text, **2px left border in `accent`**. Hover = `sel` bg.
- **Areas** eyebrow label, then the tree: each Area is a collapsible 12.5/600 row with a chevron; expanded Areas list their Projects (indented 30px, folder icon, active state same as nav). Empty area shows muted "empty".
- **Topics** eyebrow label, then wrap of tag chips (the fixed topic set). Clicking a topic → Library filtered by that tag (active chip = `accent` fill / `onAccent` text).
- Footer pinned at bottom: `cloud-check` icon + "Mirrored 14m ago" (11px, `t3`), separated by a top hairline. (This is a calm sync-status line, not interactive.)

### Shell — Top Ask bar (`Scribe.html` → `TopBar`)
- `12px 24px` padding, bottom hairline, `bg`.
- The Ask field: max-width 560, height 38, `card` bg, `1px solid line2`, radius 9, `sparkles` icon + input (placeholder "Ask your notes…") + a `↵` key hint. **On focus the border becomes `accent`.** Submitting routes to the **Ask** screen with the typed query.
- Right side: **theme toggle** (outline button, sun/moon + "Light"/"Dark") and **New** (primary `accent` button, `plus` icon) → Capture screen.

### 1. Library (`scribe-screens-1.jsx` → `LibraryScreen`)
- **Purpose:** the list of all notes with filters + keyword + Ask. Replacement for browsing.
- **Layout:** max-width 1000, centered. Header row: "**Library**" H1 + count ("13 notes" or "N of 13" when filtered) on the left; **New** primary button on the right.
- **Filters row:** a full-width keyword **search** input (`search` icon, placeholder "Search notes by title") + a row of **kind chips**: `all / note / meeting / knowledge / brainstorm`. Active chip = `accent` fill; inactive = transparent with `line2` border, `t2` text, capitalized.
- **Topics row:** a `tag`-icon "Topics" eyebrow + the fixed topic chips; clicking toggles a tag filter. When a non-topic tag is active it appears here too, with an "✕ clear".
- **Column header** (grid `1fr 150px 64px`): eyebrow labels "Title", "Tags · People", "Upd" — bottom hairline.
- **Rows** (grid `1fr 150px 64px`, `13px 6px` padding, bottom hairline, hover = `sel`):
  - Col 1: kind icon (`t3`) + title (14.5/600, ellipsis) + a meta sub-line (11.5, `t3`): home (folder+project, or layout-grid+area, or stack-2+"Library") and a "· not indexed" dot if `indexed:false`.
  - Col 2: up to 1 **person chip** (accent-tinted pill) + up to 2 **tag chips** (muted). Clicking a tag chip filters (stops row navigation).
  - Col 3: relative updated time ("2h", "1d", "1w"), right-aligned, `t3`.
  - Clicking a row → Note editor for that note.
- Empty state: centered "No notes match."

### 2. Inbox / triage (`scribe-screens-1.jsx` → `InboxScreen`)
- **Purpose:** triage untriaged captures with an AI-suggested project + tags.
- **Layout:** max-width 820. Header: "**Inbox**" + "N to triage"; **Triage all** outline button (sparkles) on the right.
- **Capture card** (`card` bg, `1px solid line`, radius 12, `16px 18px`): title (15.5/600) + source chip (icon + "apple shortcut" / "captured" / "manual"); a 13px snippet; then an **AI suggestion strip** (`accentBg` / `accentLine`, radius 9) with a sparkles eyebrow. Three suggestion states:
  1. **Confident single project:** shows folder + project name + "92% confident" + tag chips. Actions: **Accept → {project}** (primary), **Leave in inbox** (outline).
  2. **No confident project:** muted "no confident project — stays in inbox". Actions: **Pick project** (outline), **Keep tags only** (ghost).
  3. **Spans projects (multi):** "Triage suggestion · spans projects"; "File at **{Area}** · area home" + confidence; then "route action items →" with one chip per project (`folder` + name + count). Actions: **Accept split** (primary, `git-fork` icon), **Adjust routing** (outline), **Leave in inbox** (ghost).
- Accepting/leaving removes the card. Empty state: `inbox` icon + "Inbox zero".

### 3. Capture / new note (`scribe-screens-1.jsx` → `CaptureScreen`)
- **Purpose:** create a blank markdown note, or paste a meeting transcript and **Synthesize**.
- **Layout:** max-width 740. Two tabs: **New note** (pencil) / **Meeting transcript** (users).
- **Suggested home** strip: sparkles + "Suggested home" + a project pill ("Citrix CSP") + a "change" link.
- **New note tab:** a borderless **title input** (30/700, placeholder "Untitled") + a borderless **body textarea** (15/1.75, placeholder explains markdown: "# headings, **bold**, - lists, [[links]]").
- **Meeting tab:** title input + "Paste transcript" label + a bordered transcript textarea + **Synthesize** primary button (shows spinner → done) with helper text "Extracts summary, action items, people & terms · auto-tags to its project". On done, a result panel appears with a **Raw › Ready › Indexed** stepper, an extracted **Summary**, an **Action items · N extracted** checklist, and **Save to {project}** / **Discard** buttons.

### 4. Note editor (`scribe-screens-2a.jsx` → `NoteScreen`)
- **Purpose:** a single markdown document — title + body, **not** block-based. Default view is just text; Claude tools slide in on demand.
- **Layout:** three columns — **reading column** (scrolls; inner max-width 640, `30px 40px 70px` padding) + **Related panel** (252px, right, always present) + **Claude rail** (232px, slides in only when toggled).
- **Reading column:**
  - Top row: a **breadcrumb back button** ("‹ Work · Arrow · Citrix CSP") on the left + a **Claude** toggle button on the right (sparkles; toggles the rail).
  - **Title** (30/700, `-0.025em`).
  - **Meta row:** kind (icon + label) + date + **person chips** (accent-tinted pills with a user icon).
  - **"Spans" row** (only multi-project meetings): "SPANS" eyebrow + "homed in {Area}" + a chip per project (clickable → that project dashboard).
  - **Status + tags row:** for meetings, a **Raw › Ready › Indexed** stepper (filled dots up to current step in `accent`), a vertical divider, then tag chips.
  - **Summary card** (`accentBg`/`accentLine`, radius 12): sparkles + "SUMMARY" eyebrow + 14.5/1.6 text.
  - **Open action items · rolled up** (meetings): each row = a square checkbox + text (13.5) + a meta line (source · owner) + an optional routed-project chip ("→ {project}") + a right-aligned **"+ Course"** affordance (adds to the sibling Course app).
  - **Notes** eyebrow + **body** (15/1.75). Body renders paragraphs, bulleted lists, and a "See also [[link]] and [[link]]." line where `[[links]]` are underlined in `accent` and navigate to the matching note by title.
  - **Raw transcript** (meetings): a collapsible card ("Raw transcript · 4,210 words · source material"); expands to show a monospace-ish faux transcript. This is **source material**, not the main body.
- **Related panel** (`panel` bg): "RELATED · DERIVED" eyebrow + rows. Each related row = kind icon + title (13/600) + a **reason label** explaining *why* it's related ("shared term: novation", "also with: Jon", "linked [[ ]]", "routed action: SGS"). For meetings, a **People & terms** section below (person chips + term tags). Clicking a related row navigates to that note.
- **Claude rail** (slides in on Claude toggle; `card` bg): "CLAUDE" eyebrow + close ✕ + actions: **Summarize, Extract action items, Suggest tags, Rewrite, Compose deliverable**. "Compose deliverable" → Compose screen scoped to this note.

### 5. Project / Area dashboard (`scribe-screens-2b.jsx` → `ProjectScreen`)
- **Purpose:** an auto-composed view of a project. Header, on-demand briefing, rolled-up action items, meetings, notes/knowledge, deliverables, scoped Ask.
- **Layout:** max-width 760, centered.
- **Scoped Ask bar** at the very top: `card` bg, `accentLine` border, sparkles + placeholder "Ask within {Project}…" + a muted "scoped" tag. Submitting → Ask screen **scoped** to this project.
- **Header:** breadcrumb ("Work · {Area}") + project name H1 + a **status pill** (accent-tinted: "Active" / "Sent" / "On hold") + a **briefing control** on the right. Sub-line: "Due {date} · auto-composed from N notes · M linked".
- **AI Briefing:** **does not auto-run.** Default shows a dashed-border empty state ("No briefing yet — it doesn't auto-run. Generate one when you need the current picture.") with a **Generate briefing** button. Clicking → spinner ("Composing…") → a filled `accentBg` card with a sparkles "BRIEFING" eyebrow and the briefing text; button becomes **Refresh briefing**. (Briefing text per project lives in `BRIEFINGS` in the kit.)
- **Open action items · rolled up by project:** same action-item row pattern as the note editor; includes items **routed in** from area-homed cross-project meetings (shown with a `link` icon). Clicking the meta line opens the source meeting.
- **Meetings:** chronological list; each row = users icon (or `link` icon + "linked" badge for cross-project meetings homed in the area) + title + meta ("date · people" or "date · homed in {Area} · mentions {Project}") + an `arrow-up-right`. Clicking opens the meeting.
- **Notes & knowledge:** a **2-column card grid**; each card = kind label + title; hover lifts the border to `accent`. Clicking opens the note.
- **Deliverables:** if the project has `artifact`-kind notes, list them as rows (`file-export` icon + title + "Artifact · {date}") plus a **Compose another** button; otherwise a dashed empty state with **Compose**.

### 6. Ask / retrieval (`scribe-screens-3.jsx` → `AskScreen`)
- **Purpose:** the retrieval surface — the replacement for browsing.
- **Layout:** max-width 720. A large query field (height 50, sparkles + 16/500 input + a circular `accent` submit button with `arrow-up`); if scoped, a folder scope chip sits in the field.
- **Resolution chips** (below the field, after answering): muted chips reflecting how the query resolved — e.g. "scope: {Project}", "person: Jon", "last 14 days", "+ semantic". The scope chip is prepended automatically when the Ask is scoped.
- **Answer block** (`accentBg`/`accentLine`, radius 12): "ANSWER" eyebrow + 15.5/1.65 prose.
- **Sources:** "SOURCES" eyebrow + cited source cards. Each card = kind icon + title (14/600) + meta ("Jun 4 · with Jon, Haritha") + `arrow-up-right`; hover lifts border to `accent`; clicking opens the source note.
- States: `empty` (prompt to ask), `running` (spinner "Retrieving across your notes…"), `answered`.
- Answers are **scope-aware**: global Ask vs. a project-scoped Ask return different answers + sources (`ASK_ANSWERS` keyed by scope in the kit).

### 7. Compose / deliverable (`scribe-screens-3.jsx` → `ComposeScreen`)
- **Purpose:** from a note or project, compose a clean deliverable to copy into Word/PowerPoint/Excel (the user formats there). Optionally saved as a linked **artifact** note.
- **Layout:** max-width 740. Back button; "**Compose**" H1; sub-line "from **{source}** · output is clean content to paste into Word / PowerPoint / Excel".
- **Deliverable type:** a 2-column card grid — **One-pager / Exec summary / Email draft / Deck outline** (icon + name + one-line description). Selected card = `accent` border + `accentBg`.
- **Instructions:** optional textarea (placeholder gives an example).
- **Compose** primary button → spinner → a **result panel**: header with the deliverable title + **Copy** (ghost, toggles to "Copied") and **Save as artifact** (outline) buttons; body renders the composed content (h2, bottom-line paragraph, "Open items" list, "Next checkpoint"). Re-running shows **Recompose**.

---

## Interactions & Behavior
- **Navigation:** central `route` object `{ screen, id?, query?, scope?, tag?, noteId?, projectId? }`; a `go(route)` setter persists to `localStorage` (`scribe-route`) and resets the content scroll to top. Sidebar, Ask submit, row clicks, related rows, `[[links]]`, and action-item sources all call `go(...)`.
- **Theme:** `theme` ('light'|'dark') persisted to `localStorage` (`scribe-theme`); toggled from the top bar; drives the single token set. Both themes are first-class.
- **Async simulations (prototype only — see Fidelity):** Synthesize, Generate/Refresh briefing, and Compose are faked with `setTimeout` (≈0.9–1.3s) to show running→done states. In production, wire these to the real Claude/back-end calls; keep the same state machine and the same "does-not-auto-run" rule for briefings.
- **Hover states:** rows and cards shift to `sel` bg or lift their border to `accent`; outline buttons shift border to `accent`; ghost buttons get a `sel` bg.
- **Focus:** the Ask field's border animates to `accent` on focus.
- **Loading:** `loader-2` icon with the `spin` keyframe.

## State Management
- **Global (App):** `theme`, `route`, derived `t` (token set via `tk(theme)`), `go()`. Provided through a `ScribeCtx` React context.
- **Per-screen local:** Library (`kind`, `q`, `tag`); Inbox (`items` list, removed on action); Capture (`mode`, `transcript`, `synth` state); Note (`railOpen`, `rawOpen`); Project (`briefing` state idle|running|ready, scoped-ask `askQ`); Ask (`q`, `state` empty|running|answered); Compose (`type`, `instr`, `state`, `copied`).
- **Data fetching (production):** the prototype's `NOTES`, `AREAS`, `INBOX`, `ASK_ANSWERS`, `BRIEFINGS`, `COMPOSE_TYPES`, `TOPICS` are **mock fixtures** in `scribe-kit.jsx`. Replace with real queries. The data **shapes** (see below) are the contract worth keeping.

## Data shapes (the contract)
From `scribe-kit.jsx`:
- **Note:** `{ id, kind: 'note'|'meeting'|'knowledge'|'brainstorm'|'artifact', title, project|null, area|null, projects?: string[], people: string[], tags: string[], date, updated, indexed: bool, status: 0|1|2 (Raw/Ready/Indexed), rawWords?, summary?, terms?: string[], actions?: [{ text, src, owner, project? }], body: [{p}|{ul:[]}|{links:[]}], related: [{ kind, title, reason }] }`
- **Area:** `{ id, name, open, projects: [{ id, name, status, due? }] }`
- **Inbox item:** `{ id, title, src, srcIcon, snippet, suggest: {project, confidence}|null, suggestMulti?: {home, homeLabel, confidence, routes:[{project,count}]}, tags }`
- **Helpers to mirror:** `ownedNotes(pid)`, `linkedMeetings(pid)`, `actionsForProject(pid)` (roll-up by assignment), `notesByTag`, `projectName`, `areaOfProject`, `areaName`.
- **Related links resolve by title** in the prototype (`NOTES.find(x => x.title === r.title)`); in production resolve by **id** instead.

## Responsive / Out of Scope
- This handoff is **desktop-only** (sidebar + main pane). The brief calls for a PWA with a mobile layout (nav collapses to a drawer + bottom tab bar with Ask one tap away; the Library table becomes a single-column list of title + one meta line; the note editor's side panels become a stacked Related section + a Claude bottom sheet; grids collapse to one column). A `useIsMobile()` hook exists in the kit as a starting point but **the mobile layout is not built** — treat it as a separate design/build pass.
- **Do not build** (explicitly out of scope per the brief): block-based editor; force-directed graph view; Notion-style board/timeline/calendar tables; in-app .docx/.pptx export; any sharing, collaboration, or permissions UI.

## Assets
- **Fonts:** Hanken Grotesk (Google Fonts), weights 400/500/600/700. Use the codebase's font-loading approach.
- **Icons:** Tabler Icons — use the codebase's existing icon library and map by meaning (names listed under Design Tokens → Icons).
- **No raster images or logos.** The "scribe" wordmark is plain text. No brand assets to license.

## Files
In `design_files/`:
- `Scribe.html` — entry point: app shell (Sidebar, TopBar, router, theme + route persistence).
- `scribe-kit.jsx` — **the system**: `tk()` token sets, `ScribeCtx`, primitives (Icon, Label, Tag, Person, KindBadge, Btn, Stepper, StatusPill), all mock data + helpers.
- `scribe-screens-1.jsx` — Library, Inbox/triage, Capture.
- `scribe-screens-2a.jsx` — Note editor (note + meeting variants, Claude rail, Related panel).
- `scribe-screens-2b.jsx` — Project/Area dashboard.
- `scribe-screens-3.jsx` — Ask/retrieval, Compose/deliverable.
- `Scribe — Visual Directions.html` — **reference only**: the six-accent type/color study that led to the graphite choice. Not part of the app.

// Scribe data access — load the structural tree + documents + inbox from
// Supabase (per-user RLS), and seed the demo fixtures once on first run.
//
// DB rows are snake_case; the app uses the prototype's camelCase shapes. These
// mappers are the single translation point. Related links still carry a `title`
// (resolved by title in the UI) — moving to id-resolution is a later refinement.
import { supabase } from './supabase'
import { SEED_AREAS, SEED_NOTES, SEED_INBOX } from '../data'

// ── row → app shape ────────────────────────────────────────────────
function mapNote(r) {
  return {
    id: r.id, kind: r.kind, title: r.title,
    project: r.project, area: r.area,
    projects: r.projects || [], people: r.people || [], tags: r.tags || [],
    date: r.date, updated: r.updated, indexed: r.indexed, status: r.status,
    rawWords: r.raw_words || undefined, summary: r.summary || undefined,
    terms: r.terms || [], actions: r.actions || [], body: r.body || [], related: r.related || [],
  }
}
function mapInbox(r) {
  return {
    id: r.id, title: r.title, src: r.src, srcIcon: r.src_icon, snippet: r.snippet,
    suggest: r.suggest || null, suggestMulti: r.suggest_multi || undefined, tags: r.tags || [],
  }
}
function assembleAreas(areaRows, projRows) {
  return [...areaRows].sort((a, b) => a.sort - b.sort).map((a) => ({
    id: a.id, name: a.name, open: a.open_default,
    projects: projRows.filter((p) => p.area_id === a.id).sort((x, y) => x.sort - y.sort)
      .map((p) => ({ id: p.id, name: p.name, status: p.status, due: p.due || undefined })),
  }))
}

// ── load everything ────────────────────────────────────────────────
export async function loadAll() {
  const [areas, projects, notes, inbox] = await Promise.all([
    supabase.from('scribe_areas').select('*'),
    supabase.from('scribe_projects').select('*'),
    supabase.from('scribe_notes').select('*'),
    supabase.from('scribe_inbox').select('*'),
  ])
  const err = areas.error || projects.error || notes.error || inbox.error
  if (err) throw err
  return {
    areas: assembleAreas(areas.data || [], projects.data || []),
    notes: (notes.data || []).map(mapNote),
    inbox: (inbox.data || []).map(mapInbox),
  }
}

// ── app shape → row (for seeding / writes) ─────────────────────────
function noteRow(n) {
  return {
    id: n.id, kind: n.kind, title: n.title, project: n.project ?? null, area: n.area ?? null,
    projects: n.projects || [], people: n.people || [], tags: n.tags || [],
    date: n.date, updated: n.updated, indexed: n.indexed ?? true, status: n.status ?? 2,
    raw_words: n.rawWords ?? null, summary: n.summary ?? null, terms: n.terms || [],
    actions: n.actions || [], body: n.body || [], related: n.related || [],
  }
}
function inboxRow(c) {
  return {
    id: c.id, title: c.title, src: c.src, src_icon: c.srcIcon, snippet: c.snippet,
    suggest: c.suggest ?? null, suggest_multi: c.suggestMulti ?? null, tags: c.tags || [],
  }
}

// Seed the demo fixtures once, under the logged-in user (RLS sets user_id via
// the column default = auth.uid()). No-op if any notes already exist.
let _seedPromise = null
export function seedIfEmpty() {
  if (!_seedPromise) _seedPromise = _seed()
  return _seedPromise
}
// Memoized so React StrictMode's double-effect (or a reload) can't race two
// concurrent seeds into a primary-key collision.
async function _seed() {
  const { count, error } = await supabase
    .from('scribe_notes').select('id', { count: 'exact', head: true })
  if (error) throw error
  if (count && count > 0) return false

  const areaRows = SEED_AREAS.map((a, i) => ({ id: a.id, name: a.name, open_default: a.open, sort: i }))
  const projRows = SEED_AREAS.flatMap((a) => a.projects.map((p, i) => ({
    id: p.id, area_id: a.id, name: p.name, status: p.status, due: p.due ?? null, sort: i,
  })))
  const noteRows = SEED_NOTES.map(noteRow)
  const inboxRows = SEED_INBOX.map(inboxRow)

  const r1 = await supabase.from('scribe_areas').insert(areaRows)
  const r2 = await supabase.from('scribe_projects').insert(projRows)
  const r3 = await supabase.from('scribe_notes').insert(noteRows)
  const r4 = await supabase.from('scribe_inbox').insert(inboxRows)
  const err = r1.error || r2.error || r3.error || r4.error
  if (err) throw err
  return true
}

// Insert a single note under the logged-in user (RLS sets user_id default).
export async function createNote(note) {
  const { error } = await supabase.from('scribe_notes').insert(noteRow(note))
  if (error) throw error
}

// Remove a triaged inbox capture.
export async function deleteInbox(id) {
  const { error } = await supabase.from('scribe_inbox').delete().eq('id', id)
  if (error) throw error
}

// Update fields on an existing note. patch keys are app-shape (camelCase).
export async function updateNote(id, patch) {
  const row = { updated: patch.updated ?? 'now', updated_at: new Date().toISOString() }
  if ('title' in patch) row.title = patch.title
  if ('body' in patch) row.body = patch.body
  if ('summary' in patch) row.summary = patch.summary
  if ('tags' in patch) row.tags = patch.tags
  const { error } = await supabase.from('scribe_notes').update(row).eq('id', id)
  if (error) throw error
}

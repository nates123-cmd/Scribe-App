// Scribe AI surfaces — real Claude calls (via the JWT-gated `claude` proxy)
// that replace the prototype's setTimeout fakes. Each builds a compact prompt
// from the user's actual notes and returns structured results.
import { claudeComplete, extractJSON } from './claude'

const noteLine = (n) =>
  `[${n.id}] ${n.kind}${n.project ? ' · ' + n.project : ''} — ${n.title}` +
  (n.summary ? ` :: ${n.summary}` : '')

// Ask / retrieval — answer ONLY from the provided notes, cite note ids.
export async function askNotes(query, notes) {
  const corpus = notes.map(noteLine).join('\n')
  const system =
    'You are the retrieval engine for a personal notes app called Scribe. ' +
    'Answer the question using ONLY the provided notes. Be concise and specific. ' +
    'Cite the ids of the notes you actually used.'
  const user =
    `Notes:\n${corpus}\n\nQuestion: ${query}\n\n` +
    'Return ONLY JSON: {"answer": string, "sources": string[] (note ids, most relevant first, max 4)}'
  const raw = await claudeComplete(user, { system, max_tokens: 800 })
  const j = extractJSON(raw)
  if (j && j.answer) return { answer: j.answer, sourceIds: (j.sources || []).slice(0, 4) }
  return { answer: raw, sourceIds: [] }
}

// Project briefing — calm current-picture prose. Does NOT auto-run (caller gates).
export async function briefingFor(projectName, notes) {
  const lines = notes.map((n) => {
    const acts = (n.actions || []).map((a) => `  - ${a.text}${a.owner ? ` (${a.owner})` : ''}`).join('\n')
    return `• ${n.title} [${n.kind}]${n.summary ? ': ' + n.summary : ''}${acts ? '\n' + acts : ''}`
  }).join('\n')
  const system =
    'You write calm, concise project briefings for a personal work app. ' +
    '3–5 sentences, plain prose, present tense, lead with the critical path. ' +
    'No headings, no preamble, no "here is".'
  const user = `Project: ${projectName}\n\nNotes & open actions:\n${lines}\n\nWrite the current-picture briefing.`
  return (await claudeComplete(user, { system, max_tokens: 500 })).trim()
}

const TYPE_BRIEF = {
  onepager: 'a tight one-page brief',
  exec: 'a decision-first executive summary of 3–5 bullets',
  email: 'a ready-to-send email draft',
  deck: 'a slide-by-slide deck outline',
}
// Compose a paste-ready deliverable from a note or a project's notes.
export async function composeDeliverable(typeId, instructions, sourceLabel, notes) {
  const corpus = notes.map((n) => `• ${n.title}${n.summary ? ': ' + n.summary : ''}`).join('\n')
  const system =
    'You compose clean, paste-ready business deliverables from notes. ' +
    'Output ONLY the deliverable content in plain markdown — no preamble, no "here is".'
  const user =
    `Source: ${sourceLabel}\nMaterial:\n${corpus}\n\n` +
    `Produce ${TYPE_BRIEF[typeId] || 'a brief'}.` +
    (instructions ? ` Instructions: ${instructions}` : '')
  return (await claudeComplete(user, { system, max_tokens: 1200 })).trim()
}

// Synthesize a raw meeting transcript into structured fields.
export async function synthesizeTranscript(transcript) {
  const system = 'You extract structure from a raw meeting transcript for a notes app. Return strict JSON only.'
  const user =
    `Transcript:\n${transcript}\n\n` +
    'Return ONLY JSON: {"summary": string (2-3 sentences), ' +
    '"actions": [{"text": string, "owner": string}], "people": string[], ' +
    '"terms": string[], "tags": string[]}'
  const raw = await claudeComplete(user, { system, max_tokens: 1000 })
  return extractJSON(raw) || { summary: raw, actions: [], people: [], terms: [], tags: [] }
}

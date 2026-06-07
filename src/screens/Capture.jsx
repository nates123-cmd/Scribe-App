// Capture — New note (saves to Supabase) or Meeting transcript (Synthesize via
// real Claude, then Save). Home project is a real picker.
import { useState } from 'react'
import { useScribe } from '../ScribeCtx'
import { useData } from '../DataContext'
import { t, FONT } from '../theme/tokens'
import { Icon, Label, Btn, Stepper } from '../kit'
import { synthesizeTranscript } from '../lib/ai'
import { createNote } from '../lib/db'

const today = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const newId = () => (crypto?.randomUUID?.() || 'note-' + Date.now())

export function CaptureScreen() {
  const { go } = useScribe()
  const { areas, areaOfProject, reload } = useData()
  const allProjects = areas.flatMap((a) => a.projects)
  const [mode, setMode] = useState('note') // note | meeting
  const [home, setHome] = useState(allProjects[0]?.id || '')
  const [title, setTitle] = useState('')
  const [noteBody, setNoteBody] = useState('')
  const [transcript, setTranscript] = useState('')
  const [synth, setSynth] = useState(null) // null | running | done | error
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  const homeArea = home ? (areaOfProject(home) || {}).id || null : null

  const runSynth = async () => {
    if (!transcript.trim()) return
    setSynth('running'); setErr(null)
    try { setResult(await synthesizeTranscript(transcript)); setSynth('done') }
    catch (e) { setErr(e); setSynth('error') }
  }

  const saveNote = async () => {
    if (!title.trim() && !noteBody.trim()) return
    setSaving(true); setErr(null)
    const id = newId()
    const body = noteBody.trim() ? noteBody.trim().split(/\n{2,}/).map((p) => ({ p: p.trim() })) : []
    const note = {
      id, kind: 'note', title: title.trim() || 'Untitled', project: home || null, area: homeArea,
      projects: [], people: [], tags: [], date: today(), updated: 'now', indexed: false, status: 2,
      summary: noteBody.trim().slice(0, 160), terms: [], actions: [], body, related: [],
    }
    try { await createNote(note); await reload(); go({ screen: 'note', id }) }
    catch (e) { setErr(e); setSaving(false) }
  }

  const saveMeeting = async () => {
    if (!result) return
    setSaving(true); setErr(null)
    const id = newId()
    const note = {
      id, kind: 'meeting', title: title.trim() || 'Untitled meeting', project: home || null, area: homeArea,
      projects: [], people: result.people || [], tags: result.tags || [], date: today(), updated: 'now',
      indexed: false, status: 1, summary: result.summary || '', terms: result.terms || [],
      actions: (result.actions || []).map((a) => ({ text: a.text, src: 'this meeting', owner: a.owner || 'open' })),
      body: [{ p: result.summary || '' }], related: [],
    }
    try { await createNote(note); await reload(); go({ screen: 'note', id }) }
    catch (e) { setErr(e); setSaving(false) }
  }

  const tab = (mTab, label, icon) => {
    const on = mode === mTab
    return <button onClick={() => { setMode(mTab); setSynth(null); setResult(null) }} style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
      fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '8px 14px', borderRadius: 9,
      border: '1px solid ' + (on ? 'transparent' : t.line2), background: on ? t.sel : 'transparent',
      color: on ? t.t1 : t.t2 }}><Icon n={icon} s={15} c={on ? t.t1 : t.t2} />{label}</button>
  }

  return <div style={{ padding: '28px 40px 60px', maxWidth: 740, margin: '0 auto' }}>
    <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>{tab('note', 'New note', 'pencil')}{tab('meeting', 'Meeting transcript', 'users')}</div>

    {/* home picker */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18, fontFamily: FONT, fontSize: 12.5, color: t.t2 }}>
      <Icon n="folder" s={14} c={t.t1} />Home
      <select value={home} onChange={(e) => setHome(e.target.value)}
        style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: t.t1, background: t.accentBg, border: '1px solid ' + t.accentLine, borderRadius: 20, padding: '4px 11px', cursor: 'pointer' }}>
        <option value="">Library (no project)</option>
        {allProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    </div>

    {err && <div style={{ fontFamily: FONT, fontSize: 13, color: t.t2, marginBottom: 14 }}>Couldn’t save — {String(err?.message || err)}.</div>}

    {mode === 'note' && <>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled" style={{ width: '100%', border: 0, outline: 0, background: 'transparent',
        fontFamily: FONT, fontSize: 30, fontWeight: 700, color: t.t1, letterSpacing: '-0.02em', marginBottom: 14 }} />
      <textarea value={noteBody} onChange={(e) => setNoteBody(e.target.value)} placeholder="Start writing — plain markdown. # headings, **bold**, - lists, [[links]]."
        style={{ width: '100%', minHeight: 300, border: 0, outline: 0, background: 'transparent', resize: 'none',
          fontFamily: FONT, fontSize: 15, lineHeight: 1.75, color: t.t1 }} />
      <div style={{ marginTop: 8 }}>
        <Btn kind="primary" icon={saving ? 'loader-2' : 'circle-check'} onClick={saveNote}>{saving ? 'Saving…' : 'Save note'}</Btn>
      </div>
    </>}

    {mode === 'meeting' && <>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meeting title" style={{ width: '100%', border: 0, outline: 0, background: 'transparent',
        fontFamily: FONT, fontSize: 26, fontWeight: 700, color: t.t1, letterSpacing: '-0.02em', marginBottom: 14 }} />
      <Label style={{ marginBottom: 8 }}>Paste transcript</Label>
      <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)}
        placeholder="Paste the raw meeting transcript here, then Synthesize…"
        style={{ width: '100%', minHeight: 180, border: '1px solid ' + t.line2, borderRadius: 10, padding: '13px 15px',
          outline: 0, background: t.card, resize: 'vertical', fontFamily: FONT, fontSize: 13.5, lineHeight: 1.65, color: t.t1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
        <Btn kind="primary" icon={synth === 'running' ? 'loader-2' : 'sparkles'} onClick={runSynth}>
          {synth === 'running' ? 'Synthesizing…' : 'Synthesize'}</Btn>
        <span style={{ fontFamily: FONT, fontSize: 12, color: t.t3 }}>Extracts summary, action items, people & terms</span>
      </div>

      {synth === 'done' && result && <div style={{ marginTop: 22, border: '1px solid ' + t.line, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: t.panel, borderBottom: '1px solid ' + t.line }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT, fontSize: 13, fontWeight: 600, color: t.t1 }}>
            <Icon n="circle-check" s={16} c={t.t1} />Synthesized</span>
          <Stepper steps={['Raw', 'Ready', 'Indexed']} current={1} />
        </div>
        <div style={{ padding: '16px 18px' }}>
          <Label style={{ marginBottom: 8 }}>Summary</Label>
          <div style={{ fontFamily: FONT, fontSize: 14, color: t.t1, lineHeight: 1.6, marginBottom: 16, whiteSpace: 'pre-wrap' }}>{result.summary}</div>
          <Label style={{ marginBottom: 8 }}>Action items · {(result.actions || []).length} extracted</Label>
          {(result.actions || []).map((a, i) =>
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', fontFamily: FONT, fontSize: 13.5, color: t.t1 }}>
              <span style={{ width: 14, height: 14, border: '1.5px solid ' + t.t3, borderRadius: 4, flex: 'none' }} />{a.text}{a.owner ? <span style={{ color: t.t3, fontSize: 11 }}> · {a.owner}</span> : null}</div>)}
          <div style={{ display: 'flex', gap: 9, marginTop: 16 }}>
            <Btn kind="primary" icon={saving ? 'loader-2' : 'folder'} onClick={saveMeeting}>{saving ? 'Saving…' : 'Save meeting'}</Btn>
            <Btn kind="ghost" onClick={() => { setSynth(null); setResult(null) }}>Discard</Btn>
          </div>
        </div>
      </div>}
    </>}
  </div>
}

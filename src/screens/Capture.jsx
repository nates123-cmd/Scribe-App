// Capture / new note — paste a transcript and Synthesize (real Claude), then
// Save persists a new meeting note to Supabase.
import { useState } from 'react'
import { useScribe } from '../ScribeCtx'
import { useData } from '../DataContext'
import { t, FONT } from '../theme/tokens'
import { Icon, Label, Btn, Stepper } from '../kit'
import { synthesizeTranscript } from '../lib/ai'
import { createNote } from '../lib/db'

export function CaptureScreen() {
  const { go } = useScribe()
  const { reload } = useData()
  const [mode, setMode] = useState('note') // note | meeting
  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [synth, setSynth] = useState(null) // null | 'running' | 'done' | 'error'
  const [result, setResult] = useState(null) // {summary, actions, people, terms, tags}
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  const runSynth = async () => {
    if (!transcript.trim()) return
    setSynth('running'); setErr(null)
    try { setResult(await synthesizeTranscript(transcript)); setSynth('done') }
    catch (e) { setErr(e); setSynth('error') }
  }

  const save = async () => {
    if (!result) return
    setSaving(true); setErr(null)
    const id = (crypto?.randomUUID?.() || 'note-' + Date.now())
    const note = {
      id, kind: 'meeting', title: title.trim() || 'Untitled meeting',
      project: 'csp', area: 'arrow', projects: [],
      people: result.people || [], tags: result.tags || [],
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      updated: 'now', indexed: false, status: 1,
      summary: result.summary || '', terms: result.terms || [],
      actions: (result.actions || []).map((a) => ({ text: a.text, src: 'this meeting', owner: a.owner || 'open' })),
      body: [{ p: result.summary || '' }], related: [],
    }
    try { await createNote(note); await reload(); go({ screen: 'note', id }) }
    catch (e) { setErr(e); setSaving(false) }
  }

  const tab = (m, label, icon) => {
    const on = mode === m
    return <button onClick={() => { setMode(m); setSynth(null); setResult(null) }} style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
      fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '8px 14px', borderRadius: 9,
      border: '1px solid ' + (on ? 'transparent' : t.line2), background: on ? t.sel : 'transparent',
      color: on ? t.t1 : t.t2 }}><Icon n={icon} s={15} c={on ? t.t1 : t.t2} />{label}</button>
  }

  return <div style={{ padding: '28px 40px 60px', maxWidth: 740, margin: '0 auto' }}>
    <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>{tab('note', 'New note', 'pencil')}{tab('meeting', 'Meeting transcript', 'users')}</div>

    {/* suggested home */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18, fontFamily: FONT, fontSize: 12.5, color: t.t2 }}>
      <Icon n="sparkles" s={14} c={t.t1} />Suggested home
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, color: t.t1, background: t.accentBg,
        border: '1px solid ' + t.accentLine, borderRadius: 20, padding: '3px 11px' }}><Icon n="folder" s={13} />Citrix CSP</span>
      <button style={{ fontFamily: FONT, fontSize: 12, color: t.t3, background: 'transparent', border: 0, cursor: 'pointer', textDecoration: 'underline' }}>change</button>
    </div>

    {mode === 'note' && <>
      <input placeholder="Untitled" style={{ width: '100%', border: 0, outline: 0, background: 'transparent',
        fontFamily: FONT, fontSize: 30, fontWeight: 700, color: t.t1, letterSpacing: '-0.02em', marginBottom: 14 }} />
      <textarea placeholder="Start writing — plain markdown. # headings, **bold**, - lists, [[links]]."
        style={{ width: '100%', minHeight: 320, border: 0, outline: 0, background: 'transparent', resize: 'none',
          fontFamily: FONT, fontSize: 15, lineHeight: 1.75, color: t.t1 }} />
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
        <span style={{ fontFamily: FONT, fontSize: 12, color: t.t3 }}>Extracts summary, action items, people & terms · auto-tags to its project</span>
      </div>

      {synth === 'error' && <div style={{ marginTop: 14, fontFamily: FONT, fontSize: 13, color: t.t2 }}>
        Couldn’t synthesize — {String(err?.message || err)}.</div>}

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
              <span style={{ width: 14, height: 14, border: '1.5px solid ' + t.t3, borderRadius: 4, flex: 'none' }} />{a.text}{a.owner ? <span style={{ color: t.t3, fontSize: 11 }}>· {a.owner}</span> : null}</div>)}
          <div style={{ display: 'flex', gap: 9, marginTop: 16 }}>
            <Btn kind="primary" icon={saving ? 'loader-2' : 'folder'} onClick={save}>{saving ? 'Saving…' : 'Save to Citrix CSP'}</Btn>
            <Btn kind="ghost" onClick={() => { setSynth(null); setResult(null) }}>Discard</Btn>
          </div>
        </div>
      </div>}
    </>}
  </div>
}

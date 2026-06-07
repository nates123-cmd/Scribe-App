// Compose / deliverable — real Claude composition; Save as artifact persists a
// linked artifact note (appears in the project's Deliverables).
import { useState } from 'react'
import { useScribe } from '../ScribeCtx'
import { useData } from '../DataContext'
import { t, FONT } from '../theme/tokens'
import { Icon, Label, Btn } from '../kit'
import { COMPOSE_TYPES } from '../data'
import { composeDeliverable } from '../lib/ai'
import { createNote } from '../lib/db'
import { textToBlocks } from '../lib/blocks'

const today = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const newId = () => (crypto?.randomUUID?.() || 'note-' + Date.now())

export function ComposeScreen() {
  const { route, go } = useScribe()
  const { noteById, projectName, ownedNotes, areaOfProject, reload } = useData()
  const srcNote = route.noteId && noteById(route.noteId)
  const srcProj = route.projectId && projectName(route.projectId)
  const srcLabel = srcNote ? srcNote.title : srcProj || 'this project'
  const [type, setType] = useState('onepager')
  const [instr, setInstr] = useState('')
  const [state, setState] = useState('idle') // idle | running | done | error
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [artState, setArtState] = useState('idle') // idle | saving | saved
  const [err, setErr] = useState(null)

  const typeName = (COMPOSE_TYPES.find((c) => c.id === type) || {}).name || 'Deliverable'

  const run = async () => {
    setState('running'); setErr(null); setArtState('idle')
    const contextNotes = srcNote ? [srcNote] : (route.projectId ? ownedNotes(route.projectId) : [])
    try {
      const text = await composeDeliverable(type, instr, srcLabel, contextNotes)
      setOutput(text); setState('done')
    } catch (e) { setErr(e); setState('error') }
  }

  const saveArtifact = async () => {
    setArtState('saving'); setErr(null)
    const pid = (srcNote && srcNote.project) || route.projectId || null
    const aid = pid ? ((areaOfProject(pid) || {}).id || null) : (srcNote && srcNote.area) || null
    const note = {
      id: newId(), kind: 'artifact', title: typeName + ' — ' + srcLabel, project: pid, area: aid,
      projects: [], people: [], tags: ['deliverable'], date: today(), updated: 'now', indexed: false, status: 2,
      summary: output.slice(0, 160), terms: [], actions: [], body: textToBlocks(output),
      related: srcNote ? [{ kind: srcNote.kind, title: srcNote.title, reason: 'composed from' }] : [],
    }
    try { await createNote(note); await reload(); setArtState('saved') }
    catch (e) { setErr(e); setArtState('idle') }
  }

  return <div>
    <div style={{ maxWidth: 740, margin: '0 auto', padding: '30px 40px 70px' }}>
      <button onClick={() => go(srcNote ? { screen: 'note', id: srcNote.id } : { screen: 'project', id: route.projectId || 'csp' })}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 11.5, color: t.t3, background: 'transparent', border: 0, cursor: 'pointer', marginBottom: 14 }}>
        <Icon n="chevron-left" s={13} />Back</button>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
        <h1 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: t.t1, letterSpacing: '-0.02em', margin: 0 }}>Compose</h1>
      </div>
      <div style={{ fontFamily: FONT, fontSize: 12.5, color: t.t3, marginBottom: 22 }}>
        from <span style={{ color: t.t1, fontWeight: 600 }}>{srcLabel}</span> · output is clean content to paste into Word / PowerPoint / Excel</div>

      <Label style={{ marginBottom: 9 }}>Deliverable type</Label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
        {COMPOSE_TYPES.map((c) => { const on = type === c.id
          return <div key={c.id} onClick={() => { setType(c.id); setState('idle'); setArtState('idle') }}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '13px 15px', borderRadius: 11, cursor: 'pointer',
              border: '1px solid ' + (on ? t.accent : t.line2), background: on ? t.accentBg : t.card }}>
            <Icon n={c.icon} s={18} c={t.t1} style={{ marginTop: 1 }} />
            <div><div style={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 600, color: t.t1 }}>{c.name}</div>
              <div style={{ fontFamily: FONT, fontSize: 11.5, color: t.t3, marginTop: 2 }}>{c.desc}</div></div>
          </div> })}
      </div>

      <Label style={{ marginBottom: 9 }}>Instructions <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, color: t.t3 }}>· optional</span></Label>
      <textarea value={instr} onChange={(e) => setInstr(e.target.value)} placeholder="e.g. for the exec team, lead with the novation blocker, keep it to half a page."
        style={{ width: '100%', minHeight: 80, border: '1px solid ' + t.line2, borderRadius: 10, padding: '12px 14px', outline: 0,
          background: t.card, resize: 'vertical', fontFamily: FONT, fontSize: 13.5, lineHeight: 1.6, color: t.t1, marginBottom: 16 }} />
      <Btn kind="primary" icon={state === 'running' ? 'loader-2' : 'sparkles'} onClick={run}>
        {state === 'running' ? 'Composing…' : state === 'done' ? 'Recompose' : 'Compose'}</Btn>

      {state === 'error' && <div style={{ marginTop: 16, fontFamily: FONT, fontSize: 13, color: t.t2 }}>
        Couldn’t compose — {String(err?.message || err)}.</div>}

      {state === 'done' && <div style={{ marginTop: 24, border: '1px solid ' + t.line, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', background: t.panel, borderBottom: '1px solid ' + t.line }}>
          <span style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: t.t1 }}>{typeName} · {srcLabel}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn kind="ghost" size="sm" icon={copied ? 'check' : 'copy'}
              onClick={() => { navigator.clipboard?.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>{copied ? 'Copied' : 'Copy'}</Btn>
            <Btn kind="outline" size="sm" icon={artState === 'saving' ? 'loader-2' : artState === 'saved' ? 'check' : 'link'}
              onClick={() => artState === 'idle' && saveArtifact()}>{artState === 'saved' ? 'Saved' : artState === 'saving' ? 'Saving…' : 'Save as artifact'}</Btn>
          </div>
        </div>
        <div style={{ padding: '20px 22px', fontFamily: FONT, fontSize: 14, lineHeight: 1.7, color: t.t1, whiteSpace: 'pre-wrap' }}>{output}</div>
        {err && <div style={{ padding: '0 22px 16px', fontFamily: FONT, fontSize: 12.5, color: t.t2 }}>Couldn’t save — {String(err?.message || err)}.</div>}
      </div>}
    </div>
  </div>
}

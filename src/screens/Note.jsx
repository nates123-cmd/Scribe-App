// Note editor — reading column + Related + Claude rail (live). Stacks to one
// column on mobile. Title/body/tags editable; rail actions write back.
import { Fragment, useState } from 'react'
import { useScribe } from '../ScribeCtx'
import { useData } from '../DataContext'
import { t, FONT } from '../theme/tokens'
import { Icon, Label, Tag, Person, KIND, Stepper, Btn } from '../kit'
import { updateNote, deleteNote } from '../lib/db'
import { blocksToText, textToBlocks } from '../lib/blocks'
import { summarizeNote, extractActions, suggestTags, rewriteNote } from '../lib/ai'

export function NoteScreen() {
  const { route, go, mobile } = useScribe()
  const { notes: NOTES, noteById, projectName, areaName, areas: AREAS, reload } = useData()
  const n = noteById(route.id) || NOTES[0]
  const [railOpen, setRailOpen] = useState(false)
  const [rawOpen, setRawOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [eTitle, setETitle] = useState('')
  const [eBody, setEBody] = useState('')
  const [eTags, setETags] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)
  const [railBusy, setRailBusy] = useState(null)
  const [railMsg, setRailMsg] = useState(null)
  const isMeeting = n.kind === 'meeting'
  const proj = projectName(n.project)
  const area = n.area && (AREAS.find((a) => a.id === n.area) || {}).name

  const startEdit = () => { setETitle(n.title); setEBody(blocksToText(n.body || [])); setETags((n.tags || []).join(', ')); setErr(null); setEditing(true) }
  const saveEdit = async () => {
    setSaving(true); setErr(null)
    const tags = eTags.split(',').map((s) => s.trim()).filter(Boolean)
    try { await updateNote(n.id, { title: eTitle.trim() || 'Untitled', body: textToBlocks(eBody), tags }); await reload(); setEditing(false) }
    catch (e) { setErr(e) } finally { setSaving(false) }
  }
  const remove = async () => {
    if (!window.confirm('Delete this note?')) return
    setSaving(true)
    try { await deleteNote(n.id); await reload(); go(proj ? { screen: 'project', id: n.project } : { screen: 'library' }) }
    catch (e) { setErr(e); setSaving(false) }
  }

  const runRail = async (label) => {
    if (label === 'Compose deliverable') return go({ screen: 'compose', noteId: n.id })
    setRailBusy(label); setRailMsg(null)
    try {
      if (label === 'Summarize') { await updateNote(n.id, { summary: await summarizeNote(n) }); setRailMsg('Summary updated') }
      else if (label === 'Extract action items') { const a = await extractActions(n); await updateNote(n.id, { actions: a }); setRailMsg(a.length + ' action items extracted') }
      else if (label === 'Suggest tags') { const tg = await suggestTags(n); const merged = [...new Set([...(n.tags || []), ...tg])]; await updateNote(n.id, { tags: merged }); setRailMsg('Tags suggested') }
      else if (label === 'Rewrite') { await updateNote(n.id, { body: textToBlocks(await rewriteNote(n)) }); setRailMsg('Body rewritten') }
      await reload()
    } catch (e) { setRailMsg('Failed — ' + String(e?.message || e)) }
    finally { setRailBusy(null) }
  }

  const claudeActions = [
    ['list', 'Summarize'], ['checkbox', 'Extract action items'], ['tag', 'Suggest tags'],
    ['pencil', 'Rewrite'], ['file-export', 'Compose deliverable'],
  ]

  const relatedRow = (r, i) => <div key={i} onClick={() => { const m = NOTES.find((x) => x.title === r.title); if (m) go({ screen: 'note', id: m.id }) }}
    style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 4px', borderBottom: '1px solid ' + t.line, cursor: 'pointer', borderRadius: 6 }}
    onMouseEnter={(e) => (e.currentTarget.style.background = t.sel)} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
    <Icon n={(KIND[r.kind] || KIND.note).icon} s={15} c={t.t3} style={{ marginTop: 2 }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: t.t1, lineHeight: 1.35 }}>{r.title}</div>
      <div style={{ fontFamily: FONT, fontSize: 10.5, color: t.t3, marginTop: 3 }}>{r.reason}</div>
    </div></div>

  const renderBody = (blocks) => blocks.map((b, i) => {
    if (b.p) return <p key={i} style={{ margin: '0 0 15px' }}>{b.p}</p>
    if (b.ul) return <ul key={i} style={{ margin: '0 0 15px', paddingLeft: 20 }}>{b.ul.map((li, j) => <li key={j} style={{ marginBottom: 6 }}>{li}</li>)}</ul>
    if (b.links) return <p key={i} style={{ margin: 0 }}>See also {b.links.map((l, j) => <Fragment key={j}>
      <span onClick={() => { const m = NOTES.find((x) => x.title === l); if (m) go({ screen: 'note', id: m.id }) }}
        style={{ color: t.t1, textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: t.accentLine, cursor: 'pointer' }}>[[{l}]]</span>
      {j < b.links.length - 1 ? ' and ' : '.'}</Fragment>)}</p>
    return null
  })

  const hasActions = (n.actions || []).length > 0
  const sideStyle = (bg) => ({
    width: mobile ? '100%' : (bg === t.card ? 232 : 252), flex: 'none',
    borderLeft: mobile ? 'none' : '1px solid ' + t.line, borderTop: mobile ? '1px solid ' + t.line : 'none',
    background: bg, padding: '24px 16px', overflowY: mobile ? 'visible' : 'auto',
  })

  return <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', height: mobile ? 'auto' : '100%', minHeight: 0 }}>
    <div style={{ flex: 1, minWidth: 0, overflowY: mobile ? 'visible' : 'auto' }}>
      <div className="selectable" style={{ maxWidth: 640, margin: '0 auto', padding: mobile ? '20px 16px 28px' : '30px 40px 70px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button onClick={() => go(proj ? { screen: 'project', id: n.project } : { screen: 'library' })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 11.5, color: t.t3, background: 'transparent', border: 0, cursor: 'pointer' }}>
            <Icon n="chevron-left" s={13} />{['Work', area, proj].filter(Boolean).join(' · ') || 'Library'}</button>
          {editing
            ? <span style={{ display: 'flex', gap: 8 }}>
                <Btn kind="ghost" size="sm" icon="trash" onClick={remove} style={{ color: t.t3 }}>Delete</Btn>
                <Btn kind="primary" size="sm" icon={saving ? 'loader-2' : 'circle-check'} onClick={saveEdit}>{saving ? 'Saving…' : 'Save'}</Btn>
                <Btn kind="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Btn>
              </span>
            : <span style={{ display: 'flex', gap: 8 }}>
                <Btn kind="outline" size="sm" icon="pencil" onClick={startEdit}>Edit</Btn>
                <button onClick={() => setRailOpen((o) => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
                  fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: railOpen ? t.t1 : t.t2, background: railOpen ? t.sel : 'transparent',
                  border: '1px solid ' + (railOpen ? 'transparent' : t.line2), borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
                  <Icon n="sparkles" s={14} />Claude</button>
              </span>}
        </div>

        {editing
          ? <input value={eTitle} onChange={(e) => setETitle(e.target.value)} placeholder="Untitled"
              style={{ width: '100%', border: 0, outline: 0, background: 'transparent', fontFamily: FONT, fontSize: mobile ? 26 : 30, fontWeight: 700, color: t.t1, letterSpacing: '-0.025em', lineHeight: 1.12 }} />
          : <h1 style={{ fontFamily: FONT, fontSize: mobile ? 26 : 30, fontWeight: 700, color: t.t1, letterSpacing: '-0.025em', lineHeight: 1.12, margin: 0 }}>{n.title}</h1>}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '14px 0 0' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FONT, fontSize: 11.5, color: t.t2 }}>
            <Icon n={KIND[n.kind].icon} s={14} c={t.t2} />{KIND[n.kind].label}</span>
          <span style={{ fontFamily: FONT, fontSize: 11.5, color: t.t3 }}>{n.date}</span>
          {n.people.length > 0 && <><span style={{ color: t.t3 }}>·</span>{n.people.map((p) => <Person key={p}>{p}</Person>)}</>}
        </div>

        {n.projects && n.projects.length > 1 && <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', margin: '11px 0 0' }}>
          <span style={{ fontFamily: FONT, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.t3 }}>Spans</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FONT, fontSize: 11, color: t.t2 }}><Icon n="stack-2" s={13} c={t.t3} />homed in {areaName(n.area)}</span>
          <span style={{ color: t.t3 }}>·</span>
          {n.projects.map((pj) => <span key={pj} onClick={() => go({ screen: 'project', id: pj })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT, fontSize: 11, fontWeight: 600, color: t.t1, background: t.tagBg, borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>
            <Icon n="folder" s={11} c={t.t2} />{projectName(pj)}</span>)}
        </div>}

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', margin: '11px 0 22px' }}>
          {isMeeting && <><Stepper steps={['Raw', 'Ready', 'Indexed']} current={n.status} />
            <span style={{ width: 1, height: 12, background: t.line2 }} /></>}
          {editing
            ? <input value={eTags} onChange={(e) => setETags(e.target.value)} placeholder="tags, comma, separated"
                style={{ flex: 1, minWidth: 200, border: '1px solid ' + t.line2, borderRadius: 7, padding: '4px 9px', outline: 0, background: t.card, fontFamily: FONT, fontSize: 12, color: t.t1 }} />
            : <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{n.tags.map((tg) => <Tag key={tg}>{tg}</Tag>)}</span>}
        </div>

        {!editing && n.summary && <div style={{ background: t.accentBg, border: '1px solid ' + t.accentLine, borderRadius: 12, padding: '14px 16px', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><Icon n="sparkles" s={12} c={t.t1} /><Label>Summary</Label></div>
          <div style={{ fontFamily: FONT, fontSize: 14.5, color: t.t1, lineHeight: 1.6 }}>{n.summary}</div>
        </div>}

        {!editing && hasActions && <>
          <Label style={{ marginBottom: 8 }}>Open action items{isMeeting ? ' · rolled up' : ''}</Label>
          <div style={{ marginBottom: 24 }}>{n.actions.map((a, i) =>
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '10px 6px', borderBottom: '1px solid ' + t.line }}>
              <span style={{ width: 15, height: 15, border: '1.5px solid ' + t.t3, borderRadius: 4, flex: 'none', marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FONT, fontSize: 13.5, color: t.t1, lineHeight: 1.4 }}>{a.text}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 10.5, color: t.t3, marginTop: 3 }}>
                  <span>{a.src}{a.owner ? ' · ' + a.owner : ''}</span>
                  {a.project && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 600, color: t.t1, background: t.tagBg, borderRadius: 5, padding: '1px 6px' }}>
                    <Icon n="arrow-right" s={10} c={t.t2} />{projectName(a.project)}</span>}
                </div>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT, fontSize: 10.5, fontWeight: 600, color: t.t1, whiteSpace: 'nowrap', marginTop: 2, cursor: 'pointer' }}>
                <Icon n="plus" s={12} />Course</span>
            </div>)}</div>
        </>}

        <Label style={{ marginBottom: 10 }}>Notes</Label>
        {editing
          ? <>
              <textarea value={eBody} onChange={(e) => setEBody(e.target.value)} placeholder="Write in markdown — paragraphs, - bullet lists, [[note links]]."
                style={{ width: '100%', minHeight: 320, border: '1px solid ' + t.line2, borderRadius: 10, padding: '14px 16px', outline: 0,
                  background: t.card, resize: 'vertical', fontFamily: FONT, fontSize: 15, lineHeight: 1.75, color: t.t1 }} />
              {err && <div style={{ fontFamily: FONT, fontSize: 13, color: t.t2, marginTop: 10 }}>Couldn’t save — {String(err?.message || err)}.</div>}
            </>
          : <div style={{ fontFamily: FONT, fontSize: 15, color: t.t1, lineHeight: 1.75 }}>{renderBody(n.body || [])}</div>}

        {!editing && isMeeting && (n.transcript || n.rawWords) && <div onClick={() => setRawOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 22,
          padding: '11px 13px', border: '1px solid ' + t.line, borderRadius: 10, background: t.card, cursor: 'pointer' }}>
          <Icon n={rawOpen ? 'chevron-down' : 'chevron-right'} s={14} c={t.t3} />
          <span style={{ fontFamily: FONT, fontSize: 11.5, fontWeight: 600, color: t.t2 }}>Raw transcript</span>
          <span style={{ fontFamily: FONT, fontSize: 10.5, color: t.t3 }}>{n.rawWords} words · source material</span>
        </div>}
        {!editing && isMeeting && rawOpen && (n.transcript || n.rawWords) && <div className="selectable" style={{ fontFamily: FONT, fontSize: 13, color: t.t2, lineHeight: 1.7, padding: '14px 13px 0', whiteSpace: 'pre-wrap' }}>
          {n.transcript || '[00:02] Jon: Let’s start with sequencing… we can’t land pricing tiers until legal closes novation.\n[00:14] You: Agreed — I’ll confirm telemetry scope with Arrowsphere by Thursday.\n[00:31] Haritha: EMEA segmentation is still open on my side…'}</div>}
      </div>
    </div>

    {/* Related panel */}
    <div style={sideStyle(t.panel)}>
      <Label style={{ marginBottom: 8 }}>Related · derived</Label>
      {(n.related || []).length === 0 && <div style={{ fontFamily: FONT, fontSize: 12, color: t.t3 }}>No neighbors yet.</div>}
      {(n.related || []).map(relatedRow)}
      {isMeeting && n.terms && <div style={{ marginTop: 22 }}>
        <Label style={{ marginBottom: 8 }}>People & terms</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {n.people.map((p) => <Person key={p}>{p}</Person>)}
          {n.terms.map((tm) => <Tag key={tm}>{tm}</Tag>)}
        </div>
      </div>}
    </div>
    {/* Claude rail — stacks below on mobile */}
    {railOpen && <div style={sideStyle(t.card)}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Icon n="sparkles" s={14} c={t.t1} /><Label>Claude</Label></span>
        <Icon n="x" s={15} c={t.t3} style={{ cursor: 'pointer' }} onClick={() => setRailOpen(false)} />
      </div>
      {railMsg && <div style={{ fontFamily: FONT, fontSize: 11.5, color: t.t2, background: t.accentBg, border: '1px solid ' + t.accentLine, borderRadius: 7, padding: '7px 9px', marginBottom: 10 }}>{railMsg}</div>}
      {claudeActions.map(([ic, lb], i) => {
        const busy = railBusy === lb
        return <div key={i} onClick={() => { if (!railBusy) runRail(lb) }}
          onMouseEnter={(e) => (e.currentTarget.style.background = t.sel)} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT, fontSize: 12.5, fontWeight: 500, color: t.t2, padding: '9px 10px', borderRadius: 8, cursor: railBusy ? 'default' : 'pointer', opacity: railBusy && !busy ? 0.5 : 1 }}>
          <Icon n={busy ? 'loader-2' : ic} s={15} c={t.t1} />{lb}</div>
      })}
    </div>}


  </div>
}

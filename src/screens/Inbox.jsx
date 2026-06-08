// Inbox / triage — Accept creates a real note (suggested project, picked
// project, or area home for multi) and clears the capture.
import { useState } from 'react'
import { useScribe } from '../ScribeCtx'
import { useData } from '../DataContext'
import { t, FONT } from '../theme/tokens'
import { Icon, Label, Tag, Btn } from '../kit'
import { createNote, deleteInbox, updateNote } from '../lib/db'
import { blocksToText } from '../lib/blocks'

const today = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export function InboxScreen() {
  const { go, mobile } = useScribe()
  const { inbox, notes, areas, projectName, areaOfProject, reload } = useData()
  const allProjects = areas.flatMap((a) => a.projects)
  const [hidden, setHidden] = useState([])
  const [picks, setPicks] = useState({})
  const [busy, setBusy] = useState(null)
  const [err, setErr] = useState(null)

  // Notes filed under Library (no project, no area, not spanning) are untriaged —
  // surface them here as triage cards. Filing one assigns a project in place.
  const orphans = notes
    .filter((n) => !n.project && !n.area && !(n.projects || []).length)
    .map((n) => ({
      id: 'note:' + n.id, noteId: n.id, title: n.title,
      src: 'Library · no project', srcIcon: 'stack-2',
      snippet: n.summary || blocksToText(n.body || []).slice(0, 160),
      suggest: null, suggestMulti: undefined, tags: n.tags || [],
    }))
  const items = [...inbox, ...orphans].filter((x) => !hidden.includes(x.id))
  const dismiss = (id) => setHidden((h) => [...h, id])

  const accept = async (c, overrideProject) => {
    setBusy(c.id); setErr(null)
    // Note-backed entry (a Library note): file it by assigning a project, no new row.
    if (c.noteId) {
      const projectId = overrideProject || null
      const areaId = projectId ? (areaOfProject(projectId) || {}).id || null : null
      try { await updateNote(c.noteId, { project: projectId, area: areaId }); await reload() }
      catch (e) { setErr(e); setBusy(null) }
      return
    }
    const m = c.suggestMulti
    const projectId = overrideProject || (m ? null : (c.suggest?.project || null))
    const areaId = m ? m.home : (projectId ? (areaOfProject(projectId) || {}).id : null) || null
    const id = (crypto?.randomUUID?.() || 'note-' + Date.now())
    const note = {
      id, kind: m ? 'meeting' : 'note', title: c.title,
      project: projectId, area: areaId, projects: m ? m.routes.map((r) => r.project) : [],
      people: [], tags: c.tags || [], date: today(), updated: 'now', indexed: false, status: 1,
      summary: c.snippet || '', terms: [], actions: [], body: [{ p: c.snippet || '' }], related: [],
    }
    try { await createNote(note); await deleteInbox(c.id); await reload() }
    catch (e) { setErr(e); setBusy(null) }
  }

  return <div style={{ padding: mobile ? '20px 16px 90px' : '28px 40px 60px', maxWidth: 820, margin: '0 auto' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <h1 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: t.t1, letterSpacing: '-0.02em', margin: 0 }}>Inbox</h1>
        <span style={{ fontFamily: FONT, fontSize: 13, color: t.t3 }}>{items.length} to triage</span>
      </div>
      {items.length > 0 && <Btn kind="outline" icon="sparkles" onClick={() => setHidden((h) => [...h, ...items.map((x) => x.id)])}>Triage all</Btn>}
    </div>

    {err && <div style={{ fontFamily: FONT, fontSize: 13, color: t.t2, marginBottom: 14 }}>Couldn’t file it — {String(err?.message || err)}.</div>}

    {items.length === 0 && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      padding: '70px 0', color: t.t3, fontFamily: FONT }}>
      <Icon n="inbox" s={34} c={t.t3} />
      <div style={{ fontSize: 15, fontWeight: 600, color: t.t2 }}>Inbox zero</div>
      <div style={{ fontSize: 13 }}>Nothing left to triage.</div>
    </div>}

    {items.map((c) => {
      const proj = c.suggest && projectName(c.suggest.project)
      const m = c.suggestMulti
      const loading = busy === c.id
      return <div key={c.id} style={{ background: t.card, border: '1px solid ' + t.line, borderRadius: 12,
        padding: '16px 18px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
          <span onClick={c.noteId ? () => go({ screen: 'note', id: c.noteId }) : undefined}
            style={{ fontFamily: FONT, fontSize: 15.5, fontWeight: 600, color: t.t1, cursor: c.noteId ? 'pointer' : 'default' }}>{c.title}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FONT, fontSize: 11, color: t.t3, whiteSpace: 'nowrap' }}>
            <Icon n={c.srcIcon} s={13} />{c.src}</span>
        </div>
        <div style={{ fontFamily: FONT, fontSize: 13, color: t.t2, lineHeight: 1.6, marginBottom: 13 }}>{c.snippet}</div>

        <div style={{ background: t.accentBg, border: '1px solid ' + t.accentLine, borderRadius: 9, padding: '10px 13px', marginBottom: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Icon n={c.noteId ? 'stack-2' : 'sparkles'} s={12} c={t.t1} /><Label>{c.noteId ? 'Unfiled · in Library' : m ? 'Triage suggestion · spans projects' : 'Triage suggestion'}</Label>
          </div>
          {m
            ? <div style={{ fontFamily: FONT, fontSize: 12.5, color: t.t2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 9 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>File at
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600, color: t.t1 }}><Icon n="stack-2" s={13} />{m.homeLabel}</span>
                    <span style={{ color: t.t3 }}>· area home</span></span>
                  <span style={{ color: t.t3 }}>{Math.round(m.confidence * 100)}% confident</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: t.t3 }}>route action items →</span>
                  {m.routes.map((r) => <span key={r.project} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FONT, fontSize: 11.5, fontWeight: 600,
                    color: t.t1, background: t.tagBg, borderRadius: 7, padding: '3px 9px' }}>
                    <Icon n="folder" s={12} c={t.t2} />{projectName(r.project)}<span style={{ color: t.t3, fontWeight: 500 }}>· {r.count}</span></span>)}
                </div>
              </div>
            : c.suggest
            ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontFamily: FONT, fontSize: 12.5, color: t.t2 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600, color: t.t1 }}><Icon n="folder" s={14} />{proj}</span>
                <span style={{ color: t.t3 }}>{Math.round(c.suggest.confidence * 100)}% confident</span>
                <span style={{ color: t.t3 }}>·</span>{c.tags.map((tg) => <Tag key={tg}>{tg}</Tag>)}
              </div>
            : <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontFamily: FONT, fontSize: 12.5, color: t.t2 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: t.t3 }}><Icon n="folder-off" s={14} />{c.noteId ? 'no project — file it into one' : 'no confident project — pick one'}</span>
                {c.tags.length > 0 && <><span style={{ color: t.t3 }}>·</span>{c.tags.map((tg) => <Tag key={tg}>{tg}</Tag>)}</>}
              </div>}
        </div>

        <div style={{ display: 'flex', gap: 9, alignItems: 'center', flexWrap: 'wrap' }}>
          {m
            ? <><Btn kind="primary" size="sm" icon={loading ? 'loader-2' : 'git-fork'} onClick={() => accept(c)}>Accept split</Btn>
                <Btn kind="ghost" size="sm" onClick={() => dismiss(c.id)}>Leave in inbox</Btn></>
            : c.suggest
            ? <><Btn kind="primary" size="sm" icon={loading ? 'loader-2' : undefined} onClick={() => accept(c)}>Accept → {proj}</Btn>
                <select value={picks[c.id] || ''} onChange={(e) => setPicks((p) => ({ ...p, [c.id]: e.target.value }))}
                  style={{ fontFamily: FONT, fontSize: 12, color: t.t1, background: t.card, border: '1px solid ' + t.line2, borderRadius: 8, padding: '6px 9px' }}>
                  <option value="">file elsewhere…</option>
                  {allProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {picks[c.id] && <Btn kind="outline" size="sm" onClick={() => accept(c, picks[c.id])}>File</Btn>}
                <Btn kind="ghost" size="sm" onClick={() => dismiss(c.id)}>Leave in inbox</Btn></>
            : <><select value={picks[c.id] || ''} onChange={(e) => setPicks((p) => ({ ...p, [c.id]: e.target.value }))}
                  style={{ fontFamily: FONT, fontSize: 12, color: t.t1, background: t.card, border: '1px solid ' + t.line2, borderRadius: 8, padding: '6px 9px' }}>
                  <option value="">Pick project…</option>
                  {allProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <Btn kind="primary" size="sm" icon={loading ? 'loader-2' : undefined} onClick={() => picks[c.id] && accept(c, picks[c.id])}>{c.noteId ? 'File into project' : 'File as note'}</Btn>
                <Btn kind="ghost" size="sm" onClick={() => dismiss(c.id)}>{c.noteId ? 'Keep in Library' : 'Keep in inbox'}</Btn></>}
        </div>
      </div>
    })}
  </div>
}

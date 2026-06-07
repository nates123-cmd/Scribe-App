// Inbox / triage — Accept creates a real note (in the suggested project, or
// homed at the area for multi-project) and clears the capture. Other actions
// dismiss locally for the session.
import { useState } from 'react'
import { useScribe } from '../ScribeCtx'
import { useData } from '../DataContext'
import { t, FONT } from '../theme/tokens'
import { Icon, Label, Tag, Btn } from '../kit'
import { createNote, deleteInbox } from '../lib/db'

const today = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export function InboxScreen() {
  const { go } = useScribe()
  const { inbox, projectName, areaOfProject, reload } = useData()
  const [hidden, setHidden] = useState([])
  const [busy, setBusy] = useState(null)
  const [err, setErr] = useState(null)
  const items = inbox.filter((x) => !hidden.includes(x.id))
  const dismiss = (id) => setHidden((h) => [...h, id])

  const accept = async (c) => {
    setBusy(c.id); setErr(null)
    const m = c.suggestMulti
    const projectId = m ? null : (c.suggest?.project || null)
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

  return <div style={{ padding: '28px 40px 60px', maxWidth: 820, margin: '0 auto' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <h1 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: t.t1, letterSpacing: '-0.02em', margin: 0 }}>Inbox</h1>
        <span style={{ fontFamily: FONT, fontSize: 13, color: t.t3 }}>{items.length} to triage</span>
      </div>
      {items.length > 0 && <Btn kind="outline" icon="sparkles" onClick={() => setHidden(inbox.map((x) => x.id))}>Triage all</Btn>}
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
          <span style={{ fontFamily: FONT, fontSize: 15.5, fontWeight: 600, color: t.t1 }}>{c.title}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FONT, fontSize: 11, color: t.t3, whiteSpace: 'nowrap' }}>
            <Icon n={c.srcIcon} s={13} />{c.src}</span>
        </div>
        <div style={{ fontFamily: FONT, fontSize: 13, color: t.t2, lineHeight: 1.6, marginBottom: 13 }}>{c.snippet}</div>

        <div style={{ background: t.accentBg, border: '1px solid ' + t.accentLine, borderRadius: 9, padding: '10px 13px', marginBottom: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Icon n="sparkles" s={12} c={t.t1} /><Label>{m ? 'Triage suggestion · spans projects' : 'Triage suggestion'}</Label>
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
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: t.t3 }}><Icon n="folder-off" s={14} />no confident project — stays in inbox</span>
                <span style={{ color: t.t3 }}>·</span>{c.tags.map((tg) => <Tag key={tg}>{tg}</Tag>)}
              </div>}
        </div>

        <div style={{ display: 'flex', gap: 9 }}>
          {m
            ? <><Btn kind="primary" size="sm" icon={loading ? 'loader-2' : 'git-fork'} onClick={() => accept(c)}>Accept split</Btn>
                <Btn kind="outline" size="sm" onClick={() => accept(c)}>Adjust routing</Btn>
                <Btn kind="ghost" size="sm" onClick={() => dismiss(c.id)}>Leave in inbox</Btn></>
            : c.suggest
            ? <><Btn kind="primary" size="sm" icon={loading ? 'loader-2' : undefined} onClick={() => accept(c)}>Accept → {proj}</Btn>
                <Btn kind="outline" size="sm" onClick={() => dismiss(c.id)}>Leave in inbox</Btn></>
            : <><Btn kind="outline" size="sm" icon="folder" onClick={() => accept(c)}>File as note</Btn>
                <Btn kind="ghost" size="sm" onClick={() => dismiss(c.id)}>Keep in inbox</Btn></>}
        </div>
      </div>
    })}
  </div>
}

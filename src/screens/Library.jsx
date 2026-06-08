// Library — all notes with kind filters, keyword search, topic tags.
import { useState } from 'react'
import { useScribe } from '../ScribeCtx'
import { useData } from '../DataContext'
import { t, FONT } from '../theme/tokens'
import { Icon, Label, Tag, Person, Btn, KIND } from '../kit'
import { TOPICS } from '../data'

export function LibraryScreen() {
  const { route, go, mobile } = useScribe()
  const { notes: NOTES, projectName, areaName } = useData()
  const [kind, setKind] = useState('all')
  const [q, setQ] = useState('')
  const [tag, setTag] = useState(route.tag || null)
  const kinds = ['all', 'note', 'meeting', 'knowledge', 'brainstorm']
  const rows = NOTES.filter((n) => (kind === 'all' || n.kind === kind)
    && (!tag || n.tags.includes(tag))
    && (!q || n.title.toLowerCase().includes(q.toLowerCase())))
  const grid = mobile ? '1fr 44px' : '1fr 150px 64px'

  const chip = (k) => {
    const on = kind === k
    return <button key={k} onClick={() => setKind(k)} style={{ fontFamily: FONT, fontSize: 12,
      fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer', borderRadius: 8, padding: '5px 11px',
      border: '1px solid ' + (on ? 'transparent' : t.line2), background: on ? t.accent : 'transparent',
      color: on ? t.onAccent : t.t2, transition: 'all .14s' }}>{k}</button>
  }

  return <div style={{ padding: mobile ? '20px 16px 40px' : '28px 40px 60px', maxWidth: 1000, margin: '0 auto' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <h1 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: t.t1, letterSpacing: '-0.02em', margin: 0 }}>Library</h1>
        <span style={{ fontFamily: FONT, fontSize: 13, color: t.t3 }}>{(tag || kind !== 'all' || q) ? rows.length + ' of ' + NOTES.length : NOTES.length + ' notes'}</span>
      </div>
      {!mobile && <Btn kind="primary" icon="plus" onClick={() => go({ screen: 'capture' })}>New</Btn>}
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 9, background: t.card,
        border: '1px solid ' + t.line2, borderRadius: 9, padding: '0 12px', height: 38 }}>
        <Icon n="search" s={16} c={t.t3} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes by title"
          style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontFamily: FONT, fontSize: 13, color: t.t1 }} />
      </div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>{kinds.map(chip)}</div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.t3 }}>
        <Icon n="tag" s={13} c={t.t3} />Topics</span>
      {TOPICS.map((tp) => <Tag key={tp} active={tag === tp} onClick={() => setTag(tag === tp ? null : tp)}>{tp}</Tag>)}
      {tag && !TOPICS.includes(tag) && <Tag active onClick={() => setTag(null)}>{tag}</Tag>}
      {tag && <button onClick={() => setTag(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT, fontSize: 11, color: t.t3, background: 'transparent', border: 0, cursor: 'pointer' }}>
        <Icon n="x" s={12} />clear</button>}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: grid, gap: '0 16px', padding: '0 6px 9px', borderBottom: '1px solid ' + t.line }}>
      <Label>Title</Label>{!mobile && <Label>Tags · People</Label>}<Label style={{ textAlign: 'right' }}>Upd</Label>
    </div>
    {rows.map((n) => {
      const k = KIND[n.kind]; const proj = projectName(n.project)
      return <div key={n.id} onClick={() => go({ screen: 'note', id: n.id })}
        onMouseEnter={(e) => (e.currentTarget.style.background = t.sel)}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        style={{ display: 'grid', gridTemplateColumns: grid, gap: '0 16px', alignItems: 'center',
          padding: '13px 6px', borderBottom: '1px solid ' + t.line, cursor: 'pointer', borderRadius: 7, transition: 'background .12s' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, minWidth: 0 }}>
          <Icon n={k.icon} s={16} c={t.t3} style={{ marginTop: 3 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 600, color: t.t1, whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</div>
            <div style={{ fontFamily: FONT, fontSize: 11.5, color: t.t3, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {proj ? <><Icon n="folder" s={12} />{proj}</> : n.area ? <><Icon n="layout-grid" s={12} />{areaName(n.area)}</> : <><Icon n="stack-2" s={12} />Library</>}
              {!n.indexed && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: t.t3 }}>· <span style={{ width: 5, height: 5, borderRadius: 3, background: t.t3, display: 'inline-block' }} />not indexed</span>}
              {mobile && n.tags.slice(0, 2).map((tg) => <Tag key={tg}>{tg}</Tag>)}
            </div>
          </div>
        </div>
        {!mobile && <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
          {n.people.slice(0, 1).map((p) => <Person key={p}>{p}</Person>)}
          {n.tags.slice(0, 2).map((tg) => <Tag key={tg} active={tag === tg} onClick={(e) => { e.stopPropagation(); setTag(tag === tg ? null : tg) }}>{tg}</Tag>)}
        </div>}
        <div style={{ fontFamily: FONT, fontSize: 12, color: t.t3, textAlign: 'right' }}>{n.updated}</div>
      </div>
    })}
    {rows.length === 0 && <div style={{ padding: 40, textAlign: 'center', fontFamily: FONT, color: t.t3, fontSize: 14 }}>No notes match.</div>}
  </div>
}

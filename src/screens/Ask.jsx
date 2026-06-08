// Ask / Find — hybrid search surface. Two modes off one bar:
//  • Ask  → Claude synthesis over the notes (cites sources, costs tokens)
//  • Find → instant local keyword filter (live, zero tokens)
import { useEffect, useMemo, useState } from 'react'
import { useScribe } from '../ScribeCtx'
import { useData } from '../DataContext'
import { t, FONT } from '../theme/tokens'
import { Icon, Label, KIND } from '../kit'
import { askNotes } from '../lib/ai'
import { blocksToText } from '../lib/blocks'

// Build one lowercase haystack per note, then require every query token to hit it.
function findNotes(query, notes, projectName) {
  const toks = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!toks.length) return []
  const scored = []
  for (const n of notes) {
    const title = (n.title || '').toLowerCase()
    const hay = [
      title, (n.summary || '').toLowerCase(), blocksToText(n.body).toLowerCase(),
      (n.people || []).join(' ').toLowerCase(), (n.terms || []).join(' ').toLowerCase(),
      (n.tags || []).join(' ').toLowerCase(), (n.transcript || '').toLowerCase(),
      (n.project ? projectName(n.project) : '').toLowerCase(),
      (KIND[n.kind]?.label || '').toLowerCase(),
    ].join(' \n ')
    if (toks.every((tk) => hay.includes(tk))) {
      // title hits rank first, then preserve incoming (recency) order
      scored.push({ n, title: toks.some((tk) => title.includes(tk)) })
    }
  }
  scored.sort((a, b) => (b.title === a.title ? 0 : b.title ? 1 : -1))
  return scored.map((s) => s.n)
}

export function AskScreen() {
  const { route, go, mobile } = useScribe()
  const { notes, noteById, projectName } = useData()
  const [mode, setMode] = useState(route.query ? 'ask' : 'find') // ask | find
  const [q, setQ] = useState(route.query || '')
  const [state, setState] = useState(route.query ? 'running' : 'empty') // empty | running | answered | error
  const [result, setResult] = useState(null) // { answer, sources:[{id,label,meta}] }
  const [err, setErr] = useState(null)

  const run = async (queryArg) => {
    const query = (typeof queryArg === 'string' ? queryArg : q).trim()
    if (!query) return
    setMode('ask'); setState('running'); setErr(null)
    try {
      const pool = route.scope ? notes.filter((n) => n.project && projectName(n.project) === route.scope) : notes
      const { answer, sourceIds } = await askNotes(query, pool.length ? pool : notes)
      const sources = sourceIds.map((id) => {
        const n = noteById(id); if (!n) return null
        return { id: n.id, label: n.title, meta: n.date + (n.people.length ? ' · ' + n.people.join(', ') : '') }
      }).filter(Boolean)
      setResult({ answer, sources }); setState('answered')
    } catch (e) { setErr(e); setState('error') }
  }

  // Auto-run when arriving from a top-bar / scoped Ask submit.
  useEffect(() => {
    if (route.query && notes.length) run(route.query)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.query, route.scope, notes.length])

  // Live local matches (Find mode, or scoped Ask pool).
  const pool = route.scope ? notes.filter((n) => n.project && projectName(n.project) === route.scope) : notes
  const matches = useMemo(() => (mode === 'find' ? findNotes(q, pool.length ? pool : notes, projectName) : []),
    [mode, q, pool, notes, projectName])

  const onSubmit = (e) => { e.preventDefault(); if (mode === 'ask') run(); }
  const switchMode = (m) => { setMode(m); if (m === 'find') setState('empty') }

  const seg = (m, icon, txt) => <button type="button" onClick={() => switchMode(m)}
    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 13, fontWeight: 600,
      border: 0, borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
      color: mode === m ? t.onAccent : t.t2, background: mode === m ? t.accent : 'transparent' }}>
    <Icon n={icon} s={15} />{txt}</button>

  const Row = ({ n }) => <div onClick={() => go({ screen: 'note', id: n.id })}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = t.accent)} onMouseLeave={(e) => (e.currentTarget.style.borderColor = t.line)}
    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', border: '1px solid ' + t.line, borderRadius: 11, marginBottom: 9, cursor: 'pointer', background: t.card }}>
    <Icon n={(KIND[n.kind] || KIND.note).icon} s={16} c={t.t1} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: t.t1 }}>{n.title}</div>
      <div style={{ fontFamily: FONT, fontSize: 11, color: t.t3, marginTop: 2 }}>
        {n.date}{n.people?.length ? ' · ' + n.people.join(', ') : ''}{n.project ? ' · ' + projectName(n.project) : ''}</div>
    </div>
    <Icon n="arrow-up-right" s={15} c={t.t3} />
  </div>

  const chips = result
    ? (route.scope ? [{ icon: 'folder', text: 'scope: ' + route.scope }] : []).concat([{ icon: null, text: '+ Claude' }])
    : []

  return <div>
    <div style={{ maxWidth: 720, margin: '0 auto', padding: mobile ? '28px 16px 90px' : '40px 40px 70px' }}>
      <div style={{ display: 'inline-flex', gap: 2, background: t.tagBg, borderRadius: 10, padding: 3, marginBottom: 12 }}>
        {seg('ask', 'sparkles', 'Ask')}{seg('find', 'search', 'Find')}
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', alignItems: 'center', gap: 10, background: t.card,
        border: '1px solid ' + t.accentLine, borderRadius: 12, padding: '0 15px', height: 50, marginBottom: 10 }}>
        <Icon n={mode === 'ask' ? 'sparkles' : 'search'} s={18} c={t.t1} />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
          placeholder={mode === 'ask' ? 'Ask your notes…' : 'Search your notes…'}
          style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontFamily: FONT, fontSize: 16, fontWeight: 500, color: t.t1 }} />
        {route.scope && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FONT, fontSize: 11, color: t.t2, background: t.tagBg, borderRadius: 7, padding: '3px 9px' }}>
          <Icon n="folder" s={12} />{route.scope}</span>}
        {mode === 'ask'
          ? <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8,
              background: t.accent, color: t.onAccent, border: 0, cursor: 'pointer' }}><Icon n="arrow-up" s={16} /></button>
          : q && <button type="button" onClick={() => setQ('')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8,
              background: 'transparent', color: t.t3, border: 0, cursor: 'pointer' }}><Icon n="x" s={16} /></button>}
      </form>

      {/* FIND mode — live local results */}
      {mode === 'find' && <>
        {!q && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '70px 0', color: t.t3, fontFamily: FONT }}>
          <Icon n="search" s={30} c={t.t3} /><div style={{ fontSize: 14 }}>Search titles, people, tags, body & transcripts — instantly.</div></div>}
        {q && <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Label>{matches.length} {matches.length === 1 ? 'match' : 'matches'}</Label>
            <button type="button" onClick={() => run(q)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FONT, fontSize: 12, fontWeight: 600,
              color: t.t2, background: 'transparent', border: 0, cursor: 'pointer' }}><Icon n="sparkles" s={13} />Ask Claude instead</button>
          </div>
          {matches.length === 0
            ? <div style={{ padding: '24px 4px', color: t.t3, fontFamily: FONT, fontSize: 14 }}>No notes match “{q}”.</div>
            : matches.map((n) => <Row key={n.id} n={n} />)}
        </>}
      </>}

      {/* ASK mode — Claude synthesis */}
      {mode === 'ask' && <>
        {state === 'answered' && <div style={{ display: 'flex', gap: 7, marginBottom: 24, flexWrap: 'wrap', paddingLeft: 2 }}>
          {chips.map((c, i) =>
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FONT, fontSize: 11, color: t.t2, background: t.tagBg, borderRadius: 7, padding: '3px 9px' }}>
              {c.icon && <Icon n={c.icon} s={12} />}{c.text}</span>)}
        </div>}

        {state === 'empty' && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '70px 0', color: t.t3, fontFamily: FONT }}>
          <Icon n="sparkles" s={30} c={t.t3} /><div style={{ fontSize: 14 }}>Ask anything — by person, recency, topic, or meaning.</div></div>}

        {state === 'running' && <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '30px 4px', color: t.t2, fontFamily: FONT, fontSize: 14 }}>
          <Icon n="loader-2" s={16} c={t.t1} />Retrieving across your notes…</div>}

        {state === 'error' && <div style={{ padding: '24px 4px', color: t.t2, fontFamily: FONT, fontSize: 14 }}>
          Couldn’t retrieve — {String(err?.message || err)}.</div>}

        {state === 'answered' && result && <>
          <div style={{ background: t.accentBg, border: '1px solid ' + t.accentLine, borderRadius: 12, padding: '16px 18px', marginBottom: 24 }}>
            <Label style={{ marginBottom: 9 }}>Answer</Label>
            <div className="selectable" style={{ fontFamily: FONT, fontSize: 15.5, color: t.t1, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{result.answer}</div>
          </div>
          {result.sources.length > 0 && <>
            <Label style={{ marginBottom: 10 }}>Sources</Label>
            {result.sources.map((s) => { const n = noteById(s.id); return n ? <Row key={s.id} n={n} /> : null })}
          </>}
        </>}
      </>}
    </div>
  </div>
}

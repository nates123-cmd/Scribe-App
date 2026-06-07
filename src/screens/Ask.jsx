// Ask / retrieval — the replacement for browsing. Ported 1:1 from the
// prototype's scribe-screens-3.jsx -> AskScreen. Answers are canned (setTimeout
// fake); wire to claudeComplete + real retrieval later, keep the state machine.
import { useState } from 'react'
import { useScribe } from '../ScribeCtx'
import { t, FONT } from '../theme/tokens'
import { Icon, Label, KIND } from '../kit'
import { ASK_ANSWERS } from '../data'
import { useData } from '../DataContext'

export function AskScreen() {
  const { route, go } = useScribe()
  const { noteById } = useData()
  const data = (route.scope && ASK_ANSWERS[route.scope]) || ASK_ANSWERS.default
  const [q, setQ] = useState(route.query || 'what did Jon say the other day?')
  const [state, setState] = useState(route.query === '' ? 'empty' : 'answered') // empty | running | answered
  const run = (e) => { if (e) e.preventDefault(); if (!q.trim()) return; setState('running'); setTimeout(() => setState('answered'), 900) }

  return <div>
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 40px 70px' }}>
      <form onSubmit={run} style={{ display: 'flex', alignItems: 'center', gap: 10, background: t.card,
        border: '1px solid ' + t.accentLine, borderRadius: 12, padding: '0 15px', height: 50, marginBottom: 10 }}>
        <Icon n="sparkles" s={18} c={t.t1} />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask your notes…"
          style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontFamily: FONT, fontSize: 16, fontWeight: 500, color: t.t1 }} />
        {route.scope && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FONT, fontSize: 11, color: t.t2, background: t.tagBg, borderRadius: 7, padding: '3px 9px' }}>
          <Icon n="folder" s={12} />{route.scope}</span>}
        <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8,
          background: t.accent, color: t.onAccent, border: 0, cursor: 'pointer' }}><Icon n="arrow-up" s={16} /></button>
      </form>

      {/* resolution chips */}
      {state === 'answered' && <div style={{ display: 'flex', gap: 7, marginBottom: 24, flexWrap: 'wrap', paddingLeft: 2 }}>
        {(route.scope ? [{ icon: 'folder', text: 'scope: ' + route.scope }] : []).concat(data.chips).map((c, i) =>
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FONT, fontSize: 11, color: t.t2, background: t.tagBg, borderRadius: 7, padding: '3px 9px' }}>
            {c.icon && <Icon n={c.icon} s={12} />}{c.text}</span>)}
      </div>}

      {state === 'empty' && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '70px 0', color: t.t3, fontFamily: FONT }}>
        <Icon n="sparkles" s={30} c={t.t3} /><div style={{ fontSize: 14 }}>Ask anything — by person, recency, topic, or meaning.</div></div>}

      {state === 'running' && <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '30px 4px', color: t.t2, fontFamily: FONT, fontSize: 14 }}>
        <Icon n="loader-2" s={16} c={t.t1} />Retrieving across your notes…</div>}

      {state === 'answered' && <>
        <div style={{ background: t.accentBg, border: '1px solid ' + t.accentLine, borderRadius: 12, padding: '16px 18px', marginBottom: 24 }}>
          <Label style={{ marginBottom: 9 }}>Answer</Label>
          <div style={{ fontFamily: FONT, fontSize: 15.5, color: t.t1, lineHeight: 1.65 }}>{data.answer}</div>
        </div>
        <Label style={{ marginBottom: 10 }}>Sources</Label>
        {data.sources.map((s) => <div key={s.id} onClick={() => go({ screen: 'note', id: s.id })}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = t.accent)} onMouseLeave={(e) => (e.currentTarget.style.borderColor = t.line)}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', border: '1px solid ' + t.line, borderRadius: 11, marginBottom: 9, cursor: 'pointer', background: t.card }}>
          <Icon n={(KIND[(noteById(s.id) || {}).kind] || KIND.note).icon} s={16} c={t.t1} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: t.t1 }}>{s.label}</div>
            <div style={{ fontFamily: FONT, fontSize: 11, color: t.t3, marginTop: 2 }}>{s.meta}</div>
          </div>
          <Icon n="arrow-up-right" s={15} c={t.t3} />
        </div>)}
      </>}
    </div>
  </div>
}

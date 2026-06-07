// Compose / deliverable — clean content to paste into Word/PPT/Excel, optionally
// saved as a linked artifact. Ported 1:1 from the prototype's scribe-screens-3.jsx
// -> ComposeScreen. Compose is a setTimeout fake; wire to claudeComplete later.
import { useState } from 'react'
import { useScribe } from '../ScribeCtx'
import { t, FONT } from '../theme/tokens'
import { Icon, Label, Btn } from '../kit'
import { COMPOSE_TYPES, noteById, projectName } from '../data'

export function ComposeScreen() {
  const { route, go } = useScribe()
  const srcNote = route.noteId && noteById(route.noteId)
  const srcProj = route.projectId && projectName(route.projectId)
  const srcLabel = srcNote ? srcNote.title : srcProj || 'Citrix CSP'
  const [type, setType] = useState('onepager')
  const [instr, setInstr] = useState('')
  const [state, setState] = useState('idle') // idle | running | done
  const [copied, setCopied] = useState(false)
  const run = () => { setState('running'); setTimeout(() => setState('done'), 1200) }

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
          return <div key={c.id} onClick={() => { setType(c.id); setState('idle') }}
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

      {state === 'done' && <div style={{ marginTop: 24, border: '1px solid ' + t.line, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', background: t.panel, borderBottom: '1px solid ' + t.line }}>
          <span style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: t.t1 }}>One-pager · CSP commercial status</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn kind="ghost" size="sm" icon={copied ? 'check' : 'copy'} onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }}>{copied ? 'Copied' : 'Copy'}</Btn>
            <Btn kind="outline" size="sm" icon="link">Save as artifact</Btn>
          </div>
        </div>
        <div style={{ padding: '20px 22px', fontFamily: FONT, color: t.t1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Citrix CSP — Commercial Status</h2>
          <div style={{ fontSize: 12, color: t.t3, marginBottom: 16 }}>Prepared from 14 notes · Jun 7, 2026</div>
          <p style={{ fontSize: 14, lineHeight: 1.7, margin: '0 0 14px' }}><strong>Bottom line.</strong> Novation is the critical path. Legal sign-off on the novation terms is blocking finalization of the pricing tiers; everything else is sequenced behind it.</p>
          <div style={{ fontSize: 13, fontWeight: 700, margin: '0 0 6px' }}>Open items</div>
          <ul style={{ fontSize: 14, lineHeight: 1.7, margin: '0 0 14px', paddingLeft: 20 }}>
            <li>Novation sign-off — owner: Jon (pushing legal); est. 2–3 weeks once drafted</li>
            <li>Telemetry scope with Arrowsphere — owner: you, due Thursday</li>
            <li>EMEA segmentation — open</li>
          </ul>
          <div style={{ fontSize: 13, fontWeight: 700, margin: '0 0 6px' }}>Next checkpoint</div>
          <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>Thursday’s Arrowsphere call resolves telemetry scope and unblocks the EMEA question.</p>
        </div>
      </div>}
    </div>
  </div>
}

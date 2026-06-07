// scribe-screens-3.jsx — Ask / retrieval, Compose / deliverable.

function AskScreen() {
  const { t, go, Icon, Label } = window.bind();
  const { route } = window.useScribe();
  const data = (route.scope && window.ASK_ANSWERS[route.scope]) || window.ASK_ANSWERS.default;
  const [q, setQ] = React.useState(route.query || 'what did Jon say the other day?');
  const [state, setState] = React.useState(route.query === '' ? 'empty' : 'answered'); // empty | running | answered
  const run = (e) => { e && e.preventDefault(); if (!q.trim()) return; setState('running'); setTimeout(() => setState('answered'), 900); };

  return <div>
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 40px 70px' }}>
      <form onSubmit={run} style={{ display: 'flex', alignItems: 'center', gap: 10, background: t.card,
        border: '1px solid ' + t.accentLine, borderRadius: 12, padding: '0 15px', height: 50, marginBottom: 10 }}>
        <Icon n="sparkles" s={18} c={t.t1} />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask your notes…"
          style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontFamily: window.FONT, fontSize: 16, fontWeight: 500, color: t.t1 }} />
        {route.scope && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: window.FONT, fontSize: 11, color: t.t2, background: t.tagBg, borderRadius: 7, padding: '3px 9px' }}>
          <Icon n="folder" s={12} />{route.scope}</span>}
        <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8,
          background: t.accent, color: t.onAccent, border: 0, cursor: 'pointer' }}><Icon n="arrow-up" s={16} /></button>
      </form>

      {/* resolution chips */}
      {state === 'answered' && <div style={{ display: 'flex', gap: 7, marginBottom: 24, flexWrap: 'wrap', paddingLeft: 2 }}>
        {(route.scope ? [{ icon: 'folder', text: 'scope: ' + route.scope }] : []).concat(data.chips).map((c, i) =>
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: window.FONT, fontSize: 11, color: t.t2, background: t.tagBg, borderRadius: 7, padding: '3px 9px' }}>
            {c.icon && <Icon n={c.icon} s={12} />}{c.text}</span>)}
      </div>}

      {state === 'empty' && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '70px 0', color: t.t3, fontFamily: window.FONT }}>
        <Icon n="sparkles" s={30} c={t.t3} /><div style={{ fontSize: 14 }}>Ask anything — by person, recency, topic, or meaning.</div></div>}

      {state === 'running' && <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '30px 4px', color: t.t2, fontFamily: window.FONT, fontSize: 14 }}>
        <Icon n="loader-2" s={16} c={t.t1} />Retrieving across your notes…</div>}

      {state === 'answered' && <>
        <div style={{ background: t.accentBg, border: '1px solid ' + t.accentLine, borderRadius: 12, padding: '16px 18px', marginBottom: 24 }}>
          <Label style={{ marginBottom: 9 }}>Answer</Label>
          <div style={{ fontFamily: window.FONT, fontSize: 15.5, color: t.t1, lineHeight: 1.65 }}>{data.answer}</div>
        </div>
        <Label style={{ marginBottom: 10 }}>Sources</Label>
        {data.sources.map((s) => <div key={s.id} onClick={() => go({ screen: 'note', id: s.id })}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = t.accent} onMouseLeave={(e) => e.currentTarget.style.borderColor = t.line}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', border: '1px solid ' + t.line, borderRadius: 11, marginBottom: 9, cursor: 'pointer', background: t.card }}>
          <Icon n={(window.KIND[(window.noteById(s.id) || {}).kind] || window.KIND.note).icon} s={16} c={t.t1} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: window.FONT, fontSize: 14, fontWeight: 600, color: t.t1 }}>{s.label}</div>
            <div style={{ fontFamily: window.FONT, fontSize: 11, color: t.t3, marginTop: 2 }}>{s.meta}</div>
          </div>
          <Icon n="arrow-up-right" s={15} c={t.t3} />
        </div>)}
      </>}
    </div>
  </div>;
}

function ComposeScreen() {
  const { t, go, Icon, Label } = window.bind();
  const { route } = window.useScribe();
  const srcNote = route.noteId && window.noteById(route.noteId);
  const srcProj = route.projectId && window.projectName(route.projectId);
  const srcLabel = srcNote ? srcNote.title : srcProj || 'Citrix CSP';
  const [type, setType] = React.useState('onepager');
  const [instr, setInstr] = React.useState('');
  const [state, setState] = React.useState('idle'); // idle | running | done
  const [copied, setCopied] = React.useState(false);
  const run = () => { setState('running'); setTimeout(() => setState('done'), 1200); };

  return <div>
    <div style={{ maxWidth: 740, margin: '0 auto', padding: '30px 40px 70px' }}>
      <button onClick={() => go(srcNote ? { screen: 'note', id: srcNote.id } : { screen: 'project', id: route.projectId || 'csp' })}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: window.FONT, fontSize: 11.5, color: t.t3, background: 'transparent', border: 0, cursor: 'pointer', marginBottom: 14 }}>
        <Icon n="chevron-left" s={13} />Back</button>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
        <h1 style={{ fontFamily: window.FONT, fontSize: 28, fontWeight: 700, color: t.t1, letterSpacing: '-0.02em', margin: 0 }}>Compose</h1>
      </div>
      <div style={{ fontFamily: window.FONT, fontSize: 12.5, color: t.t3, marginBottom: 22 }}>
        from <span style={{ color: t.t1, fontWeight: 600 }}>{srcLabel}</span> · output is clean content to paste into Word / PowerPoint / Excel</div>

      <Label style={{ marginBottom: 9 }}>Deliverable type</Label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
        {window.COMPOSE_TYPES.map((c) => { const on = type === c.id;
          return <div key={c.id} onClick={() => { setType(c.id); setState('idle'); }}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '13px 15px', borderRadius: 11, cursor: 'pointer',
              border: '1px solid ' + (on ? t.accent : t.line2), background: on ? t.accentBg : t.card }}>
            <Icon n={c.icon} s={18} c={t.t1} style={{ marginTop: 1 }} />
            <div><div style={{ fontFamily: window.FONT, fontSize: 13.5, fontWeight: 600, color: t.t1 }}>{c.name}</div>
              <div style={{ fontFamily: window.FONT, fontSize: 11.5, color: t.t3, marginTop: 2 }}>{c.desc}</div></div>
          </div>; })}
      </div>

      <Label style={{ marginBottom: 9 }}>Instructions <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, color: t.t3 }}>· optional</span></Label>
      <textarea value={instr} onChange={(e) => setInstr(e.target.value)} placeholder="e.g. for the exec team, lead with the novation blocker, keep it to half a page."
        style={{ width: '100%', minHeight: 80, border: '1px solid ' + t.line2, borderRadius: 10, padding: '12px 14px', outline: 0,
          background: t.card, resize: 'vertical', fontFamily: window.FONT, fontSize: 13.5, lineHeight: 1.6, color: t.t1, marginBottom: 16 }} />
      <window.Btn kind="primary" icon={state === 'running' ? 'loader-2' : 'sparkles'} onClick={run}>
        {state === 'running' ? 'Composing…' : state === 'done' ? 'Recompose' : 'Compose'}</window.Btn>

      {state === 'done' && <div style={{ marginTop: 24, border: '1px solid ' + t.line, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', background: t.panel, borderBottom: '1px solid ' + t.line }}>
          <span style={{ fontFamily: window.FONT, fontSize: 12.5, fontWeight: 600, color: t.t1 }}>One-pager · CSP commercial status</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <window.Btn kind="ghost" size="sm" icon={copied ? 'check' : 'copy'} onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? 'Copied' : 'Copy'}</window.Btn>
            <window.Btn kind="outline" size="sm" icon="link">Save as artifact</window.Btn>
          </div>
        </div>
        <div style={{ padding: '20px 22px', fontFamily: window.FONT, color: t.t1 }}>
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
          <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>Thursday's Arrowsphere call resolves telemetry scope and unblocks the EMEA question.</p>
        </div>
      </div>}
    </div>
  </div>;
}

window.AskScreen = AskScreen;
window.ComposeScreen = ComposeScreen;

// scribe-screens-1.jsx — Library, Inbox (triage), Capture / new note.

// ── Library ─────────────────────────────────────────────────────
function LibraryScreen() {
  const { t, go, Icon, Label, Tag, KIND, NOTES } = window.bind();
  const { route } = window.useScribe();
  const [kind, setKind] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [tag, setTag] = React.useState(route.tag || null);
  const kinds = ['all', 'note', 'meeting', 'knowledge', 'brainstorm'];
  const rows = NOTES.filter((n) => (kind === 'all' || n.kind === kind)
    && (!tag || n.tags.includes(tag))
    && (!q || n.title.toLowerCase().includes(q.toLowerCase())));

  const chip = (k) => {
    const on = kind === k;
    return <button key={k} onClick={() => setKind(k)} style={{ fontFamily: window.FONT, fontSize: 12,
      fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer', borderRadius: 8, padding: '5px 11px',
      border: '1px solid ' + (on ? 'transparent' : t.line2), background: on ? t.accent : 'transparent',
      color: on ? t.onAccent : t.t2, transition: 'all .14s' }}>{k}</button>;
  };

  return <div style={{ padding: '28px 40px 60px', maxWidth: 1000, margin: '0 auto' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <h1 style={{ fontFamily: window.FONT, fontSize: 28, fontWeight: 700, color: t.t1, letterSpacing: '-0.02em', margin: 0 }}>Library</h1>
        <span style={{ fontFamily: window.FONT, fontSize: 13, color: t.t3 }}>{(tag || kind !== 'all' || q) ? rows.length + ' of ' + NOTES.length : NOTES.length + ' notes'}</span>
      </div>
      <window.Btn kind="primary" icon="plus" onClick={() => go({ screen: 'capture' })}>New</window.Btn>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 9, background: t.card,
        border: '1px solid ' + t.line2, borderRadius: 9, padding: '0 12px', height: 38 }}>
        <Icon n="search" s={16} c={t.t3} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes by title"
          style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontFamily: window.FONT, fontSize: 13, color: t.t1 }} />
      </div>
      <div style={{ display: 'flex', gap: 7 }}>{kinds.map(chip)}</div>
    </div>

    {/* topics + active tag filter */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: window.FONT, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.t3 }}>
        <Icon n="tag" s={13} c={t.t3} />Topics</span>
      {window.TOPICS.map((tp) => <Tag key={tp} active={tag === tp} onClick={() => setTag(tag === tp ? null : tp)}>{tp}</Tag>)}
      {tag && !window.TOPICS.includes(tag) && <Tag active onClick={() => setTag(null)}>{tag}</Tag>}
      {tag && <button onClick={() => setTag(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: window.FONT, fontSize: 11, color: t.t3, background: 'transparent', border: 0, cursor: 'pointer' }}>
        <Icon n="x" s={12} />clear</button>}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 64px', gap: '0 16px', padding: '0 6px 9px',
      borderBottom: '1px solid ' + t.line }}>
      <Label>Title</Label><Label>Tags · People</Label><Label style={{ textAlign: 'right' }}>Upd</Label>
    </div>
    {rows.map((n) => {
      const k = KIND[n.kind]; const proj = window.projectName(n.project);
      return <div key={n.id} onClick={() => go({ screen: 'note', id: n.id })}
        onMouseEnter={(e) => e.currentTarget.style.background = t.sel}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        style={{ display: 'grid', gridTemplateColumns: '1fr 150px 64px', gap: '0 16px', alignItems: 'center',
          padding: '13px 6px', borderBottom: '1px solid ' + t.line, cursor: 'pointer', borderRadius: 7, transition: 'background .12s' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, minWidth: 0 }}>
          <Icon n={k.icon} s={16} c={t.t3} style={{ marginTop: 3 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: window.FONT, fontSize: 14.5, fontWeight: 600, color: t.t1, whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</div>
            <div style={{ fontFamily: window.FONT, fontSize: 11.5, color: t.t3, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              {proj ? <><Icon n="folder" s={12} />{proj}</> : n.area ? <><Icon n="layout-grid" s={12} />{window.areaName(n.area)}</> : <><Icon n="stack-2" s={12} />Library</>}
              {!n.indexed && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: t.t3 }}>· <span style={{ width: 5, height: 5, borderRadius: 3, background: t.t3, display: 'inline-block' }}></span>not indexed</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
          {n.people.slice(0, 1).map((p) => <window.Person key={p}>{p}</window.Person>)}
          {n.tags.slice(0, 2).map((tg) => <Tag key={tg} active={tag === tg} onClick={(e) => { e.stopPropagation(); setTag(tag === tg ? null : tg); }}>{tg}</Tag>)}
        </div>
        <div style={{ fontFamily: window.FONT, fontSize: 12, color: t.t3, textAlign: 'right' }}>{n.updated}</div>
      </div>;
    })}
    {rows.length === 0 && <div style={{ padding: 40, textAlign: 'center', fontFamily: window.FONT, color: t.t3, fontSize: 14 }}>No notes match.</div>}
  </div>;
}

// ── Inbox / triage ──────────────────────────────────────────────
function InboxScreen() {
  const { t, go, Icon, Label, Tag } = window.bind();
  const [items, setItems] = React.useState(window.INBOX);
  const remove = (id) => setItems((xs) => xs.filter((x) => x.id !== id));

  return <div style={{ padding: '28px 40px 60px', maxWidth: 820, margin: '0 auto' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <h1 style={{ fontFamily: window.FONT, fontSize: 28, fontWeight: 700, color: t.t1, letterSpacing: '-0.02em', margin: 0 }}>Inbox</h1>
        <span style={{ fontFamily: window.FONT, fontSize: 13, color: t.t3 }}>{items.length} to triage</span>
      </div>
      {items.length > 0 && <window.Btn kind="outline" icon="sparkles" onClick={() => setItems([])}>Triage all</window.Btn>}
    </div>

    {items.length === 0 && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      padding: '70px 0', color: t.t3, fontFamily: window.FONT }}>
      <Icon n="inbox" s={34} c={t.t3} />
      <div style={{ fontSize: 15, fontWeight: 600, color: t.t2 }}>Inbox zero</div>
      <div style={{ fontSize: 13 }}>Nothing left to triage.</div>
    </div>}

    {items.map((c) => {
      const proj = c.suggest && window.projectName(c.suggest.project);
      const m = c.suggestMulti;
      return <div key={c.id} style={{ background: t.card, border: '1px solid ' + t.line, borderRadius: 12,
        padding: '16px 18px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
          <span style={{ fontFamily: window.FONT, fontSize: 15.5, fontWeight: 600, color: t.t1 }}>{c.title}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: window.FONT, fontSize: 11, color: t.t3, whiteSpace: 'nowrap' }}>
            <Icon n={c.srcIcon} s={13} />{c.src}</span>
        </div>
        <div style={{ fontFamily: window.FONT, fontSize: 13, color: t.t2, lineHeight: 1.6, marginBottom: 13 }}>{c.snippet}</div>

        <div style={{ background: t.accentBg, border: '1px solid ' + t.accentLine, borderRadius: 9, padding: '10px 13px', marginBottom: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Icon n="sparkles" s={12} c={t.t1} /><Label>{m ? 'Triage suggestion · spans projects' : 'Triage suggestion'}</Label>
          </div>
          {m
            ? <div style={{ fontFamily: window.FONT, fontSize: 12.5, color: t.t2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 9 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>File at
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600, color: t.t1 }}><Icon n="stack-2" s={13} />{m.homeLabel}</span>
                    <span style={{ color: t.t3 }}>· area home</span></span>
                  <span style={{ color: t.t3 }}>{Math.round(m.confidence * 100)}% confident</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: t.t3 }}>route action items →</span>
                  {m.routes.map((r) => <span key={r.project} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: window.FONT, fontSize: 11.5, fontWeight: 600,
                    color: t.t1, background: t.tagBg, borderRadius: 7, padding: '3px 9px' }}>
                    <Icon n="folder" s={12} c={t.t2} />{window.projectName(r.project)}<span style={{ color: t.t3, fontWeight: 500 }}>· {r.count}</span></span>)}
                </div>
              </div>
            : c.suggest
            ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontFamily: window.FONT, fontSize: 12.5, color: t.t2 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600, color: t.t1 }}><Icon n="folder" s={14} />{proj}</span>
                <span style={{ color: t.t3 }}>{Math.round(c.suggest.confidence * 100)}% confident</span>
                <span style={{ color: t.t3 }}>·</span>{c.tags.map((tg) => <Tag key={tg}>{tg}</Tag>)}
              </div>
            : <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontFamily: window.FONT, fontSize: 12.5, color: t.t2 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: t.t3 }}><Icon n="folder-off" s={14} />no confident project — stays in inbox</span>
                <span style={{ color: t.t3 }}>·</span>{c.tags.map((tg) => <Tag key={tg}>{tg}</Tag>)}
              </div>}
        </div>

        <div style={{ display: 'flex', gap: 9 }}>
          {m
            ? <><window.Btn kind="primary" size="sm" icon="git-fork" onClick={() => remove(c.id)}>Accept split</window.Btn>
                <window.Btn kind="outline" size="sm" onClick={() => remove(c.id)}>Adjust routing</window.Btn>
                <window.Btn kind="ghost" size="sm" onClick={() => remove(c.id)}>Leave in inbox</window.Btn></>
            : c.suggest
            ? <><window.Btn kind="primary" size="sm" onClick={() => remove(c.id)}>Accept → {proj}</window.Btn>
                <window.Btn kind="outline" size="sm" onClick={() => remove(c.id)}>Leave in inbox</window.Btn></>
            : <><window.Btn kind="outline" size="sm" icon="folder">Pick project</window.Btn>
                <window.Btn kind="ghost" size="sm" onClick={() => remove(c.id)}>Keep tags only</window.Btn></>}
        </div>
      </div>;
    })}
  </div>;
}

// ── Capture / new note ──────────────────────────────────────────
function CaptureScreen() {
  const { t, go, Icon, Label } = window.bind();
  const [mode, setMode] = React.useState('note'); // note | meeting
  const [transcript, setTranscript] = React.useState('');
  const [synth, setSynth] = React.useState(null); // null | 'running' | 'done'

  const runSynth = () => { setSynth('running'); setTimeout(() => setSynth('done'), 1300); };

  const tab = (m, label, icon) => {
    const on = mode === m;
    return <button onClick={() => { setMode(m); setSynth(null); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
      fontFamily: window.FONT, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '8px 14px', borderRadius: 9,
      border: '1px solid ' + (on ? 'transparent' : t.line2), background: on ? t.sel : 'transparent',
      color: on ? t.t1 : t.t2 }}><Icon n={icon} s={15} c={on ? t.t1 : t.t2} />{label}</button>;
  };

  return <div style={{ padding: '28px 40px 60px', maxWidth: 740, margin: '0 auto' }}>
    <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>{tab('note', 'New note', 'pencil')}{tab('meeting', 'Meeting transcript', 'users')}</div>

    {/* suggested home */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18, fontFamily: window.FONT, fontSize: 12.5, color: t.t2 }}>
      <Icon n="sparkles" s={14} c={t.t1} />Suggested home
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, color: t.t1, background: t.accentBg,
        border: '1px solid ' + t.accentLine, borderRadius: 20, padding: '3px 11px' }}><Icon n="folder" s={13} />Citrix CSP</span>
      <button style={{ fontFamily: window.FONT, fontSize: 12, color: t.t3, background: 'transparent', border: 0, cursor: 'pointer', textDecoration: 'underline' }}>change</button>
    </div>

    {mode === 'note' && <>
      <input placeholder="Untitled" style={{ width: '100%', border: 0, outline: 0, background: 'transparent',
        fontFamily: window.FONT, fontSize: 30, fontWeight: 700, color: t.t1, letterSpacing: '-0.02em', marginBottom: 14 }} />
      <textarea placeholder="Start writing — plain markdown. # headings, **bold**, - lists, [[links]]."
        style={{ width: '100%', minHeight: 320, border: 0, outline: 0, background: 'transparent', resize: 'none',
          fontFamily: window.FONT, fontSize: 15, lineHeight: 1.75, color: t.t1 }} />
    </>}

    {mode === 'meeting' && <>
      <input placeholder="Meeting title" style={{ width: '100%', border: 0, outline: 0, background: 'transparent',
        fontFamily: window.FONT, fontSize: 26, fontWeight: 700, color: t.t1, letterSpacing: '-0.02em', marginBottom: 14 }} />
      <Label style={{ marginBottom: 8 }}>Paste transcript</Label>
      <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)}
        placeholder="Paste the raw meeting transcript here, then Synthesize…"
        style={{ width: '100%', minHeight: 180, border: '1px solid ' + t.line2, borderRadius: 10, padding: '13px 15px',
          outline: 0, background: t.card, resize: 'vertical', fontFamily: window.FONT, fontSize: 13.5, lineHeight: 1.65, color: t.t1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
        <window.Btn kind="primary" icon={synth === 'running' ? 'loader-2' : 'sparkles'} onClick={runSynth}>
          {synth === 'running' ? 'Synthesizing…' : 'Synthesize'}</window.Btn>
        <span style={{ fontFamily: window.FONT, fontSize: 12, color: t.t3 }}>Extracts summary, action items, people & terms · auto-tags to its project</span>
      </div>

      {synth === 'done' && <div style={{ marginTop: 22, border: '1px solid ' + t.line, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: t.panel, borderBottom: '1px solid ' + t.line }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: window.FONT, fontSize: 13, fontWeight: 600, color: t.t1 }}>
            <Icon n="circle-check" s={16} c={t.t1} />Synthesized</span>
          <window.Stepper steps={['Raw', 'Ready', 'Indexed']} current={1} />
        </div>
        <div style={{ padding: '16px 18px' }}>
          <Label style={{ marginBottom: 8 }}>Summary</Label>
          <div style={{ fontFamily: window.FONT, fontSize: 14, color: t.t1, lineHeight: 1.6, marginBottom: 16 }}>
            Novation is the critical path — legal sign-off blocks the pricing tiers. Telemetry scope and EMEA segmentation remain open.</div>
          <Label style={{ marginBottom: 8 }}>Action items · 3 extracted</Label>
          {['Confirm telemetry scope with Arrowsphere','Get legal sign-off on novation terms','Resolve EMEA segmentation question'].map((a) =>
            <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', fontFamily: window.FONT, fontSize: 13.5, color: t.t1 }}>
              <span style={{ width: 14, height: 14, border: '1.5px solid ' + t.t3, borderRadius: 4 }}></span>{a}</div>)}
          <div style={{ display: 'flex', gap: 9, marginTop: 16 }}>
            <window.Btn kind="primary" icon="folder" onClick={() => go({ screen: 'note', id: 'csp-align' })}>Save to Citrix CSP</window.Btn>
            <window.Btn kind="ghost">Discard</window.Btn>
          </div>
        </div>
      </div>}
    </>}
  </div>;
}

window.LibraryScreen = LibraryScreen;
window.InboxScreen = InboxScreen;
window.CaptureScreen = CaptureScreen;

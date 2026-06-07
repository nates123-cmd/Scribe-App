// scribe-screens-2a.jsx — Note editor (note + meeting variants).

function NoteScreen() {
  const { t, go, Icon, Label, Tag, KIND, Person, Stepper } = window.bind();
  const { route } = window.useScribe();
  const n = window.noteById(route.id) || window.NOTES[0];
  const [railOpen, setRailOpen] = React.useState(false);
  const [rawOpen, setRawOpen] = React.useState(false);
  const isMeeting = n.kind === 'meeting';
  const proj = window.projectName(n.project);
  const area = n.area && (window.AREAS.find((a) => a.id === n.area) || {}).name;

  const claudeActions = [
    ['list', 'Summarize'], ['checkbox', 'Extract action items'], ['tag', 'Suggest tags'],
    ['pencil', 'Rewrite'], ['file-export', 'Compose deliverable'],
  ];

  const relatedRow = (r, i) => <div key={i} onClick={() => { const m = window.NOTES.find((x) => x.title === r.title); if (m) go({ screen: 'note', id: m.id }); }}
    style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 4px', borderBottom: '1px solid ' + t.line, cursor: 'pointer', borderRadius: 6 }}
    onMouseEnter={(e) => e.currentTarget.style.background = t.sel} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
    <Icon n={(KIND[r.kind] || KIND.note).icon} s={15} c={t.t3} style={{ marginTop: 2 }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: window.FONT, fontSize: 13, fontWeight: 600, color: t.t1, lineHeight: 1.35 }}>{r.title}</div>
      <div style={{ fontFamily: window.FONT, fontSize: 10.5, color: t.t3, marginTop: 3 }}>{r.reason}</div>
    </div></div>;

  const renderBody = (blocks) => blocks.map((b, i) => {
    if (b.p) return <p key={i} style={{ margin: '0 0 15px' }}>{b.p}</p>;
    if (b.ul) return <ul key={i} style={{ margin: '0 0 15px', paddingLeft: 20 }}>{b.ul.map((li, j) => <li key={j} style={{ marginBottom: 6 }}>{li}</li>)}</ul>;
    if (b.links) return <p key={i} style={{ margin: 0 }}>See also {b.links.map((l, j) => <React.Fragment key={j}>
      <span onClick={() => { const m = window.NOTES.find((x) => x.title === l); if (m) go({ screen: 'note', id: m.id }); }}
        style={{ color: t.t1, textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: t.accentLine, cursor: 'pointer' }}>[[{l}]]</span>
      {j < b.links.length - 1 ? ' and ' : '.'}</React.Fragment>)}</p>;
    return null;
  });

  return <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
    {/* main reading column */}
    <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '30px 40px 70px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={() => go(proj ? { screen: 'project', id: n.project } : { screen: 'library' })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: window.FONT, fontSize: 11.5, color: t.t3, background: 'transparent', border: 0, cursor: 'pointer' }}>
            <Icon n="chevron-left" s={13} />{['Work', area, proj].filter(Boolean).join(' · ') || 'Library'}</button>
          <button onClick={() => setRailOpen((o) => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
            fontFamily: window.FONT, fontSize: 12.5, fontWeight: 600, color: railOpen ? t.t1 : t.t2, background: railOpen ? t.sel : 'transparent',
            border: '1px solid ' + (railOpen ? 'transparent' : t.line2), borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
            <Icon n="sparkles" s={14} />Claude</button>
        </div>

        <h1 style={{ fontFamily: window.FONT, fontSize: 30, fontWeight: 700, color: t.t1, letterSpacing: '-0.025em', lineHeight: 1.12, margin: 0 }}>{n.title}</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '14px 0 0' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: window.FONT, fontSize: 11.5, color: t.t2 }}>
            <Icon n={KIND[n.kind].icon} s={14} c={t.t2} />{KIND[n.kind].label}</span>
          <span style={{ fontFamily: window.FONT, fontSize: 11.5, color: t.t3 }}>{n.date}</span>
          {n.people.length > 0 && <><span style={{ color: t.t3 }}>·</span>{n.people.map((p) => <Person key={p}>{p}</Person>)}</>}
        </div>

        {n.projects && n.projects.length > 1 && <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', margin: '11px 0 0' }}>
          <span style={{ fontFamily: window.FONT, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.t3 }}>Spans</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: window.FONT, fontSize: 11, color: t.t2 }}><Icon n="stack-2" s={13} c={t.t3} />homed in {window.areaName(n.area)}</span>
          <span style={{ color: t.t3 }}>·</span>
          {n.projects.map((pj) => <span key={pj} onClick={() => go({ screen: 'project', id: pj })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: window.FONT, fontSize: 11, fontWeight: 600, color: t.t1, background: t.tagBg, borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>
            <Icon n="folder" s={11} c={t.t2} />{window.projectName(pj)}</span>)}
        </div>}

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', margin: '11px 0 22px' }}>
          {isMeeting && <><Stepper steps={['Raw', 'Ready', 'Indexed']} current={n.status} />
            <span style={{ width: 1, height: 12, background: t.line2 }}></span></>}
          <span style={{ display: 'flex', gap: 6 }}>{n.tags.map((tg) => <Tag key={tg}>{tg}</Tag>)}</span>
        </div>

        {n.summary && <div style={{ background: t.accentBg, border: '1px solid ' + t.accentLine, borderRadius: 12, padding: '14px 16px', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><Icon n="sparkles" s={12} c={t.t1} /><Label>Summary</Label></div>
          <div style={{ fontFamily: window.FONT, fontSize: 14.5, color: t.t1, lineHeight: 1.6 }}>{n.summary}</div>
        </div>}

        {isMeeting && n.actions && <>
          <Label style={{ marginBottom: 8 }}>Open action items · rolled up</Label>
          <div style={{ marginBottom: 24 }}>{n.actions.map((a, i) =>
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '10px 6px', borderBottom: '1px solid ' + t.line }}>
              <span style={{ width: 15, height: 15, border: '1.5px solid ' + t.t3, borderRadius: 4, flex: 'none', marginTop: 2 }}></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: window.FONT, fontSize: 13.5, color: t.t1, lineHeight: 1.4 }}>{a.text}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: window.FONT, fontSize: 10.5, color: t.t3, marginTop: 3 }}>
                  <span>{a.src} · {a.owner}</span>
                  {a.project && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 600, color: t.t1, background: t.tagBg, borderRadius: 5, padding: '1px 6px' }}>
                    <Icon n="arrow-right" s={10} c={t.t2} />{window.projectName(a.project)}</span>}
                </div>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: window.FONT, fontSize: 10.5, fontWeight: 600, color: t.t1, whiteSpace: 'nowrap', marginTop: 2, cursor: 'pointer' }}>
                <Icon n="plus" s={12} />Course</span>
            </div>)}</div>
        </>}

        <Label style={{ marginBottom: 10 }}>Notes</Label>
        <div style={{ fontFamily: window.FONT, fontSize: 15, color: t.t1, lineHeight: 1.75 }}>{renderBody(n.body || [])}</div>

        {isMeeting && <div onClick={() => setRawOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 22,
          padding: '11px 13px', border: '1px solid ' + t.line, borderRadius: 10, background: t.card, cursor: 'pointer' }}>
          <Icon n={rawOpen ? 'chevron-down' : 'chevron-right'} s={14} c={t.t3} />
          <span style={{ fontFamily: window.FONT, fontSize: 11.5, fontWeight: 600, color: t.t2 }}>Raw transcript</span>
          <span style={{ fontFamily: window.FONT, fontSize: 10.5, color: t.t3 }}>{n.rawWords} words · source material</span>
        </div>}
        {isMeeting && rawOpen && <div style={{ fontFamily: window.FONT, fontSize: 13, color: t.t2, lineHeight: 1.7, padding: '14px 13px 0', whiteSpace: 'pre-wrap' }}>
          [00:02] Jon: Let's start with sequencing… we can't land pricing tiers until legal closes novation.{'\n'}[00:14] You: Agreed — I'll confirm telemetry scope with Arrowsphere by Thursday.{'\n'}[00:31] Haritha: EMEA segmentation is still open on my side…</div>}
      </div>
    </div>

    {/* related panel (always) */}
    <div style={{ width: 252, flex: 'none', borderLeft: '1px solid ' + t.line, background: t.panel, padding: '24px 16px', overflowY: 'auto' }}>
      <Label style={{ marginBottom: 8 }}>Related · derived</Label>
      {(n.related || []).length === 0 && <div style={{ fontFamily: window.FONT, fontSize: 12, color: t.t3 }}>No neighbors yet.</div>}
      {(n.related || []).map(relatedRow)}
      {isMeeting && n.terms && <div style={{ marginTop: 22 }}>
        <Label style={{ marginBottom: 8 }}>People & terms</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {n.people.map((p) => <Person key={p}>{p}</Person>)}
          {n.terms.map((tm) => <Tag key={tm}>{tm}</Tag>)}
        </div>
      </div>}
    </div>

    {/* Claude actions rail — slides in on demand */}
    {railOpen && <div style={{ width: 232, flex: 'none', borderLeft: '1px solid ' + t.line, background: t.card, padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Icon n="sparkles" s={14} c={t.t1} /><Label>Claude</Label></span>
        <Icon n="x" s={15} c={t.t3} style={{ cursor: 'pointer' }} onClick={() => setRailOpen(false)} />
      </div>
      {claudeActions.map(([ic, lb], i) => <div key={i}
        onClick={() => { if (lb === 'Compose deliverable') go({ screen: 'compose', noteId: n.id }); }}
        onMouseEnter={(e) => e.currentTarget.style.background = t.sel} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: window.FONT, fontSize: 12.5, fontWeight: 500, color: t.t2, padding: '9px 10px', borderRadius: 8, cursor: 'pointer' }}>
        <Icon n={ic} s={15} c={t.t1} />{lb}</div>)}
    </div>}
  </div>;
}

window.NoteScreen = NoteScreen;

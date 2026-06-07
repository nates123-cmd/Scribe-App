// Project / Area dashboard (auto-composed). Ported 1:1 from the prototype's
// scribe-screens-2b.jsx -> ProjectScreen. Briefing is a setTimeout fake (wire to
// claudeComplete later) and MUST NOT auto-run.
import { useState } from 'react'
import { useScribe } from '../ScribeCtx'
import { t, FONT } from '../theme/tokens'
import { Icon, Label, Btn, StatusPill, KIND } from '../kit'
import { projectName, areaOfProject, areaName, ownedNotes, linkedMeetings, actionsForProject, BRIEFINGS } from '../data'

export function ProjectScreen() {
  const { route, go } = useScribe()
  const pid = route.id || 'csp'
  const pname = projectName(pid) || 'Project'
  const area = areaOfProject(pid)
  const proj = area && area.projects.find((p) => p.id === pid)
  const owned = ownedNotes(pid)
  const linked = linkedMeetings(pid)
  const meetings = [
    ...owned.filter((n) => n.kind === 'meeting').map((m) => ({ m, linked: false })),
    ...linked.map((m) => ({ m, linked: true })),
  ]
  const refs = owned.filter((n) => n.kind === 'note' || n.kind === 'knowledge' || n.kind === 'brainstorm')
  const artifacts = owned.filter((n) => n.kind === 'artifact')

  const [briefing, setBriefing] = useState(pid === 'csp' ? 'ready' : 'idle') // idle | running | ready
  const [askQ, setAskQ] = useState('')
  const runBrief = () => { setBriefing('running'); setTimeout(() => setBriefing('ready'), 1100) }

  // roll up open action items BY ASSIGNMENT (includes items routed here from
  // meetings that are homed in the area, e.g. a cross-project weekly).
  const actions = actionsForProject(pid)

  const sectionLabel = (txt) => <Label style={{ marginBottom: 9, marginTop: 4 }}>{txt}</Label>

  return <div>
    {/* scoped Ask bar */}
    <div style={{ padding: '20px 40px 0', maxWidth: 760, margin: '0 auto' }}>
      <form onSubmit={(e) => { e.preventDefault(); go({ screen: 'ask', query: askQ, scope: pname }) }}
        style={{ display: 'flex', alignItems: 'center', gap: 9, background: t.card, border: '1px solid ' + t.accentLine,
          borderRadius: 10, padding: '0 13px', height: 40 }}>
        <Icon n="sparkles" s={16} c={t.t1} />
        <input value={askQ} onChange={(e) => setAskQ(e.target.value)} placeholder={'Ask within ' + pname + '…'}
          style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontFamily: FONT, fontSize: 13, color: t.t1 }} />
        <span style={{ fontFamily: FONT, fontSize: 11, color: t.t3 }}>scoped</span>
      </form>
    </div>

    <div style={{ maxWidth: 760, margin: '0 auto', padding: '22px 40px 70px' }}>
      <div style={{ fontFamily: FONT, fontSize: 11.5, color: t.t3, marginBottom: 3 }}>Work · {area ? area.name : ''}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: t.t1, letterSpacing: '-0.02em', margin: 0, whiteSpace: 'nowrap' }}>{pname}</h1>
          {proj && <StatusPill tone="accent">{proj.status}</StatusPill>}
        </div>
        <Btn kind="outline" size="sm" icon={briefing === 'running' ? 'loader-2' : 'refresh'} onClick={runBrief}>
          {briefing === 'ready' ? 'Refresh briefing' : briefing === 'running' ? 'Composing…' : 'Generate briefing'}</Btn>
      </div>
      <div style={{ fontFamily: FONT, fontSize: 11.5, color: t.t3, marginBottom: 20 }}>
        {proj && proj.due ? 'Due ' + proj.due + ' · ' : ''}auto-composed from {owned.length} notes{linked.length ? ' · ' + linked.length + ' linked' : ''}</div>

      {/* briefing */}
      {briefing === 'ready' ? <div style={{ background: t.accentBg, border: '1px solid ' + t.accentLine, borderRadius: 12, padding: '15px 17px', marginBottom: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><Icon n="sparkles" s={12} c={t.t1} /><Label>Briefing</Label></div>
        <div style={{ fontFamily: FONT, fontSize: 14.5, color: t.t1, lineHeight: 1.65 }}>
          {BRIEFINGS[pid] || 'Generate a briefing to see the current picture for this project.'}
        </div>
      </div> : <div style={{ border: '1px dashed ' + t.line2, borderRadius: 12, padding: '18px 17px', marginBottom: 26,
        display: 'flex', alignItems: 'center', gap: 10, color: t.t3, fontFamily: FONT, fontSize: 13 }}>
        <Icon n="sparkles" s={15} c={t.t3} />{briefing === 'running' ? 'Composing briefing from this project’s notes…' : 'No briefing yet — it doesn’t auto-run. Generate one when you need the current picture.'}
      </div>}

      {/* action items rolled up */}
      {actions.length > 0 && <>
        {sectionLabel('Open action items · rolled up by project')}
        <div style={{ marginBottom: 26 }}>{actions.map((a, i) =>
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '11px 6px', borderBottom: '1px solid ' + t.line }}>
            <span style={{ width: 15, height: 15, border: '1.5px solid ' + t.t3, borderRadius: 4, flex: 'none', marginTop: 2 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FONT, fontSize: 13.5, color: t.t1, lineHeight: 1.4 }}>{a.text}</div>
              <div onClick={() => go({ screen: 'note', id: a.mid })} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: FONT, fontSize: 10.5, color: t.t3, marginTop: 3, cursor: 'pointer' }}>
                {a.linked && <Icon n="link" s={11} c={t.t3} />}{a.meeting} · {a.owner}</div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT, fontSize: 10.5, fontWeight: 600, color: t.t1, whiteSpace: 'nowrap', marginTop: 2, cursor: 'pointer' }}>
              <Icon n="plus" s={12} />Course</span>
          </div>)}</div>
      </>}

      {/* meetings */}
      {meetings.length > 0 && <>
        {sectionLabel('Meetings')}
        <div style={{ marginBottom: 26 }}>{meetings.map(({ m, linked: lk }) =>
          <div key={m.id} onClick={() => go({ screen: 'note', id: m.id })}
            onMouseEnter={(e) => (e.currentTarget.style.background = t.sel)} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 8px', borderBottom: '1px solid ' + t.line, cursor: 'pointer', borderRadius: 7 }}>
            <Icon n={lk ? 'link' : 'users'} s={16} c={t.t3} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: t.t1, lineHeight: 1.3, whiteSpace: 'nowrap' }}>{m.title}</span>
                {lk && <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: t.t2, background: t.tagBg, borderRadius: 6, padding: '1px 7px', flex: 'none' }}>linked</span>}</div>
              <div style={{ fontFamily: FONT, fontSize: 11, color: t.t3, marginTop: 2 }}>
                {lk ? m.date + ' · homed in ' + areaName(m.area) + ' · mentions ' + pname : m.date + ' · ' + m.people.join(', ')}</div>
            </div>
            <Icon n="arrow-up-right" s={14} c={t.t3} />
          </div>)}</div>
      </>}

      {/* notes & knowledge */}
      {refs.length > 0 && <>
        {sectionLabel('Notes & knowledge')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 26 }}>{refs.map((r) =>
          <div key={r.id} onClick={() => go({ screen: 'note', id: r.id })}
            style={{ border: '1px solid ' + t.line, borderRadius: 11, padding: '13px 15px', cursor: 'pointer', background: t.card }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = t.accent)} onMouseLeave={(e) => (e.currentTarget.style.borderColor = t.line)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <Icon n={KIND[r.kind].icon} s={14} c={t.t3} /><span style={{ fontFamily: FONT, fontSize: 10.5, color: t.t3 }}>{KIND[r.kind].label}</span></div>
            <div style={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 600, color: t.t1, lineHeight: 1.3 }}>{r.title}</div>
          </div>)}</div>
      </>}

      {/* deliverables */}
      {sectionLabel('Deliverables')}
      {artifacts.length > 0 ? <div>
        {artifacts.map((d) => <div key={d.id} onClick={() => go({ screen: 'note', id: d.id })}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = t.accent)} onMouseLeave={(e) => (e.currentTarget.style.borderColor = t.line)}
          style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', border: '1px solid ' + t.line, borderRadius: 11, marginBottom: 9, cursor: 'pointer', background: t.card }}>
          <Icon n="file-export" s={16} c={t.t1} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 600, color: t.t1 }}>{d.title}</div>
            <div style={{ fontFamily: FONT, fontSize: 11, color: t.t3, marginTop: 2 }}>Artifact · {d.date}</div>
          </div>
          <Icon n="arrow-up-right" s={14} c={t.t3} />
        </div>)}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <Btn kind="ghost" size="sm" icon="file-export" onClick={() => go({ screen: 'compose', projectId: pid })}>Compose another</Btn></div>
      </div> : <div style={{ border: '1px dashed ' + t.line2, borderRadius: 12, padding: '16px 17px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontFamily: FONT, fontSize: 13, color: t.t3 }}>Nothing composed yet.</span>
        <Btn kind="outline" size="sm" icon="file-export" onClick={() => go({ screen: 'compose', projectId: pid })}>Compose</Btn>
      </div>}
    </div>
  </div>
}

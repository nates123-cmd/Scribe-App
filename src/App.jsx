import { useEffect, useMemo, useState } from 'react'
import { ScribeCtx } from './ScribeCtx'
import { t, FONT } from './theme/tokens'
import { Icon } from './kit'
import { AREAS, INBOX, TOPICS } from './data'

import { LibraryScreen } from './screens/Library'
import { InboxScreen } from './screens/Inbox'
import { CaptureScreen } from './screens/Capture'
import { NoteScreen } from './screens/Note'
import { ProjectScreen } from './screens/Project'
import { AskScreen } from './screens/Ask'
import { ComposeScreen } from './screens/Compose'

// ── Sidebar ───────────────────────────────────────────────────────
function Sidebar({ route, go }) {
  const [areas, setAreas] = useState(() => AREAS.map((a) => ({ id: a.id, open: a.open })))
  const isOpen = (id) => (areas.find((a) => a.id === id) || {}).open
  const toggle = (id) => setAreas((xs) => xs.map((a) => (a.id === id ? { ...a, open: !a.open } : a)))
  const inboxCount = INBOX.length

  const navItem = (icon, text, screen, badge) => {
    const active = route.screen === screen
    return <div onClick={() => go({ screen })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: FONT, fontSize: 13, fontWeight: active ? 600 : 500, color: active ? t.t1 : t.t2, cursor: 'pointer',
      background: active ? t.sel : 'transparent', borderRadius: 8, padding: '8px 10px', marginBottom: 1,
      borderLeft: '2px solid ' + (active ? t.accent : 'transparent') }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = t.sel }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Icon n={icon} s={16} c={active ? t.t1 : t.t2} />{text}</span>
      {badge ? <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: t.t1, background: t.accentBg, border: '1px solid ' + t.accentLine, padding: '0px 7px', borderRadius: 10 }}>{badge}</span> : null}
    </div>
  }

  return <div style={{ width: 232, flex: 'none', borderRight: '1px solid ' + t.line, background: t.panel, display: 'flex', flexDirection: 'column', padding: '18px 12px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px 18px' }}>
      <span style={{ fontFamily: FONT, fontSize: 21, fontWeight: 700, color: t.t1, letterSpacing: '-0.02em' }}>scribe</span>
    </div>
    {navItem('stack-2', 'Library', 'library')}
    {navItem('inbox', 'Inbox', 'inbox', inboxCount)}
    {navItem('sparkles', 'Ask', 'ask')}

    <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: t.t3, padding: '20px 10px 8px' }}>Areas</div>
    <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
      {AREAS.map((a) => <div key={a.id}>
        <div onClick={() => toggle(a.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: t.t2, cursor: 'pointer', padding: '6px 10px', borderRadius: 7 }}
          onMouseEnter={(e) => (e.currentTarget.style.background = t.sel)} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
          <Icon n={isOpen(a.id) ? 'chevron-down' : 'chevron-right'} s={13} c={t.t3} />{a.name}</div>
        {isOpen(a.id) && a.projects.map((p) => { const active = route.screen === 'project' && route.id === p.id
          return <div key={p.id} onClick={() => go({ screen: 'project', id: p.id })}
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT, fontSize: 12.5, fontWeight: active ? 600 : 500,
              color: active ? t.t1 : t.t2, cursor: 'pointer', padding: '6px 10px 6px 30px', borderRadius: 7, margin: '1px 0',
              background: active ? t.sel : 'transparent', borderLeft: '2px solid ' + (active ? t.accent : 'transparent') }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = t.sel }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}>
            <Icon n="folder" s={13} c={active ? t.t1 : t.t3} />{p.name}</div> })}
        {isOpen(a.id) && a.projects.length === 0 && <div style={{ fontFamily: FONT, fontSize: 12, color: t.t3, padding: '5px 10px 5px 30px' }}>empty</div>}
      </div>)}
    </div>

    <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: t.t3, padding: '14px 10px 8px' }}>Topics</div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 8px 6px' }}>
      {TOPICS.map((tp) => { const active = route.screen === 'library' && route.tag === tp
        return <span key={tp} onClick={() => go({ screen: 'library', tag: tp })}
          style={{ fontFamily: FONT, fontSize: 11, fontWeight: 500, color: active ? t.onAccent : t.tagText,
            background: active ? t.accent : t.tagBg, borderRadius: 6, padding: '2px 9px', cursor: 'pointer' }}>{tp}</span> })}
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT, fontSize: 10.5, color: t.t3, padding: '12px 10px 0', borderTop: '1px solid ' + t.line }}>
      <Icon n="cloud-check" s={13} c={t.t3} />Mirrored 14m ago</div>
  </div>
}

// ── Top Ask bar ───────────────────────────────────────────────────
function TopBar({ go, theme, setTheme }) {
  const [q, setQ] = useState('')
  return <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderBottom: '1px solid ' + t.line, background: t.bg }}>
    <form onSubmit={(e) => { e.preventDefault(); go({ screen: 'ask', query: q || 'what did Jon say the other day?' }) }}
      style={{ flex: 1, maxWidth: 560, display: 'flex', alignItems: 'center', gap: 9, background: t.card, border: '1px solid ' + t.line2, borderRadius: 9, padding: '0 13px', height: 38 }}
      onFocusCapture={(e) => (e.currentTarget.style.borderColor = t.accent)} onBlurCapture={(e) => (e.currentTarget.style.borderColor = t.line2)}>
      <Icon n="sparkles" s={15} c={t.t1} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask your notes…"
        style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontFamily: FONT, fontSize: 13, color: t.t1 }} />
      <span style={{ fontFamily: FONT, fontSize: 10.5, color: t.t3, border: '1px solid ' + t.line2, borderRadius: 5, padding: '1px 6px' }}>↵</span>
    </form>
    <div style={{ flex: 1 }} />
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: FONT, fontSize: 12, fontWeight: 600, color: t.t2,
        background: 'transparent', border: '1px solid ' + t.line2, borderRadius: 8, padding: '7px 12px', cursor: 'pointer' }}>
      <Icon n={theme === 'dark' ? 'moon' : 'sun'} s={15} />{theme === 'dark' ? 'Dark' : 'Light'}</button>
    <button onClick={() => go({ screen: 'capture' })}
      style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: FONT, fontSize: 13, fontWeight: 600, color: t.onAccent,
        background: t.accent, border: 0, borderRadius: 8, padding: '8px 14px', cursor: 'pointer' }}>
      <Icon n="plus" s={15} />New</button>
  </div>
}

function Screen({ route }) {
  switch (route.screen) {
    case 'library': return <LibraryScreen />
    case 'inbox': return <InboxScreen />
    case 'capture': return <CaptureScreen />
    case 'note': return <NoteScreen />
    case 'project': return <ProjectScreen />
    case 'ask': return <AskScreen />
    case 'compose': return <ComposeScreen />
    default: return <LibraryScreen />
  }
}

export default function App() {
  const [theme, setThemeRaw] = useState(() => localStorage.getItem('scribe-theme') || 'light')
  const [route, setRoute] = useState(() => {
    try { return JSON.parse(localStorage.getItem('scribe-route')) || { screen: 'library' } } catch { return { screen: 'library' } }
  })

  const setTheme = (v) => { setThemeRaw(v); localStorage.setItem('scribe-theme', v) }
  const go = (r) => { setRoute(r); localStorage.setItem('scribe-route', JSON.stringify(r))
    const scroller = document.getElementById('scribe-scroll'); if (scroller) scroller.scrollTop = 0 }

  // Theme drives a [data-theme] attribute on <html>; CSS variables do the rest.
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme) }, [theme])

  const ctx = useMemo(() => ({ t, theme, setTheme, route, go }), [theme, route])
  const isNote = route.screen === 'note'

  return <ScribeCtx.Provider value={ctx}>
    <div style={{ display: 'flex', height: '100vh', background: t.bg, color: t.t1, fontFamily: FONT }}>
      <Sidebar route={route} go={go} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <TopBar go={go} theme={theme} setTheme={setTheme} />
        {isNote
          ? <div style={{ flex: 1, minHeight: 0 }}><Screen route={route} /></div>
          : <div id="scribe-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}><Screen route={route} /></div>}
      </div>
    </div>
  </ScribeCtx.Provider>
}

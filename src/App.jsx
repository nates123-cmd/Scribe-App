import { useEffect, useMemo, useState } from 'react'
import { ScribeCtx, useIsMobile } from './ScribeCtx'
import { useData } from './DataContext'
import { t, FONT } from './theme/tokens'
import { Icon } from './kit'
import { TOPICS } from './data'
import { createArea, createProject, updateArea, deleteArea, reorderAreas } from './lib/db'

import { LibraryScreen } from './screens/Library'
import { InboxScreen } from './screens/Inbox'
import { CaptureScreen } from './screens/Capture'
import { NoteScreen } from './screens/Note'
import { ProjectScreen } from './screens/Project'
import { AskScreen } from './screens/Ask'
import { ComposeScreen } from './screens/Compose'

// ── Sidebar (desktop column + mobile drawer body) ─────────────────
function Sidebar({ route, go }) {
  const { areas, inbox, reload } = useData()
  const [openOverride, setOpenOverride] = useState({})
  const [orderIds, setOrderIds] = useState(null) // local drag order until reload re-sorts
  const [dragId, setDragId] = useState(null)
  const [overId, setOverId] = useState(null)
  const isOpen = (a) => openOverride[a.id] ?? a.open
  const toggle = (id) => setOpenOverride((o) => ({ ...o, [id]: !(o[id] ?? (areas.find((a) => a.id === id) || {}).open) }))
  const inboxCount = inbox.length

  // Displayed area order: local drag override (if any) else server order.
  const ordered = orderIds
    ? [...orderIds.map((id) => areas.find((a) => a.id === id)).filter(Boolean),
       ...areas.filter((a) => !orderIds.includes(a.id))]
    : areas

  const addArea = async () => {
    const name = (window.prompt('New area name') || '').trim()
    if (!name) return
    try { await createArea(name, areas.length); await reload() } catch (e) { window.alert('Could not add area: ' + (e?.message || e)) }
  }
  const renameArea = async (a) => {
    const name = (window.prompt('Rename area', a.name) || '').trim()
    if (!name || name === a.name) return
    try { await updateArea(a.id, { name }); await reload() } catch (e) { window.alert('Could not rename area: ' + (e?.message || e)) }
  }
  const removeArea = async (a) => {
    if (a.projects.length) { window.alert('Move or delete its ' + a.projects.length + ' project(s) first.'); return }
    if (!window.confirm('Delete area “' + a.name + '”?')) return
    try { await deleteArea(a.id); await reload() } catch (e) { window.alert('Could not delete area: ' + (e?.message || e)) }
  }
  const dropOn = async (targetId) => {
    const src = dragId; setDragId(null); setOverId(null)
    if (!src || src === targetId) return
    const ids = ordered.map((a) => a.id)
    const from = ids.indexOf(src); const to = ids.indexOf(targetId)
    if (from < 0 || to < 0) return
    ids.splice(to, 0, ids.splice(from, 1)[0])
    setOrderIds(ids)
    try { await reorderAreas(ids); await reload(); setOrderIds(null) }
    catch (e) { window.alert('Could not reorder: ' + (e?.message || e)); setOrderIds(null) }
  }
  const addProject = async (a) => {
    const name = (window.prompt('New project in ' + a.name) || '').trim()
    if (!name) return
    try { await createProject(a.id, name, a.projects.length); await reload(); setOpenOverride((o) => ({ ...o, [a.id]: true })) } catch (e) { window.alert('Could not add project: ' + (e?.message || e)) }
  }

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

  return <div style={{ width: 232, flex: 'none', borderRight: '1px solid ' + t.line, background: t.panel, display: 'flex', flexDirection: 'column', padding: '18px 12px', height: '100%' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px 18px' }}>
      <span style={{ fontFamily: FONT, fontSize: 21, fontWeight: 700, color: t.t1, letterSpacing: '-0.02em' }}>scribe</span>
    </div>
    {navItem('stack-2', 'Library', 'library')}
    {navItem('inbox', 'Inbox', 'inbox', inboxCount)}
    {navItem('sparkles', 'Ask', 'ask')}

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 10px 8px' }}>
      <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: t.t3 }}>Areas</span>
      <span title="Add area" onClick={addArea} style={{ display: 'inline-flex', color: t.t3, cursor: 'pointer' }}><Icon n="plus" s={13} /></span>
    </div>
    <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
      {ordered.map((a) => <div key={a.id}
        draggable onDragStart={() => setDragId(a.id)} onDragEnd={() => { setDragId(null); setOverId(null) }}
        onDragOver={(e) => { e.preventDefault(); if (overId !== a.id) setOverId(a.id) }}
        onDrop={(e) => { e.preventDefault(); dropOn(a.id) }}
        style={{ opacity: dragId === a.id ? 0.4 : 1, borderTop: '2px solid ' + (overId === a.id && dragId && dragId !== a.id ? t.accent : 'transparent') }}>
        <div onClick={() => toggle(a.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: t.t2, cursor: 'pointer', padding: '6px 10px', borderRadius: 7 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = t.sel; const g = e.currentTarget.querySelector('[data-area-actions]'); if (g) g.style.opacity = 1 }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; const g = e.currentTarget.querySelector('[data-area-actions]'); if (g) g.style.opacity = 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <Icon n="grip-vertical" s={12} c={t.t3} style={{ cursor: 'grab', flex: 'none' }} />
            <Icon n={isOpen(a) ? 'chevron-down' : 'chevron-right'} s={13} c={t.t3} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span></span>
          <span data-area-actions style={{ display: 'inline-flex', alignItems: 'center', gap: 2, opacity: 0, transition: 'opacity .12s', flex: 'none' }}>
            <span title="Rename area" onClick={(e) => { e.stopPropagation(); renameArea(a) }} style={{ display: 'inline-flex', color: t.t3, padding: 2 }}><Icon n="pencil" s={12} /></span>
            <span title="Delete area" onClick={(e) => { e.stopPropagation(); removeArea(a) }} style={{ display: 'inline-flex', color: t.t3, padding: 2 }}><Icon n="trash" s={12} /></span>
            <span title="Add project" onClick={(e) => { e.stopPropagation(); addProject(a) }} style={{ display: 'inline-flex', color: t.t3, padding: 2 }}><Icon n="plus" s={12} /></span>
          </span></div>
        {isOpen(a) && a.projects.map((p) => { const active = route.screen === 'project' && route.id === p.id
          return <div key={p.id} onClick={() => go({ screen: 'project', id: p.id })}
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT, fontSize: 12.5, fontWeight: active ? 600 : 500,
              color: active ? t.t1 : t.t2, cursor: 'pointer', padding: '6px 10px 6px 30px', borderRadius: 7, margin: '1px 0',
              background: active ? t.sel : 'transparent', borderLeft: '2px solid ' + (active ? t.accent : 'transparent') }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = t.sel }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}>
            <Icon n="folder" s={13} c={active ? t.t1 : t.t3} />{p.name}</div> })}
        {isOpen(a) && a.projects.length === 0 && <div style={{ fontFamily: FONT, fontSize: 12, color: t.t3, padding: '5px 10px 5px 30px' }}>empty</div>}
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

// ── Desktop top Ask bar ───────────────────────────────────────────
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

// ── Mobile header + bottom tab bar ────────────────────────────────
function MobileHeader({ go, theme, setTheme, onMenu }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: '1px solid ' + t.line, background: t.bg }}>
    <button onClick={onMenu} style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: 0, color: t.t1, cursor: 'pointer', padding: 4 }}>
      <Icon n="menu-2" s={22} /></button>
    <span style={{ fontFamily: FONT, fontSize: 19, fontWeight: 700, color: t.t1, letterSpacing: '-0.02em' }}>scribe</span>
    <div style={{ flex: 1 }} />
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ display: 'flex', background: 'transparent', border: 0, color: t.t2, cursor: 'pointer', padding: 6 }}>
      <Icon n={theme === 'dark' ? 'moon' : 'sun'} s={19} /></button>
    <button onClick={() => go({ screen: 'capture' })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, background: t.accent, color: t.onAccent, border: 0, borderRadius: 9, cursor: 'pointer' }}>
      <Icon n="plus" s={18} /></button>
  </div>
}

function BottomTabs({ route, go }) {
  const { inbox } = useData()
  const tabs = [['library', 'stack-2', 'Library'], ['inbox', 'inbox', 'Inbox'], ['ask', 'sparkles', 'Ask']]
  return <div style={{ display: 'flex', borderTop: '1px solid ' + t.line, background: t.panel, height: 56, flex: 'none' }}>
    {tabs.map(([screen, icon, label]) => {
      const active = route.screen === screen
      return <button key={screen} onClick={() => go({ screen })}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
          background: 'transparent', border: 0, cursor: 'pointer', color: active ? t.t1 : t.t3, position: 'relative' }}>
        <Icon n={icon} s={20} c={active ? t.t1 : t.t3} />
        <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600 }}>{label}</span>
        {screen === 'inbox' && inbox.length > 0 && <span style={{ position: 'absolute', top: 6, right: '50%', marginRight: -18, fontFamily: FONT, fontSize: 9, fontWeight: 700, color: t.onAccent, background: t.accent, borderRadius: 8, padding: '0 5px' }}>{inbox.length}</span>}
      </button>
    })}
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

function FullScreenMsg({ children, spin }) {
  return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    background: t.bg, color: t.t2, fontFamily: FONT, fontSize: 14 }}>
    {spin && <Icon n="loader-2" s={18} c={t.t1} />}{children}</div>
}

export default function App() {
  const { status, error, reload } = useData()
  const mobile = useIsMobile()
  const [drawer, setDrawer] = useState(false)
  const [theme, setThemeRaw] = useState(() => localStorage.getItem('scribe-theme') || 'light')
  const [route, setRoute] = useState(() => {
    try { return JSON.parse(localStorage.getItem('scribe-route')) || { screen: 'library' } } catch { return { screen: 'library' } }
  })

  const setTheme = (v) => { setThemeRaw(v); localStorage.setItem('scribe-theme', v) }
  const go = (r) => { setRoute(r); localStorage.setItem('scribe-route', JSON.stringify(r)); setDrawer(false)
    const scroller = document.getElementById('scribe-scroll'); if (scroller) scroller.scrollTop = 0 }

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme) }, [theme])

  const ctx = useMemo(() => ({ t, theme, setTheme, route, go, mobile }), [theme, route, mobile])
  const isNote = route.screen === 'note'

  if (status === 'loading') return <FullScreenMsg spin>Loading your notes…</FullScreenMsg>
  if (status === 'error') return <FullScreenMsg>
    Couldn’t load — {String(error?.message || error)}.&nbsp;
    <span onClick={reload} style={{ color: t.t1, textDecoration: 'underline', cursor: 'pointer' }}>retry</span>
  </FullScreenMsg>

  // ── Mobile shell ──
  if (mobile) {
    return <ScribeCtx.Provider value={ctx}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: t.bg, color: t.t1, fontFamily: FONT }}>
        <MobileHeader go={go} theme={theme} setTheme={setTheme} onMenu={() => setDrawer(true)} />
        <div id="scribe-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}><Screen route={route} /></div>
        <BottomTabs route={route} go={go} />
      </div>
      {drawer && <div onClick={() => setDrawer(false)}
        style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.35)', display: 'flex' }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: 264, maxWidth: '82%', height: '100%', boxShadow: t.shadow }}>
          <Sidebar route={route} go={go} />
        </div>
      </div>}
    </ScribeCtx.Provider>
  }

  // ── Desktop shell ──
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

// Primitives — Icon (Tabler webfont), kind badges, atoms. Ported from the
// prototype's scribe-kit.jsx. Styles are inline against the token var-map `t`.
import { Fragment } from 'react'
import { t, FONT } from './theme/tokens'

export function Icon({ n, s = 16, c, style }) {
  return <i className={'ti ti-' + n} style={{ fontSize: s, color: c || 'inherit', lineHeight: 1, display: 'inline-flex', ...style }} />
}

export const KIND = {
  note:       { icon: 'file-text',   label: 'Note' },
  meeting:    { icon: 'users',       label: 'Meeting' },
  knowledge:  { icon: 'bulb',        label: 'Knowledge' },
  brainstorm: { icon: 'bolt',        label: 'Brainstorm' },
  artifact:   { icon: 'file-export', label: 'Artifact' },
}

export function Label({ children, style }) {
  return <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, letterSpacing: '0.09em',
    textTransform: 'uppercase', color: t.t3, ...style }}>{children}</div>
}

export function Tag({ children, onClick, active }) {
  return <span onClick={onClick} style={{ fontFamily: FONT, fontSize: 11.5, fontWeight: 500,
    color: active ? t.onAccent : t.tagText, background: active ? t.accent : t.tagBg,
    borderRadius: 6, padding: '2px 9px', whiteSpace: 'nowrap', cursor: onClick ? 'pointer' : 'default' }}>{children}</span>
}

export function Person({ children }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FONT, fontSize: 11.5,
    fontWeight: 600, color: t.t1, background: t.accentBg, border: '1px solid ' + t.accentLine,
    borderRadius: 20, padding: '2px 10px', whiteSpace: 'nowrap' }}>
    <Icon n="user" s={11} c={t.t2} />{children}</span>
}

export function KindBadge({ kind, withLabel = true }) {
  const k = KIND[kind] || KIND.note
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 11.5,
    fontWeight: 500, color: t.t2 }}><Icon n={k.icon} s={14} c={t.t2} />{withLabel && k.label}</span>
}

export function Btn({ children, icon, kind = 'ghost', onClick, size = 'md', style, type }) {
  const pad = size === 'sm' ? '6px 11px' : '8px 14px'
  const fs = size === 'sm' ? 12 : 13
  const base = { display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONT, fontSize: fs,
    fontWeight: 600, borderRadius: 8, padding: pad, cursor: 'pointer', whiteSpace: 'nowrap',
    transition: 'background .14s, border-color .14s, color .14s', border: '1px solid transparent', ...style }
  const skin = kind === 'primary'
    ? { background: t.accent, color: t.onAccent }
    : kind === 'outline'
    ? { background: 'transparent', color: t.t1, borderColor: t.line2 }
    : { background: 'transparent', color: t.t2 }
  return <button type={type} onClick={onClick} style={{ ...base, ...skin }}
    onMouseEnter={(e) => { if (kind === 'ghost') e.currentTarget.style.background = t.sel
      if (kind === 'outline') e.currentTarget.style.borderColor = t.accent }}
    onMouseLeave={(e) => { if (kind === 'ghost') e.currentTarget.style.background = 'transparent'
      if (kind === 'outline') e.currentTarget.style.borderColor = t.line2 }}>
    {icon && <Icon n={icon} s={fs + 2} />}{children}</button>
}

export function Stepper({ steps, current }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
    {steps.map((s, i) => <Fragment key={s}>
      {i > 0 && <Icon n="chevron-right" s={11} c={t.t3} />}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FONT, fontSize: 11,
        fontWeight: 600, color: i === current ? t.t1 : t.t3 }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: i <= current ? t.accent : t.t3,
          opacity: i <= current ? 1 : 0.45 }} />{s}</span>
    </Fragment>)}
  </span>
}

export function StatusPill({ children, tone = 'neutral' }) {
  const skin = tone === 'accent'
    ? { color: t.t1, background: t.accentBg, borderColor: t.accentLine }
    : { color: t.t2, background: t.tagBg, borderColor: 'transparent' }
  return <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, borderRadius: 20,
    border: '1px solid', padding: '2px 10px', ...skin }}>{children}</span>
}

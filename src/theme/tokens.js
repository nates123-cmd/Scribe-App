// Token system — single set drives both light and dark via CSS variables
// (see styles.css). Components reference `t.bg` etc., which resolve to
// `var(--bg)`; theme switches by toggling the [data-theme] attribute on <html>,
// so no React re-render of every styled node is needed.
//
// Source of truth for hex values: tk(theme) in the prototype's scribe-kit.jsx.
export const FONT = "'Hanken Grotesk', sans-serif"

const v = (name) => `var(--${name})`

export const t = {
  bg: v('bg'), panel: v('panel'), card: v('card'), raise: v('raise'),
  line: v('line'), line2: v('line2'),
  t1: v('t1'), t2: v('t2'), t3: v('t3'),
  accent: v('accent'), onAccent: v('onAccent'),
  accentBg: v('accentBg'), accentLine: v('accentLine'),
  sel: v('sel'), tagBg: v('tagBg'), tagText: v('tagText'),
  shadow: v('shadow'),
}

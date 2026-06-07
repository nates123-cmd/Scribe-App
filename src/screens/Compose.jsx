// STUB — autonomous build replaces this with the full port. See BUILD.md.
import { useScribe } from '../ScribeCtx'
import { t, FONT } from '../theme/tokens'
import { Icon } from '../kit'

export function ComposeScreen() {
  const { go } = useScribe()
  return <div style={{ padding: '28px 40px 60px', maxWidth: 760, margin: '0 auto' }}>
    <h1 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: t.t1, letterSpacing: '-0.02em', margin: '0 0 6px' }}>Compose</h1>
    <div style={{ fontFamily: FONT, fontSize: 13, color: t.t3, marginBottom: 24 }}>Screen not built yet.</div>
    <div style={{ border: '1px dashed ' + t.line2, borderRadius: 12, padding: '18px 17px',
      display: 'flex', alignItems: 'center', gap: 10, color: t.t3, fontFamily: FONT, fontSize: 13 }}>
      <Icon n="sparkles" s={15} c={t.t3} />Port from prototype: scribe-screens-3.jsx → ComposeScreen
    </div>
  </div>
}

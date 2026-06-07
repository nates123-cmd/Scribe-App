// scribe-kit.jsx — locked graphite system, theme + nav context, primitives, data.
// Direction B: Hanken Grotesk, cool-neutral graphite base, inky monochrome accent.
// Everything here is exported on window so the screen files (separate Babel
// scopes) can read it. Components read theme via useScribe() at render time.

// ── Token system ────────────────────────────────────────────────
function tk(theme) {
  if (theme === 'dark') return {
    bg:'#121517', panel:'#171b1e', card:'#1a1e22', raise:'#1f242a',
    line:'#262b30', line2:'#333a40',
    t1:'#e4e8eb', t2:'#8b949d', t3:'#5c656d',
    accent:'#c7ced4', onAccent:'#121517',
    accentBg:'rgba(199,206,212,0.10)', accentLine:'rgba(199,206,212,0.22)',
    sel:'#222a30', tagBg:'#232a2f', tagText:'#9fb0bd',
    shadow:'0 1px 2px rgba(0,0,0,.4),0 8px 30px rgba(0,0,0,.35)',
  };
  return {
    bg:'#f4f5f6', panel:'#fbfbfc', card:'#ffffff', raise:'#ffffff',
    line:'#e7e9eb', line2:'#d6dadd',
    t1:'#1b2024', t2:'#5a626a', t3:'#8b939b',
    accent:'#2e3439', onAccent:'#ffffff',
    accentBg:'rgba(46,52,57,0.06)', accentLine:'rgba(46,52,57,0.16)',
    sel:'#e9ebed', tagBg:'#eceef0', tagText:'#4a525a',
    shadow:'0 1px 2px rgba(20,24,28,.05),0 8px 30px rgba(20,24,28,.07)',
  };
}
const FONT = "'Hanken Grotesk', sans-serif";

// ── Context ─────────────────────────────────────────────────────
const ScribeCtx = React.createContext(null);
function useScribe() { return React.useContext(ScribeCtx); }
// Viewport hook — drives the desktop/mobile split. One breakpoint, matchMedia.
function useIsMobile(bp = 760) {
  const q = '(max-width:' + bp + 'px)';
  const [m, setM] = React.useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  React.useEffect(() => {
    const mq = window.matchMedia(q); const on = () => setM(mq.matches); on();
    mq.addEventListener('change', on); return () => mq.removeEventListener('change', on);
  }, [q]);
  return m;
}
// Convenience hook for screen files: context (t, theme, setTheme, route, go)
// merged with the kit primitives so a screen can grab everything in one call.
function bind() {
  const ctx = React.useContext(ScribeCtx);
  return Object.assign({}, ctx, { Icon, Label, Tag, KIND, NOTES: window.NOTES, Btn, Person, KindBadge, Stepper, StatusPill, AREAS: window.AREAS });
}

// ── Icons (Tabler webfont) ──────────────────────────────────────
function Icon({ n, s = 16, c, style }) {
  return <i className={'ti ti-' + n} style={{ fontSize: s, color: c || 'inherit', lineHeight: 1, display: 'inline-flex', ...style }}></i>;
}
const KIND = {
  note:      { icon: 'file-text', label: 'Note' },
  meeting:   { icon: 'users',     label: 'Meeting' },
  knowledge: { icon: 'bulb',      label: 'Knowledge' },
  brainstorm:{ icon: 'bolt',      label: 'Brainstorm' },
  artifact:  { icon: 'file-export', label: 'Artifact' },
};

// ── Atoms ───────────────────────────────────────────────────────
function Label({ children, style }) {
  const { t } = useScribe();
  return <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, letterSpacing: '0.09em',
    textTransform: 'uppercase', color: t.t3, ...style }}>{children}</div>;
}
function Tag({ children, onClick, active }) {
  const { t } = useScribe();
  return <span onClick={onClick} style={{ fontFamily: FONT, fontSize: 11.5, fontWeight: 500,
    color: active ? t.onAccent : t.tagText, background: active ? t.accent : t.tagBg,
    borderRadius: 6, padding: '2px 9px', whiteSpace: 'nowrap', cursor: onClick ? 'pointer' : 'default' }}>{children}</span>;
}
function Person({ children }) {
  const { t } = useScribe();
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FONT, fontSize: 11.5,
    fontWeight: 600, color: t.t1, background: t.accentBg, border: '1px solid ' + t.accentLine,
    borderRadius: 20, padding: '2px 10px', whiteSpace: 'nowrap' }}>
    <Icon n="user" s={11} c={t.t2} />{children}</span>;
}
function KindBadge({ kind, withLabel = true }) {
  const { t } = useScribe(); const k = KIND[kind] || KIND.note;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 11.5,
    fontWeight: 500, color: t.t2 }}><Icon n={k.icon} s={14} c={t.t2} />{withLabel && k.label}</span>;
}
function Btn({ children, icon, kind = 'ghost', onClick, size = 'md', style }) {
  const { t } = useScribe();
  const pad = size === 'sm' ? '6px 11px' : '8px 14px';
  const fs = size === 'sm' ? 12 : 13;
  const base = { display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONT, fontSize: fs,
    fontWeight: 600, borderRadius: 8, padding: pad, cursor: 'pointer', whiteSpace: 'nowrap',
    transition: 'background .14s, border-color .14s, color .14s', border: '1px solid transparent', ...style };
  const skin = kind === 'primary'
    ? { background: t.accent, color: t.onAccent }
    : kind === 'outline'
    ? { background: 'transparent', color: t.t1, borderColor: t.line2 }
    : { background: 'transparent', color: t.t2 };
  return <button onClick={onClick} style={{ ...base, ...skin }}
    onMouseEnter={(e) => { if (kind === 'ghost') e.currentTarget.style.background = t.sel;
      if (kind === 'outline') e.currentTarget.style.borderColor = t.accent; }}
    onMouseLeave={(e) => { if (kind === 'ghost') e.currentTarget.style.background = 'transparent';
      if (kind === 'outline') e.currentTarget.style.borderColor = t.line2; }}>
    {icon && <Icon n={icon} s={fs + 2} />}{children}</button>;
}
function Stepper({ steps, current }) {
  const { t } = useScribe();
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
    {steps.map((s, i) => <React.Fragment key={s}>
      {i > 0 && <Icon n="chevron-right" s={11} c={t.t3} />}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FONT, fontSize: 11,
        fontWeight: 600, color: i === current ? t.t1 : t.t3 }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: i <= current ? t.accent : t.t3,
          opacity: i <= current ? 1 : 0.45 }}></span>{s}</span>
    </React.Fragment>)}
  </span>;
}
function StatusPill({ children, tone = 'neutral' }) {
  const { t } = useScribe();
  const skin = tone === 'accent'
    ? { color: t.t1, background: t.accentBg, borderColor: t.accentLine }
    : { color: t.t2, background: t.tagBg, borderColor: 'transparent' };
  return <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, borderRadius: 20,
    border: '1px solid', padding: '2px 10px', ...skin }}>{children}</span>;
}

// ── Mock data ───────────────────────────────────────────────────
const AREAS = [
  { id:'arrow', name:'Arrow', open:true, projects:[
    { id:'csp', name:'Citrix CSP', status:'Active', due:'Oct 3' },
    { id:'sgs', name:'SGS Tracker', status:'Active' },
    { id:'accenture', name:'Accenture', status:'On hold' },
  ]},
  { id:'sds', name:'Slow Down Sunny', open:true, projects:[
    { id:'maggetti', name:'Maggetti proposal', status:'Sent', due:'Jun 27' },
  ]},
  { id:'brain', name:'Second Brain', open:false, projects:[] },
];

const NOTES = [
  { id:'csp-align', kind:'meeting', title:'Commercial Alignment — CSP', project:'csp', area:'arrow',
    people:['Jon','Haritha'], tags:['commercial','pricing','novation'], date:'Jun 4, 2026', updated:'2h',
    indexed:true, status:2, rawWords:'4,210',
    summary:"Novation is the critical path — legal sign-off blocks the pricing tiers. Jon owns pushing legal; telemetry scope and EMEA segmentation remain open. Next checkpoint is Thursday's Arrowsphere call.",
    terms:['Arrowsphere','novation','EMEA','telemetry'],
    actions:[
      { text:'Confirm telemetry scope with Arrowsphere', src:'this meeting', owner:'you · due Thu' },
      { text:'Get legal sign-off on novation terms', src:'Review with Ed (Jun 3)', owner:'Ed Lewis' },
      { text:'Resolve EMEA segmentation question', src:'this meeting', owner:'open' },
    ],
    body:[
      { p:"Jon reframed the sequencing: pricing tiers can't be finalized until legal closes the novation terms, so novation is now the gating item rather than a parallel workstream. He'll take the push with legal directly." },
      { p:"We walked the telemetry scope for Arrowsphere — segmentation granularity is still unresolved for EMEA, where iAsset / ARM handles quoting separately from NA. Confirm against Lénaïg's old notes before Thursday." },
      { ul:['Telemetry scope — depth of per-tenant segmentation','EMEA vs NA quoting paths feeding Salesforce','Whether novation needs a separate addendum'] },
      { links:['CSP pricing model v2','Novation — legal background'] },
    ],
    related:[
      { kind:'knowledge', title:'Novation questions for legal', reason:'shared term: novation' },
      { kind:'meeting', title:'SGS weekly tracker call — Jun 2', reason:'also with: Jon' },
      { kind:'note', title:'CSP pricing model v2', reason:'linked [[ ]]' },
    ]},
  { id:'csp-terms', kind:'note', title:'Commercial terms — open questions', project:'csp', area:'arrow',
    people:[], tags:['commercial','pricing'], date:'Jun 3, 2026', updated:'1d', indexed:true, status:2,
    summary:"Running list of unresolved commercial points for CSP: tier thresholds, novation dependency, and the telemetry billing model.",
    body:[
      { p:"Open commercial questions ahead of contract close. Most are blocked on the novation outcome." },
      { ul:['Tier thresholds — confirm the mid-tier ceiling','Telemetry billing — per-tenant vs flat','Does novation require a pricing addendum?'] },
      { links:['Commercial Alignment — CSP'] },
    ],
    related:[
      { kind:'meeting', title:'Commercial Alignment — CSP', reason:'same project' },
      { kind:'note', title:'CSP pricing model v2', reason:'shared term: pricing' },
    ]},
  { id:'csp-pricing', kind:'note', title:'CSP pricing model v2', project:'csp', area:'arrow',
    people:[], tags:['pricing','reference'], date:'May 28, 2026', updated:'1w', indexed:true, status:2,
    summary:"Second pass at the CSP pricing model — three tiers, telemetry as a metered add-on, novation handled as a contract amendment.",
    body:[
      { p:"Revised pricing structure after the May review. Tiers stay at three; telemetry moves to a metered add-on rather than bundled." },
      { ul:['Starter / Growth / Scale tiers','Telemetry metered per active tenant','Novation as amendment, not re-paper'] },
    ],
    related:[ { kind:'note', title:'Commercial terms — open questions', reason:'shared term: pricing' } ]},
  { id:'csp-novation', kind:'knowledge', title:'Novation — legal background', project:'csp', area:'arrow',
    people:[], tags:['legal','reference'], date:'May 20, 2026', updated:'2w', indexed:true, status:2,
    summary:"Reference: what novation means for the CSP contract, who must sign, and the typical timeline with legal.",
    body:[
      { p:"Novation substitutes one party for another in the existing contract, requiring consent from all three parties. For CSP this means the original reseller, the new entity, and the customer." },
      { ul:['All three parties must consent in writing','Legal estimates 2–3 weeks once drafted','Blocks pricing finalization until closed'] },
    ],
    related:[ { kind:'knowledge', title:'Novation questions for legal', reason:'shared term: novation' } ]},
  { id:'csp-novq', kind:'knowledge', title:'Novation questions for legal', project:'csp', area:'arrow',
    people:[], tags:['legal','open'], date:'Jun 2, 2026', updated:'2d', indexed:true, status:2,
    summary:"Specific questions to send legal before they draft the novation: consent sequencing, addendum vs re-paper, and EMEA entity handling.",
    body:[ { ul:['Can consent be sequenced or must it be simultaneous?','Addendum vs full re-paper for pricing?','Does the EMEA entity need separate handling?'] } ],
    related:[ { kind:'knowledge', title:'Novation — legal background', reason:'shared term: novation' } ]},
  { id:'sgs-handoff', kind:'knowledge', title:'Handoff from Lénaïg — Crawl / Walk / Run', project:'sgs', area:'arrow',
    people:['Jon','Lénaïg','Agathe'], tags:['handoff','crawl-walk-run','reference'], date:'May 29, 2026', updated:'1w',
    indexed:true, status:2,
    summary:"Jon framed the SGS handoff as Crawl / Walk / Run. You're in Crawl: learn the process and people, keep the existing tracker intact, don't slow anyone down, and don't touch tooling or workflow yet. Lénaïg and Agathe keep owning the underlying tracking through roughly mid-June while you take over the weekly call.",
    terms:['Crawl/Walk/Run','tracker','ARM','SFDC'],
    body:[
      { p:"Context for the SGS Global Project Tracker — the cross-functional Salesforce / ERP / ARM integration program, covering project tracking across EMEA and NA, that you're taking over from Lénaïg." },
      { p:"Jon set the handoff up as Crawl / Walk / Run. The Crawl mandate is deliberately narrow:" },
      { ul:['Learn the process, the lines, and the people','Keep the existing tracker intact — no structural changes',"Don't slow anyone down","Explicitly don't touch tooling or workflow yet"] },
      { p:"Lénaïg and Agathe continue owning the underlying tracking through roughly mid-June; your first concrete responsibility is the weekly call." },
      { links:['SGS weekly tracker call — Jun 2','Salesforce ↔ ERP ↔ ARM architecture'] },
    ],
    related:[
      { kind:'meeting', title:'SGS weekly tracker call — Jun 2', reason:'same project' },
      { kind:'knowledge', title:'Salesforce ↔ ERP ↔ ARM architecture', reason:'shared term: ARM' },
    ]},
  { id:'sgs-call', kind:'meeting', title:'SGS weekly tracker call — Jun 2', project:'sgs', area:'arrow',
    people:['Jon','Kirby'], tags:['meeting','tracker','crawl-walk-run'], date:'Jun 2, 2026', updated:'5d',
    indexed:true, status:2, rawWords:'3,640',
    summary:"Your first weekly call. Dense and unfamiliar, and several line owners were absent, so their rows went un-updated. Two follow-ups fell out: get fluent in the substance, and chase the gaps before the stakeholder reviews.",
    terms:['ARM','SFDC','ERP','tracker'],
    actions:[
      { text:'Build 02/06 comment updates for each tracker row', src:'this meeting', owner:'you · in progress' },
      { text:'Chase un-updated lines from absent owners', src:'this meeting', owner:'you · due Thu' },
      { text:'Draft async updates to Mattia + Diane', src:'this meeting', owner:'you' },
    ],
    body:[
      { p:"First call I led. A lot of it went over my head, and several owners were absent so their lines went un-updated — the follow-up is twofold: get fluent in the substance, and chase the gaps." },
      { ul:['Several line owners absent — rows un-updated','Sparse, copy-paste comment updates needed in the "02/06 :" format','Mattia and Diane absent — async updates required'] },
      { links:['Tracker update conventions & line decisions','Ed Lewis review — prep & concepts'] },
    ],
    related:[
      { kind:'knowledge', title:'Handoff from Lénaïg — Crawl / Walk / Run', reason:'same project' },
      { kind:'knowledge', title:'Tracker update conventions & line decisions', reason:'shared term: tracker' },
      { kind:'note', title:'Nathalie open items — triaged to Notion', reason:'follow-up' },
    ]},
  { id:'sgs-conventions', kind:'knowledge', title:'Tracker update conventions & line decisions', project:'sgs', area:'arrow',
    people:['Kirby'], tags:['conventions','tracker','reference'], date:'Jun 4, 2026', updated:'3d',
    indexed:true, status:2,
    summary:"How tracker rows get updated, plus two line decisions. Updates go in as dated copy-paste comments (the 02/06 format). An opening update was re-mapped from ARM-02 to ARM-04. Kirby's end-user deduplication question was resolved by proposing a new standalone line — SFDC-76 (NA, phase 2) — rather than editing the near-complete SFDC-47/2 or misusing the slash-suffix convention.",
    terms:['ARM-04','SFDC-76','SFDC-47/2','deduplication'],
    body:[
      { p:"Working notes on the tracker's update conventions and the judgment calls behind two lines." },
      { ul:['Updates entered as dated copy-paste comments — e.g. "02/06 :"',"The slash-suffix (e.g. /2) denotes a sub-phase, not a new scope — don't overload it",'Opening update re-mapped: belonged to ARM-04, not ARM-02',"Kirby's end-user dedup → new standalone line SFDC-76 (NA, phase 2), leaving the near-complete SFDC-47/2 untouched"] },
    ],
    related:[
      { kind:'meeting', title:'SGS weekly tracker call — Jun 2', reason:'shared term: tracker' },
      { kind:'note', title:'Ed Lewis review — prep & concepts', reason:'shared term: SFDC' },
    ]},
  { id:'sgs-ed-prep', kind:'note', title:'Ed Lewis review — prep & concepts', project:'sgs', area:'arrow',
    people:['Ed Lewis'], tags:['review','forecasting','reference'], date:'Jun 5, 2026', updated:'2d',
    indexed:true, status:2,
    summary:"Prep for Ed's stakeholder review. Got tutored on the real Salesforce concepts behind his four items, and flagged that \"pipeline refinement\" isn't an official term.",
    terms:['SFDC-30','SFDC-32','ERP-06','SFDC-74'],
    body:[
      { p:"Ahead of Ed's review I worked through the actual Salesforce concepts behind each of his four items so I could speak to them:" },
      { ul:['SFDC-30 — Forecast / sales hierarchy','SFDC-32 — Quotas','ERP-06 — end-user classification sync','SFDC-74 — opportunity upload template'] },
      { p:"Also flagged that \"pipeline refinement\" isn't an official term, so it shouldn't anchor the review." },
      { links:['Tracker update conventions & line decisions'] },
    ],
    related:[
      { kind:'meeting', title:'SGS weekly tracker call — Jun 2', reason:'review prep' },
      { kind:'note', title:'Nathalie open items — triaged to Notion', reason:'also: stakeholder review' },
    ]},
  { id:'sgs-nathalie', kind:'note', title:'Nathalie open items — triaged to Notion', project:'sgs', area:'arrow',
    people:['Nathalie'], tags:['triage','master-data','reference'], date:'Jun 5, 2026', updated:'2d',
    indexed:true, status:2,
    summary:"Triaged Nathalie's open tracker items into a dedicated Notion page, grouped into master-data, forecasting, and deal-reg / pricing.",
    terms:['master-data','forecasting','deal-reg'],
    body:[
      { p:"Nathalie had a scattered set of open items. I pulled them into one Notion page and grouped them so the review has structure:" },
      { ul:['Master-data — ownership and classification fields','Forecasting — hierarchy and quota alignment','Deal-reg / pricing — registration and pricing edge cases'] },
    ],
    related:[
      { kind:'note', title:'Ed Lewis review — prep & concepts', reason:'also: stakeholder review' },
      { kind:'meeting', title:'SGS weekly tracker call — Jun 2', reason:'same project' },
    ]},
  { id:'sgs-arch', kind:'knowledge', title:'Salesforce ↔ ERP ↔ ARM architecture', project:'sgs', area:'arrow',
    people:[], tags:['reference','architecture','arm'], date:'May 30, 2026', updated:'5d', indexed:true, status:2,
    summary:"How the three systems connect: Salesforce is the hub feeding both iAsset / ARM (EMEA quoting) and ARS Cloud (NA quoting).",
    terms:['Salesforce','ARM','ERP'],
    body:[
      { p:"iAsset / ARM handles EMEA quoting, ARS Cloud handles NA, and Salesforce is the hub feeding both." },
      { ul:['Salesforce = system of record','EMEA quoting via iAsset / ARM','NA quoting via ARS Cloud'] },
    ],
    related:[ { kind:'knowledge', title:'Handoff from Lénaïg — Crawl / Walk / Run', reason:'shared term: ARM' } ]},
  // Multi-project meeting: homed at the AREA (project:null), touches two projects.
  // Each action item is routed to its own project via `project`.
  { id:'arrow-sync', kind:'meeting', title:'Arrow weekly — CSP + SGS', project:null, area:'arrow',
    projects:['csp','sgs'], people:['Jon','Ed Lewis','Nathalie'], tags:['weekly','novation','arm','emea'],
    date:'Jun 6, 2026', updated:'18h', indexed:true, status:2, rawWords:'5,020',
    summary:"Cross-project Arrow weekly. CSP: novation is still the blocker, Jon escalating legal. SGS: first tracker call is done and the 02/06 updates are in flight, with Ed's and Nathalie's reviews next. Shared thread — Ed reviews both sides, and the EMEA entity touches the novation paperwork and the tracker's master-data at once.",
    terms:['novation','ARM','EMEA','tracker'],
    actions:[
      { text:'Escalate novation sign-off with legal', src:'this meeting', owner:'Jon', project:'csp' },
      { text:'Confirm EMEA entity handling — affects both', src:'this meeting', owner:'you · due Thu', project:'csp' },
      { text:'Finish 02/06 tracker updates before Ed’s review', src:'this meeting', owner:'you · due Thu', project:'sgs' },
    ],
    body:[
      { p:"Combined Arrow weekly covering both live projects. Most of the shared time was the EMEA-entity question, which sits on the critical path for CSP (novation paperwork) and SGS (master-data / ARM) at once." },
      { ul:['CSP — novation blocking pricing; Jon escalating legal','SGS — first tracker call done; chasing un-updated lines before Ed’s review','Shared — EMEA entity affects both; resolve before either closes'] },
      { links:['Commercial Alignment — CSP','SGS weekly tracker call — Jun 2'] },
    ],
    related:[
      { kind:'meeting', title:'Commercial Alignment — CSP', reason:'routed action: CSP' },
      { kind:'meeting', title:'SGS weekly tracker call — Jun 2', reason:'routed action: SGS' },
    ]},
  { id:'mag-overview', kind:'note', title:'Maggetti — engagement overview', project:'maggetti', area:'sds',
    people:['Mitch'], tags:['engagement','consulting','reference'], date:'May 20, 2026', updated:'2w',
    indexed:true, status:2,
    summary:"Paid digital-marketing engagement through Slow Down Sunny LLC for Maggetti Construction — Mitch's high-end Willow Glen builder serving Los Gatos, Saratoga and Los Altos. The core gap: a top-1% BuildZoom reputation over 35+ years against a near-absent digital presence.",
    terms:['BuildZoom','Squarespace','Houzz','Angi'],
    body:[
      { p:"Maggetti Construction is a high-end San Jose builder (Willow Glen), 35+ years in, top-1% on BuildZoom, with a strong word-of-mouth reputation across Los Gatos, Saratoga and Los Altos." },
      { p:"The problem is the gap between that real-world standing and the digital footprint:" },
      { ul:['Effectively zero Google reviews','An underoptimized Squarespace site','A small Instagram following','Dormant Houzz / Angi profiles'] },
      { links:['Competitive research — De Mattei benchmark','Three-package pitch structure'] },
    ],
    related:[
      { kind:'knowledge', title:'Competitive research — De Mattei benchmark', reason:'same project' },
      { kind:'note', title:'Three-package pitch structure', reason:'same project' },
    ]},
  { id:'mag-research', kind:'knowledge', title:'Competitive research — De Mattei benchmark', project:'maggetti', area:'sds',
    people:[], tags:['research','competitive','reference'], date:'May 22, 2026', updated:'2w',
    indexed:true, status:2,
    summary:"Local competitor scan. De Mattei Construction is the one rival with a real social presence and the main benchmark; most comparable builders are similarly thin online, which is the opening.",
    terms:['De Mattei','Instagram','Google reviews'],
    body:[
      { p:"Scanned the high-end builders in the area. The pattern: strong reputations, weak digital — with one exception." },
      { ul:['De Mattei Construction — the only rival with real social presence','Most peers: minimal reviews, dated sites','Opening: own search + reviews before competitors invest'] },
    ],
    related:[
      { kind:'note', title:'Maggetti — engagement overview', reason:'same project' },
      { kind:'note', title:'Three-package pitch structure', reason:'informs scope' },
    ]},
  { id:'mag-packages', kind:'note', title:'Three-package pitch structure', project:'maggetti', area:'sds',
    people:[], tags:['pitch','proposal','pricing'], date:'May 25, 2026', updated:'10d',
    indexed:true, status:2,
    summary:"Three tiers: Foundation, Foundation + Launch, and Foundation + Managed retainer. Foundation fixes the basics; Launch adds a campaign; the retainer adds ongoing reputation / listings upkeep and paid-ad management.",
    terms:['Foundation','Launch','retainer'],
    body:[
      { p:"Pitch is structured as three packages so Mitch can choose his level of commitment:" },
      { ul:['Foundation — reviews, listings cleanup, Squarespace optimization','Foundation + Launch — adds a kickoff campaign','Foundation + Managed retainer — adds ongoing reputation / listings upkeep and paid-advertising management'] },
      { links:['Pitch deck — architectural direction','Proposal v-final — Slow Down Sunny → Maggetti'] },
    ],
    related:[
      { kind:'artifact', title:'Proposal v-final — Slow Down Sunny → Maggetti', reason:'same project' },
      { kind:'artifact', title:'Pitch deck — architectural direction', reason:'same project' },
    ]},
  { id:'mag-deck', kind:'artifact', title:'Pitch deck — architectural direction', project:'maggetti', area:'sds',
    people:[], tags:['deliverable','deck'], date:'May 26, 2026', updated:'1w',
    indexed:true, status:2,
    summary:"Eight-slide pitch deck in an architectural visual direction — Cormorant Garamond + Inter on a near-white background. Source material for the formal proposal.",
    terms:['deck','Cormorant Garamond','Inter'],
    body:[
      { p:"Eight slides, built to feel architectural: Cormorant Garamond display over Inter, near-white ground, generous margins. Walks from the reputation / digital gap through the three packages." },
    ],
    related:[
      { kind:'note', title:'Three-package pitch structure', reason:'composed from' },
      { kind:'artifact', title:'Proposal v-final — Slow Down Sunny → Maggetti', reason:'same project' },
    ]},
  { id:'mag-proposal', kind:'artifact', title:'Proposal v-final — Slow Down Sunny → Maggetti', project:'maggetti', area:'sds',
    people:['Mitch'], tags:['deliverable','proposal','pricing'], date:'May 28, 2026', updated:'4d',
    indexed:true, status:2,
    summary:"Formal proposal under Slow Down Sunny LLC, signed by you, dated May 28 with a June 27 validity window. Managed scope expanded to reputation / listings upkeep + paid-ad management; monthly fee $1,000; financial summary set to a first-six-months total of $8,600. Platform ad spend is paid directly by Maggetti, separate from the fee.",
    terms:['$8,600','$1,000/mo','retainer'],
    body:[
      { p:"The contracting entity is Slow Down Sunny LLC throughout, with you as the signing party. Dated May 28, valid through June 27." },
      { ul:['Monthly managed fee — $1,000','First-six-months total — $8,600','Managed scope — reputation / listings upkeep + paid-advertising management','Platform ad spend paid directly by Maggetti, kept separate from the fee'] },
      { links:['Proposal review — gaps & cover email'] },
    ],
    related:[
      { kind:'note', title:'Three-package pitch structure', reason:'composed from' },
      { kind:'note', title:'Proposal review — gaps & cover email', reason:'reviewed in' },
    ]},
  { id:'mag-review', kind:'note', title:'Proposal review — gaps & cover email', project:'maggetti', area:'sds',
    people:[], tags:['review','proposal','open'], date:'May 30, 2026', updated:'2d',
    indexed:true, status:2,
    summary:"Review pass before sending. Tightened the cover email and flagged two substantive gaps in the proposal to close.",
    terms:['cover email','asset ownership','review commitment'],
    body:[
      { p:"Cover-email cleanup: a term-length typo, a capitalization slip, some redundancy, and a tone mismatch (a \"no rush\" line sitting next to \"let's meet next week\")." },
      { p:"Two substantive gaps to close in the proposal itself:" },
      { ul:["Add language confirming all accounts and assets remain the client's property at engagement end",'Tie the review commitment to outreach effort rather than a guaranteed count'] },
    ],
    related:[
      { kind:'artifact', title:'Proposal v-final — Slow Down Sunny → Maggetti', reason:'reviews' },
    ]},
  { id:'arm-quote', kind:'knowledge', title:'ARM quoting flow — EMEA via iAsset', project:'sgs', area:'arrow',
    people:[], tags:['reference','arm'], date:'May 22, 2026', updated:'2w', indexed:true, status:2,
    summary:"iAsset / ARM handles EMEA quoting, ARS Cloud handles NA, Salesforce is the hub feeding both — confirm details against Lénaïg's old notes.",
    body:[ { p:"Reference pulled from Lénaïg's handoff material; confirm specifics before relying on it." } ],
    related:[ { kind:'knowledge', title:'Salesforce ↔ ERP ↔ ARM architecture', reason:'shared term: ARM' } ]},
  { id:'voyage', kind:'knowledge', title:'Voyage 4 embeddings — shared vector space', project:null, area:null,
    people:[], tags:['reference','reading'], date:'Jun 1, 2026', updated:'3d', indexed:false, status:1,
    summary:"voyage-4-large and voyage-4-lite embed into one space — index with large, query with lite, no re-index.",
    body:[ { p:"Relevant to v2 search: index with the large model, query with lite, single shared space." } ], related:[]},
  { id:'brainstorm-name', kind:'brainstorm', title:'Naming — the compose feature', project:null, area:null,
    people:[], tags:['ideas'], date:'May 31, 2026', updated:'1w', indexed:true, status:2,
    summary:"Loose ideas for what to call the deliverable-composition feature.",
    body:[ { ul:['Compose','Draft','Assemble','Spin up'] } ], related:[]},
];
const noteById = (id) => NOTES.find((n) => n.id === id);
const projectName = (id) => { for (const a of AREAS) { const p = a.projects.find((x) => x.id === id); if (p) return p.name; } return null; };
const areaOfProject = (id) => AREAS.find((a) => a.projects.some((p) => p.id === id));
const areaName = (id) => { const a = AREAS.find((x) => x.id === id); return a ? a.name : null; };
const notesInProject = (id) => NOTES.filter((n) => n.project === id);
// Owned = structural home is this project. Linked = homed elsewhere (e.g. the
// area) but explicitly touches this project via `projects[]`.
const ownedNotes = (id) => NOTES.filter((n) => n.project === id);
const linkedMeetings = (id) => NOTES.filter((n) => n.project !== id && (n.projects || []).includes(id));
// Roll up action items BY ASSIGNMENT, not by meeting ownership: an action
// belongs to a.project if set, else to the meeting's own home project.
const actionsForProject = (id) => {
  const out = [];
  NOTES.forEach((n) => {
    if (n.kind !== 'meeting' || !n.actions) return;
    n.actions.forEach((a) => {
      const belongs = a.project ? a.project === id : n.project === id;
      if (belongs) out.push({ ...a, meeting: n.title, mid: n.id, linked: n.project !== id });
    });
  });
  return out;
};
// All free-text tags actually in use, and the fixed topic set.
const ALL_TAGS = [...new Set(NOTES.flatMap((n) => n.tags))].sort();
const TOPICS = ['novation', 'pricing', 'arm', 'proposal', 'review'];
const notesByTag = (tag) => NOTES.filter((n) => n.tags.includes(tag));

// Inbox captures (untriaged)
const INBOX = [
  { id:'in-arrow', title:'Arrow weekly — combined notes', src:'apple shortcut', srcIcon:'brand-apple',
    snippet:"Covered CSP novation (Jon escalating legal) and the SGS tracker — first weekly call done, chasing the lines absent owners left un-updated before Ed's review. Shared: Ed reviews both sides.",
    suggest:null, tags:['weekly','novation','arm','emea'],
    suggestMulti:{ home:'arrow', homeLabel:'Arrow', confidence:0.88,
      routes:[ { project:'csp', count:2 }, { project:'sgs', count:1 } ] } },
  { id:'in-ed', title:'Notes from Ed Lewis 1:1', src:'apple shortcut', srcIcon:'brand-apple',
    snippet:"Ed wants his four review items walked — forecast hierarchy, quotas, end-user classification sync, opportunity upload — and flagged that \"pipeline refinement\" isn't an official term. Async updates to Mattia + Diane still pending.",
    suggest:{ project:'sgs', confidence:0.92 }, tags:['review','follow-up'] },
  { id:'in-mag', title:'Maggetti — cover email & proposal review notes', src:'captured', srcIcon:'clipboard',
    snippet:"Tightened the cover email (typo, capitalization, a no-rush vs let's-meet-next-week tone mismatch). Two proposal gaps to close: asset ownership at engagement end, and tying the review commitment to outreach effort rather than a guaranteed count.",
    suggest:{ project:'maggetti', confidence:0.9 }, tags:['review','proposal'] },
  { id:'in-voyage', title:'Voyage 4 embeddings — shared vector space', src:'captured', srcIcon:'clipboard',
    snippet:"voyage-4-large and voyage-4-lite embed into one space — index with large, query with lite, no re-index. Relevant to v2 search.",
    suggest:null, tags:['reference','reading'] },
  { id:'in-arm', title:'ARM quoting flow — EMEA via iAsset', src:'manual', srcIcon:'pencil',
    snippet:"iAsset/ARM handles EMEA quoting, ARS Cloud handles NA, Salesforce is the hub feeding both. Confirm with Lénaïg's old notes.",
    suggest:{ project:'sgs', confidence:0.78 }, tags:['reference','arm'] },
];

// Ask answers (canned retrieval)
const ASK_ANSWERS = {
  default: {
    chips:[ { icon:'user', text:'person: Jon' }, { icon:'clock', text:'last 14 days' }, { icon:null, text:'+ semantic' } ],
    answer:"In the Commercial Alignment meeting (CSP) on Jun 4, Jon pushed to lock the novation terms with legal before the pricing tiers are finalized, and asked you to confirm telemetry scope with Arrowsphere by Thursday. He also flagged EMEA segmentation as still open.",
    sources:[
      { id:'csp-align', label:'Commercial Alignment — CSP', meta:'Jun 4 · with Jon, Haritha' },
      { id:'csp-novq', label:'Novation questions for legal', meta:'Jun 2 · open questions' },
    ]},
  'SGS Tracker': {
    chips:[ { icon:'clock', text:'recent first' }, { icon:'tag', text:'tracker' }, { icon:null, text:'+ semantic' } ],
    answer:"Before Ed's review you still need to finish the 02/06 comment updates and chase the lines left un-updated by absent owners from the Jun 2 call. His four items are prepped — SFDC-30 (forecast / hierarchy), SFDC-32 (quotas), ERP-06 (end-user classification sync), SFDC-74 (opportunity upload template) — and Nathalie's items are triaged in Notion. The Mattia / Diane async updates are still outstanding.",
    sources:[
      { id:'sgs-call', label:'SGS weekly tracker call — Jun 2', meta:'Jun 2 · first run' },
      { id:'sgs-ed-prep', label:'Ed Lewis review — prep & concepts', meta:'Jun 5 · four items' },
    ]},
  'Maggetti proposal': {
    chips:[ { icon:'clock', text:'recent first' }, { icon:'tag', text:'proposal' }, { icon:null, text:'+ semantic' } ],
    answer:"Two open items remain from the review pass: add language confirming all accounts and assets remain the client's property at engagement end, and tie the review commitment to outreach effort rather than a guaranteed count. Otherwise the proposal is out under Slow Down Sunny LLC — $1,000/mo managed, $8,600 over six months, valid to June 27.",
    sources:[
      { id:'mag-review', label:'Proposal review — gaps & cover email', meta:'May 30 · 2 open gaps' },
      { id:'mag-proposal', label:'Proposal v-final — Slow Down Sunny → Maggetti', meta:'May 28 · valid to Jun 27' },
    ]},
};

const COMPOSE_TYPES = [
  { id:'onepager', icon:'file-text', name:'One-pager', desc:'Tight single-page brief' },
  { id:'exec', icon:'clipboard-text', name:'Exec summary', desc:'3–5 bullets, decision-first' },
  { id:'email', icon:'mail', name:'Email draft', desc:'Ready to send' },
  { id:'deck', icon:'layout-board', name:'Deck outline', desc:'Slide-by-slide skeleton' },
];

const BRIEFINGS = {
  csp: "Commercial terms and novation are the critical path: legal sign-off on novation is blocking the pricing tiers. Telemetry scope and EMEA segmentation are still open. Last movement was the Jun 4 alignment with Jon, who owns pushing legal.",
  sgs: "You're in the Crawl phase of the handoff from Lénaïg — learn the people and process, keep the tracker intact, don't change tooling yet. Your first weekly call (Jun 2) exposed gaps from absent owners; since then you've built the 02/06 comment updates, corrected the ARM-02 → ARM-04 mapping, and stood up SFDC-76 for Kirby's dedup case. Stakeholder reviews are prepped — Ed's four items (concepts in hand) and Nathalie's items triaged in Notion. Open: finish chasing the un-updated lines and send the Mattia / Diane async updates.",
  maggetti: "The proposal is out — Slow Down Sunny LLC to Maggetti Construction, dated May 28 and valid to June 27. It's the three-package pitch with a $1,000/mo managed retainer and an $8,600 first-six-months total; platform ad spend stays separate. The wedge is the gap between Maggetti's top-1% BuildZoom reputation and its near-absent digital presence, benchmarked against De Mattei. Two open items from the review pass: add asset-ownership-on-exit language, and tie the review commitment to outreach effort rather than a guaranteed count.",
};

Object.assign(window, {
  ScribeCtx, useScribe, useIsMobile, bind, tk, FONT, Icon, KIND, Label, Tag, Person, KindBadge, Btn, Stepper, StatusPill,
  AREAS, NOTES, noteById, projectName, areaOfProject, areaName, notesInProject,
  ownedNotes, linkedMeetings, actionsForProject, ALL_TAGS, TOPICS, notesByTag,
  INBOX, ASK_ANSWERS, COMPOSE_TYPES, BRIEFINGS,
});

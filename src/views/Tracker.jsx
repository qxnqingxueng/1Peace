import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

/* ─── spring / easing tokens ─── */
const SS = { type: 'spring', stiffness: 300, damping: 30 };   // soft
const SN = { type: 'spring', stiffness: 480, damping: 36 };   // snappy
const SM = { type: 'spring', stiffness: 420, damping: 28 };   // modal
const EX = { duration: 0.32, ease: [0.16, 1, 0.3, 1] };       // expo-out

const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const FADE_UP = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: SS } };

/* ─── static data ─── */
const STAGES = ['Tabled', '1st Reading', '2nd Reading', 'Committee', '3rd Reading', 'Gazetted'];
const MY_STATES = ['Selangor', 'Kuala Lumpur', 'Johor', 'Penang', 'Perak', 'Sabah', 'Sarawak', 'Kedah', 'Kelantan', 'Pahang', 'Negeri Sembilan', 'Melaka', 'Perlis'];

const BILLS = [
  { id: 'diesel',  name: 'Targeted Diesel Subsidy Rationalisation Bill 2024', stage: 5, category: 'Subsidy', keywords: ['diesel', 'subsidy', 'fuel'] },
  { id: 'epf',     name: 'EPF (Amendment) Act 2024 — Akaun Fleksibel',        stage: 5, category: 'Finance', keywords: ['epf', 'pension', 'savings', 'finance'] },
  { id: 'str',     name: 'Sumbangan Tunai Rahmah (STR) 2026 Framework',       stage: 3, category: 'Welfare', keywords: ['str', 'welfare', 'cash aid', 'bantuan'] },
  { id: 'housing', name: 'Housing Credit Guarantee Scheme Bill 2025',          stage: 4, category: 'Housing', keywords: ['housing', 'loan', 'housing loan', 'property', 'rumah'] },
  { id: 'digital', name: 'MyDIGITAL Economy Blueprint Bill 2026',              stage: 1, category: 'Digital', keywords: ['digital', 'tech', 'economy'] },
  { id: 'einv',    name: 'e-Invoice Mandatory Adoption Act 2024',              stage: 5, category: 'Tax',     keywords: ['invoice', 'tax', 'lhdn', 'e-invoice'] },
];

const AID_BASE = [
  { id: 'budi',    name: 'BUDI MADANI',     amount: 'RM 200/mo',     deadline: new Date('2024-10-31'), cat: 'Fuel',      status: 'eligible',   met: ['B40','Diesel vehicle','Selangor'],  unmet: [],                                forGroup: ['B40'], vehicleReq: 'Diesel Car' },
  { id: 'str',     name: 'STR 2026',        amount: 'RM 1,500',      deadline: new Date('2026-04-30'), cat: 'Cash',      status: 'action',     met: ['B40','Single parent','2 deps'],      unmet: ['PADU profile incomplete'],       forGroup: ['B40'] },
  { id: 'mysalam', name: 'MySalam',          amount: 'RM 8,000/yr',   deadline: null,                   cat: 'Health',    status: 'eligible',   met: ['B40','Age under 65'],                unmet: [],                                forGroup: ['B40', 'M40'] },
  { id: 'peka',    name: 'PeKa B40',         amount: 'Free screening', deadline: null,                  cat: 'Health',    status: 'ineligible', met: ['B40'],                               unmet: ['Aged 40+ required'],             forGroup: ['B40'] },
  { id: 'pr1ma',   name: 'PR1MA Housing',    amount: '30% off market', deadline: null,                  cat: 'Housing',   status: 'action',     met: ['Income RM2.5k–15k/mo'],              unmet: ['First-time buyer unverified'],   forGroup: ['B40', 'M40', 'T20'] },
  { id: 'ptptn',   name: 'PTPTN Deferment', amount: 'Pause loan',    deadline: null,                   cat: 'Education', status: 'eligible',   met: ['Income < RM2,000/mo'],               unmet: [],                                forGroup: ['B40', 'M40'] },
];

const DIFFS = {
  diesel: [
    { clause: 'Section 4A — Eligibility',
      removed: 'All registered vehicle owners shall receive a fixed subsidy of RM0.30 per litre on diesel fuel purchases, without income verification.',
      added:   'Only households with a combined monthly income below RM5,000 and at least one registered diesel vehicle shall qualify for the targeted BUDI MADANI fuel credit of RM200 per month, subject to PADU registration and annual verification.',
      impact:  ['B40 households', 'Diesel vehicle owners', 'PADU registrants'] },
    { clause: 'Section 7 — Registration',
      removed: 'No registration requirement. Subsidy applied automatically at point of sale.',
      added:   'Eligible households must register via PADU (padu.gov.my) before 31 October 2024. Failure to register will result in loss of entitlement.',
      impact:  ['All diesel users', 'PADU unregistered'] },
  ],
  epf: [
    { clause: 'Section 54 — Account Structure',
      removed: 'Monthly contributions allocated to Account 1 (70%) and Account 2 (30%). Account 2 withdrawals permitted for housing, education and medical purposes only.',
      added:   'Monthly contributions allocated to Account 1 Persaraan (75%), Account 2 Sejahtera (15%), and Account 3 Fleksibel (10%). Account 3 withdrawals permitted at any time for any purpose, minimum RM50.',
      impact:  ['All EPF contributors', 'Members below 55'] },
  ],
};

const CAT_CLS = {
  Subsidy: 'bg-blue-50 text-blue-700', Finance: 'bg-purple-50 text-purple-700',
  Welfare: 'bg-emerald-50 text-emerald-700', Housing: 'bg-amber-50 text-amber-700',
  Digital: 'bg-cyan-50 text-cyan-700', Tax: 'bg-rose-50 text-rose-700',
  Fuel: 'bg-orange-50 text-orange-700', Cash: 'bg-green-50 text-green-700',
  Health: 'bg-pink-50 text-pink-700', Education: 'bg-indigo-50 text-indigo-700',
};
const CAT_BAR = {
  Subsidy: 'bg-blue-500', Finance: 'bg-purple-500', Welfare: 'bg-emerald-500',
  Housing: 'bg-amber-500', Digital: 'bg-cyan-500', Tax: 'bg-rose-500',
};

/* ─────────────────────────────────────────────────────────────
   SHARED: PILL BUTTON
───────────────────────────────────────────────────────────── */
function Pill({ label, selected, onClick, className = '' }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={SN}
      className={`rounded-xl border px-4 py-2.5 text-[13px] font-semibold transition-colors duration-150 ${
        selected
          ? 'border-[#003399] bg-[#003399] text-white shadow'
          : 'border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#003399] hover:text-[#003399]'
      } ${className}`}
    >
      {label}
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────────
   SHARED: PIPELINE BAR
───────────────────────────────────────────────────────────── */
function PipelineBar({ stage }) {
  const pct = ((stage - 1) / (STAGES.length - 1)) * 100;
  return (
    <div className="mt-3">
      <div className="relative flex items-center">
        <div className="absolute inset-x-0 top-[7px] h-[3px] rounded-full bg-[#e2e8f0]" />
        <motion.div className="absolute top-[7px] h-[3px] rounded-full bg-[#003399]"
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ ...SS, delay: 0.1 }} />
        {STAGES.map((_, i) => (
          <div key={i} className="relative z-10 flex flex-1 justify-start last:flex-none last:justify-end">
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ ...SN, delay: 0.04 * i }}
              className={`h-3.5 w-3.5 rounded-full border-2 ${
                i === stage - 1 ? 'border-[#003399] bg-[#003399] ring-4 ring-[#003399]/10'
                : i < stage     ? 'border-[#16a34a] bg-[#16a34a]'
                                : 'border-[#cbd5e1] bg-white'
              }`}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex">
        {STAGES.map((s, i) => (
          <div key={i} className={`flex-1 text-[9px] leading-tight ${i === STAGES.length - 1 ? 'text-right' : ''} ${
            i === stage - 1 ? 'font-bold text-[#003399]' : i < stage ? 'text-[#16a34a]' : 'text-[#94a3b8]'
          }`}>{s}</div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PROFILE NORMALISER  (chat page → tracker format)
───────────────────────────────────────────────────────────── */
const VEHICLE_MAP = {
  'Diesel': 'Diesel Car', 'Petrol': 'Petrol Car',
  'Motorcycle': 'Motorcycle', 'No vehicle': 'None',
};

function normalizeProfile(p) {
  return {
    incomeGroup:   p.incomeGroup   || 'B40',
    state:         p.state         || '',
    householdType: p.householdType || '',
    dependants:    parseInt(p.dependants, 10) || 0,
    vehicle:       VEHICLE_MAP[p.vehicleType] || p.vehicle || 'None',
  };
}

/* ─────────────────────────────────────────────────────────────
   AID ELIGIBILITY SECTION
───────────────────────────────────────────────────────────── */
function matchAid(profile) {
  return AID_BASE
    .filter(p => p.forGroup.includes(profile.incomeGroup))
    .map(p => {
      if (p.vehicleReq && profile.vehicle !== p.vehicleReq) {
        return { ...p, status: 'ineligible', unmet: [`${p.vehicleReq} required`] };
      }
      return p;
    })
    .sort((a, b) => {
      const order = { eligible: 0, action: 1, ineligible: 2 };
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      if (a.deadline && b.deadline) return a.deadline - b.deadline;
      return a.deadline ? -1 : 1;
    });
}

function AidCard({ prog, onApply }) {
  const [expanded, setExpanded] = useState(false);

  const cfg = {
    eligible:   { border: 'border-[#86efac]', badge: 'bg-[#16a34a] text-white',       label: '✓ Eligible' },
    action:     { border: 'border-[#fde68a]', badge: 'bg-[#F7C800] text-[#78350f]',   label: '! Action needed' },
    ineligible: { border: 'border-[#e2e8f0]', badge: 'bg-[#f1f5f9] text-[#94a3b8]',  label: 'Not eligible' },
  }[prog.status];

  const daysLeft = prog.deadline
    ? Math.ceil((prog.deadline - Date.now()) / 86400000)
    : null;
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const urgent = daysLeft !== null && daysLeft > 0 && daysLeft < 60;

  return (
    <motion.div variants={FADE_UP}
      className={`overflow-hidden rounded-2xl border-2 ${cfg.border} bg-white shadow-sm`}>
      {/* collapsed row — always visible */}
      <button type="button" onClick={() => setExpanded(e => !e)}
        className="flex w-full items-start gap-6 px-6 py-5 text-left">

        {/* Left: badge row, then title below with clear gap */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cfg.badge}`}>{cfg.label}</span>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CAT_CLS[prog.cat] || 'bg-slate-50 text-slate-600'}`}>{prog.cat}</span>
            {urgent && (
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
                className="shrink-0 rounded-full bg-[#fef2f2] px-2.5 py-0.5 text-[11px] font-bold text-[#dc2626]">
                ⚠ {daysLeft}d left
              </motion.span>
            )}
            {isExpired && (
              <span className="shrink-0 rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-[11px] font-bold text-[#94a3b8]">
                Deadline passed
              </span>
            )}
          </div>
          <p className="text-[14px] font-bold leading-snug text-[#0f172a]">{prog.name}</p>
        </div>

        {/* Right: amount top, chevron bottom — clearly separated */}
        <div className="flex flex-col items-end gap-5 pt-0.5" style={{ minWidth: 0, maxWidth: '140px' }}>
          <p className="text-[15px] font-extrabold text-[#003399] text-right break-words">{prog.amount}</p>
          <span className={`text-[12px] text-[#94a3b8] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>▾</span>
        </div>

      </button>

      {/* expanded detail */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div key="detail"
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ ...SS, opacity: { duration: 0.15 } }}
            className="overflow-hidden border-t border-[#f1f5f9]">
            <div className="px-6 pb-6 pt-4">
              <div className="mb-5 flex flex-wrap gap-2">
                {prog.met.map(c => <span key={c} className="rounded-full border border-[#86efac] bg-[#f0fdf4] px-2.5 py-0.5 text-[11px] font-semibold text-[#16a34a]">✓ {c}</span>)}
                {prog.unmet.map(c => <span key={c} className="rounded-full border border-[#fca5a5] bg-[#fef2f2] px-2.5 py-0.5 text-[11px] font-semibold text-[#dc2626]">✗ {c}</span>)}
              </div>
              {prog.status !== 'ineligible' && (
                <motion.button type="button" onClick={() => onApply(prog)}
                  whileTap={{ scale: 0.95 }} transition={SN}
                  className={`rounded-xl px-5 py-2.5 text-[13px] font-bold ${
                    prog.status === 'eligible'
                      ? 'bg-[#003399] text-white hover:bg-[#1a4fad]'
                      : 'border border-[#fde68a] bg-[#fffbea] text-[#92400e] hover:bg-[#fef3c7]'
                  }`}>
                  {prog.status === 'eligible' ? '1Peace can apply for you →' : 'Complete requirements →'}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ApplyModal({ prog, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }} onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <motion.div initial={{ scale: 0.88, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }} transition={SM}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-[#001f6b] to-[#003399] p-6 text-white">
          <div className="mb-1 flex items-start justify-between">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/50">Applying via 1Peace</p>
            <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
          </div>
          <p className="text-xl font-extrabold">{prog.name}</p>
          <p className="mt-0.5 font-bold text-[#F7C800]">{prog.amount}</p>
        </div>
        <div className="p-6">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#94a3b8]">What happens next</p>
          {['1Peace pre-fills your application using your saved profile.',
            'You review and confirm — nothing is submitted without your approval.',
            'We submit to the government portal on your behalf.',
            'Tracking ID sent to you via WhatsApp.'].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ ...SS, delay: 0.07 * i }} className="mb-3 flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#003399] text-[11px] font-extrabold text-white">{i + 1}</span>
              <p className="text-[13px] leading-relaxed text-[#334155]">{s}</p>
            </motion.div>
          ))}
          <div className="mt-6 flex gap-3">
            <motion.button whileTap={{ scale: 0.94 }} transition={SN}
              className="flex-1 rounded-xl bg-[#003399] py-3 text-[14px] font-bold text-white hover:bg-[#1a4fad]">
              Start application
            </motion.button>
            <motion.button whileTap={{ scale: 0.94 }} transition={SN} onClick={onClose}
              className="rounded-xl border border-[#e2e8f0] px-5 text-[14px] font-semibold text-[#64748b] hover:bg-[#f8fafc]">
              Later
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AidSection({ profile, aidTotal }) {
  const [filter,  setFilter]  = useState('All');
  const [modal,   setModal]   = useState(null);
  const programmes = matchAid(profile);
  const eligible   = programmes.filter(p => p.status === 'eligible');
  const computedTotal = eligible.reduce((s, p) => {
    const n = p.amount.startsWith('RM') ? parseInt(p.amount.replace(/[^\d]/g, ''), 10) : 0;
    return s + (isNaN(n) ? 0 : n);
  }, 0);
  const total = aidTotal ?? computedTotal;
  const cats    = ['All', ...new Set(programmes.map(p => p.cat))];
  const visible = programmes.filter(p => filter === 'All' || p.cat === filter);

  return (
    <div className="flex flex-col gap-5">
      {/* wallet banner */}
      <motion.div variants={FADE_UP}
        className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#001f6b] to-[#003399] p-6 text-white shadow-sm">

        {/* top label row — explains both sides */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/50">Estimated eligible aid</p>
          <p className="text-[11px] text-white/40">Based on your profile</p>
        </div>

        {/* main row: amount left, profile right */}
        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[38px] font-extrabold leading-none text-[#F7C800]">
              RM {total.toLocaleString()}
            </p>
            <p className="mt-2 text-[13px] text-white/55">
              {eligible.length} programmes matched · {profile.state}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7C800] text-[14px] font-extrabold text-[#001f6b]">
              {profile.incomeGroup[0]}
            </div>
            <div>
              <p className="text-[13px] font-bold">{profile.householdType}</p>
              <p className="text-[11px] text-white/55">{profile.dependants} dependant{profile.dependants !== 1 ? 's' : ''} · {profile.vehicle}</p>
            </div>
          </div>
        </div>

      </motion.div>

      {/* filter chips */}
      <motion.div variants={FADE_UP}>
        <LayoutGroup>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {cats.map(c => (
              <motion.button key={c} type="button" onClick={() => setFilter(c)}
                whileTap={{ scale: 0.92 }} transition={SN}
                className={`relative shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-colors ${
                  filter === c ? 'border-[#003399] bg-[#003399] text-white' : 'border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#003399]'
                }`}>
                {filter === c && <motion.span layoutId="aid-chip" className="absolute inset-0 rounded-full bg-[#003399]" style={{ zIndex: -1 }} transition={SS} />}
                {c}
              </motion.button>
            ))}
          </div>
        </LayoutGroup>
      </motion.div>

      {/* cards */}
      <AnimatePresence mode="wait">
        <motion.div key={filter} className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={STAGGER} initial="hidden" animate="show">
          {visible.map(p => <AidCard key={p.id} prog={p} onApply={setModal} />)}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {modal && <ApplyModal prog={modal} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BILL TRACKER SECTION
───────────────────────────────────────────────────────────── */
function BillCard({ bill, watching, onToggle }) {
  const bar = CAT_BAR[bill.category] || 'bg-slate-400';
  return (
    <motion.div variants={FADE_UP}
      className="relative overflow-hidden rounded-2xl border border-[#e8edf8] bg-white shadow-sm">
      <div className={`absolute inset-y-0 left-0 w-1 ${bar}`} />
      <div className="px-5 py-4 pl-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${CAT_CLS[bill.category] || 'bg-slate-50 text-slate-600'}`}>{bill.category}</span>
              <span className="text-[12px] font-semibold text-[#003399]">{STAGES[bill.stage - 1]}</span>
            </div>
            <p className="text-[14px] font-semibold leading-snug text-[#0f172a]">{bill.name}</p>
            <PipelineBar stage={bill.stage} />
          </div>
          <motion.button type="button" onClick={() => onToggle(bill.id)}
            whileTap={{ scale: 0.87 }} transition={SN}
            className={`mt-0.5 shrink-0 rounded-xl border px-3.5 py-2 text-[12px] font-bold transition-colors ${
              watching ? 'border-[#003399] bg-[#003399] text-white shadow-md' : 'border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] hover:border-[#003399] hover:text-[#003399]'
            }`}>
            {watching ? '🔔 Watching' : '+ Alert'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function BillSection() {
  const [input,    setInput]    = useState('');
  const [keywords, setKeywords] = useState(['diesel', 'housing loan']);
  const [watching, setWatching] = useState(new Set(['diesel']));
  const [alerts,   setAlerts]   = useState({ whatsapp: true, email: true, push: false });

  const addKeyword = () => {
    const kw = input.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) setKeywords(ks => [...ks, kw]);
    setInput('');
  };
  const removeKeyword = kw => setKeywords(ks => ks.filter(k => k !== kw));
  const toggleWatch   = id  => setWatching(w => { const n = new Set(w); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const matched = keywords.length === 0 ? [] : BILLS.filter(b =>
    keywords.some(kw => b.keywords.some(bk => bk.includes(kw)) || b.name.toLowerCase().includes(kw))
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] md:items-start gap-6">

      {/* Left column: subscription config */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={EX}
        className="overflow-hidden rounded-2xl border border-[#e8edf8] bg-white shadow-sm md:sticky md:top-[69px]">
        <div className="p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#94a3b8]">Subscribe to keywords</p>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addKeyword()}
              placeholder='e.g. "diesel", "housing loan", "epf"'
              className="flex-1 rounded-xl border border-[#e2e8f0] px-4 py-2.5 text-[13px] outline-none focus:border-[#003399] placeholder:text-[#cbd5e1]"
            />
            <motion.button type="button" onClick={addKeyword} whileTap={{ scale: 0.92 }} transition={SN}
              className="rounded-xl bg-[#003399] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#1a4fad]">
              Add
            </motion.button>
          </div>
          {keywords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <AnimatePresence>
                {keywords.map(kw => (
                  <motion.span key={kw} layout
                    initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }} transition={SN}
                    className="flex items-center gap-1.5 rounded-full bg-[#003399] pl-3 pr-2 py-1 text-[12px] font-semibold text-white">
                    {kw}
                    <button type="button" onClick={() => removeKeyword(kw)}
                      className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] hover:bg-white/40">✕</button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
        <div className="border-t border-[#f1f5f9]" />
        <div className="p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#94a3b8]">Notify me via</p>
          <div className="flex flex-wrap gap-3">
            {[{ k: 'whatsapp', icon: '📱', label: 'WhatsApp' }, { k: 'email', icon: '📧', label: 'Email' }, { k: 'push', icon: '🔔', label: 'Push' }].map(ch => (
              <motion.button key={ch.k} type="button" whileTap={{ scale: 0.93 }} transition={SN}
                onClick={() => setAlerts(a => ({ ...a, [ch.k]: !a[ch.k] }))}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                  alerts[ch.k] ? 'border-[#86efac] bg-[#f0fdf4] text-[#16a34a]' : 'border-[#e2e8f0] bg-[#f8fafc] text-[#94a3b8]'
                }`}>
                <span>{ch.icon}</span>{ch.label}
                <span className="text-[10px]">{alerts[ch.k] ? '✓' : '—'}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right column: matched bills */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...EX, delay: 0.06 }}>
        {keywords.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#e2e8f0] p-8 text-center text-[13px] text-[#94a3b8]">
            Add a keyword above to see matching bills
          </p>
        ) : matched.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#e2e8f0] p-8 text-center text-[13px] text-[#94a3b8]">
            No bills matched — try "diesel", "housing", or "epf"
          </p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={keywords.join()} className="flex flex-col gap-4" variants={STAGGER} initial="hidden" animate="show">
              {matched.map(b => <BillCard key={b.id} bill={b} watching={watching.has(b.id)} onToggle={toggleWatch} />)}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   POLICY TIMELINE — DRAGGABLE DIFF SLIDER
───────────────────────────────────────────────────────────── */
function DiffSlider({ diff }) {
  const [pos,       setPos]      = useState(50);
  const containerRef             = useRef(null);
  const dragging                 = useRef(false);

  const updatePos = useCallback(clientX => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.max(15, Math.min(85, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  return (
    <div className="rounded-2xl border border-[#e8edf8] overflow-hidden shadow-sm">
      {/* clause label */}
      <div className="border-b border-[#e8edf8] bg-[#f8fafc] px-5 py-3">
        <p className="text-[13px] font-bold text-[#334155]">{diff.clause}</p>
        <p className="mt-0.5 text-[11px] text-[#94a3b8]">Drag the divider to compare before & after</p>
      </div>

      {/* slider */}
      <div
        ref={containerRef}
        className="relative flex select-none cursor-col-resize"
        onPointerMove={e => { if (dragging.current) updatePos(e.clientX); }}
        onPointerUp={() => { dragging.current = false; }}
        onPointerLeave={() => { dragging.current = false; }}
      >
        {/* left: before */}
        <div style={{ width: `${pos}%` }} className="shrink-0 overflow-hidden bg-[#fff8f8] p-5">
          <p className="mb-2 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-[#dc2626]">❌ Before (v3.0)</p>
          <p className="break-words text-[13px] leading-relaxed text-[#7f1d1d] line-through decoration-[#dc2626]/30">{diff.removed}</p>
        </div>

        {/* drag handle */}
        <div
          className="relative z-10 flex shrink-0 cursor-col-resize flex-col items-center bg-[#003399]"
          style={{ width: '3px' }}
          onPointerDown={e => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); }}
          onPointerMove={e => { if (dragging.current) updatePos(e.clientX); }}
          onPointerUp={() => { dragging.current = false; }}
        >
          <motion.div
            className="pointer-events-none absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#003399] bg-white text-[#003399] shadow-xl"
            whileHover={{ scale: 1.15 }} transition={SN}
          >
            <span className="text-sm font-bold select-none">⇔</span>
          </motion.div>
        </div>

        {/* right: after */}
        <div className="flex-1 overflow-hidden bg-[#f6fef9] p-5">
          <p className="mb-2 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-[#16a34a]">✅ After (v4.0)</p>
          <p className="break-words text-[13px] leading-relaxed text-[#14532d] font-medium">{diff.added}</p>
        </div>
      </div>

      {/* who is affected */}
      <div className="border-t border-[#e8edf8] bg-[#f8fafc] px-5 py-3">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">Who is affected</p>
        <div className="flex flex-wrap gap-1.5">
          {diff.impact.map(g => (
            <span key={g} className="rounded-full border border-[#c7d7ff] bg-[#f0f4ff] px-2.5 py-0.5 text-[12px] font-semibold text-[#003399]">{g}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineSection() {
  const [selected, setSelected] = useState('diesel');
  const diffs = DIFFS[selected] || [];
  const bill  = BILLS.find(b => b.id === selected);

  return (
    <motion.div className="flex flex-col gap-6" variants={STAGGER} initial="hidden" animate="show">

      {/* bill selector */}
      <motion.div variants={FADE_UP} className="rounded-2xl border border-[#e8edf8] bg-white p-5 shadow-sm">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#94a3b8]">Select a bill to compare</p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(DIFFS).map(id => {
            const b = BILLS.find(x => x.id === id);
            return (
              <motion.button key={id} type="button" onClick={() => setSelected(id)}
                whileTap={{ scale: 0.92 }} transition={SN}
                className={`rounded-xl border px-4 py-2 text-[13px] font-semibold transition-colors ${
                  selected === id ? 'border-[#003399] bg-[#003399] text-white shadow' : 'border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#003399]'
                }`}>
                {b?.name.split(' ').slice(0, 3).join(' ')}…
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* plain-language summary */}
      <motion.div variants={FADE_UP}
        className="rounded-2xl border border-[#fde68a] bg-gradient-to-br from-[#fffbea] to-[#fef9e0] p-5 shadow-sm">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#92400e]">📋 Plain-language summary — v3.0 → v4.0</p>
        <AnimatePresence mode="wait">
          <motion.p key={selected} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }} transition={EX}
            className="text-[14px] leading-relaxed text-[#78350f]">
            {selected === 'diesel'
              ? 'The blanket RM0.30/litre diesel subsidy was removed and replaced with a means-tested RM200/month credit. Only B40 households with a registered diesel vehicle and a verified PADU profile qualify. Everyone else pays market price from Oct 2024.'
              : 'EPF contributions are now split three ways. The new Account 3 (10%) lets members withdraw at any time for any purpose. This reduces long-term retirement savings but provides emergency liquidity for members below 55.'}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* diff sliders */}
      <AnimatePresence mode="wait">
        <motion.div key={selected} className="flex flex-col gap-4" variants={STAGGER} initial="hidden" animate="show">
          {diffs.map((d, i) => (
            <motion.div key={i} variants={FADE_UP}>
              <DiffSlider diff={d} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

    </motion.div>
  );
}


/* ─────────────────────────────────────────────────────────────
   DASHBOARD (long scroll, profile-powered)
───────────────────────────────────────────────────────────── */
const TRACKER_TABS = [
  { id: 'aid',      emoji: '🎁',  label: 'Aid Eligibility',  short: 'Aid',      sub: 'Programmes you qualify for, ranked by deadline' },
  { id: 'bills',    emoji: '📋',  label: 'Bill Tracker',     short: 'Bills',    sub: 'Subscribe to keywords — get notified as bills move through Parliament' },
  { id: 'timeline', emoji: '📜',  label: 'Policy Timeline',  short: 'Timeline', sub: 'Drag the divider to compare exact text changes between bill versions' },
];

function Dashboard({ profile, aidTotal }) {
  const [activeTab, setActiveTab] = useState('aid');

  return (
    <div className="px-8 py-6 md:px-10">

      {/* nav group: profile chip + tab bar — treated as one block */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={EX}
        className="mb-8 flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 text-[13px] font-semibold text-[#334155] shadow-sm">
          <span>👤</span>
          <span>{[profile.incomeGroup, profile.state, profile.householdType].filter(Boolean).join(' · ')}</span>
        </div>
        <div className="flex gap-1 rounded-xl border border-[#e2e8f0] bg-white p-1 shadow-sm">
          {TRACKER_TABS.map(t => (
            <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
              className={`relative flex-1 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                activeTab === t.id ? 'bg-[#003399] text-white shadow-sm' : 'text-[#64748b] hover:text-[#003399]'
              }`}>
              <span className="mr-1">{t.emoji}</span>
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.short}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={EX}>
          {activeTab === 'aid'      && <AidSection profile={profile} aidTotal={aidTotal} />}
          {activeTab === 'bills'    && <BillSection />}
          {activeTab === 'timeline' && <TimelineSection />}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOT EXPORT — receives profile from PolicyBrainPage
───────────────────────────────────────────────────────────── */
export default function PolicyTrackerView({ profile: rawProfile, aidTotal }) {
  const profile = rawProfile ? normalizeProfile(rawProfile) : null;

  const eligibleTotal = profile
    ? matchAid(profile).filter(p => p.status === 'eligible').reduce((s, p) => s + (p.amount.startsWith('RM') ? parseInt(p.amount.replace(/[^\d]/g, ''), 10) || 0 : 0), 0)
    : 0;

  return (
    <div className="flex min-h-full flex-col bg-[#f4f7ff]">
      {/* content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {!profile
            ? <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={EX}
                className="flex flex-col items-center justify-center gap-4 px-5 py-24 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0f4ff] text-3xl">📋</div>
                <p className="text-[18px] font-extrabold text-[#0f172a]">Profile not set up yet</p>
                <p className="max-w-xs text-[14px] leading-relaxed text-[#64748b]">
                  Set up your profile in the <strong>Chat</strong> tab to see your personalised aid eligibility and tracker.
                </p>
              </motion.div>
            : <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={EX}>
                <Dashboard profile={profile} aidTotal={aidTotal} />
              </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>
  );
}

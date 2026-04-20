import { useEffect, useRef, useState } from 'react';
import { motion as Motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useModeTheme } from '../hooks/useModeTheme';

const UNIQUE_ICON_SOURCES = [
  '/landing-icons/new-car.gif',
  '/landing-icons/team-building.gif',
  '/landing-icons/tsunami.gif',
  '/landing-icons/flood.gif',
  '/landing-icons/supercar.gif',
  '/landing-icons/building-1.gif',
  '/landing-icons/tsunami-1.gif',
  '/landing-icons/flood-1.gif',
  '/landing-icons/mini-car.gif',
  '/landing-icons/corporate-culture.gif',
  '/landing-icons/tsunami-2.gif',
  '/landing-icons/flood-2.gif',
  '/landing-icons/car.gif',
  '/landing-icons/building.gif',
  '/landing-icons/tsunami-3.gif',
  '/landing-icons/flood-3.gif',
  '/landing-icons/steering-wheel.gif',
  '/landing-icons/wave.gif',
];

const LANDING_ICONS = Array.from({ length: 42 }, (_, index) => {
  const source = UNIQUE_ICON_SOURCES[index % UNIQUE_ICON_SOURCES.length];
  const size = 48 + Math.floor(Math.random() * 34);
  return {
    id: `icon-${index + 1}`,
    src: source,
    left: `${Math.random() * 100}%`,
    size,
    delay: -1 * (Math.random() * 12),
    duration: 5.5 + Math.random() * 6,
    driftX: (Math.random() * 66 - 33).toFixed(1),
    rotate: Math.random() * 420 - 210,
    opacity: 0.52 + Math.random() * 0.4,
  };
});

const STATS = [
  { icon: '🛡️', value: '4,200+', label: 'Citizens Protected' },
  { icon: '📋', value: '12',     label: 'Active Policies Tracked' },
  { icon: '🏠', value: '3',      label: 'PPS Shelters Mapped' },
  { icon: '⚡', value: '42ms',   label: 'AI Response Time' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: '🎯',
    title: 'Choose Your Mode',
    desc: 'Select Peace-Time for policy intelligence or switch to Crisis-Time the moment a flood alert is issued for your area.',
  },
  {
    step: '02',
    icon: '🤖',
    title: 'AI Analyses For You',
    desc: 'Gemini reads legal documents or live sensor feeds and gives you plain-language answers, not raw data dumps.',
  },
  {
    step: '03',
    icon: '✅',
    title: 'Act With Confidence',
    desc: 'Evacuate to the nearest shelter, auto-submit your flood aid claim, or forecast how a new policy hits your household.',
  },
];

const PARTNERS = [
  'NADMA', 'JPS Malaysia', 'JKM', 'MET Malaysia',
  'BOMBA Malaysia', 'KKM', 'JMG Malaysia', 'EPU Malaysia',
  'KPKT', 'Penang State Govt', 'Selangor State Govt', 'MyCC',
];

function PeaceScene() {
  return (
    <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-[#475569] bg-[#0B132B]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_20%,rgba(255,204,0,0.2),transparent_35%),radial-gradient(circle_at_78%_76%,rgba(255,255,255,0.09),transparent_42%)]" />
      <img
        src="/policy-compass.avif"
        alt="Policy and city landscape"
        className="relative z-10 h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-[#0B132B] to-transparent" />
    </div>
  );
}

function CrisisScene() {
  return (
    <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-[#2b4a66] bg-[#0F2942]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_22%,rgba(14,165,233,0.24),transparent_34%),radial-gradient(circle_at_78%_72%,rgba(237,28,36,0.18),transparent_40%)]" />
      <img
        src="/flood-shield.avif"
        alt="Flood response landscape"
        className="relative z-10 h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-[#0F2942] to-transparent" />
    </div>
  );
}

function IconDropBand() {
  const prefersReducedMotion = useReducedMotion();
  const bandRef = useRef(null);
  const [followIconId, setFollowIconId] = useState(null);
  const [mousePoint, setMousePoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!followIconId) {
      return undefined;
    }

    const handleMove = (event) => {
      setMousePoint({ x: event.clientX, y: event.clientY });
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setFollowIconId(null);
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [followIconId]);

  return (
    <div
      ref={bandRef}
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      onClick={() => setFollowIconId(null)}
    >
      {LANDING_ICONS.map((icon) => (
        <Motion.img
          key={icon.id}
          src={icon.src}
          alt=""
          aria-hidden="true"
          className={`pointer-events-auto select-none mix-blend-multiply ${followIconId === icon.id ? '' : 'absolute'}`}
          style={
            followIconId === icon.id
              ? {
                  position: 'fixed',
                  left: mousePoint.x - icon.size / 2,
                  top: mousePoint.y - icon.size / 2,
                  width: icon.size,
                  height: icon.size,
                  zIndex: 12,
                }
              : { left: icon.left, top: '-12vh', width: icon.size, height: icon.size, opacity: icon.opacity, zIndex: 10 }
          }
          initial={
            prefersReducedMotion
              ? { y: 0, x: 0, opacity: icon.opacity, rotate: 0 }
              : { y: '-8vh', x: 0, opacity: 0, rotate: 0 }
          }
          animate={
            followIconId === icon.id
              ? { opacity: 1, scale: 1.08, rotate: 0, zIndex: 12 }
              : prefersReducedMotion
                ? { y: 0, x: 0, opacity: icon.opacity, scale: 1, rotate: 0, zIndex: 10 }
                : {
                    y: ['-8vh', '100vh'],
                    x: [0, Number(icon.driftX)],
                    opacity: [0, icon.opacity, icon.opacity, 0],
                    scale: [0.92, 1.02, 1],
                    rotate: [0, icon.rotate],
                    zIndex: 10,
                  }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  y: { duration: icon.duration, delay: icon.delay, ease: 'linear', repeat: Infinity, repeatDelay: 0 },
                  x: { duration: icon.duration, delay: icon.delay, ease: 'linear', repeat: Infinity, repeatDelay: 0 },
                  opacity: {
                    duration: icon.duration,
                    delay: icon.delay,
                    ease: 'linear',
                    times: [0, 0.08, 0.98, 1],
                    repeat: Infinity,
                    repeatDelay: 0,
                  },
                  scale: { duration: icon.duration, delay: icon.delay, ease: 'linear', repeat: Infinity, repeatDelay: 0 },
                  rotate: { duration: icon.duration, delay: icon.delay, ease: 'linear', repeat: Infinity, repeatDelay: 0 },
                }
          }
          onClick={(event) => {
            event.stopPropagation();
            setMousePoint({ x: event.clientX, y: event.clientY });
            setFollowIconId((current) => (current === icon.id ? null : icon.id));
          }}
        />
      ))}
    </div>
  );
}

/* ── AID CALCULATION (based on sign-up profile) ───────────────────────────── */
function calcAid(p) {
  if (!p) return { total: 0, count: 0 };
  const incomeMap = { '<1500': 1000, '1500-2500': 2000, '2500-4000': 3250, '4000-5000': 4500, '>5000': 6000 };
  const sizeMap   = { '1': 1, '2': 2, '3-4': 3.5, '5+': 6 };
  const income    = incomeMap[p.income] ?? 3000;
  const size      = sizeMap[p.householdSize] ?? 3;
  const perCapita = income / size;
  let total = 0, count = 0;
  if (income < 5000)    { total += income < 2500 ? 2400 : income < 3500 ? 2100 : 1800; count++; }
  if (perCapita < 1169) { total += 960;  count++; } // MyKasih RM80/month
  if (p.hasSchoolKids === 'yes') { total += 200;  count++; } // Baucar Buku
  if (p.hasOKU === 'yes')        { total += 3600; count++; } // Bantuan OKU RM300/month
  return { total, count };
}

export default function MainGatewayLanding({ onLaunch, onAuthComplete, userProfile }) {
  useModeTheme('landing');
  const [entering,    setEntering]    = useState(null);   // null | 'PEACE' | 'CRISIS'
  const [pendingMode, setPendingMode] = useState(null);   // card clicked, waiting for auth
  const [authView,    setAuthView]    = useState('signup'); // 'signup' | 'login'
  const [form, setForm] = useState({
    name: '', ic: '', income: '', householdSize: '', employment: '', hasOKU: '', hasSchoolKids: '', password: '',
  });

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleEnter = (mode) => {
    setEntering(mode);
    setTimeout(() => onLaunch?.(mode), 700);
  };

  const handleCardClick = (mode) => {
    if (userProfile) { handleEnter(mode); return; }
    setPendingMode(mode);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    onAuthComplete?.({ ...form, authView });
    const mode = pendingMode;
    setPendingMode(null);
    handleEnter(mode);
  };

  return (
    <main className="landing-page relative min-h-screen bg-white text-slate-950">

      {/* ── TOPBAR ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 flex h-[60px] items-center gap-4 border-b border-slate-200 bg-white/95 px-6 backdrop-blur-sm md:px-10">
        <a href="#/" className="flex flex-shrink-0 items-center gap-2.5" style={{ textDecoration: 'none' }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#001f6b] to-[#1a4fad] text-xs font-black text-[#FFCC00] shadow-sm">
            1P
          </div>
          <span className="font-peace text-[15px] font-bold text-[#003399]">
            1<span className="text-[#F7C800]">Peace</span>
          </span>
        </a>

        <div className="flex-1" />

        <div className="hidden items-center gap-7 text-sm font-medium text-slate-500 md:flex">
          {['About', 'Features', 'Partners'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="transition-colors hover:text-slate-900"
              style={{ textDecoration: 'none' }}
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="hidden rounded-lg border border-slate-300 px-4 py-[6px] text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:block"
          >
            Sign In
          </button>
          <button
            type="button"
            className="rounded-lg bg-[#0B132B] px-4 py-[6px] text-sm font-semibold text-white transition-colors hover:bg-[#1a2744]"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── HERO + CARDS ────────────────────────────────────────────────────── */}
      <section className="relative z-30 mx-auto w-full max-w-6xl px-6 pb-20 pt-14 md:px-10">
        <header className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-600">
            🇲🇾 Built for Malaysia
          </div>

          <h1 className="landing-heading font-peace text-4xl font-bold tracking-tight text-[#0B132B] md:text-6xl">
            One Malaysia 1 Peace
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#334155] md:text-lg">
            A citizen-first operating layer that turns complex policy into practical everyday decisions and
            transitions communities into real-time flood and tsunami response when risk escalates.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-400" />
              Live flood monitoring
            </span>
            <span className="hidden text-slate-200 sm:inline">·</span>
            <span>AI policy translation</span>
            <span className="hidden text-slate-200 sm:inline">·</span>
            <span>Automated aid claims</span>
          </div>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <Motion.button
            type="button"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            onClick={() => handleCardClick('PEACE')}
            className="group flex h-[35rem] w-full flex-col rounded-3xl border border-[#475569] bg-[#0B132B] p-5 text-left text-white shadow-[0_20px_60px_rgba(2,9,19,0.35)]"
          >
            <PeaceScene />
            <div className="mt-5 flex flex-1 flex-col">
              <p className="font-peace text-xs font-semibold uppercase tracking-[0.18em] text-[#f8e59d]">Peace-Time</p>
              <h2 className="font-peace mt-2 text-3xl font-semibold">Policy Compass</h2>
              <p className="font-peace mt-4 flex-1 text-sm leading-relaxed text-white/80">
                Translate legal text into plain language, forecast household-level economic effects, and reveal how
                policy shifts impact nearby hospitals, clinics, schools, and city systems before disruption begins.
              </p>
              <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#FFCC00] px-4 py-2 text-sm font-semibold text-[#0B132B] shadow-[0_0_18px_rgba(255,204,0,0.35)]">
                Enter
                <span aria-hidden="true">-&gt;</span>
              </div>
            </div>
          </Motion.button>

          <Motion.button
            type="button"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.65, ease: 'easeOut' }}
            onClick={() => handleCardClick('CRISIS')}
            className="group flex h-[35rem] w-full flex-col rounded-3xl border border-[#2b4a66] bg-[#030610] p-5 text-left text-white shadow-[0_20px_60px_rgba(1,5,14,0.55)]"
          >
            <CrisisScene />
            <div className="mt-5 flex flex-1 flex-col">
              <p className="font-peace text-xs font-semibold uppercase tracking-[0.2em] text-[#8fc7ff]">Crisis-Time</p>
              <h2 className="font-peace mt-2 text-3xl font-semibold">Flood Shield</h2>
              <p className="font-peace mt-4 flex-1 text-sm leading-relaxed text-white/80">
                Monitor flood and tsunami escalation, identify nearest shelters and safer movement corridors, and
                access high-speed situational insights with a direct path to automated emergency aid workflows.
              </p>
              <div className="font-peace mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#FFCC00] px-4 py-2 text-sm font-semibold text-[#0B132B] shadow-[0_0_18px_rgba(255,204,0,0.35)]">
                Enter
                <span aria-hidden="true">-&gt;</span>
              </div>
            </div>
          </Motion.button>
        </div>
      </section>

      {/* ── STATS STRIP ─────────────────────────────────────────────────────── */}
      <section className="relative z-30 border-y border-slate-100 bg-[#f8fafc] py-14">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {STATS.map(({ icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="mb-2 text-3xl">{icon}</div>
                <div className="font-peace text-3xl font-bold text-[#0B132B]">{value}</div>
                <div className="mt-1 text-sm text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="features" className="relative z-30 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Simple by design</p>
            <h2 className="font-peace text-3xl font-bold text-[#0B132B] md:text-4xl">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, icon, title, desc }) => (
              <div key={step} className="rounded-2xl border border-slate-100 bg-slate-50 p-7">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B132B] text-lg">{icon}</span>
                  <span className="font-peace text-xs font-bold text-slate-400 tracking-widest">{step}</span>
                </div>
                <h3 className="font-peace mb-2 text-lg font-bold text-[#0B132B]">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY ──────────────────────────────────────────────────────── */}
      <section id="partners" className="relative z-30 border-t border-slate-100 bg-[#f8fafc] py-12">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Trusted by &amp; aligned with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {PARTNERS.map((name) => (
              <div
                key={name}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer id="about" className="relative z-30 bg-[#0B132B] py-12 text-white">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="flex flex-col gap-10 md:flex-row md:gap-16">

            <div className="flex-shrink-0 md:w-56">
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1a4fad] to-[#3b7de8] text-xs font-black text-[#FFCC00]">
                  1P
                </div>
                <span className="font-peace text-[15px] font-bold text-[#003399]">
                  1<span className="text-[#F7C800]">Peace</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed text-white/50">
                Citizen-first intelligence for a more resilient Malaysia.
              </p>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Product</h4>
                {['Policy Compass', 'Flood Shield', 'Claim Aid', 'Disaster Guide'].map((item) => (
                  <div key={item} className="mb-2.5 cursor-pointer text-sm text-white/60 transition-colors hover:text-white">{item}</div>
                ))}
              </div>
              <div>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Resources</h4>
                {['Documentation', 'API Reference', 'Status Page', 'Changelog'].map((item) => (
                  <div key={item} className="mb-2.5 cursor-pointer text-sm text-white/60 transition-colors hover:text-white">{item}</div>
                ))}
              </div>
              <div>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Legal</h4>
                {['Privacy Policy', 'Terms of Use', 'Data Handling', 'Contact'].map((item) => (
                  <div key={item} className="mb-2.5 cursor-pointer text-sm text-white/60 transition-colors hover:text-white">{item}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/30">
            &copy; 2026 1Peace &middot; One Malaysia Initiative &middot; Built with Gemini 2.0, Vertex AI Search, Google AI Studio
          </div>
        </div>
      </footer>

      {/* ── AUTH MODAL ──────────────────────────────────────────────────────── */}
      {pendingMode && (
        <div
          style={{
            position:'fixed',inset:0,zIndex:60,
            background:'rgba(11,19,43,0.72)',backdropFilter:'blur(8px)',
            display:'flex',alignItems:'center',justifyContent:'center',padding:20,
          }}
          onClick={() => setPendingMode(null)}
        >
          <div
            style={{
              background:'white',borderRadius:24,padding:'36px 32px',
              width:'100%',maxWidth:460,
              boxShadow:'0 32px 80px rgba(0,0,0,0.28)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ fontSize:26, fontWeight:900, color:'#003399' }}>Welcome, Rakyat 🇲🇾</div>
              <div style={{ fontSize:13, color:'#64748b', marginTop:6 }}>
                {authView === 'signup'
                  ? 'Create an account to personalise your aid eligibility and policy insights.'
                  : 'Sign in to your 1Peace account.'}
              </div>
            </div>

            {/* Tab toggle */}
            <div style={{ display:'flex', background:'#f1f5f9', borderRadius:12, padding:4, marginBottom:24 }}>
              {['signup','login'].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAuthView(v)}
                  style={{
                    flex:1, padding:'8px 0', borderRadius:9, border:'none', cursor:'pointer',
                    fontWeight:700, fontSize:13, transition:'all .15s',
                    background: authView === v ? '#003399' : 'transparent',
                    color: authView === v ? 'white' : '#64748b',
                  }}
                >
                  {v === 'signup' ? 'Sign Up' : 'Log In'}
                </button>
              ))}
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {authView === 'signup' ? (
                <>
                  <input
                    placeholder="Full name"
                    required
                    value={form.name}
                    onChange={e => setF('name', e.target.value)}
                    style={{ width:'100%',padding:'10px 14px',borderRadius:10,border:'1.5px solid #e2e8f0',fontSize:14,outline:'none',boxSizing:'border-box' }}
                  />
                  <input
                    placeholder="IC number (e.g. 901234-12-5678)"
                    required
                    value={form.ic}
                    onChange={e => setF('ic', e.target.value)}
                    style={{ width:'100%',padding:'10px 14px',borderRadius:10,border:'1.5px solid #e2e8f0',fontSize:14,outline:'none',boxSizing:'border-box' }}
                  />
                  <select
                    required
                    value={form.income}
                    onChange={e => setF('income', e.target.value)}
                    style={{ width:'100%',padding:'10px 14px',borderRadius:10,border:'1.5px solid #e2e8f0',fontSize:14,outline:'none',background:'white',boxSizing:'border-box' }}
                  >
                    <option value="">Monthly household income</option>
                    <option value="<1500">Below RM 1,500</option>
                    <option value="1500-2500">RM 1,500 – 2,500</option>
                    <option value="2500-4000">RM 2,500 – 4,000</option>
                    <option value="4000-5000">RM 4,000 – 5,000</option>
                    <option value=">5000">Above RM 5,000</option>
                  </select>
                  <select
                    required
                    value={form.householdSize}
                    onChange={e => setF('householdSize', e.target.value)}
                    style={{ width:'100%',padding:'10px 14px',borderRadius:10,border:'1.5px solid #e2e8f0',fontSize:14,outline:'none',background:'white',boxSizing:'border-box' }}
                  >
                    <option value="">Household size</option>
                    <option value="1">1 person</option>
                    <option value="2">2 persons</option>
                    <option value="3-4">3–4 persons</option>
                    <option value="5+">5 or more</option>
                  </select>
                  <select
                    required
                    value={form.employment}
                    onChange={e => setF('employment', e.target.value)}
                    style={{ width:'100%',padding:'10px 14px',borderRadius:10,border:'1.5px solid #e2e8f0',fontSize:14,outline:'none',background:'white',boxSizing:'border-box' }}
                  >
                    <option value="">Employment status</option>
                    <option value="employed">Employed (private / government)</option>
                    <option value="self-employed">Self-employed / freelance</option>
                    <option value="unemployed">Unemployed / seeking work</option>
                    <option value="retired">Retired</option>
                  </select>
                  <select
                    required
                    value={form.hasOKU}
                    onChange={e => setF('hasOKU', e.target.value)}
                    style={{ width:'100%',padding:'10px 14px',borderRadius:10,border:'1.5px solid #e2e8f0',fontSize:14,outline:'none',background:'white',boxSizing:'border-box' }}
                  >
                    <option value="">Any OKU (disabled) household member?</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  <select
                    required
                    value={form.hasSchoolKids}
                    onChange={e => setF('hasSchoolKids', e.target.value)}
                    style={{ width:'100%',padding:'10px 14px',borderRadius:10,border:'1.5px solid #e2e8f0',fontSize:14,outline:'none',background:'white',boxSizing:'border-box' }}
                  >
                    <option value="">Any school-going children?</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </>
              ) : (
                <>
                  <input
                    placeholder="IC number"
                    required
                    value={form.ic}
                    onChange={e => setF('ic', e.target.value)}
                    style={{ width:'100%',padding:'10px 14px',borderRadius:10,border:'1.5px solid #e2e8f0',fontSize:14,outline:'none',boxSizing:'border-box' }}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={form.password}
                    onChange={e => setF('password', e.target.value)}
                    style={{ width:'100%',padding:'10px 14px',borderRadius:10,border:'1.5px solid #e2e8f0',fontSize:14,outline:'none',boxSizing:'border-box' }}
                  />
                </>
              )}

              <button
                type="submit"
                style={{
                  marginTop:6, padding:'12px 0', borderRadius:12, border:'none',
                  background:'#003399', color:'white', fontWeight:800, fontSize:14, cursor:'pointer',
                }}
              >
                {authView === 'signup' ? 'Create Account & Continue →' : 'Sign In & Continue →'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setPendingMode(null)}
              style={{
                marginTop:12, width:'100%', padding:'10px 0', borderRadius:12,
                border:'1.5px solid #e2e8f0', background:'white', color:'#64748b',
                fontWeight:600, fontSize:13, cursor:'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── ENTER OVERLAY ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {entering && (
          <Motion.div
            key="enter-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: entering === 'PEACE' ? '#0B132B' : '#030610',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
            }}
          >
            <div style={{ fontSize: 48 }}>{entering === 'PEACE' ? '🎯' : '🛡️'}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>
              {entering === 'PEACE' ? 'Opening Policy Compass…' : 'Activating Flood Shield…'}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      <IconDropBand />
    </main>
  );
}

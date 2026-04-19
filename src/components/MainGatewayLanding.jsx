import { useEffect, useRef, useState } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
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

export default function MainGatewayLanding({ onLaunch }) {
  useModeTheme('landing');

  return (
    <main className="landing-page relative min-h-screen overflow-hidden bg-white px-6 pb-44 pt-12 text-slate-950 md:px-10">
      <section className="relative z-30 mx-auto w-full max-w-6xl">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="landing-heading font-peace text-4xl font-bold tracking-tight text-[#0B132B] md:text-6xl">
            One Malaysia 1 Peace{' '}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#334155] md:text-lg">
            A citizen-first operating layer that turns complex policy into practical everyday decisions and
            transitions communities into real-time flood and tsunami response when risk escalates.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <Motion.button
            type="button"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            onClick={() => onLaunch?.('PEACE')}
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
            onClick={() => onLaunch?.('CRISIS')}
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

      <IconDropBand />
    </main>
  );
}

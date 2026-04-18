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

const LANDING_ICONS = UNIQUE_ICON_SOURCES.map((src, index) => {
  const iconNumber = index + 1;
  const oddOrder = Math.floor(index / 2);
  const evenOrder = Math.floor((index - 1) / 2);
  const phaseDelay = iconNumber % 2 === 1 ? oddOrder * 0.05 : 0.62 + evenOrder * 0.05;
  const pairIndex = Math.floor(index / 2);
  const pairBaseLeft = 4 + pairIndex * 10.2;
  const pairOffset = iconNumber % 2 === 1 ? 0 : 4.9;

  return {
    id: `icon-${iconNumber}`,
    src,
    left: `${pairBaseLeft + pairOffset}%`,
    size: index % 5 === 0 ? 82 : index % 4 === 0 ? 76 : index % 3 === 0 ? 72 : 68,
    settleY: [-10, 6, -4, 5, -8, 7, -6, 4, -7][index % 9],
    delay: phaseDelay,
    driftX: (index % 2 === 0 ? 1 : -1) * (18 + (index % 4) * 5),
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
          className={`pointer-events-auto select-none mix-blend-multiply ${followIconId === icon.id ? '' : 'absolute bottom-4'}`}
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
              : { left: icon.left, width: icon.size, height: icon.size, zIndex: 10 }
          }
          initial={
            prefersReducedMotion
              ? { y: icon.settleY, x: 0, opacity: 1, rotate: 0 }
              : { y: -980, x: icon.driftX, opacity: 0, rotate: icon.driftX > 0 ? 6 : -6 }
          }
          animate={
            followIconId === icon.id
              ? { opacity: 1, scale: 1.08, rotate: 0, zIndex: 12 }
              : prefersReducedMotion
                ? { y: icon.settleY, x: 0, opacity: 1, scale: 1, rotate: 0, zIndex: 10 }
                : {
                    y: [-980, icon.settleY + 26, icon.settleY - 14, icon.settleY + 8, icon.settleY],
                    x: [icon.driftX, icon.driftX * -0.18, icon.driftX * 0.1, 0],
                    opacity: [0, 1, 1, 1, 1],
                    scale: [0.92, 1.03, 0.99, 1.01, 1],
                    rotate: [icon.driftX > 0 ? 8 : -8, icon.driftX > 0 ? -4 : 4, 2, -1, 0],
                    zIndex: 10,
                  }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  y: { duration: 1.5, delay: icon.delay, times: [0, 0.72, 0.86, 0.94, 1], ease: 'easeOut' },
                  x: { duration: 1.5, delay: icon.delay, times: [0, 0.4, 0.72, 1], ease: 'easeOut' },
                  opacity: { duration: 0.18, delay: icon.delay },
                  scale: { duration: 1.5, delay: icon.delay, times: [0, 0.72, 0.86, 0.94, 1] },
                  rotate: { duration: 1.5, delay: icon.delay, times: [0, 0.62, 0.8, 0.94, 1] },
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
    <main className="landing-page relative min-h-screen overflow-hidden px-6 pb-44 pt-12 text-slate-950 md:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(11,19,43,0.06),transparent_35%),radial-gradient(circle_at_80%_8%,rgba(237,28,36,0.07),transparent_28%),radial-gradient(circle_at_60%_75%,rgba(255,204,0,0.12),transparent_30%)]" />

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

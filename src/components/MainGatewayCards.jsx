import React from 'react';
import { motion as Motion } from 'framer-motion';

function CityScene() {
  return (
    <div
      className="relative h-56 w-full overflow-hidden rounded-2xl border border-[#475569] bg-cover bg-center"
      style={{ backgroundImage: "url('/city-policy.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/80 via-[#0B132B]/45 to-[#0B132B]/20" />
      <Motion.div
        className="absolute left-6 top-6 h-10 w-10 rounded-full bg-[#FFCC00]/55 blur-[1px]"
        animate={{ scale: [1, 1.08, 1], opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <Motion.div
        className="absolute bottom-4 h-[3px] w-10 rounded-full bg-[#FFCC00] shadow-[0_0_12px_rgba(255,204,0,0.6)]"
        initial={{ x: -40 }}
        animate={{ x: 460 }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

function FloodScene() {
  return (
    <div
      className="relative h-56 w-full overflow-hidden rounded-2xl border border-[#475569] bg-cover bg-center"
      style={{ backgroundImage: "url('/flood-disaster.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/80 via-[#0B132B]/45 to-[#0B132B]/20" />
      <div className="absolute inset-0 overflow-hidden opacity-55">
        {Array.from({ length: 10 }).map((_, idx) => (
      <Motion.span
            key={idx}
            className="absolute top-[-20px] h-8 w-px bg-white/60"
            style={{ left: `${idx * 9 + 5}%` }}
            animate={{ y: [0, 220], opacity: [0, 1, 0] }}
            transition={{ duration: 0.9 + (idx % 3) * 0.24, delay: idx * 0.09, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>
      <Motion.div
        className="absolute -bottom-9 left-[-8%] h-24 w-[118%] rounded-[50%] bg-[#0f58a8]/45"
        animate={{ y: [0, -8, 0], x: [0, -10, 0] }}
        transition={{ duration: 3.3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

export default function MainGatewayCards({ onLaunch }) {
  const cards = [
    {
      id: 'PEACE',
      title: 'Category 1',
      subtitle: 'Policy + Economic Impact',
      description: 'City-oriented intelligence with buildings, transport, and people-level policy interpretation.',
      Scene: CityScene,
      cardTone: 'bg-[#0B132B] hover:border-[#FFCC00]/45',
    },
    {
      id: 'CRISIS',
      title: 'Category 2',
      subtitle: 'Flood + Tsunami Operations',
      description: 'Disaster layer focused on water risk, early warnings, and action routes during emergency windows.',
      Scene: FloodScene,
      cardTone: 'bg-[#0B132B] hover:border-[#FFCC00]/45',
    },
  ];

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B132B] px-6 py-12 font-sans text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-12%] h-[30rem] w-[30rem] rounded-full bg-[#FFCC00]/10 blur-[140px]" />
        <div className="absolute -right-24 bottom-[-16%] h-[30rem] w-[30rem] rounded-full bg-[#ED1C24]/10 blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">1Peace Main Gateway</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70 md:text-base">
            Choose one direction to start. Left focuses on policy-to-daily-life insight, right focuses on flood and tsunami response.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {cards.map((card, index) => (
            <Motion.button
              key={card.id}
              type="button"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.14, duration: 0.55, ease: 'easeOut' }}
              onClick={() => onLaunch?.(card.id)}
              className={`group flex h-[34rem] w-full flex-col rounded-3xl border border-[#475569] bg-white/[0.05] p-5 text-left shadow-[0_18px_56px_rgba(2,9,19,0.45)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 ${card.cardTone}`}
            >
              <card.Scene />
              <div className="mt-5 flex flex-1 flex-col">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">{card.title}</p>
                <h2 className="mt-2 text-3xl font-semibold">{card.subtitle}</h2>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-white/75">{card.description}</p>
                <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#FFCC00] px-4 py-2 text-sm font-semibold text-[#0B132B] shadow-[0_0_18px_rgba(255,204,0,0.35)]">
                  Enter
                  <span aria-hidden="true">{'->'}</span>
                </div>
              </div>
            </Motion.button>
          ))}
        </div>
      </div>
    </main>
  );
}

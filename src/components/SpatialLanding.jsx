import React from 'react';
import { motion } from 'framer-motion';

// --- 微动效组件：平时城市与车流 ---
const PeaceGraphic = () => (
  <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-gradient-to-b from-[#0A192F]/40 to-[#0A192F]/80">
    {/* 柔和的月亮/太阳 */}
    <motion.div 
      className="absolute top-6 left-10 h-12 w-12 rounded-full bg-[#FFCC00]/20 blur-sm"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
    <div className="absolute top-6 left-10 h-12 w-12 rounded-full bg-[#FFCC00]/40" />

    {/* 城市建筑群 (错落有致) */}
    <div className="absolute bottom-4 flex w-full items-end justify-around px-8 opacity-60">
      <motion.div className="w-8 bg-[#E2E8F0]/20 rounded-t-sm" initial={{ height: 0 }} animate={{ height: 80 }} transition={{ duration: 1 }} />
      <motion.div className="w-12 bg-[#E2E8F0]/30 rounded-t-sm" initial={{ height: 0 }} animate={{ height: 120 }} transition={{ duration: 1.2 }} />
      <motion.div className="w-10 bg-[#E2E8F0]/20 rounded-t-sm" initial={{ height: 0 }} animate={{ height: 60 }} transition={{ duration: 0.8 }} />
      <motion.div className="w-16 bg-[#E2E8F0]/40 rounded-t-sm" initial={{ height: 0 }} animate={{ height: 140 }} transition={{ duration: 1.5 }} />
      <motion.div className="w-8 bg-[#E2E8F0]/20 rounded-t-sm" initial={{ height: 0 }} animate={{ height: 90 }} transition={{ duration: 1.1 }} />
    </div>

    {/* 马路与穿梭的汽车 */}
    <div className="absolute bottom-0 h-4 w-full bg-white/5 border-t border-white/10" />
    <motion.div 
      className="absolute bottom-[2px] h-3 w-10 rounded-full bg-[#FFCC00]/80 shadow-[0_0_10px_rgba(255,204,0,0.5)]"
      initial={{ x: -50 }}
      animate={{ x: 600 }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

// --- 微动效组件：灾时洪水与海啸 ---
const CrisisGraphic = () => (
  <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-gradient-to-b from-[#1A0B13]/60 to-[#2A0810]/90">
    {/* 警示光晕 */}
    <motion.div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-[#ED1C24]/20 blur-[40px]"
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* 降雨效果 */}
    <div className="absolute inset-0 opacity-20">
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-[1px] h-8 bg-white/40 rotate-12"
          style={{ left: `${i * 10}%`, top: -40 }}
          animate={{ y: [0, 200], opacity: [0, 1, 0] }}
          transition={{ duration: 0.6 + Math.random(), repeat: Infinity, ease: "linear", delay: Math.random() }}
        />
      ))}
    </div>

    {/* 动态海啸/洪水波浪 (交叠起伏) */}
    <motion.div 
      className="absolute -bottom-10 -left-10 h-32 w-[150%] rounded-[100%] bg-[#0B5394]/60 mix-blend-screen"
      animate={{ x: [-20, -50, -20], y: [0, -15, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div 
      className="absolute -bottom-16 -left-20 h-40 w-[160%] rounded-[100%] bg-[#ED1C24]/30 mix-blend-screen"
      animate={{ x: [-50, -10, -50], y: [0, -20, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

export default function SpatialLanding({ onLaunch }) {
  const cards = [
    {
      id: 'PEACE',
      title: 'Policy Brain',
      subtitle: 'Category 1: Everyday Life',
      description: 'AI translates complex bills into plain language. See how budgets, taxes, and subsidies impact your daily commute and local city facilities.',
      graphic: <PeaceGraphic />,
      accentColor: 'hover:border-[#FFCC00]/50 hover:shadow-[0_0_40px_rgba(255,204,0,0.15)]',
      btnColor: 'bg-white/10 hover:bg-[#FFCC00] hover:text-black text-white'
    },
    {
      id: 'CRISIS',
      title: 'Disaster Twin',
      subtitle: 'Category 2: Emergency Response',
      description: 'When disaster strikes. 3D spatial intel maps flood zones, routes you to safety, and unleashes the AI Aid Copilot for instant relief claims.',
      graphic: <CrisisGraphic />,
      accentColor: 'hover:border-[#ED1C24]/50 hover:shadow-[0_0_40px_rgba(237,28,36,0.2)]',
      btnColor: 'bg-[#ED1C24] hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
    }
  ];

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center bg-[#030610] font-sans p-6 md:p-12 overflow-hidden selection:bg-[#FFCC00] selection:text-black">
      
      {/* 柔和的大背景环境光 (马来西亚色调融合) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] h-[40rem] w-[40rem] rounded-full bg-[#1c2d5c]/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[30rem] w-[30rem] rounded-full bg-[#ED1C24]/10 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        
        {/* 主标题区 */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
            1Peace <span className="text-[#FFCC00]">OS</span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto text-sm md:text-base">
            Bridging the gap between everyday policy transparency and autonomous disaster resilience.
          </p>
        </motion.div>

        {/* 双卡片并排布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2, duration: 0.6, type: "spring", stiffness: 80 }}
              className={`group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all duration-500 cursor-pointer ${card.accentColor}`}
              onClick={() => onLaunch && onLaunch(card.id)}
            >
              {/* 顶部动态插画区 */}
              <div className="w-full">
                {card.graphic}
              </div>

              {/* 底部文字与按钮区 */}
              <div className="p-8 flex flex-col flex-grow">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
                  {card.subtitle}
                </span>
                <h2 className="text-3xl font-semibold text-white mb-4">
                  {card.title}
                </h2>
                <p className="text-white/70 leading-relaxed mb-10 flex-grow text-sm md:text-base">
                  {card.description}
                </p>
                
                <button 
                  className={`w-full py-4 rounded-xl font-bold tracking-wide transition-all duration-300 ${card.btnColor}`}
                >
                  Enter {card.title} →
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
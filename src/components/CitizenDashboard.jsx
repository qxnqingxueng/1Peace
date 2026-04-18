import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MapDashboard from './MapDashboard'; 

const PHASES = { POLICY: '1_POLICY_BRAIN', WARNING: '2_DISASTER_WARNING', LIVEOPS: '3_LIVE_OPS', AID: '4_AID_COPILOT' };

export default function CitizenDashboard() {
  const [currentPhase, setCurrentPhase] = useState(PHASES.POLICY);
  const [userProfile] = useState({ incomeGroup: "B40", location: "Butterworth", dependencies: 2 });
  const [aidState, setAidState] = useState({ status: 'idle', response: null });

  const mapMode = currentPhase === PHASES.POLICY ? 'PEACE' : 'CRISIS';

  const handleFileUpload = async () => {
    setAidState({ status: 'processing', response: null });
    setTimeout(() => {
      setAidState({
        status: 'success',
        response: { status: "success", message: "Automated verification complete. BWI Aid of RM1,000 submitted. Tracking ID: #BWI-9527", user_notified: true }
      });
    }, 3500);
  };

  const panelVariants = {
    initial: { opacity: 0, x: -20, filter: 'blur(4px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 100, damping: 15 } },
    exit: { opacity: 0, x: 20, filter: 'blur(4px)', transition: { duration: 0.2 } }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen bg-[#050814] text-white overflow-hidden font-sans antialiased">
      <div className="w-full md:w-1/3 lg:w-1/4 p-6 flex flex-col z-10 bg-[#0B132B]/95 shadow-2xl shadow-black/50 border-r border-white/10">
        <div className="mb-8 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
          <h2 className="text-xl font-bold tracking-tight text-white mb-1">1Peace OS</h2>
          <div className="flex gap-2 text-xs text-white/70">
            <span className="px-2 py-1 rounded bg-[#050814] border border-white/10">{userProfile.location}</span>
            <span className="px-2 py-1 rounded bg-[#FFCC00]/20 text-[#FFCC00] border border-[#FFCC00]/30">{userProfile.incomeGroup}</span>
          </div>
        </div>

        <div className="flex-grow relative">
          <AnimatePresence mode="wait">
            {currentPhase === PHASES.POLICY && (
              <motion.div key="phase1" variants={panelVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-sm uppercase tracking-widest text-[#FFCC00] mb-2 font-bold">Policy Brain Active</h3>
                  <p className="text-sm leading-relaxed text-white/80">
                    Based on the upcoming Budget 2026, your <span className="text-white font-semibold">B40</span> status qualifies you for expanded utility subsidies. Local healthcare budgets remain secure.
                  </p>
                </div>
                <button onClick={() => setCurrentPhase(PHASES.WARNING)} className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/15 text-sm font-bold">
                  Simulate Incoming Storm ⛈️
                </button>
              </motion.div>
            )}

            {currentPhase === PHASES.WARNING && (
              <motion.div key="phase2" variants={panelVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <div className="p-5 rounded-2xl bg-red-900/20 border border-red-500/50 ring-1 ring-red-500 shadow-[0_0_15px_rgba(237,28,36,0.2)]">
                  <h3 className="text-sm uppercase tracking-widest text-[#ED1C24] mb-2 font-bold animate-pulse">Disaster Twin Warning</h3>
                  <p className="text-sm leading-relaxed text-white/85">
                    ⚠️ <span className="font-bold text-white">Heavy Rain Alert.</span> Predictive 3D models show impending flood risk in your sector. Map updated with projected zones.
                  </p>
                </div>
                <button onClick={() => setCurrentPhase(PHASES.LIVEOPS)} className="w-full py-4 rounded-xl bg-[#ED1C24] hover:bg-red-600 transition-colors text-white text-sm font-bold shadow-lg shadow-red-500/30">
                  Flood Hits Home 🌊
                </button>
              </motion.div>
            )}

            {currentPhase === PHASES.LIVEOPS && (
              <motion.div key="phase3" variants={panelVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <div className="p-5 rounded-2xl bg-white/5 border border-[#FFCC00]/30">
                  <h3 className="text-sm uppercase tracking-widest text-[#FFCC00] mb-2 font-bold">Live Ops Initiated</h3>
                  <p className="text-sm leading-relaxed text-white/80">
                    Crisis management active. <span className="text-white font-semibold">Click anywhere on the map</span> to retrieve real-time data via Gemini Flash.
                  </p>
                </div>
                <button onClick={() => setCurrentPhase(PHASES.AID)} className="w-full py-4 rounded-xl bg-[#FFCC00] hover:bg-yellow-500 transition-colors text-black text-sm font-bold shadow-lg shadow-yellow-500/20 mt-8">
                  Apply for Relief
                </button>
              </motion.div>
            )}

            {currentPhase === PHASES.AID && (
              <motion.div key="phase4" variants={panelVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 flex flex-col h-full justify-center">
                <h3 className="text-xl font-bold text-white mb-2">Aid Copilot</h3>
                
                {aidState.status === 'idle' && (
                  <div onClick={handleFileUpload} className="border-2 border-dashed border-white/20 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-[#FFCC00] transition-all group">
                    <svg className="w-10 h-10 text-white/60 group-hover:text-[#FFCC00] mb-3 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <p className="text-sm text-white/80 text-center">Click to upload muddy TNB Bill</p>
                  </div>
                )}

                {aidState.status === 'processing' && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="w-12 h-12 border-4 border-white/15 border-t-[#FFCC00] rounded-full animate-spin"></div>
                    <p className="text-sm text-[#FFCC00] animate-pulse">Agent verifying OCR & Policy...</p>
                  </div>
                )}

                {aidState.status === 'success' && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-5 rounded-2xl bg-[#ED1C24]/10 border border-[#ED1C24]/40">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#FFCC00] flex items-center justify-center text-black font-bold">✓</div>
                      <h4 className="font-bold text-[#FFCC00]">Claim Approved</h4>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">{aidState.response.message}</p>
                    <button onClick={() => { setCurrentPhase(PHASES.POLICY); setAidState({status: 'idle', response: null}); }} className="mt-6 text-xs text-white/60 hover:text-[#FFCC00] underline underline-offset-4">
                      Reset Journey to Peace-time
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="w-full md:w-2/3 lg:w-3/4 relative">
        <MapDashboard appMode={mapMode} />
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import MapDashboard from './MapDashboard';
import { useModeTheme } from '../hooks/useModeTheme';

/* ─────────────────────────────────────────────────────────────────────────────
   SCOPED CSS  (mirrors PolicyBrainPage pattern — injected on mount)
───────────────────────────────────────────────────────────────────────────── */
const CSS = `
.co-shell {
  --cr-bg:      #060d1a;
  --cr-surface: #0d1929;
  --cr-border:  #1e3a5c;
  --cr-accent:  #3b82f6;
  --cr-gold:    #FFCC00;
  --cr-red:     #ef4444;
  --cr-green:   #22c55e;
  --cr-text:    #e2e8f0;
  --cr-muted:   #64748b;
  --cr-dim:     #94a3b8;
  --sidebar-w:  256px;
  --right-w:    280px;
  --topbar-h:   52px;
  position: fixed; inset: 0; z-index: 50;
  font-family: 'Segoe UI', system-ui, Arial, sans-serif;
  background: var(--cr-bg);
  color: var(--cr-text);
  display: flex; flex-direction: column; overflow: hidden;
}
.co-shell * { box-sizing: border-box; }

/* TOPBAR — mirrors PolicyBrainPage .topbar structure */
.co-shell .topbar {
  height: var(--topbar-h);
  background: var(--cr-surface);
  border-bottom: 1px solid var(--cr-border);
  display: flex; align-items: center;
  padding: 0 16px; gap: 10px;
  flex-shrink: 0; position: relative; z-index: 20;
  box-shadow: 0 1px 0 rgba(255,255,255,0.03);
}
.co-shell .brand {
  display: flex; align-items: center; gap: 8px;
  background: none; border: none; cursor: pointer;
  padding: 4px 8px; border-radius: 8px;
  transition: background 0.15s; flex-shrink: 0;
  text-decoration: none;
}
.co-shell .brand:hover { background: rgba(255,255,255,0.05); }
.co-shell .brand-mark {
  width: 30px; height: 30px; border-radius: 8px;
  background: linear-gradient(135deg, #001f6b, #1a4fad);
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 12px; color: var(--cr-gold);
  box-shadow: 0 2px 8px rgba(0,51,153,.4);
}
.co-shell .brand-name { font-weight: 800; font-size: 15px; color: #003399; }
.co-shell .brand-name span { color: #F7C800; }
.co-shell .topbar-sep { width: 1px; height: 22px; background: var(--cr-border); flex-shrink: 0; }
.co-shell .crisis-pill {
  display: flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 20px;
  background: rgba(59,130,246,0.1);
  border: 1px solid rgba(59,130,246,0.28);
  font-size: 11px; font-weight: 700; color: #8fc7ff;
  letter-spacing: 0.12em; text-transform: uppercase; flex-shrink: 0;
}
.co-shell .alert-badge {
  display: flex; align-items: center; gap: 6px;
  padding: 3px 10px; border-radius: 20px;
  background: rgba(239,68,68,0.14);
  border: 1px solid rgba(239,68,68,0.38);
  font-size: 11px; font-weight: 700; color: #fca5a5;
  letter-spacing: 0.07em; flex-shrink: 0;
}
.co-shell .live-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #ef4444;
  animation: co-blink 1.1s ease-in-out infinite;
}
@keyframes co-blink { 0%,100%{opacity:1} 50%{opacity:0.22} }
.co-shell .topbar-spacer { flex: 1; }

/* topbar-nav — same pill shape as PolicyBrainPage */
.co-shell .topbar-nav {
  display: flex; gap: 2px;
  background: rgba(255,255,255,0.04);
  border-radius: 20px; padding: 3px;
  border: 1px solid var(--cr-border);
}
.co-shell .tn-btn {
  padding: 3px 11px; border-radius: 14px;
  border: none; font-size: 11px; font-weight: 700;
  cursor: pointer; color: var(--cr-muted);
  background: transparent; transition: all 0.15s;
}
.co-shell .tn-btn.active { background: var(--cr-accent); color: white; }
.co-shell .notif-btn {
  position: relative; width: 32px; height: 32px;
  border-radius: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--cr-border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 15px; flex-shrink: 0;
  transition: background 0.15s;
}
.co-shell .notif-btn:hover { background: rgba(255,255,255,0.09); }
.co-shell .notif-dot {
  position: absolute; top: 5px; right: 5px;
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--cr-red);
  animation: co-blink 1.1s ease-in-out infinite;
}
.co-shell .back-btn {
  padding: 4px 11px; border-radius: 8px;
  font-size: 11px; font-weight: 600; cursor: pointer;
  border: 1px solid var(--cr-border);
  background: rgba(255,255,255,0.04);
  color: var(--cr-dim); transition: all 0.15s; flex-shrink: 0;
}
.co-shell .back-btn:hover { background: rgba(255,255,255,0.09); color: var(--cr-text); }

/* NOTIFICATION POPUP */
.co-shell .notif-popup {
  position: absolute; top: calc(var(--topbar-h) + 8px); right: 14px;
  width: 284px;
  background: rgba(10,18,34,0.97);
  border: 1px solid rgba(239,68,68,0.42);
  border-radius: 14px; padding: 14px 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.65);
  backdrop-filter: blur(14px); z-index: 100;
  animation: co-drop 0.22s ease-out;
}
@keyframes co-drop { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
.co-shell .np-title {
  font-size: 11px; font-weight: 700; color: #fca5a5;
  display: flex; align-items: center; gap: 6px; margin-bottom: 6px;
}
.co-shell .np-body { font-size: 12px; color: var(--cr-dim); line-height: 1.6; }
.co-shell .np-body strong { color: var(--cr-text); }
.co-shell .np-time { font-size: 10px; color: var(--cr-muted); margin-top: 8px; }
.co-shell .np-close {
  position: absolute; top: 10px; right: 12px;
  background: none; border: none; cursor: pointer;
  font-size: 14px; color: var(--cr-muted); padding: 2px; line-height: 1;
}
.co-shell .np-close:hover { color: var(--cr-dim); }

/* LAYOUT */
.co-shell .layout { display: flex; flex: 1; overflow: hidden; position: relative; }

/* PANEL COLLAPSE STRIPS — always visible between panel and map */
.co-shell .panel-strip {
  width: 14px; flex-shrink: 0;
  background: var(--cr-surface);
  border-color: var(--cr-border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 9px; color: var(--cr-muted);
  transition: background 0.15s, color 0.15s;
  user-select: none;
}
.co-shell .panel-strip:hover { background: rgba(255,255,255,0.06); color: var(--cr-text); }
.co-shell .panel-strip.left-strip { border-right: 1px solid var(--cr-border); }
.co-shell .panel-strip.right-strip { border-left: 1px solid var(--cr-border); }

/* LEFT PANEL */
.co-shell .left-panel {
  width: var(--sidebar-w); min-width: var(--sidebar-w);
  background: var(--cr-surface);
  border-right: 1px solid var(--cr-border);
  display: flex; flex-direction: column;
  overflow-y: auto; overflow-x: hidden;
  transition: width 0.25s ease, min-width 0.25s ease, opacity 0.2s ease;
  flex-shrink: 0;
}
.co-shell .left-panel.closed { width: 0; min-width: 0; opacity: 0; border-right: none; overflow: hidden; }
.co-shell .left-panel::-webkit-scrollbar { width: 3px; }
.co-shell .left-panel::-webkit-scrollbar-thumb { background: var(--cr-border); }

/* RIGHT PANEL */
.co-shell .right-panel {
  width: var(--right-w); min-width: var(--right-w);
  background: var(--cr-surface);
  border-left: 1px solid var(--cr-border);
  display: flex; flex-direction: column;
  overflow-y: auto; overflow-x: hidden;
  transition: width 0.25s ease, min-width 0.25s ease, opacity 0.2s ease;
  flex-shrink: 0;
}
.co-shell .right-panel.closed { width: 0; min-width: 0; opacity: 0; border-left: none; overflow: hidden; }
.co-shell .right-panel::-webkit-scrollbar { width: 3px; }
.co-shell .right-panel::-webkit-scrollbar-thumb { background: var(--cr-border); }

/* PANEL SHARED INTERNALS */
.co-shell .p-section { padding: 12px 14px; border-bottom: 1px solid var(--cr-border); }
.co-shell .p-label {
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--cr-muted); margin-bottom: 8px;
}

/* search box */
.co-shell .search-box {
  display: flex; align-items: center; gap: 7px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--cr-border);
  border-radius: 9px; padding: 7px 10px;
  font-size: 12px; color: var(--cr-dim);
  cursor: pointer; transition: border-color 0.15s;
}
.co-shell .search-box:hover { border-color: var(--cr-accent); }

/* alert card */
.co-shell .alert-card {
  background: rgba(239,68,68,0.09);
  border: 1px solid rgba(239,68,68,0.28);
  border-radius: 10px; padding: 11px 12px;
}
.co-shell .ac-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #fca5a5; margin-bottom: 3px; }
.co-shell .ac-value { font-size: 20px; font-weight: 800; color: #ef4444; line-height: 1; }
.co-shell .ac-sub { font-size: 11px; color: #fca5a5; margin-top: 2px; }
.co-shell .gauge { height: 5px; border-radius: 4px; background: rgba(255,255,255,0.08); margin-top: 9px; overflow: hidden; }
.co-shell .gauge-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg,#f97316,#ef4444); width: 72%; }

/* stats grid */
.co-shell .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
.co-shell .stat-card { background: rgba(255,255,255,0.03); border: 1px solid var(--cr-border); border-radius: 9px; padding: 9px 10px; }
.co-shell .stat-lbl { font-size: 10px; color: var(--cr-muted); margin-bottom: 3px; }
.co-shell .stat-val { font-size: 16px; font-weight: 700; }
.co-shell .stat-unit { font-size: 10px; font-weight: 400; color: var(--cr-muted); }
.co-shell .c-orange { color: #fb923c; }
.co-shell .c-blue { color: #60a5fa; }

/* timeline */
.co-shell .timeline { display: flex; gap: 5px; }
.co-shell .t-tick {
  flex: 1; background: rgba(255,255,255,0.03);
  border: 1px solid var(--cr-border);
  border-radius: 8px; padding: 7px 3px;
  text-align: center; cursor: pointer; transition: all 0.15s;
}
.co-shell .t-tick.on { background: rgba(59,130,246,0.16); border-color: rgba(59,130,246,0.48); }
.co-shell .t-hr { color: var(--cr-muted); font-size: 9px; }
.co-shell .t-dep { font-weight: 700; font-size: 11px; margin-top: 2px; }
.co-shell .d-low { color: #4ade80; }
.co-shell .d-mid { color: #fb923c; }
.co-shell .d-hi  { color: #ef4444; }

/* layer toggles */
.co-shell .tog-row { display: flex; align-items: center; justify-content: space-between; padding: 7px 0; }
.co-shell .tog-row + .tog-row { border-top: 1px solid rgba(255,255,255,0.05); }
.co-shell .tog-lbl { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--cr-dim); }
.co-shell .tog-sw {
  width: 30px; height: 17px; border-radius: 10px;
  position: relative; cursor: pointer;
  transition: background 0.2s; flex-shrink: 0;
}
.co-shell .tog-sw.on  { background: var(--cr-accent); }
.co-shell .tog-sw.off { background: rgba(255,255,255,0.1); }
.co-shell .tog-sw::after {
  content: ''; position: absolute; top: 2px;
  width: 13px; height: 13px; border-radius: 50%;
  background: white; transition: left 0.2s;
}
.co-shell .tog-sw.on::after  { left: 15px; }
.co-shell .tog-sw.off::after { left: 2px; }

/* PPS shelter cards */
.co-shell .pps-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--cr-border);
  border-radius: 10px; padding: 10px 12px;
  margin-bottom: 7px; cursor: pointer; transition: all 0.15s;
}
.co-shell .pps-card:hover { background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.35); }
.co-shell .pps-card.selected { border-color: rgba(34,197,94,0.48); background: rgba(34,197,94,0.06); }
.co-shell .pps-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 6px; }
.co-shell .pps-name { font-size: 12px; font-weight: 600; color: var(--cr-text); line-height: 1.3; }
.co-shell .pps-dist { font-size: 11px; color: var(--cr-accent); font-weight: 600; white-space: nowrap; margin-left: 6px; flex-shrink: 0; }
.co-shell .pps-bar { height: 4px; border-radius: 3px; background: rgba(255,255,255,0.07); margin-bottom: 4px; }
.co-shell .pps-fill { height: 100%; border-radius: 3px; }
.co-shell .pps-bottom { display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: var(--cr-muted); }
.co-shell .pps-badge { font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; }
.co-shell .b-open    { background: rgba(34,197,94,0.14); color: #4ade80; }
.co-shell .b-filling { background: rgba(251,146,60,0.14); color: #fb923c; }
.co-shell .pps-hint { font-size: 10px; color: var(--cr-muted); text-align: center; padding: 4px 0 0; letter-spacing: 0.04em; }

/* escape route */
.co-shell .route-card {
  background: rgba(255,204,0,0.05);
  border: 1px solid rgba(255,204,0,0.2);
  border-radius: 10px; padding: 12px;
}
.co-shell .route-hdr { display: flex; align-items: center; gap: 7px; margin-bottom: 9px; }
.co-shell .route-title { font-size: 12px; font-weight: 700; color: var(--cr-gold); }
.co-shell .route-steps { list-style: none; }
.co-shell .route-step { display: flex; align-items: flex-start; gap: 7px; padding: 5px 0; font-size: 11px; color: var(--cr-dim); border-bottom: 1px solid rgba(255,255,255,0.04); }
.co-shell .route-step:last-child { border-bottom: none; }
.co-shell .step-n {
  width: 16px; height: 16px; border-radius: 50%;
  background: rgba(255,204,0,0.1); border: 1px solid rgba(255,204,0,0.28);
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 700; color: var(--cr-gold);
  flex-shrink: 0; margin-top: 1px;
}
.co-shell .step-warn { color: #fb923c; }

/* AI brief */
.co-shell .ai-card {
  background: rgba(59,130,246,0.06);
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: 10px; padding: 12px;
}
.co-shell .ai-hdr { display: flex; align-items: center; gap: 6px; margin-bottom: 7px; }
.co-shell .ai-title { font-size: 11px; font-weight: 700; color: #60a5fa; letter-spacing: 0.08em; text-transform: uppercase; }
.co-shell .ai-lat { margin-left: auto; font-size: 9px; color: #4ade80; font-weight: 600; }
.co-shell .ai-text { font-size: 11px; line-height: 1.65; color: var(--cr-dim); }
.co-shell .ai-text strong { color: var(--cr-text); }

/* MAP WRAPPER */
.co-shell .map-wrap { flex: 1; overflow: hidden; position: relative; min-width: 0; }

/* TAB BAR */
.co-shell .tab-bar {
  display: flex; height: 40px; flex-shrink: 0;
  background: var(--cr-surface);
  border-bottom: 1px solid var(--cr-border);
}
.co-shell .tab-btn {
  flex: 1; border: none; background: transparent;
  font-size: 12px; font-weight: 600; color: var(--cr-muted);
  cursor: pointer; border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
  letter-spacing: 0.04em;
}
.co-shell .tab-btn:hover { color: var(--cr-text); }
.co-shell .tab-btn.active { color: var(--cr-accent); border-bottom-color: var(--cr-accent); }

/* CLAIM AID PAGE */
.co-shell .aid-layout {
  display: flex; flex: 1; overflow: hidden;
}
.co-shell .aid-col {
  width: 400px; min-width: 400px; flex-shrink: 0;
  background: var(--cr-surface);
  border-right: 1px solid var(--cr-border);
  overflow-y: auto; padding: 16px;
  display: flex; flex-direction: column; gap: 12px;
}
.co-shell .aid-col::-webkit-scrollbar { width: 3px; }
.co-shell .aid-col::-webkit-scrollbar-thumb { background: var(--cr-border); }
.co-shell .aid-chat-col {
  flex: 1; display: flex; flex-direction: column;
  overflow: hidden; background: var(--cr-bg);
}
.co-shell .upload-zone {
  border: 2px dashed rgba(59,130,246,0.35);
  border-radius: 12px; padding: 24px 16px;
  text-align: center; cursor: pointer;
  background: rgba(59,130,246,0.04);
  transition: border-color 0.15s, background 0.15s;
}
.co-shell .upload-zone:hover { border-color: var(--cr-accent); background: rgba(59,130,246,0.08); }
.co-shell .upload-icon { font-size: 28px; margin-bottom: 6px; }
.co-shell .upload-title { font-size: 13px; font-weight: 600; color: var(--cr-text); margin-bottom: 3px; }
.co-shell .upload-sub { font-size: 11px; color: var(--cr-muted); }
.co-shell .thumbs { display: flex; gap: 8px; }
.co-shell .thumb {
  flex: 1; aspect-ratio: 1; border-radius: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--cr-border);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; cursor: pointer;
  transition: border-color 0.15s;
}
.co-shell .thumb.selected { border-color: var(--cr-accent); background: rgba(59,130,246,0.1); }
.co-shell .extract-card {
  background: rgba(34,197,94,0.06);
  border: 1px solid rgba(34,197,94,0.25);
  border-radius: 10px; padding: 12px;
}
.co-shell .extract-hdr { display: flex; align-items: center; gap: 6px; margin-bottom: 9px; font-size: 11px; font-weight: 700; color: #4ade80; letter-spacing: 0.08em; text-transform: uppercase; }
.co-shell .extract-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; font-size: 11px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.co-shell .extract-row:last-child { border-bottom: none; }
.co-shell .extract-key { color: var(--cr-muted); }
.co-shell .extract-val { color: var(--cr-text); font-weight: 600; }
.co-shell .checklist { display: flex; flex-direction: column; gap: 6px; }
.co-shell .check-item { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--cr-dim); }
.co-shell .check-icon { width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; flex-shrink: 0; }
.co-shell .ci-pass { background: rgba(34,197,94,0.15); color: #4ade80; }
.co-shell .ci-fail { background: rgba(239,68,68,0.15); color: #fca5a5; }
.co-shell .aid-chat-msgs {
  flex: 1; overflow-y: auto; padding: 16px;
  display: flex; flex-direction: column; gap: 10px;
}
.co-shell .aid-chat-msgs::-webkit-scrollbar { width: 3px; }
.co-shell .aid-chat-msgs::-webkit-scrollbar-thumb { background: var(--cr-border); }
.co-shell .agent-step {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--cr-border);
  border-radius: 10px; padding: 10px 12px;
  font-size: 11px; color: var(--cr-dim);
  display: flex; align-items: flex-start; gap: 8px;
}
.co-shell .step-icon { font-size: 14px; flex-shrink: 0; }
.co-shell .step-body { flex: 1; }
.co-shell .step-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--cr-muted); margin-bottom: 2px; }
.co-shell .step-done { color: #4ade80; }
.co-shell .step-spin { display: inline-block; animation: co-spin 1s linear infinite; }
@keyframes co-spin { to { transform: rotate(360deg); } }
.co-shell .success-card {
  margin: 0 16px 16px;
  background: rgba(34,197,94,0.08);
  border: 1px solid rgba(34,197,94,0.35);
  border-radius: 12px; padding: 16px;
}
.co-shell .sc-top { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.co-shell .sc-icon { font-size: 22px; }
.co-shell .sc-title { font-size: 14px; font-weight: 800; color: #4ade80; }
.co-shell .sc-sub { font-size: 11px; color: var(--cr-muted); }
.co-shell .sc-amount { font-size: 28px; font-weight: 900; color: #4ade80; margin-bottom: 8px; }
.co-shell .sc-meta { font-size: 10px; color: var(--cr-muted); display: flex; gap: 12px; }
.co-shell .sc-meta span { color: var(--cr-dim); }

/* DISASTER GUIDE PAGE */
.co-shell .guide-layout { display: flex; flex: 1; overflow: hidden; }
.co-shell .guide-main {
  flex: 1; display: flex; flex-direction: column;
  overflow: hidden; background: var(--cr-bg);
}
.co-shell .guide-msgs {
  flex: 1; overflow-y: auto; padding: 20px;
  display: flex; flex-direction: column; gap: 14px;
  max-width: 800px; width: 100%; margin: 0 auto; align-self: center;
}
.co-shell .guide-msgs { width: 100%; }
.co-shell .guide-main > .guide-msgs { max-width: 100%; }
.co-shell .gmsg-user {
  align-self: flex-end; max-width: 60%;
  background: rgba(59,130,246,0.16);
  border: 1px solid rgba(59,130,246,0.3);
  border-radius: 12px 12px 3px 12px;
  padding: 10px 14px; font-size: 13px; color: var(--cr-text);
}
.co-shell .gmsg-ai {
  align-self: flex-start; max-width: 75%;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--cr-border);
  border-radius: 12px 12px 12px 3px;
  padding: 12px 14px; font-size: 13px; color: var(--cr-dim); line-height: 1.65;
}
.co-shell .gmsg-ai strong { color: var(--cr-text); }
.co-shell .gmsg-ai-hdr { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-size: 10px; font-weight: 700; color: #60a5fa; letter-spacing: 0.1em; text-transform: uppercase; }
.co-shell .citations { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.co-shell .citation-chip {
  font-size: 10px; padding: 2px 8px; border-radius: 5px;
  background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.28);
  color: #93c5fd; cursor: pointer; transition: background 0.15s;
}
.co-shell .citation-chip:hover { background: rgba(59,130,246,0.2); }
.co-shell .grounded-tag {
  font-size: 10px; padding: 2px 8px; border-radius: 5px;
  background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25);
  color: #86efac;
}
.co-shell .guide-input-row {
  padding: 12px 16px; border-top: 1px solid var(--cr-border);
  background: var(--cr-surface);
  display: flex; gap: 8px;
}
.co-shell .guide-input {
  flex: 1; background: rgba(255,255,255,0.04);
  border: 1px solid var(--cr-border); border-radius: 9px;
  padding: 8px 12px; font-size: 12px; color: var(--cr-text);
  outline: none; transition: border-color 0.15s;
}
.co-shell .guide-input:focus { border-color: var(--cr-accent); }
.co-shell .guide-input::placeholder { color: var(--cr-muted); }
.co-shell .guide-send {
  padding: 8px 14px; border-radius: 9px;
  background: var(--cr-accent); border: none;
  color: white; font-size: 12px; font-weight: 700;
  cursor: pointer; transition: opacity 0.15s;
}
.co-shell .guide-send:hover { opacity: 0.85; }
.co-shell .guide-sources {
  width: 300px; min-width: 300px; flex-shrink: 0;
  background: var(--cr-surface);
  border-left: 1px solid var(--cr-border);
  overflow-y: auto; padding: 16px;
  display: flex; flex-direction: column; gap: 12px;
}
.co-shell .guide-sources::-webkit-scrollbar { width: 3px; }
.co-shell .guide-sources::-webkit-scrollbar-thumb { background: var(--cr-border); }
.co-shell .vertex-badge {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 10px; border-radius: 8px;
  background: rgba(59,130,246,0.08);
  border: 1px solid rgba(59,130,246,0.2);
  font-size: 10px; font-weight: 700; color: #93c5fd;
  letter-spacing: 0.06em;
}
.co-shell .src-doc {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--cr-border);
  border-radius: 9px; padding: 10px 11px;
}
.co-shell .src-doc-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 5px; }
.co-shell .src-doc-name { font-size: 11px; font-weight: 600; color: var(--cr-text); line-height: 1.3; }
.co-shell .src-relevance { font-size: 10px; font-weight: 700; color: #4ade80; flex-shrink: 0; margin-left: 6px; }
.co-shell .src-doc-org { font-size: 10px; color: var(--cr-muted); margin-bottom: 5px; }
.co-shell .src-doc-snippet { font-size: 11px; color: var(--cr-dim); line-height: 1.55; }
`;


/* ─────────────────────────────────────────────────────────────────────────────
   HARDCODED PPS DATA — 3 shelters, each with its own route + AI brief
───────────────────────────────────────────────────────────────────────────── */
const PPS_LIST = [
  {
    name: 'SK Butterworth 1',
    dist: '1.2 km',
    capacity: 45,
    slots: '270 / 600',
    status: 'open',
    route: {
      title: 'Route to SK Butterworth 1 (1.2km)',
      steps: [
        { warn: false, text: 'Head north on <strong>Jalan Bagan Luar</strong> — road clear' },
        { warn: false, text: 'Turn right onto <strong>Jalan Chain Ferry</strong>' },
        { warn: true,  text: 'Avoid <strong>Jalan Pantai</strong> — flooded 0.9m' },
        { warn: false, text: 'Arrive at PPS — main entrance on left' },
      ],
      ai: 'Water along <strong>Jalan Bagan Luar</strong> rising at 1.4m. <strong>SK Butterworth 1</strong> is optimal at 45% capacity — safe northern corridor confirmed. Est. travel: <strong>8 min</strong>.',
    },
    path: [[100.362, 5.388], [100.358, 5.395], [100.365, 5.402], [100.395, 5.410]],
    coords: [100.395, 5.410],
  },
  {
    name: 'Dewan Masyarakat Butterworth',
    dist: '2.1 km',
    capacity: 72,
    slots: '360 / 500',
    status: 'filling',
    route: {
      title: 'Route to Dewan Masyarakat (2.1km)',
      steps: [
        { warn: false, text: 'Head west on <strong>Jalan Weld Quay</strong>' },
        { warn: true,  text: 'Caution: <strong>Jalan Raja Uda</strong> partially flooded — drive slow' },
        { warn: false, text: 'Turn left onto <strong>Jalan Baru</strong>' },
        { warn: false, text: 'Arrive at Dewan — ground floor entrance' },
      ],
      ai: '<strong>Dewan Masyarakat</strong> is at 72% and filling fast. Western corridor is passable but slowing. Consider <strong>SK Butterworth 1</strong> if time allows. Est. travel: <strong>14 min</strong>.',
    },
    path: [[100.362, 5.388], [100.360, 5.383], [100.355, 5.378], [100.350, 5.375]],
    coords: [100.350, 5.375],
  },
  {
    name: 'Masjid Jamek Butterworth',
    dist: '2.8 km',
    capacity: 28,
    slots: '112 / 400',
    status: 'open',
    route: {
      title: 'Route to Masjid Jamek (2.8km)',
      steps: [
        { warn: false, text: 'Head south on <strong>Jalan Bagan Luar</strong>' },
        { warn: false, text: 'Continue straight onto <strong>Jalan Utama</strong>' },
        { warn: true,  text: 'Detour: <strong>Jalan Teluk Wanjah</strong> closed — use Lorong 3' },
        { warn: false, text: 'Arrive at Masjid — rear entrance open' },
      ],
      ai: '<strong>Masjid Jamek</strong> is the least crowded at 28% — good option if you\'re south of the flood zone. Southern route via Jalan Utama is clear. Est. travel: <strong>19 min</strong>.',
    },
    path: [[100.362, 5.388], [100.368, 5.385], [100.382, 5.382], [100.400, 5.380]],
    coords: [100.400, 5.380],
  },
];

const LAYER_DEFAULTS = { flood: true, pps: true, route: true, radar: false, road: false };
const LAYERS_CONFIG = [
  ['flood', '💧', 'Flood Zones (3D)'],
  ['pps',   '🏠', 'PPS Shelters'],
  ['route', '🛣️', 'Escape Routes'],
  ['radar', '🌧️', 'Rainfall Radar'],
  ['road',  '🚗', 'Road Status'],
];
const FORECAST = [
  { h: 'Now', d: '1.4m', cls: 'd-mid', active: false },
  { h: '+3h', d: '2.1m', cls: 'd-hi',  active: true  },
  { h: '+6h', d: '1.8m', cls: 'd-mid', active: false },
  { h: '+12h',d: '0.6m', cls: 'd-low', active: false },
];

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function CrisisOpsPage({ onBack, userProfile }) {
  useModeTheme('crisis');

  const [leftOpen,   setLeftOpen]   = useState(true);
  const [rightOpen,  setRightOpen]  = useState(true);
  const [selectedPPS, setSelected]  = useState(0);
  const [showNotif,  setShowNotif]  = useState(false);
  const [activeView, setActiveView] = useState('3D');
  const [layers, setLayers]         = useState(LAYER_DEFAULTS);
  const [activeTab,  setActiveTab]  = useState('map');

  // auto-show Japan-style push alert after 1.5 s
  useEffect(() => {
    const t = setTimeout(() => setShowNotif(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // inject + remove scoped CSS (same pattern as PolicyBrainPage)
  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const toggleLayer = (key) => setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  const pps = PPS_LIST[selectedPPS];

  return (
    <div className="co-shell">

      {/* ── TOPBAR ─────────────────────────────────────────────────────────── */}
      <header className="topbar">
        {/* Brand — same shape as PolicyBrainPage .brand */}
        <button className="brand" type="button" onClick={onBack}>
          <div className="brand-mark">1P</div>
          <span className="brand-name">1<span>Peace</span></span>
        </button>

        <div className="topbar-sep" />
        <div className="crisis-pill">⚡ Crisis-Time</div>
        <div className="alert-badge">
          <div className="live-dot" />
          Alert Level 3 — Butterworth
        </div>

        <div className="topbar-spacer" />

        {/* User profile chip */}
        {userProfile && (
          <div style={{ display:'flex', alignItems:'center', gap:7, marginRight:6 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#F7C800,#f59e0b)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#001f6b', flexShrink:0 }}>
              {(userProfile.name || 'U').charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--cr-text)' }}>{(userProfile.name || '').split(' ')[0]}</span>
          </div>
        )}

        {/* View switcher — only shown on Live Map tab */}
        {activeTab === 'map' && (
          <nav className="topbar-nav">
            {['3D', 'Satellite', 'Heatmap'].map((v) => (
              <button
                key={v}
                type="button"
                className={`tn-btn${activeView === v ? ' active' : ''}`}
                onClick={() => setActiveView(v)}
              >
                {v}
              </button>
            ))}
          </nav>
        )}

        {/* Notification bell */}
        <button className="notif-btn" type="button" onClick={() => setShowNotif((s) => !s)}>
          🔔
          {!showNotif && <div className="notif-dot" />}
        </button>

        <button className="back-btn" type="button" onClick={onBack} style={{ fontSize:18, lineHeight:1 }}>←</button>

        {/* Japan-style push notification popup */}
        {showNotif && (
          <div className="notif-popup">
            <div className="np-title">
              <div className="live-dot" />
              FLOOD ALERT — Butterworth, Penang
            </div>
            <div className="np-body">
              Water level risen to <strong>1.4m</strong> near Jalan Bagan Luar.
              Nearest open shelter: <strong>SK Butterworth 1</strong> (1.2km north) — 45% capacity.
            </div>
            <div className="np-time">⏱ Just now · JPS Malaysia via 1Peace</div>
            <button className="np-close" type="button" onClick={() => setShowNotif(false)}>✕</button>
          </div>
        )}
      </header>

      {/* ── TAB BAR ────────────────────────────────────────────────────────── */}
      <div className="tab-bar">
        {[
          { id: 'map',   label: '🗺 Live Map'       },
          { id: 'aid',   label: '🆘 Claim Aid'      },
          { id: 'guide', label: '📖 Disaster Guide' },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`tab-btn${activeTab === id ? ' active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── LIVE MAP ───────────────────────────────────────────────────────── */}
      {activeTab === 'map' && <div className="layout">

        {/* LEFT PANEL */}
        <aside className={`left-panel${leftOpen ? '' : ' closed'}`}>

          {/* Location */}
          <div className="p-section">
            <div className="p-label">📍 Location</div>
            <div className="search-box">🔍 Butterworth, Penang</div>
          </div>

          {/* Alert level */}
          <div className="p-section">
            <div className="p-label">⚠️ Current Alert</div>
            <div className="alert-card">
              <div className="ac-label">Amaran Banjir</div>
              <div className="ac-value">Level 3</div>
              <div className="ac-sub">Bahaya — Paras Merah</div>
              <div className="gauge"><div className="gauge-fill" /></div>
            </div>
          </div>

          {/* Real-time stats */}
          <div className="p-section">
            <div className="p-label">📊 Real-Time Data</div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-lbl">Water Depth</div>
                <div className="stat-val c-orange">1.4<span className="stat-unit">m</span></div>
              </div>
              <div className="stat-card">
                <div className="stat-lbl">Rising Rate</div>
                <div className="stat-val c-blue">+12<span className="stat-unit">cm/h</span></div>
              </div>
              <div className="stat-card">
                <div className="stat-lbl">Pop. Affected</div>
                <div className="stat-val">4,200</div>
              </div>
              <div className="stat-card">
                <div className="stat-lbl">Peak ETA</div>
                <div className="stat-val c-orange">~3<span className="stat-unit">h</span></div>
              </div>
            </div>
          </div>

          {/* 24 h forecast */}
          <div className="p-section">
            <div className="p-label">📅 Depth Forecast</div>
            <div className="timeline">
              {FORECAST.map((f, i) => (
                <div key={i} className={`t-tick${f.active ? ' on' : ''}`}>
                  <div className="t-hr">{f.h}</div>
                  <div className={`t-dep ${f.cls}`}>{f.d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Layer toggles */}
          <div className="p-section">
            <div className="p-label">🗂 Map Layers</div>
            {LAYERS_CONFIG.map(([key, icon, label]) => (
              <div key={key} className="tog-row">
                <div className="tog-lbl"><span>{icon}</span>{label}</div>
                <div
                  className={`tog-sw ${layers[key] ? 'on' : 'off'}`}
                  onClick={() => toggleLayer(key)}
                />
              </div>
            ))}
          </div>

        </aside>

        {/* Left panel collapse strip */}
        <div
          className="panel-strip left-strip"
          title={leftOpen ? 'Collapse left panel' : 'Expand left panel'}
          onClick={() => setLeftOpen((v) => !v)}
        >
          {leftOpen ? '‹' : '›'}
        </div>

        {/* CENTER MAP */}
        <div className="map-wrap">
          <MapDashboard appMode="CRISIS" selectedPPS={selectedPPS} layers={layers} mapView={activeView} />
        </div>

        {/* Right panel collapse strip */}
        <div
          className="panel-strip right-strip"
          title={rightOpen ? 'Collapse right panel' : 'Expand right panel'}
          onClick={() => setRightOpen((v) => !v)}
        >
          {rightOpen ? '›' : '‹'}
        </div>

        {/* RIGHT PANEL */}
        <aside className={`right-panel${rightOpen ? '' : ' closed'}`}>

          {/* PPS shelter cards — clickable to switch route */}
          <div className="p-section">
            <div className="p-label">🏠 Nearest Shelters (PPS)</div>
            {PPS_LIST.map((p, i) => (
              <div
                key={i}
                className={`pps-card${selectedPPS === i ? ' selected' : ''}`}
                onClick={() => setSelected(i)}
              >
                <div className="pps-top">
                  <span className="pps-name">{p.name}</span>
                  <span className="pps-dist">{p.dist} →</span>
                </div>
                <div className="pps-bar">
                  <div
                    className="pps-fill"
                    style={{
                      width: `${p.capacity}%`,
                      background: p.capacity > 70 ? '#fb923c' : '#22c55e',
                    }}
                  />
                </div>
                <div className="pps-bottom">
                  <span>Capacity: {p.capacity}% · {p.slots}</span>
                  <span className={`pps-badge ${p.status === 'open' ? 'b-open' : 'b-filling'}`}>
                    {p.status === 'open' ? 'Open' : 'Filling'}
                  </span>
                </div>
              </div>
            ))}
            <div className="pps-hint">Tap a shelter to update route &amp; AI brief</div>
          </div>

          {/* Active escape route — changes per selectedPPS */}
          <div className="p-section">
            <div className="p-label">🛣️ Active Escape Route</div>
            <div className="route-card">
              <div className="route-hdr">
                <span>⬆️</span>
                <span className="route-title">{pps.route.title}</span>
              </div>
              <ul className="route-steps">
                {pps.route.steps.map((s, i) => (
                  <li key={i} className="route-step">
                    <div className="step-n">{i + 1}</div>
                    <span>
                      {s.warn && <span className="step-warn">⚠️ </span>}
                      <span dangerouslySetInnerHTML={{ __html: s.text }} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Gemini AI brief — changes per selectedPPS */}
          <div className="p-section">
            <div className="p-label">🤖 AI Situational Brief</div>
            <div className="ai-card">
              <div className="ai-hdr">
                <span>✦</span>
                <span className="ai-title">Gemini 2.0 Flash</span>
                <span className="ai-lat">● 42ms</span>
              </div>
              <p className="ai-text" dangerouslySetInnerHTML={{ __html: pps.route.ai }} />
            </div>
          </div>

        </aside>

      </div>}

      {/* ── CLAIM AID ──────────────────────────────────────────────────────── */}
      {activeTab === 'aid' && (
        <div className="aid-layout">

          {/* Left: upload + extraction */}
          <div className="aid-col">
            <div className="p-label">📄 Upload Documents</div>
            <div className="upload-zone">
              <div className="upload-icon">📸</div>
              <div className="upload-title">Drop utility bill / IC photo here</div>
              <div className="upload-sub">JPG, PNG, PDF · max 10 MB · Gemini reads it instantly</div>
            </div>

            <div className="p-label" style={{ marginTop: 4 }}>Recent Uploads</div>
            <div className="thumbs">
              <div className="thumb selected">🧾</div>
              <div className="thumb">🪪</div>
              <div className="thumb">📄</div>
            </div>

            <div className="p-label" style={{ marginTop: 4 }}>✦ Gemini Extraction</div>
            <div className="extract-card">
              <div className="extract-hdr">✓ Data Extracted</div>
              {[
                ['Name',    'Ahmad bin Yusof'],
                ['IC No.',  '810432-07-5219'],
                ['Address', 'No. 14, Jalan Bagan Luar, Butterworth'],
                ['Bill Amt','RM 87.40 (TNB Apr 2026)'],
              ].map(([k, v]) => (
                <div className="extract-row" key={k}>
                  <span className="extract-key">{k}</span>
                  <span className="extract-val">{v}</span>
                </div>
              ))}
            </div>

            <div className="p-label" style={{ marginTop: 4 }}>✅ Eligibility Checklist</div>
            <div className="checklist">
              {[
                [true,  'Malaysian Citizen (IC verified)'],
                [true,  'Flood-affected address confirmed'],
                [true,  'Household income ≤ RM5,000/month'],
                [true,  'No prior BWI claim this year'],
                [false, 'Property ownership docs (optional)'],
              ].map(([pass, label], i) => (
                <div className="check-item" key={i}>
                  <div className={`check-icon ${pass ? 'ci-pass' : 'ci-fail'}`}>{pass ? '✓' : '–'}</div>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Genkit agent chat */}
          <div className="aid-chat-col">
            <div className="aid-chat-msgs">
              <div className="p-label" style={{ marginBottom: 4 }}>🤖 BWI Aid Agent — Genkit Orchestration</div>

              {[
                { done: true,  icon: '🔍', label: 'Identity Verification',      body: 'IC 810432-07-5219 matched against JPN registry — <strong>verified</strong>.' },
                { done: true,  icon: '📍', label: 'Address Geocoding',           body: 'Jalan Bagan Luar confirmed inside <strong>Flood Zone Butterworth-1</strong> (Alert Level 3).' },
                { done: true,  icon: '💰', label: 'Eligibility Scoring',         body: 'Income criteria met · No existing claim · Score: <strong>94/100</strong>.' },
                { done: true,  icon: '📋', label: 'BWI Form Auto-Fill',          body: 'Borang BWI-2026 completed from extracted data. Ready for JKM submission.' },
                { done: false, icon: '⏳', label: 'JKM Portal Submission',       body: 'Submitting to portal.jkm.gov.my… <span class="step-spin">⟳</span>' },
              ].map((s, i) => (
                <div className="agent-step" key={i}>
                  <div className="step-icon">{s.icon}</div>
                  <div className="step-body">
                    <div className={`step-label ${s.done ? 'step-done' : ''}`}>{s.done ? '✓ ' : ''}{s.label}</div>
                    <span dangerouslySetInnerHTML={{ __html: s.body }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="success-card">
              <div className="sc-top">
                <div className="sc-icon">✅</div>
                <div>
                  <div className="sc-title">Aid Approved!</div>
                  <div className="sc-sub">Bantuan Wang Ihsan (BWI) — Flood Relief 2026</div>
                </div>
              </div>
              <div className="sc-amount">RM 1,000.00</div>
              <div className="sc-meta">
                <div>Tracking ID <span>#BWI-9527</span></div>
                <div>Disbursement <span>1–3 business days</span></div>
                <div>Via <span>DuitNow / Bank Islam</span></div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── DISASTER GUIDE ─────────────────────────────────────────────────── */}
      {activeTab === 'guide' && (
        <div className="guide-layout">

          {/* Main chat area */}
          <div className="guide-main">
            <div className="guide-msgs">

              <div className="gmsg-user">
                What is the government's flood compensation policy for homeowners?
              </div>

              <div className="gmsg-ai">
                <div className="gmsg-ai-hdr">✦ Gemini · Grounded via Vertex AI Search</div>
                Under the <strong>Skim Bantuan Bencana Negara (SBBN)</strong>, homeowners in declared flood disaster zones are entitled to:
                <br /><br />
                • <strong>BWI (Bantuan Wang Ihsan)</strong> — RM1,000 per household for immediate relief<br />
                • <strong>Home Repair Grant</strong> — up to RM5,000 for structural damage (means-tested)<br />
                • <strong>Furniture Replacement</strong> — up to RM2,500 via JKM, requires photo evidence<br />
                <br />
                Claims must be filed within <strong>60 days</strong> of the disaster declaration. Applications go through <strong>JKM district offices</strong> or the online portal at portal.jkm.gov.my.
                <div className="citations">
                  <span className="citation-chip">[1] NADMA Circular 2023</span>
                  <span className="citation-chip">[2] JKM Bencana Guidelines</span>
                  <span className="citation-chip">[3] Penang DRO Policy</span>
                  <span className="grounded-tag">✓ Grounded</span>
                </div>
              </div>

              <div className="gmsg-user">
                Is there special aid for flood victims who are also B40 households?
              </div>

              <div className="gmsg-ai">
                <div className="gmsg-ai-hdr">✦ Gemini · Grounded via Vertex AI Search</div>
                Yes. B40 households (household income ≤ RM4,849/month) qualify for <strong>additional top-up aid</strong> under the <strong>Program Bantuan Sara Hidup (BSH) Emergency Supplement</strong>:
                <br /><br />
                • Additional <strong>RM500 emergency supplement</strong> on top of BWI<br />
                • Priority processing — approval within <strong>48 hours</strong><br />
                • E-Kasih registered families are auto-identified; no separate application needed<br />
                <div className="citations">
                  <span className="citation-chip">[1] BSH Emergency Guidelines</span>
                  <span className="citation-chip">[2] MOF Circular B40 Flood</span>
                  <span className="grounded-tag">✓ Grounded</span>
                </div>
              </div>

            </div>

            <div className="guide-input-row">
              <input
                className="guide-input"
                placeholder="Ask about flood policy, aid eligibility, relief procedures…"
                readOnly
              />
              <button className="guide-send" type="button">Send</button>
            </div>
          </div>

          {/* Source documents panel */}
          <div className="guide-sources">
            <div className="p-label">📚 Source Documents</div>
            <div className="vertex-badge">
              <span>🔍</span> Vertex AI Search · RAG
            </div>

            {[
              { name: 'NADMA Flood Compensation Circular 2023', org: 'NADMA Malaysia', relevance: '97%', snippet: 'Bantuan Wang Ihsan disbursement framework for flood-affected households, including eligibility criteria and claim procedures.' },
              { name: 'JKM Disaster Assistance Guidelines v4.2', org: 'Jabatan Kebajikan Masyarakat', relevance: '94%', snippet: 'Means-tested grant matrix for home repair, furniture replacement, and temporary shelter allowances post-flood.' },
              { name: 'Penang State DRO Policy 2024', org: 'Penang Disaster Relief Office', relevance: '91%', snippet: 'State-level supplementary aid for Penang residents, including coordination with district JKM offices in Butterworth.' },
                            { name: 'BSH Emergency Supplement Memo', org: 'Ministry of Finance', relevance: '88%', snippet: 'B40 emergency supplement eligibility, e-Kasih auto-identification, and 48-hour priority processing SLA.' },
            ].map((doc, i) => (
              <div className="src-doc" key={i}>
                <div className="src-doc-top">
                  <div className="src-doc-name">{doc.name}</div>
                  <div className="src-relevance">{doc.relevance}</div>
                </div>
                <div className="src-doc-org">{doc.org}</div>
                <div className="src-doc-snippet">{doc.snippet}</div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}

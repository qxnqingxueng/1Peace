import { useEffect, useRef, useState } from 'react';
import {
  getRedirectResult, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  auth, db, firebaseConfigMessage, googleProvider, isFirebaseConfigured,
} from '../firebase/client';
import PolicyTrackerView from './PolicyTrackerView';
import PolicyImpactView from './PolicyImpactView';

/* ─────────────────────────────────────────────────────────────────────────────
   SCOPED CSS  (injected once, removed on unmount)
───────────────────────────────────────────────────────────────────────────── */
const CSS = `
.pb-shell{
  --blue:#003399;--blue-mid:#1a4fad;--blue-light:#e8edf8;
  --blue-dark:#001f6b;--blue-pale:#f0f4ff;
  --gold:#F7C800;--gold-light:#fffbea;
  --green:#16a34a;--green-light:#f0fdf4;--green-dark:#15803d;
  --red:#dc2626;--red-light:#fef2f2;
  --dark:#0f172a;--gray:#334155;--muted:#64748b;--light-muted:#94a3b8;
  --border:#e2e8f0;--border-light:#f1f5f9;
  --surface:#f8fafc;--white:#ffffff;
  --sidebar-w:256px;--panel-w:420px;--topbar-h:52px;
  --radius:12px;--radius-sm:8px;--radius-lg:16px;
  --shadow-sm:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
  --shadow-md:0 4px 16px rgba(0,51,153,.08);
  position:fixed;inset:0;z-index:50;
  font-family:'Segoe UI',system-ui,Arial,sans-serif;
  color:var(--dark);background:var(--surface);
  display:flex;flex-direction:column;overflow:hidden;
}
.pb-shell *{box-sizing:border-box;}
.pb-shell .topbar *,.pb-shell .layout *{margin:0;padding:0;}

/* topbar */
.pb-shell .topbar{height:var(--topbar-h);background:var(--white);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 20px;flex-shrink:0;box-shadow:var(--shadow-sm);}
.pb-shell .brand{display:flex;align-items:center;gap:10px;text-decoration:none;cursor:pointer;border:none;background:none;}
.pb-shell .brand-mark{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,var(--blue-dark),var(--blue-mid));display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;color:var(--gold);box-shadow:0 2px 8px rgba(0,51,153,.3);}
.pb-shell .brand-name{font-weight:800;font-size:16px;color:var(--blue);}
.pb-shell .brand-name span{color:#F7C800;}
.pb-shell .topbar-right{display:flex;align-items:center;gap:10px;}
.pb-shell .topbar-nav{display:flex;gap:2px;background:var(--surface);border-radius:20px;padding:3px;border:1px solid var(--border);}
.pb-shell .tn-btn{padding:3px 11px;border-radius:14px;border:none;font-size:12px;font-weight:700;cursor:pointer;color:var(--muted);background:transparent;transition:all .15s;}
.pb-shell .tn-btn.active{background:var(--blue);color:white;}
.pb-shell .lang-pill{display:flex;gap:2px;background:var(--surface);border-radius:20px;padding:3px;border:1px solid var(--border);}
.pb-shell .lp-btn{padding:3px 10px;border-radius:14px;border:none;font-size:11px;font-weight:700;cursor:pointer;color:var(--muted);background:transparent;transition:all .15s;}
.pb-shell .lp-btn.active{background:var(--blue);color:white;}
.pb-shell .tp-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--gold),#f59e0b);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:var(--blue-dark);}
.pb-shell .topbar-profile{display:flex;align-items:center;gap:8px;cursor:pointer;padding:4px 8px;border-radius:8px;transition:background .15s;border:none;background:none;}
.pb-shell .topbar-profile:hover{background:var(--surface);}
.pb-shell .tp-name{font-size:13px;font-weight:600;color:var(--dark);}
.pb-shell .tp-tag{font-size:10px;color:var(--muted);}

/* layout */
.pb-shell .layout{display:flex;flex:1;overflow:hidden;}

/* sidebar */
.pb-shell .sidebar{width:var(--sidebar-w);background:var(--white);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0;overflow-y:auto;}
.pb-shell .sidebar::-webkit-scrollbar{width:3px;}
.pb-shell .sidebar::-webkit-scrollbar-thumb{background:var(--border);}
.pb-shell .sidebar-section{padding:14px 12px 6px;}
.pb-shell .sidebar-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--light-muted);margin-bottom:8px;padding:0 4px;}
.pb-shell .aid-wallet{margin:12px 12px 0;background:linear-gradient(135deg,var(--blue-dark),var(--blue-mid));border-radius:var(--radius);padding:14px 16px;color:white;cursor:pointer;transition:opacity .15s;}
.pb-shell .aid-wallet:hover{opacity:.93;}
.pb-shell .aw-label{font-size:10px;opacity:.7;text-transform:uppercase;letter-spacing:.8px;font-weight:700;margin-bottom:3px;}
.pb-shell .aw-amount{font-size:22px;font-weight:900;color:var(--gold);}
.pb-shell .aw-sub{font-size:11px;opacity:.65;margin-top:2px;}
.pb-shell .aw-hint{font-size:10px;opacity:.55;margin-top:6px;}
.pb-shell .tool-btn{display:flex;align-items:center;gap:10px;width:100%;padding:9px 10px;border-radius:10px;border:none;background:transparent;cursor:pointer;text-align:left;transition:all .15s;margin-bottom:2px;position:relative;}
.pb-shell .tool-btn:hover{background:var(--surface);}
.pb-shell .tool-btn.active{background:var(--blue-pale);color:var(--blue);}
.pb-shell .tb-icon{width:34px;height:34px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:16px;background:var(--surface);border:1px solid var(--border);transition:all .15s;}
.pb-shell .tool-btn.active .tb-icon{background:var(--blue);border-color:var(--blue);}
.pb-shell .tb-name{font-size:13px;font-weight:600;color:var(--dark);display:block;}
.pb-shell .tool-btn.active .tb-name{color:var(--blue);}
.pb-shell .tb-desc{font-size:11px;color:var(--muted);display:block;margin-top:1px;}
.pb-shell .tb-badge{min-width:18px;height:18px;border-radius:9px;background:var(--red);color:white;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;padding:0 4px;flex-shrink:0;}
.pb-shell .sidebar-divider{height:1px;background:var(--border-light);margin:8px 12px;}
.pb-shell .recent-item{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;cursor:pointer;transition:background .15s;}
.pb-shell .recent-item:hover{background:var(--surface);}
.pb-shell .recent-icon{font-size:12px;flex-shrink:0;opacity:.5;}
.pb-shell .recent-text{font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pb-shell .profile-bar{margin-top:auto;padding:12px;border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;cursor:pointer;transition:background .15s;border-left:none;border-right:none;border-bottom:none;background:none;width:100%;text-align:left;}
.pb-shell .profile-bar:hover{background:var(--surface);}
.pb-shell .profile-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--gold),#f59e0b);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:var(--blue-dark);flex-shrink:0;}
.pb-shell .pname{font-size:13px;font-weight:600;color:var(--dark);}
.pb-shell .ptag-line{font-size:11px;color:var(--muted);margin-top:1px;}
.pb-shell .profile-complete{margin-left:auto;font-size:10px;font-weight:700;color:var(--green);background:var(--green-light);padding:2px 7px;border-radius:10px;white-space:nowrap;}

/* main / chat */
.pb-shell .main{flex:1;display:flex;overflow:hidden;}
.pb-shell .chat-area{flex:1;display:flex;flex-direction:column;overflow:hidden;background:var(--surface);}
.pb-shell .chat-scroll{flex:1;overflow-y:auto;display:flex;flex-direction:column;scroll-behavior:smooth;}
.pb-shell .chat-scroll::-webkit-scrollbar{width:4px;}
.pb-shell .chat-scroll::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px;}
.pb-shell .chat-inner{max-width:740px;width:100%;margin:0 auto;padding:24px 20px 8px;}

/* welcome */
.pb-shell .welcome-screen{display:flex;flex-direction:column;align-items:center;padding:52px 20px 0;text-align:center;}
.pb-shell .welcome-logo{width:60px;height:60px;border-radius:18px;background:linear-gradient(135deg,var(--blue-dark),var(--blue-mid));display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;color:var(--gold);margin-bottom:20px;box-shadow:0 8px 28px rgba(0,51,153,.25);}
.pb-shell .welcome-greeting{font-size:13px;color:var(--muted);font-weight:500;margin-bottom:6px;}
.pb-shell .welcome-screen h2{font-size:24px;font-weight:800;color:var(--dark);margin-bottom:10px;line-height:1.3;}
.pb-shell .welcome-screen p{font-size:14px;color:var(--muted);max-width:420px;line-height:1.7;}
.pb-shell .quick-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:28px 0 4px;max-width:520px;width:100%;}
.pb-shell .qa-card{background:var(--white);border:1.5px solid var(--border);border-radius:var(--radius);padding:16px;cursor:pointer;text-align:left;transition:all .2s;box-shadow:var(--shadow-sm);border-top-width:1.5px;}
.pb-shell .qa-card:hover{border-color:var(--blue);box-shadow:var(--shadow-md);transform:translateY(-1px);}
.pb-shell .qac-icon{font-size:22px;margin-bottom:8px;}
.pb-shell .qac-title{font-size:13px;font-weight:700;color:var(--dark);margin-bottom:3px;}
.pb-shell .qac-sub{font-size:11px;color:var(--muted);}
.pb-shell .profile-nudge{background:var(--gold-light);border:1.5px solid #fde68a;border-radius:var(--radius);padding:12px 16px;margin:16px 0 0;max-width:520px;width:100%;display:flex;align-items:center;gap:10px;cursor:pointer;transition:opacity .15s;text-align:left;border-top-width:1.5px;}
.pb-shell .profile-nudge:hover{opacity:.9;}
.pb-shell .pn-icon{font-size:18px;flex-shrink:0;}
.pb-shell .pn-text{font-size:12px;color:#92400e;}
.pb-shell .pn-text strong{display:block;font-size:13px;margin-bottom:1px;}
.pb-shell .pn-cta{margin-left:auto;font-size:11px;font-weight:700;color:#92400e;white-space:nowrap;}

/* chips + input */
.pb-shell .chips-bar{background:var(--white);border-top:1px solid var(--border);padding:8px 0 8px 16px;}
.pb-shell .chips-row{display:flex;gap:6px;overflow-x:auto;padding-right:16px;}
.pb-shell .chips-row::-webkit-scrollbar{height:0;}
.pb-shell .chip{white-space:nowrap;padding:6px 14px;border-radius:20px;border:1.5px solid var(--border);background:var(--white);font-size:12px;font-weight:500;cursor:pointer;transition:all .15s;color:var(--gray);flex-shrink:0;}
.pb-shell .chip:hover{border-color:var(--blue);color:var(--blue);background:var(--blue-pale);}
.pb-shell .input-bar{background:var(--white);border-top:1px solid var(--border);padding:12px 16px;}
.pb-shell .input-wrap{max-width:740px;margin:0 auto;display:flex;align-items:flex-end;gap:8px;background:var(--white);border:2px solid var(--border);border-radius:var(--radius-lg);padding:10px 14px;transition:border-color .2s;box-shadow:var(--shadow-sm);}
.pb-shell .input-wrap:focus-within{border-color:var(--blue);box-shadow:0 0 0 3px rgba(0,51,153,.06);}
.pb-shell .chat-ta{flex:1;background:transparent;border:none;outline:none;font-size:14px;resize:none;max-height:160px;min-height:22px;line-height:1.55;font-family:inherit;color:var(--dark);}
.pb-shell .chat-ta::placeholder{color:var(--light-muted);}
.pb-shell .send-btn{width:36px;height:36px;border-radius:10px;border:none;background:var(--blue);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;font-size:16px;}
.pb-shell .send-btn:hover{background:var(--blue-mid);}
.pb-shell .send-btn:disabled{background:var(--border);cursor:not-allowed;}
.pb-shell .input-hint{font-size:10px;color:var(--light-muted);text-align:center;margin-top:6px;max-width:740px;margin-left:auto;margin-right:auto;}

/* messages */
.pb-shell .msg{display:flex;gap:10px;margin-bottom:22px;align-items:flex-start;}
.pb-shell .msg.user{flex-direction:row-reverse;}
.pb-shell .msg-av{width:30px;height:30px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;}
.pb-shell .msg-av.ai{background:linear-gradient(135deg,var(--blue-dark),var(--blue-mid));color:var(--gold);}
.pb-shell .msg-av.user{background:linear-gradient(135deg,var(--gold),#f59e0b);color:var(--blue-dark);}
.pb-shell .msg-content{max-width:600px;}
.pb-shell .msg.user .msg-content{display:flex;flex-direction:column;align-items:flex-end;}
.pb-shell .bubble{background:var(--white);border:1px solid var(--border);border-radius:var(--radius-lg);padding:14px 16px;font-size:14px;line-height:1.75;box-shadow:var(--shadow-sm);}
.pb-shell .msg.user .bubble{background:linear-gradient(135deg,var(--blue),var(--blue-mid));color:white;border-color:transparent;}
.pb-shell .bubble p{margin-bottom:8px;}
.pb-shell .bubble p:last-of-type{margin-bottom:0;}
.pb-shell .bubble strong{font-weight:700;}
.pb-shell .bubble ul{margin:6px 0 8px 20px;}
.pb-shell .bubble li{margin-bottom:4px;}
.pb-shell .info-box{border-radius:var(--radius-sm);padding:11px 13px;margin:8px 0;font-size:13px;line-height:1.6;border-width:1px;border-style:solid;}
.pb-shell .info-box.green{background:var(--green-light);border-color:#86efac;color:#166534;}
.pb-shell .info-box.blue{background:var(--blue-pale);border-color:#93c5fd;color:#1e40af;}
.pb-shell .info-box.gold{background:var(--gold-light);border-color:#fde68a;color:#92400e;}
.pb-shell .info-box.red{background:var(--red-light);border-color:#fca5a5;color:#991b1b;}
.pb-shell .impact-cta{margin:12px 0 4px;background:var(--white);border:2px solid var(--blue-light);border-radius:var(--radius);padding:13px 15px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:all .2s;}
.pb-shell .impact-cta:hover{border-color:var(--blue);background:var(--blue-pale);}
.pb-shell .icta-icon{font-size:22px;flex-shrink:0;}
.pb-shell .icta-body{flex:1;}
.pb-shell .icta-title{font-size:13px;font-weight:700;color:var(--dark);}
.pb-shell .icta-sub{font-size:11px;color:var(--muted);margin-top:2px;}
.pb-shell .icta-arrow{font-size:14px;color:var(--blue);font-weight:700;}
.pb-shell .ref-row{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px;}
.pb-shell .ref-chip{font-size:10px;font-weight:600;padding:3px 9px;border-radius:6px;background:var(--surface);border:1px solid var(--border);color:var(--muted);}
.pb-shell .quick-replies{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;}
.pb-shell .qr-chip{padding:5px 13px;border-radius:16px;border:1.5px solid var(--border);font-size:12px;font-weight:500;cursor:pointer;background:var(--white);color:var(--gray);transition:all .15s;}
.pb-shell .qr-chip:hover{border-color:var(--blue);color:var(--blue);background:var(--blue-pale);}
.pb-shell .typing-bubble{background:var(--white);border:1px solid var(--border);border-radius:var(--radius-lg);padding:14px 18px;display:inline-flex;gap:5px;box-shadow:var(--shadow-sm);}
.pb-shell .t-dot{width:7px;height:7px;border-radius:50%;background:var(--border);animation:tdot 1s infinite;}
.pb-shell .t-dot:nth-child(2){animation-delay:.18s;}
.pb-shell .t-dot:nth-child(3){animation-delay:.36s;}
@keyframes tdot{0%,60%,100%{transform:translateY(0);background:var(--border);}30%{transform:translateY(-6px);background:var(--muted);}}

/* tool panel */
.pb-shell .tool-panel{width:var(--panel-w);background:var(--white);border-left:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;flex-shrink:0;box-shadow:-4px 0 20px rgba(0,0,0,.04);}
.pb-shell .journey-bar{padding:12px 18px;border-bottom:1px solid var(--border);background:var(--surface);flex-shrink:0;}
.pb-shell .journey-steps{display:flex;align-items:center;}
.pb-shell .jstep{display:flex;align-items:center;gap:5px;flex:1;font-size:11px;font-weight:600;color:var(--light-muted);transition:color .2s;}
.pb-shell .jstep.active{color:var(--blue);}
.pb-shell .jstep.done{color:var(--green);}
.pb-shell .jstep-num{width:20px;height:20px;border-radius:50%;border:2px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;flex-shrink:0;}
.pb-shell .jstep.active .jstep-num{background:var(--blue);color:white;border-color:var(--blue);}
.pb-shell .jstep.done .jstep-num{background:var(--green);color:white;border-color:var(--green);}
.pb-shell .jstep-line{flex:1;height:2px;background:var(--border);margin:0 6px;max-width:32px;}
.pb-shell .jstep-line.done{background:var(--green);}
.pb-shell .tph{padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
.pb-shell .tph-title{font-size:15px;font-weight:700;color:var(--dark);}
.pb-shell .tph-sub{font-size:11px;color:var(--muted);margin-top:2px;}
.pb-shell .tph-close{width:28px;height:28px;border-radius:7px;border:none;background:var(--surface);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--muted);transition:all .15s;}
.pb-shell .tph-close:hover{background:var(--border);}
.pb-shell .tool-body{flex:1;overflow-y:auto;padding:18px;}
.pb-shell .tool-body::-webkit-scrollbar{width:3px;}
.pb-shell .tool-body::-webkit-scrollbar-thumb{background:var(--border);}

/* forms */
.pb-shell .form-group{margin-bottom:16px;}
.pb-shell .form-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin-bottom:6px;display:block;}
.pb-shell .form-select,.pb-shell .form-input{width:100%;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:9px 12px;font-size:13px;outline:none;background:var(--white);color:var(--dark);transition:border-color .2s;font-family:inherit;}
.pb-shell .form-select:focus,.pb-shell .form-input:focus{border-color:var(--blue);}
.pb-shell .tags-row{display:flex;flex-wrap:wrap;gap:5px;}
.pb-shell .tag{padding:5px 13px;border-radius:16px;border:1.5px solid var(--border);background:var(--white);font-size:12px;font-weight:500;cursor:pointer;color:var(--muted);transition:all .15s;}
.pb-shell .tag:hover{border-color:var(--blue);color:var(--blue);}
.pb-shell .tag.on{background:var(--blue);color:white;border-color:var(--blue);}
.pb-shell .run-btn{width:100%;padding:12px;border-radius:var(--radius-sm);border:none;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;margin-top:8px;display:flex;align-items:center;justify-content:center;gap:8px;}
.pb-shell .run-btn.blue{background:var(--blue);color:white;}
.pb-shell .run-btn.blue:hover{background:var(--blue-mid);}
.pb-shell .run-btn:disabled{background:var(--border);color:var(--muted);cursor:not-allowed;}
.pb-shell .loading-state{display:flex;align-items:center;gap:10px;padding:14px 0;color:var(--muted);font-size:13px;}
.pb-shell .ld{width:6px;height:6px;border-radius:50%;background:var(--blue);animation:ldot .8s infinite;display:inline-block;}
.pb-shell .ld:nth-child(2){animation-delay:.15s;}
.pb-shell .ld:nth-child(3){animation-delay:.3s;}
@keyframes ldot{0%,80%,100%{opacity:.2;transform:scale(.8);}40%{opacity:1;transform:scale(1);}}
.pb-shell .result-section{margin-top:16px;display:flex;flex-direction:column;gap:10px;}
.pb-shell .summary-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px;font-size:13px;line-height:1.75;color:var(--dark);}
.pb-shell .summary-card p{margin-bottom:8px;}
.pb-shell .summary-card p:last-child{margin-bottom:0;}
.pb-shell .summary-card strong{color:var(--blue);}
.pb-shell .summary-card ul{margin:6px 0 8px 18px;}
.pb-shell .policy-timeline{display:flex;align-items:center;margin:12px 0;}
.pb-shell .pt-item{flex:1;text-align:center;}
.pb-shell .pt-dot{width:10px;height:10px;border-radius:50%;margin:0 auto 5px;border:2px solid var(--border);background:var(--white);}
.pb-shell .pt-dot.done{background:var(--green);border-color:var(--green);}
.pb-shell .pt-dot.active{background:var(--blue);border-color:var(--blue);box-shadow:0 0 0 3px var(--blue-light);}
.pb-shell .pt-label{font-size:9px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.5px;}
.pb-shell .pt-date{font-size:10px;color:var(--dark);font-weight:700;margin-top:2px;}
.pb-shell .pt-line{height:2px;background:var(--border);flex:0 0 24px;margin-bottom:14px;}
.pb-shell .pt-line.done{background:var(--green);}
.pb-shell .impact-hero{background:linear-gradient(135deg,var(--blue-dark),var(--blue));border-radius:var(--radius);padding:18px;color:white;}
.pb-shell .ih-label{font-size:11px;opacity:.7;margin-bottom:4px;text-transform:uppercase;letter-spacing:.6px;}
.pb-shell .ih-amount{font-size:36px;font-weight:900;color:var(--gold);}
.pb-shell .ih-sub{font-size:11px;opacity:.55;margin-top:3px;}
.pb-shell .impact-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.pb-shell .ir-card{background:var(--white);border-radius:var(--radius-sm);padding:13px;border:1px solid var(--border);}
.pb-shell .ir-label{font-size:10px;color:var(--muted);font-weight:600;text-transform:uppercase;margin-bottom:3px;}
.pb-shell .ir-val{font-size:18px;font-weight:800;}
.pb-shell .ir-val.neg{color:var(--red);}
.pb-shell .ir-val.pos{color:var(--green);}
.pb-shell .ir-sub{font-size:11px;color:var(--muted);margin-top:1px;}
.pb-shell .aid-highlight{background:var(--green-light);border:1.5px solid #86efac;border-radius:var(--radius);padding:14px;display:flex;gap:10px;}
.pb-shell .ahd-icon{font-size:22px;flex-shrink:0;}
.pb-shell .ahd-title{font-size:13px;font-weight:700;color:var(--green);margin-bottom:3px;}
.pb-shell .ahd-body{font-size:12px;color:#166534;line-height:1.6;}
.pb-shell .ahd-btn{margin-top:8px;display:inline-flex;align-items:center;gap:5px;background:var(--green);color:white;border:none;padding:7px 14px;border-radius:var(--radius-sm);font-size:12px;font-weight:700;cursor:pointer;}
.pb-shell .also-qualifies{background:var(--blue-pale);border:1px solid var(--blue-light);border-radius:var(--radius);padding:13px;}
.pb-shell .aq-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--blue);margin-bottom:8px;}
.pb-shell .aq-item{display:flex;align-items:center;gap:8px;padding:4px 0;font-size:12px;color:var(--blue-mid);}
.pb-shell .aq-item::before{content:'✓';font-weight:800;color:var(--green);flex-shrink:0;}
.pb-shell .step-cta{margin-top:14px;background:linear-gradient(135deg,var(--blue-pale),#fff);border:2px solid var(--blue-light);border-radius:var(--radius);padding:14px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:all .2s;}
.pb-shell .step-cta:hover{border-color:var(--blue);box-shadow:var(--shadow-md);}
.pb-shell .sc-icon{font-size:20px;flex-shrink:0;}
.pb-shell .sc-body{flex:1;}
.pb-shell .sc-title{font-size:13px;font-weight:700;color:var(--blue);}
.pb-shell .sc-sub{font-size:11px;color:var(--muted);margin-top:2px;}
.pb-shell .sc-btn{padding:7px 14px;border-radius:var(--radius-sm);border:none;background:var(--blue);color:white;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0;}
.pb-shell .task-item{display:flex;align-items:center;gap:10px;padding:11px 13px;border-radius:var(--radius-sm);background:var(--surface);border:1px solid var(--border);margin-bottom:6px;}
.pb-shell .task-status{width:22px;height:22px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;}
.pb-shell .task-status.done{background:#4ade80;color:#14532d;}
.pb-shell .task-status.active-dot{background:var(--blue-pale);border:2px solid var(--blue);}
.pb-shell .task-status.waiting{background:var(--surface);border:2px solid var(--border);}
.pb-shell .task-name{font-size:12px;font-weight:600;color:var(--dark);}
.pb-shell .task-sub{font-size:11px;color:var(--muted);margin-top:1px;}
.pb-shell .pend-dot{width:8px;height:8px;border-radius:50%;background:var(--blue);animation:ldot 1.2s infinite;}
.pb-shell .task-header{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin-bottom:8px;}
.pb-shell .agent-info{margin-top:16px;background:var(--surface);border-radius:var(--radius);padding:14px;border:1px solid var(--border);}
.pb-shell .agent-info-title{font-size:12px;font-weight:700;color:var(--dark);margin-bottom:6px;}
.pb-shell .agent-info-body{font-size:12px;color:var(--muted);line-height:1.7;}
.pb-shell .act-btn{padding:5px 11px;border-radius:var(--radius-sm);border:none;background:var(--blue);color:white;font-size:11px;font-weight:700;cursor:pointer;transition:opacity .15s;}
.pb-shell .act-btn:hover{opacity:.85;}
.pb-shell .out-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;}
.pb-shell .out-btn{padding:6px 13px;border-radius:16px;border:1.5px solid var(--border);font-size:11px;font-weight:600;cursor:pointer;background:white;color:var(--gray);transition:all .15s;}
.pb-shell .out-btn:hover{border-color:var(--blue);color:var(--blue);}

/* auth overlay */
.pb-auth-overlay{position:absolute;inset:0;z-index:100;background:rgba(248,250,252,.92);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;}
.pb-auth-card{background:var(--white);border-radius:24px;box-shadow:0 24px 80px rgba(0,51,153,.14),0 4px 16px rgba(0,0,0,.08);padding:40px 36px;width:100%;max-width:440px;border:1px solid var(--border);}
.pb-auth-brand{display:flex;align-items:center;gap:12px;justify-content:center;margin-bottom:28px;}
.pb-auth-mark{width:44px;height:44px;border-radius:13px;background:linear-gradient(135deg,var(--blue-dark),var(--blue-mid));display:flex;align-items:center;justify-content:center;font-weight:900;font-size:17px;color:var(--gold);box-shadow:0 4px 14px rgba(0,51,153,.3);}
.pb-auth-wordmark{font-weight:900;font-size:22px;color:var(--blue);}
.pb-auth-wordmark span{color:#F7C800;}
.pb-auth-heading{font-size:26px;font-weight:800;color:var(--dark);text-align:center;margin-bottom:6px;}
.pb-auth-sub{font-size:13px;color:var(--muted);text-align:center;line-height:1.6;margin-bottom:28px;max-width:320px;margin-left:auto;margin-right:auto;}
.pb-google-btn{width:100%;height:48px;border-radius:12px;border:1.5px solid var(--border);background:var(--white);display:flex;align-items:center;justify-content:center;gap:10px;font-size:14px;font-weight:600;color:var(--dark);cursor:pointer;transition:all .2s;box-shadow:var(--shadow-sm);}
.pb-google-btn:hover{border-color:var(--blue);box-shadow:var(--shadow-md);}
.pb-google-btn:disabled{opacity:.6;cursor:not-allowed;}
.pb-divider{display:flex;align-items:center;gap:10px;margin:18px 0;font-size:11px;color:var(--light-muted);text-transform:uppercase;letter-spacing:.8px;}
.pb-divider::before,.pb-divider::after{content:'';flex:1;height:1px;background:var(--border);}
.pb-email-input{width:100%;height:44px;border:1.5px solid var(--border);border-radius:10px;padding:0 14px;font-size:13px;outline:none;transition:border-color .2s;font-family:inherit;color:var(--dark);}
.pb-email-input:focus{border-color:var(--blue);}
.pb-main-btn{width:100%;height:44px;border-radius:10px;border:none;background:var(--blue);color:white;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;margin-top:10px;}
.pb-main-btn:hover{background:var(--blue-mid);}
.pb-main-btn:disabled{background:var(--border);cursor:not-allowed;}
.pb-auth-toggle{text-align:center;font-size:12px;color:var(--muted);margin-top:14px;}
.pb-auth-toggle button{background:none;border:none;color:var(--blue);font-weight:700;cursor:pointer;font-size:12px;}
.pb-auth-back{background:none;border:none;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;margin-bottom:18px;padding:0;}
.pb-auth-back:hover{color:var(--dark);}
.pb-auth-error{background:var(--red-light);border:1px solid #fca5a5;border-radius:8px;padding:10px 13px;font-size:12px;color:#991b1b;margin-top:12px;}
.pb-no-firebase{background:var(--gold-light);border:1px solid #fde68a;border-radius:8px;padding:10px 13px;font-size:12px;color:#92400e;margin-top:12px;}

/* profile modal */
.pb-modal-overlay{position:absolute;inset:0;z-index:90;background:rgba(248,250,252,.88);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto;}
.pb-modal-card{background:var(--white);border-radius:24px;box-shadow:0 24px 80px rgba(0,51,153,.12),0 4px 16px rgba(0,0,0,.07);padding:36px;width:100%;max-width:520px;border:1px solid var(--border);}
.pb-modal-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--blue);margin-bottom:6px;}
.pb-modal-title{font-size:24px;font-weight:800;color:var(--dark);margin-bottom:6px;line-height:1.3;}
.pb-modal-sub{font-size:13px;color:var(--muted);margin-bottom:24px;line-height:1.6;}
.pb-save-btn{width:100%;height:44px;border-radius:10px;border:none;background:var(--blue);color:white;font-size:14px;font-weight:700;cursor:pointer;margin-top:20px;transition:background .2s;}
.pb-save-btn:hover{background:var(--blue-mid);}
.pb-save-btn:disabled{background:var(--border);cursor:not-allowed;}

@media(max-width:1100px){.pb-shell .tool-panel{width:360px;}}
@media(max-width:900px){.pb-shell .sidebar{display:none;}.pb-shell .tool-panel{display:none;}}
`;

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────────────── */
const REDIRECT_KEY = '1p-redirect-intent';

const INITIAL_PROFILE = {
  incomeGroup: 'B40',
  state: 'Selangor',
  householdType: 'Single Parent',
  vehicleType: 'Diesel',
  dependants: '2',
  monthlyIncome: '3000',
};

const STATE_OPTIONS = ['Selangor','Kuala Lumpur','Johor','Penang','Perak','Kedah','Sabah','Sarawak'];
const INCOME_OPTIONS = ['1000','2000','3000','4000','5000','6000','8000','10000','15000+'];

const REPLIES = {
  diesel:`<p><strong>Diesel Subsidy — What changed</strong></p><p>From <strong>October 2024</strong>, the blanket diesel subsidy is replaced with a targeted system. Here's who still qualifies:</p><ul><li>Households earning <strong>below RM5,000/month</strong> with a registered diesel vehicle</li><li>Registered fishermen, farmers, and public transport operators</li></ul><div class="info-box green">✅ <strong>If you qualify:</strong> You receive a <strong>RM200/month BUDI MADANI fuel credit</strong> via Touch 'n Go or bank transfer — applied automatically once registered.</div><div class="info-box gold">⚠️ <strong>Action required:</strong> Register or update your profile on <strong>PADU (padu.gov.my)</strong> before 31 October 2024. No registration = no credit.</div>`,
  str:`<p><strong>STR 2026 — Your estimated payment</strong></p><p>Sumbangan Tunai Rahmah 2026 is disbursed automatically to B40 and M40 households with a complete PADU profile:</p><ul><li>Single parent household: <strong>RM1,000 base</strong></li><li>Per dependent child: <strong>+ RM250</strong> (up to 4 children)</li><li>Single adult below 40: <strong>RM500</strong></li><li>Senior citizen household: <strong>RM800</strong></li></ul><div class="info-box blue">📅 <strong>Disbursement:</strong> May 2026, directly to your registered bank account. No separate application needed.</div><div class="info-box gold">⚠️ <strong>Deadline:</strong> Complete your PADU profile before <strong>30 April 2026</strong>.</div>`,
  tax:`<p><strong>Income Tax Relief — What you can claim (YA 2024)</strong></p><ul><li><strong>Personal relief:</strong> RM9,500</li><li><strong>Spouse / alimony:</strong> RM4,000</li><li><strong>Per child (under 18):</strong> RM2,000</li><li><strong>EPF contribution:</strong> Up to RM4,000</li><li><strong>Medical & dental:</strong> Up to RM10,000</li><li><strong>Lifestyle (internet, books, sport):</strong> Up to RM3,000</li></ul><div class="info-box green">💡 <strong>Single parent tip:</strong> You can claim the spousal relief of RM4,000 under Section 49 — even without a current spouse.</div>`,
  gig:`<p><strong>Gig & Online Income — Tax rules in Malaysia</strong></p><p>Yes, income from Grab, Shopee, Lazada, freelancing, and digital platforms is <strong>taxable</strong> if your total annual income exceeds <strong>RM34,000 after personal reliefs</strong>.</p><div class="info-box blue">📋 <strong>How to declare:</strong> File <strong>Form BE</strong> (salaried + other income) or <strong>Form B</strong> (business income). Deadline: 30 April each year via MyTax.</div><div class="info-box gold">⚠️ <strong>e-Invoice:</strong> From <strong>July 2025</strong>, businesses with revenue above RM150,000/year must issue e-Invoices via MyInvois.</div>`,
  epf:`<p><strong>EPF Account 3 (Akaun Fleksibel) — Full guide</strong></p><p>From <strong>May 2024</strong>, your monthly EPF contribution is split into three accounts:</p><ul><li><strong>Account 1 (Persaraan):</strong> 75% — locked until age 55</li><li><strong>Account 2 (Sejahtera):</strong> 15% — housing, medical, education</li><li><strong>Account 3 (Fleksibel):</strong> 10% — <strong>withdraw anytime, for any purpose</strong></li></ul><div class="info-box green">💳 <strong>How to withdraw Account 3:</strong> Login to i-Akaun → Pengeluaran → Akaun Fleksibel. Minimum RM50 per withdrawal. Funds arrive in 3–5 working days.</div>`,
  housing:`<p><strong>First Home Buying — Schemes available</strong></p><ul><li><strong>PR1MA:</strong> 10–30% below market price for households earning RM2,500–RM15,000/month.</li><li><strong>MyDeposit:</strong> Up to RM30,000 grant toward your down payment. Income below RM10,000/month.</li><li><strong>Rumah Mesra Rakyat (RMR):</strong> Fully subsidised home for income below RM3,000/month via SPNB.</li></ul><div class="info-box green">🏠 <strong>Stamp duty waiver:</strong> 100% exemption for first-time buyers purchasing below <strong>RM500,000</strong>.</div>`,
  health:`<p><strong>Free Health Programmes for B40 Malaysians</strong></p><p><strong>PeKa B40</strong> covers free screenings for Malaysians aged <strong>40 and above</strong> from B40 households:</p><ul><li>Cancer screening (breast, cervical, colorectal)</li><li>Cardiovascular & diabetes risk assessment</li></ul><div class="info-box green">✅ <strong>To access:</strong> Visit any Klinik Kesihatan or participating clinic. Bring MyKad. No appointment needed.</div><div class="info-box blue">🛡️ <strong>MySalam Insurance:</strong> Free hospitalisation takaful for B40. Covers RM8,000/year for 36 critical illnesses. Enrol at MySejahtera.</div>`,
  edu:`<p><strong>PTPTN — Deferment & repayment options</strong></p><p>You can apply to defer PTPTN repayments if:</p><ul><li>Currently <strong>unemployed</strong> — provide EPF statement or JTK letter</li><li>Monthly income <strong>below RM2,000</strong></li><li>Registered as B40 in <strong>eKasih database</strong></li></ul><div class="info-box blue">📝 <strong>Apply at:</strong> ptptn.gov.my → My Account → Deferment Application. Approved deferments are 12 months, renewable. No interest accrues.</div>`,
  biz:`<p><strong>Business & Online Sellers</strong></p><p><strong>SSM Registration</strong> is required for annual income above <strong>RM30,000</strong> from online selling.</p><div class="info-box blue">💻 <strong>SME Digitalisation Grant (2024):</strong> Up to <strong>RM5,000</strong> matching grant for SMEs. Apply at madanidigital.gov.my.</div>`,
  general:`<p>I can help you understand any Malaysian government policy, subsidy, or tax rule in plain language.</p><p>Try asking something specific like:</p><ul><li><em>"Am I eligible for the diesel subsidy?"</em></li><li><em>"What tax relief can I claim as a single parent?"</em></li><li><em>"How does EPF Account 3 work?"</em></li></ul><div class="info-box blue">💡 <strong>Tip:</strong> Use the <strong>🧮 Impact Calculator</strong> on the right to see exactly how a policy affects your monthly finances.</div>`,
};

const REFS = {
  diesel:['Diesel Subsidy Bill 2024 §4A','Warta P.U.(A) 215/2024','BUDI MADANI Circular'],
  str:['STR 2026 Framework §3','Treasury Circular 2026','PADU Verification Guidelines'],
  tax:['Income Tax Act 1967 §45','Finance Act 2024 Schedule 9','LHDN Practice Note 12/2024'],
  gig:['Income Tax Act §4(f)','LHDN e-Invoice Guidelines','MyInvois API Specification'],
  epf:['EPF Act 1991 §54','EPF Amendment 2024','EPF Akaun Fleksibel Circular'],
  housing:['PR1MA Act 2012 §8','Housing Credit Guarantee Scheme 2025','Stamp Duty (Exemption) Order 2024'],
  health:['PeKa B40 Scope 2024 (MOH)','MySalam Takaful Schedule'],
  edu:['PTPTN Act 1997 §22','PTPTN Deferment Guidelines 2024'],
  biz:['SSM Companies Act §570','SME Corp Grant T&C'],
  general:['MyGov Policy Index 2024','Parliament Hansard 2024'],
};

const QRS = {
  diesel:['How do I register on PADU?','Calculate my fuel cost impact','What if I miss the deadline?'],
  str:['When is STR 2026 disbursed?','How to complete PADU profile?','What other aid do I qualify for?'],
  tax:['How to file e-Filing?','What is PCB deduction?','RPGT on property sale?'],
  gig:['How to declare Grab income?','What is e-Invoice?','Do I need SSM as seller?'],
  epf:['How to withdraw Account 3?','Can I withdraw for education?','EPF dividend rate?'],
  housing:['How to apply for PR1MA?','MyDeposit requirements?','Is stamp duty waiver still active?'],
  health:['Where is the nearest PeKa clinic?','How to enrol MySalam?'],
  edu:['How to apply PTPTN deferment?','What is PTPTN discount offer?'],
};

const IMPACT_TYPES = new Set(['diesel','str','tax','epf','housing']);

function classify(q) {
  q = q.toLowerCase();
  if (/diesel|budi madani|ron95|minyak|petrol subsid/.test(q)) return 'diesel';
  if (/str |rahmah|cash aid|bantuan tunai/.test(q)) return 'str';
  if (/tax relief|lhdn|income tax|e.filing|pcb|relief|rpgt|stamp duty/.test(q)) return 'tax';
  if (/grab|shopee|lazada|e-commerce|gig|freelanc|online sell/.test(q)) return 'gig';
  if (/epf|kwsp|account 3|akaun/.test(q)) return 'epf';
  if (/pr1ma|housing|rumah|home|deposit|mydeposit/.test(q)) return 'housing';
  if (/peka|mysalam|health|hospital|clinic/.test(q)) return 'health';
  if (/ptptn|jpa|scholar|education/.test(q)) return 'edu';
  if (/ssm|sme|business|enterprise|invoice/.test(q)) return 'biz';
  return 'general';
}

const BILL_ANSWERS = {
  diesel:{
    clauses:'Section 4A (Eligibility), Section 7 (PADU Registration), Section 12(b) (Enforcement)',
    timeline:[{label:'First Reading',date:'Mar 2024',state:'done'},{label:'Gazette',date:'Sep 2024',state:'done'},{label:'In Effect',date:'Oct 2024',state:'active'},{label:'Review',date:'Oct 2025',state:''}],
    body:`<p><strong>What this bill does:</strong> Replaces the blanket diesel subsidy with a targeted credit system from October 2024.</p><p><strong>Who qualifies:</strong> Registered households earning below RM5,000/month with a diesel vehicle, plus fishermen, farmers, and public transport operators.</p><p><strong>What you receive:</strong> RM200/month BUDI MADANI credit via Touch 'n Go or bank transfer.</p><p><strong>Action required:</strong> Register or update your PADU profile before <strong>31 October 2024</strong>.</p>`,
  },
  income:{
    clauses:'Section 45 (Personal Relief), Schedule 9 (Tax Rates), Section 33 (Deductible Expenses)',
    timeline:[{label:'Tabled',date:'Oct 2023',state:'done'},{label:'Passed',date:'Dec 2023',state:'done'},{label:'In Effect',date:'Jan 2024',state:'active'},{label:'YA 2024 Filing',date:'Apr 2025',state:''}],
    body:`<p><strong>What changed in 2024:</strong> Personal tax relief increased from RM9,000 to <strong>RM9,500</strong>. New RM2,000 cost-of-living relief for those earning below RM100,000.</p><p><strong>Lifestyle relief consolidated:</strong> Electronics, books, sports, and internet are one combined RM3,000 relief.</p>`,
  },
  str:{
    clauses:'Section 3 (Eligibility Tiers), Section 5 (Disbursement), Section 8 (PADU Verification)',
    timeline:[{label:'Framework',date:'Jan 2026',state:'done'},{label:'Registration',date:'Feb 2026',state:'done'},{label:'Deadline',date:'Apr 2026',state:'active'},{label:'Disbursement',date:'May 2026',state:''}],
    body:`<p><strong>Who gets what:</strong></p><ul><li>Single parent with dependants: <strong>RM1,000 + RM250/child</strong> (max 4)</li><li>Married B40 household: <strong>RM1,000 + RM250/child</strong></li><li>Single adult: <strong>RM500</strong></li></ul><p><strong>When:</strong> May 2026. No application needed if PADU is complete before 30 April 2026.</p>`,
  },
  epf:{
    clauses:'Section 54 (Akaun Fleksibel), Section 67 (Withdrawal Rules), Section 89 (Allocation)',
    timeline:[{label:'Passed',date:'Feb 2024',state:'done'},{label:'Gazette',date:'Apr 2024',state:'done'},{label:'In Effect',date:'May 2024',state:'active'},{label:'Review',date:'May 2025',state:''}],
    body:`<p><strong>New 3-account structure (from May 2024):</strong></p><ul><li><strong>Account 1 — Persaraan (75%):</strong> Locked until retirement at 55</li><li><strong>Account 2 — Sejahtera (15%):</strong> Housing, education, medical</li><li><strong>Account 3 — Fleksibel (10%):</strong> Withdraw anytime, any reason, minimum RM50</li></ul>`,
  },
  housing:{
    clauses:'Section 6 (Eligibility), Section 14 (Guarantee Limit), Section 21 (Application)',
    timeline:[{label:'Tabled',date:'Jan 2025',state:'done'},{label:'Passed',date:'Mar 2025',state:'done'},{label:'In Effect',date:'Apr 2025',state:'active'},{label:'Review',date:'Apr 2026',state:''}],
    body:`<p><strong>What this scheme does:</strong> The government guarantees up to <strong>10% of your home loan</strong>, allowing banks to approve applications from buyers with minimal savings.</p><p><strong>Who qualifies:</strong> Malaysian citizens, first-time buyers, household income RM2,500–RM10,000/month, property below RM500,000.</p>`,
  },
};

const CALC_POLICY_MAP = { diesel: 0, str: 2, tax: 1, epf: 3 };

/* ─────────────────────────────────────────────────────────────────────────────
   FIREBASE HELPERS
───────────────────────────────────────────────────────────────────────────── */
const createUserRef = (uid) => doc(db, 'users', uid);
const createProfileRef = (uid) => doc(db, 'users', uid, 'policyCompass', 'profile');

/* ─────────────────────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" style={{ width: 20, height: 20, flexShrink: 0 }} aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5Z"/>
      <path fill="#FF3D00" d="M6.3 14.7 12.9 19c1.8-4.4 6.1-7 11.1-7 3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.2-8l-6.5 5c3.3 6.5 10 11 17.7 11Z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.2 5.2C37.1 39 44 34 44 24c0-1.3-.1-2.4-.4-3.5Z"/>
    </svg>
  );
}

function AuthScreen({ onBack, onGoogleSignIn, authPending, authError }) {
  return (
    <div className="pb-auth-overlay">
      <div className="pb-auth-card">
        <button className="pb-auth-back" onClick={onBack}>← Back to home</button>
        <div className="pb-auth-brand">
          <div className="pb-auth-mark">1P</div>
          <div className="pb-auth-wordmark">1<span>Peace</span></div>
        </div>
        <h1 className="pb-auth-heading">Welcome, Rakyat</h1>
        <p className="pb-auth-sub">
          Sign in to personalise your policy impact — we use your profile to explain bills in plain language, calculate household-level effects, and surface aid you qualify for.
        </p>
        <button
          className="pb-google-btn"
          onClick={onGoogleSignIn}
          disabled={authPending || !isFirebaseConfigured}
        >
          <GoogleIcon />
          {authPending ? 'Opening Google sign-in…' : 'Continue with Google'}
        </button>
        {!isFirebaseConfigured && (
          <div className="pb-no-firebase">{firebaseConfigMessage || 'Firebase is not configured. Add your environment variables.'}</div>
        )}
        {authError && <div className="pb-auth-error">{authError}</div>}
        <div className="pb-divider">or</div>
        <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
          You can use the chat without signing in, but your profile won&apos;t be saved.{' '}
          <button style={{ background: 'none', border: 'none', color: 'var(--blue)', fontWeight: 700, cursor: 'pointer', fontSize: 12 }} onClick={onBack}>
            Continue as guest →
          </button>
        </p>
      </div>
    </div>
  );
}

function ProfileSetupModal({ profile, onChange, onSave, profileSaving, profileError, onClose }) {
  const inc = ['B40', 'M40', 'T20'];
  const hh = ['Single Parent', 'Married', 'Single', 'Senior Citizen'];
  const veh = ['Diesel', 'Petrol', 'Motorcycle', 'No vehicle'];

  return (
    <div className="pb-modal-overlay">
      <div className="pb-modal-card">
        <div className="pb-modal-label">Profile Setup</div>
        <div className="pb-modal-title">Personalise your policy impact</div>
        <div className="pb-modal-sub">
          Your answers shape how 1Peace explains bills and calculates aid eligibility — in plain language, for your exact situation.
        </div>

        <div className="form-group">
          <span className="form-label">Income Group</span>
          <div className="tags-row">
            {inc.map(v => (
              <button key={v} className={`tag${profile.incomeGroup === v ? ' on' : ''}`} onClick={() => onChange('incomeGroup', v)}>{v}</button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <span className="form-label">Household Type</span>
          <div className="tags-row">
            {hh.map(v => (
              <button key={v} className={`tag${profile.householdType === v ? ' on' : ''}`} onClick={() => onChange('householdType', v)}>{v}</button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <span className="form-label">Vehicle</span>
          <div className="tags-row">
            {veh.map(v => (
              <button key={v} className={`tag${profile.vehicleType === v ? ' on' : ''}`} onClick={() => onChange('vehicleType', v)}>{v}</button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <span className="form-label">State</span>
          <select className="form-select" value={profile.state} onChange={e => onChange('state', e.target.value)}>
            {STATE_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <span className="form-label">Dependants</span>
            <select className="form-select" value={profile.dependants} onChange={e => onChange('dependants', e.target.value)}>
              {['0','1','2','3','4','5','6+'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div className="form-group">
            <span className="form-label">Monthly Income (RM)</span>
            <select className="form-select" value={profile.monthlyIncome} onChange={e => onChange('monthlyIncome', e.target.value)}>
              {INCOME_OPTIONS.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>

        {profileError && <div className="pb-auth-error">{profileError}</div>}
        <button className="pb-save-btn" onClick={onSave} disabled={profileSaving}>
          {profileSaving ? 'Saving…' : 'Save & enter workspace →'}
        </button>
        {onClose && (
          <button onClick={onClose} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer' }}>
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}

function SettingsModal({ user, profile, onClose, onSignOut, signingOut, onOpenProfileSetup }) {
  return (
    <div className="pb-modal-overlay">
      <div className="pb-modal-card" style={{ maxWidth: 400 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div className="pb-modal-title" style={{ marginBottom: 0 }}>Settings</div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: 'var(--muted)' }}>Close</button>
        </div>
        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 14, border: '1px solid var(--border)', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark)' }}>{user.displayName || 'Citizen User'}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{user.email}</div>
          <div style={{ marginTop: 8, display: 'inline-block', background: 'var(--blue-pale)', color: 'var(--blue)', borderRadius: 10, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>Google Session</div>
        </div>
        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 14, border: '1px solid var(--border)', marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 6 }}>Your Profile</div>
          <div style={{ fontSize: 12, color: 'var(--dark)' }}>
            {profile.incomeGroup} · {profile.state} · {profile.householdType} · {profile.vehicleType} vehicle
          </div>
          <button onClick={() => { onClose(); onOpenProfileSetup(); }} style={{ marginTop: 10, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}>
            Edit profile →
          </button>
        </div>
        <button onClick={onSignOut} disabled={signingOut} style={{ width: '100%', marginTop: 14, height: 40, borderRadius: 10, border: '1.5px solid var(--border)', background: 'none', color: 'var(--red)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  );
}

/* ── Tool Panel Panels ── */
function TranslatorPanel({ onOpenCalculator }) {
  const [bill, setBill] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function run() {
    const key = bill || 'diesel';
    const data = BILL_ANSWERS[key] || BILL_ANSWERS.diesel;
    setResult(null);
    setLoading(true);
    setTimeout(() => { setLoading(false); setResult(data); }, 1600);
  }

  return (
    <div>
      <div className="form-group">
        <span className="form-label">Select a Bill or Act</span>
        <select className="form-select" value={bill} onChange={e => setBill(e.target.value)}>
          <option value="">— Choose a bill —</option>
          <option value="diesel">Targeted Diesel Subsidy Rationalisation Bill 2024</option>
          <option value="income">Income Tax Act 1967 (Amendment 2024)</option>
          <option value="housing">Housing Credit Guarantee Scheme Bill 2025</option>
          <option value="str">Sumbangan Tunai Rahmah (STR) 2026 Framework</option>
          <option value="epf">EPF (Amendment) Act 2024 — Account 3</option>
        </select>
      </div>
      <div className="form-group">
        <span className="form-label">Or search a clause / keyword</span>
        <input className="form-input" value={search} onChange={e => setSearch(e.target.value)} placeholder='"subsidy eligibility", "Section 4A"…' />
      </div>
      <button className="run-btn blue" onClick={run} disabled={loading}>
        {loading ? '…' : '📄 Translate This Policy'}
      </button>
      {loading && (
        <div className="loading-state">
          <span className="ld"/><span className="ld"/><span className="ld"/>
          <span>Analysing bill…</span>
        </div>
      )}
      {result && (
        <div className="result-section">
          <div className="summary-card">
            <p style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.6px', fontWeight: 700 }}>Policy Timeline</p>
            <div className="policy-timeline">
              {result.timeline.map((item, i) => (
                <div key={i} style={{ display: 'contents' }}>
                  <div className="pt-item">
                    <div className={`pt-dot ${item.state}`}/>
                    <div className="pt-label">{item.label}</div>
                    <div className="pt-date">{item.date}</div>
                  </div>
                  {i < result.timeline.length - 1 && <div className={`pt-line ${item.state === 'done' ? 'done' : ''}`}/>}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 10, color: 'var(--muted)', margin: '10px 0 8px', borderTop: '1px solid var(--border)', paddingTop: 10, textTransform: 'uppercase', letterSpacing: '.6px', fontWeight: 700 }}>
              References: {result.clauses}
            </p>
            <div dangerouslySetInnerHTML={{ __html: result.body }} />
          </div>
          <div className="step-cta" onClick={onOpenCalculator}>
            <div className="sc-icon">🧮</div>
            <div className="sc-body">
              <div className="sc-title">Calculate your personal impact</div>
              <div className="sc-sub">See how this bill affects your wallet based on your profile</div>
            </div>
            <button className="sc-btn">Next →</button>
          </div>
          <div className="out-actions">
            <button className="out-btn">📋 Copy</button>
            <button className="out-btn" style={{ background: '#25D366', color: 'white', border: 'none' }}>📱 WhatsApp</button>
            <button className="out-btn">⬇️ Save PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}

function CalculatorPanel({ profile, preselect, onOpenAgent }) {
  const [inc, setInc] = useState(profile.incomeGroup || 'B40');
  const [hh, setHh] = useState(profile.householdType || 'Single Parent');
  const [veh, setVeh] = useState(profile.vehicleType ? profile.vehicleType + ' car' : 'Diesel car');
  const [state2, setState2] = useState(profile.state || 'Selangor');
  const [policy, setPolicy] = useState(preselect ?? 0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(false);

  function run() {
    setResult(false);
    setLoading(true);
    setTimeout(() => { setLoading(false); setResult(true); }, 1800);
  }

  const Tag = ({ val, cur, set }) => (
    <button className={`tag${cur === val ? ' on' : ''}`} onClick={() => set(val)}>{val}</button>
  );

  return (
    <div>
      <div className="form-group">
        <span className="form-label">Income Group</span>
        <div className="tags-row">
          {['B40','M40','T20'].map(v => <Tag key={v} val={v} cur={inc} set={setInc}/>)}
        </div>
      </div>
      <div className="form-group">
        <span className="form-label">State</span>
        <select className="form-select" value={state2} onChange={e => setState2(e.target.value)}>
          {STATE_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="form-group">
        <span className="form-label">Household Type</span>
        <div className="tags-row">
          {['Single Parent','Married','Single','Senior Citizen'].map(v => <Tag key={v} group="hh" val={v} cur={hh} set={setHh}/>)}
        </div>
      </div>
      <div className="form-group">
        <span className="form-label">Vehicle</span>
        <div className="tags-row">
          {['Diesel car','Petrol car','Motorcycle','No vehicle'].map(v => <Tag key={v} group="veh" val={v} cur={veh} set={setVeh}/>)}
        </div>
      </div>
      <div className="form-group">
        <span className="form-label">Analyse which policy?</span>
        <select className="form-select" value={policy} onChange={e => setPolicy(Number(e.target.value))}>
          <option value={0}>Targeted Diesel Subsidy Bill 2024</option>
          <option value={1}>Income Tax Amendment 2024</option>
          <option value={2}>STR 2026 Framework</option>
          <option value={3}>EPF Account 3 Rules 2024</option>
        </select>
      </div>
      <button className="run-btn blue" onClick={run} disabled={loading}>
        {loading ? '…' : '🧮 Calculate My Impact'}
      </button>
      {loading && (
        <div className="loading-state">
          <span className="ld"/><span className="ld"/><span className="ld"/>
          <span>Calculating your impact…</span>
        </div>
      )}
      {result && (
        <div className="result-section">
          <div className="impact-hero">
            <div className="ih-label">Your estimated net monthly change</div>
            <div className="ih-amount">− RM 50</div>
            <div className="ih-sub">{inc} · {hh} · {state2} · {veh} · Diesel Subsidy Bill</div>
          </div>
          <div className="impact-row">
            <div className="ir-card">
              <div className="ir-label">Fuel Cost Increase</div>
              <div className="ir-val neg">+ RM 250</div>
              <div className="ir-sub">~60L/month at +RM2.00/L</div>
            </div>
            <div className="ir-card">
              <div className="ir-label">BUDI MADANI Credit</div>
              <div className="ir-val pos">− RM 200</div>
              <div className="ir-sub">Auto-applied once on PADU</div>
            </div>
          </div>
          <div className="aid-highlight">
            <div className="ahd-icon">🎁</div>
            <div>
              <div className="ahd-title">You qualify for BUDI MADANI (RM200/mo)</div>
              <div className="ahd-body">As a {inc} {hh.toLowerCase()} in {state2}, you get RM200/month fuel credit — reducing your net increase to RM50/month. Register by <strong>31 Oct 2024</strong>.</div>
              <button className="ahd-btn" onClick={onOpenAgent}>Let 1Peace register for you →</button>
            </div>
          </div>
          <div className="also-qualifies">
            <div className="aq-label">You also qualify for</div>
            <div className="aq-item">STR 2026 — RM1,250 one-off payment (May 2026)</div>
            <div className="aq-item">PeKa B40 — free health screening (if aged 40+)</div>
            <div className="aq-item">MySalam — free hospitalisation insurance</div>
          </div>
          <div className="step-cta" onClick={onOpenAgent}>
            <div className="sc-icon">✅</div>
            <div className="sc-body">
              <div className="sc-title">Ready to take action?</div>
              <div className="sc-sub">1Peace can register for BUDI MADANI using your saved profile — takes under 2 minutes</div>
            </div>
            <button className="sc-btn">Go →</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AgentPanel() {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div className="task-header">Needs your attention</div>
        <div className="task-item">
          <div className="task-status active-dot"><div className="pend-dot"/></div>
          <div style={{ flex: 1 }}>
            <div className="task-name">BUDI MADANI — Registration ready</div>
            <div className="task-sub">Form pre-filled · Deadline: 31 Oct 2024</div>
          </div>
          <button className="act-btn" onClick={() => alert('1Peace has pre-filled the BUDI MADANI registration form using your saved profile.\n\nReview the form before submitting.')}>
            Review →
          </button>
        </div>
        <div className="task-item">
          <div className="task-status waiting"/>
          <div style={{ flex: 1 }}>
            <div className="task-name">STR 2026 — PADU profile verification</div>
            <div className="task-sub">Opens May 1 · 1Peace will notify you</div>
          </div>
        </div>
      </div>
      <div>
        <div className="task-header">Completed</div>
        <div className="task-item">
          <div className="task-status done">✓</div>
          <div style={{ flex: 1 }}>
            <div className="task-name">PTPTN Deferment — Submitted</div>
            <div className="task-sub">Ref: PTN-2026-88421 · 10 Apr 2026</div>
          </div>
        </div>
        <div className="task-item">
          <div className="task-status done">✓</div>
          <div style={{ flex: 1 }}>
            <div className="task-name">eKasih School Aid — Applied</div>
            <div className="task-sub">RM300 approved · Disbursed Mar 2026</div>
          </div>
        </div>
      </div>
      <div className="agent-info">
        <div className="agent-info-title">What 1Peace does for you</div>
        <div className="agent-info-body">
          With your permission, I submit government applications, verify eligibility, and set reminders for deadlines — using your saved profile. <strong>You approve every action before it's taken.</strong>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────────────────────── */
export default function PolicyBrainPage({ onBack, userProfile }) {
  /* ── CSS injection ── */
  useEffect(() => {
    const el = document.createElement('style');
    el.id = 'pb2-styles';
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => { document.getElementById('pb2-styles')?.remove(); };
  }, []);

  /* ── Auth state ── */
  const [authInitializing, setAuthInitializing] = useState(true);
  const [authPending, setAuthPending] = useState(() => window.sessionStorage.getItem(REDIRECT_KEY) === 'true');
  const [authError, setAuthError] = useState('');
  const [user, setUser] = useState(null);
  const [signingOut, setSigningOut] = useState(false);
  const [showAuthScreen, setShowAuthScreen] = useState(false);

  /* ── Profile state ── */
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [draftProfile, setDraftProfile] = useState(INITIAL_PROFILE);
  const [, setProfileLoading] = useState(false);
  const [, setProfileHydrated] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  /* ── Aid calculation from userProfile ── */
  const aidResult = (() => {
    const p = userProfile;
    if (!p) return { total: 4900, count: 5 }; // fallback display when no profile
    const incomeMap = { '<1500': 1000, '1500-2500': 2000, '2500-4000': 3250, '4000-5000': 4500, '>5000': 6000 };
    const sizeMap   = { '1': 1, '2': 2, '3-4': 3.5, '5+': 6 };
    const income    = incomeMap[p.income] ?? 3000;
    const size      = sizeMap[p.householdSize] ?? 3;
    const perCapita = income / size;
    let total = 0, count = 0;
    if (income < 5000)             { total += income < 2500 ? 2400 : income < 3500 ? 2100 : 1800; count++; }
    if (perCapita < 1169)          { total += 960;  count++; }
    if (p.hasSchoolKids === 'yes') { total += 200;  count++; }
    if (p.hasOKU === 'yes')        { total += 3600; count++; }
    return { total, count };
  })();

  /* ── Chat state ── */
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [busy, setBusy] = useState(false);
  const chatScrollRef = useRef(null);
  const taRef = useRef(null);

  /* ── Tool panel state ── */
  const [currentTool, setCurrentTool] = useState(null); // 'translator'|'calculator'|'agent'
  const [calcPreselect, setCalcPreselect] = useState(null);
  const [activeModuleView, setActiveModuleView] = useState('chat');

  /* ── Lang ── */
  const [lang, setLang] = useState('en');

  /* ── Firebase auth listeners ── */
  useEffect(() => {
    if (!auth) { setAuthInitializing(false); return; }

    let active = true;
    getRedirectResult(auth)
      .then(result => {
        if (!active) return;
        window.sessionStorage.removeItem(REDIRECT_KEY);
        setAuthPending(false);
        if (result?.user) { setUser(result.user); setAuthError(''); setShowAuthScreen(false); }
      })
      .catch(err => {
        if (!active) return;
        window.sessionStorage.removeItem(REDIRECT_KEY);
        setAuthPending(false);
        setAuthError(err.message || 'Unable to complete Google sign-in.');
      });

    const unsub = onAuthStateChanged(auth, nextUser => {
      setUser(nextUser);
      setAuthInitializing(false);
      setAuthPending(false);
    });
    return () => { active = false; unsub(); };
  }, []);

  /* ── Profile load on auth ── */
  useEffect(() => {
    async function load() {
      if (!user || !db) {
        setProfile(INITIAL_PROFILE);
        setDraftProfile(INITIAL_PROFILE);
        setProfileHydrated(false);
        return;
      }
      setProfileLoading(true);
      setProfileHydrated(false);
      setProfileError('');
      try {
        const snap = await getDoc(createProfileRef(user.uid));
        const data = snap.exists() ? snap.data() : null;
        const next = data ? { ...INITIAL_PROFILE, ...data } : INITIAL_PROFILE;
        const completed = Boolean(data?.profileCompleted);
        await setDoc(createUserRef(user.uid), {
          uid: user.uid, email: user.email || '', displayName: user.displayName || '',
          photoURL: user.photoURL || '', provider: 'google',
          lastLoginAt: serverTimestamp(), updatedAt: serverTimestamp(),
        }, { merge: true });
        await setDoc(createProfileRef(user.uid), {
          ...next, email: user.email || '', displayName: user.displayName || '',
          profileCompleted: completed,
          createdAt: data?.createdAt || serverTimestamp(),
          lastLoginAt: serverTimestamp(), updatedAt: serverTimestamp(),
        }, { merge: true });
        setProfile(next);
        setDraftProfile(next);
        setIsProfileSetupOpen(!completed);
        setShowAuthScreen(false);
      } catch (err) {
        setProfileError(err.message || 'Unable to load profile.');
      } finally {
        setProfileLoading(false);
        setProfileHydrated(true);
      }
    }
    load();
  }, [user]);

  /* ── Auth handlers ── */
  const handleGoogleSignIn = async () => {
    if (!auth || !googleProvider || !isFirebaseConfigured) {
      setAuthError(firebaseConfigMessage || 'Firebase not configured.');
      return;
    }
    setAuthPending(true);
    setAuthError('');
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      setUser(cred.user);
      setShowAuthScreen(false);
    } catch (err) {
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/cancelled-popup-request') {
        try {
          window.sessionStorage.setItem(REDIRECT_KEY, 'true');
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (rErr) { setAuthError(rErr.message || 'Redirect sign-in failed.'); return; }
      }
      setAuthError(err.message || 'Unable to sign in with Google.');
    } finally {
      setAuthPending(false);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    setSigningOut(true);
    try {
      await signOut(auth);
      setMessages([]);
      setChatInput('');
      setCurrentTool(null);
      setIsSettingsOpen(false);
      setIsProfileSetupOpen(false);
    } finally {
      setSigningOut(false);
    }
  };

  /* ── Profile handlers ── */
  const handleProfileChange = (field, value) => {
    setDraftProfile(cur => ({ ...cur, [field]: value }));
  };

  const handleProfileSave = async ({ closeSetup = false } = {}) => {
    if (!user || !db) { if (closeSetup) setIsProfileSetupOpen(false); setProfile(draftProfile); return; }
    setProfileSaving(true);
    setProfileError('');
    try {
      await setDoc(createProfileRef(user.uid), {
        ...draftProfile, email: user.email || '', displayName: user.displayName || '',
        profileCompleted: true, profileCompletedAt: serverTimestamp(), updatedAt: serverTimestamp(),
      }, { merge: true });
      setProfile(draftProfile);
      if (closeSetup) setIsProfileSetupOpen(false);
    } catch (err) {
      setProfileError(err.message || 'Unable to save profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  /* ── Chat handlers ── */
  const scrollDown = () => {
    setTimeout(() => {
      if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }, 50);
  };

  const sendMessage = (text) => {
    const q = (text || chatInput).trim();
    if (!q || busy) return;
    setBusy(true);
    setChatInput('');
    if (taRef.current) taRef.current.style.height = 'auto';

    const uid = Date.now();
    const type = classify(q);
    setMessages(cur => [
      ...cur,
      { id: uid, role: 'user', text: q },
      { id: uid + 1, role: 'ai', typing: true },
    ]);
    scrollDown();

    setTimeout(() => {
      setMessages(cur => cur.map(m =>
        m.id === uid + 1
          ? {
              ...m,
              typing: false,
              text: REPLIES[type] || REPLIES.general,
              type,
              showCTA: IMPACT_TYPES.has(type),
              refs: REFS[type] || REFS.general,
              qrs: QRS[type] || [],
            }
          : m,
      ));
      setBusy(false);
      scrollDown();
    }, 1400 + Math.random() * 500);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const autoResize = (el) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  /* ── Tool handlers ── */
  const openTool = (name, presel) => {
    setActiveModuleView('chat');
    setCurrentTool(name);
    if (name === 'calculator' && presel != null) setCalcPreselect(presel);
  };

  const openToolForType = (type) => {
    const presel = CALC_POLICY_MAP[type] ?? null;
    openTool('calculator', presel);
  };

  /* ── Journey step ── */
  useEffect(() => {
    if (activeModuleView !== 'chat' && currentTool) {
      setCurrentTool(null);
    }
  }, [activeModuleView, currentTool]);

  const journeyStep = currentTool === 'translator' ? 1 : currentTool === 'calculator' ? 2 : currentTool === 'agent' ? 3 : 0;
  const toolMeta = {
    translator: { title: 'Policy Translator', sub: 'Get a plain-language summary of any Malaysian bill' },
    calculator: { title: 'Impact Calculator', sub: 'See how a policy affects your monthly finances' },
    agent: { title: 'My Tasks', sub: 'Applications and actions on your behalf' },
  };

  const profileTagLine = `${profile.incomeGroup} · ${profile.state} · ${profile.householdType} · ${profile.vehicleType || 'Diesel'}`;
  const displayName = user?.displayName || userProfile?.name || 'You';
  const initials = displayName.charAt(0).toUpperCase();

  const INCOME_GROUP = { '<1500': 'B40', '1500-2500': 'B40', '2500-4000': 'M40', '4000-5000': 'M40', '>5000': 'T20' };
  const trackerProfile = user ? profile : userProfile ? {
    incomeGroup:   INCOME_GROUP[userProfile.income] || 'B40',
    householdType: userProfile.employment || '',
    state: '',
    dependants: 0,
  } : null;

  /* ── Loading state ── */
  if (authInitializing) {
    return (
      <div className="pb-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: '20px 28px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', fontSize: 14, color: 'var(--muted)' }}>
          Restoring your session…
        </div>
      </div>
    );
  }

  const CHIPS = [
    { emoji: '⛽', label: 'BUDI MADANI fuel credit', q: 'Am I eligible for BUDI MADANI fuel credit?' },
    { emoji: '💵', label: 'STR 2026 amount', q: 'How much STR 2026 do I get?' },
    { emoji: '🧾', label: 'Single parent tax relief', q: 'What tax relief can I claim as a single parent?' },
    { emoji: '🏦', label: 'EPF Account 3', q: "EPF Account 3 — what can I withdraw?" },
    { emoji: '🏡', label: 'PR1MA housing', q: 'Am I eligible for PR1MA affordable housing?' },
    { emoji: '🏥', label: 'PeKa B40 coverage', q: 'What does PeKa B40 health screening cover?' },
    { emoji: '🚗', label: 'Grab income & tax', q: 'Is my Grab income taxable?' },
    { emoji: '📚', label: 'PTPTN deferment', q: 'PTPTN — can I defer if unemployed?' },
    { emoji: '🌱', label: 'Solar panel subsidy', q: 'Solar panel subsidy in Malaysia?' },
  ];
  const moduleTabs = [
    { id: 'chat', label: 'Chat', blurb: 'Policy AI workspace' },
    { id: 'news', label: 'Tracker', blurb: 'Bills, aid & timeline' },
    { id: 'impact', label: 'Impact', blurb: 'Public facility map' },
  ];

  return (
    <div className="pb-shell">

      {/* ── Modals (relative to shell) ── */}
      {showAuthScreen && (
        <AuthScreen
          onBack={() => setShowAuthScreen(false)}
          onGoogleSignIn={handleGoogleSignIn}
          authPending={authPending}
          authError={authError}
        />
      )}
      {user && isProfileSetupOpen && (
        <ProfileSetupModal
          profile={draftProfile}
          onChange={handleProfileChange}
          onSave={() => handleProfileSave({ closeSetup: true })}
          profileSaving={profileSaving}
          profileError={profileError}
          onClose={() => setIsProfileSetupOpen(false)}
        />
      )}
      {user && isSettingsOpen && (
        <SettingsModal
          user={user}
          profile={profile}
          onClose={() => setIsSettingsOpen(false)}
          onSignOut={handleSignOut}
          signingOut={signingOut}
          onOpenProfileSetup={() => { setIsSettingsOpen(false); setIsProfileSetupOpen(true); }}
        />
      )}

      {/* ── Topbar ── */}
      <div className="topbar">
        <button className="brand" onClick={onBack}>
          <div className="brand-mark">1P</div>
          <div className="brand-name">1<span>Peace</span></div>
        </button>
        <div className="topbar-right">
          <div className="topbar-nav">
            {moduleTabs.map((tab) => (
              <button key={tab.id} type="button" className={`tn-btn${activeModuleView === tab.id ? ' active' : ''}`} onClick={() => setActiveModuleView(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
          {user ? (
            <button className="topbar-profile" onClick={() => setIsSettingsOpen(true)}>
              <div className="tp-avatar">{initials}</div>
              <div>
                <div className="tp-name">{displayName.split(' ')[0]}</div>
                <div className="tp-tag">{profile.incomeGroup} · {profile.state}</div>
              </div>
            </button>
          ) : userProfile ? (
            <div className="topbar-profile" style={{ cursor: 'default' }}>
              <div className="tp-avatar">{initials}</div>
              <div>
                <div className="tp-name">{displayName.split(' ')[0]}</div>
                <div className="tp-tag">{INCOME_GROUP[userProfile.income] || 'B40'}</div>
              </div>
            </div>
          ) : (
            <button
              style={{ padding: '6px 14px', borderRadius: 10, border: '1.5px solid var(--blue)', background: 'var(--blue)', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              onClick={() => setShowAuthScreen(true)}
            >
              Sign in
            </button>
          )}
        </div>
      </div>

      {activeModuleView === 'chat' ? (
      <div className="layout">

        {/* ── Sidebar ── */}
        <div className="sidebar">
          <button
            onClick={onBack}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 14px', border:'none', background:'none', cursor:'pointer', color:'var(--muted)', fontSize:13, fontWeight:600, width:'100%', textAlign:'left' }}
          >
            <span style={{ fontSize:16 }}>←</span> Back
          </button>
          <div className="aid-wallet" onClick={() => openTool('agent')}>
            <div className="aw-label">Your eligible aid</div>
            <div className="aw-amount">RM {aidResult.total.toLocaleString()}</div>
            <div className="aw-sub">per year across {aidResult.count} programme{aidResult.count !== 1 ? 's' : ''}</div>
            <div className="aw-hint">Tap to see breakdown →</div>
          </div>

          <div className="sidebar-section" style={{ paddingTop: 14 }}>
            <div className="sidebar-label">Tools</div>
            <button className={`tool-btn${currentTool === 'translator' ? ' active' : ''}`} onClick={() => openTool('translator')}>
              <div className="tb-icon">📄</div>
              <div>
                <span className="tb-name">Policy Translator</span>
                <span className="tb-desc">Plain-language summaries</span>
              </div>
            </button>
            <button className={`tool-btn${currentTool === 'calculator' ? ' active' : ''}`} onClick={() => openTool('calculator')}>
              <div className="tb-icon">🧮</div>
              <div>
                <span className="tb-name">Impact Calculator</span>
                <span className="tb-desc">How policy affects your wallet</span>
              </div>
            </button>
            <button className={`tool-btn${currentTool === 'agent' ? ' active' : ''}`} onClick={() => openTool('agent')}>
              <div className="tb-icon">✅</div>
              <div>
                <span className="tb-name">My Tasks</span>
                <span className="tb-desc">Applications & actions</span>
              </div>
              <div className="tb-badge">2</div>
            </button>
          </div>

          <div className="sidebar-divider"/>

          <div className="sidebar-section">
            <div className="sidebar-label">Recent</div>
            {['Do I still qualify for diesel subsidy?', 'EPF Account 3 withdrawal rules', 'Tax relief single parent 2024'].map(q => (
              <div key={q} className="recent-item" onClick={() => sendMessage(q)}>
                <div className="recent-icon">💬</div>
                <div className="recent-text">{q}</div>
              </div>
            ))}
          </div>

          <button className="profile-bar" onClick={() => user ? setIsProfileSetupOpen(true) : setShowAuthScreen(true)}>
            <div className="profile-avatar">{initials}</div>
            <div>
              <div className="pname">{user?.displayName || 'Guest'}</div>
              <div className="ptag-line">{profileTagLine}</div>
            </div>
            <div className="profile-complete">● Set</div>
          </button>
        </div>

        {/* ── Main ── */}
        <div className="main">

          {/* ── Chat area ── */}
          <div className="chat-area">
            <div className="chat-scroll" ref={chatScrollRef}>
              <div className="chat-inner">

                {/* Welcome screen (shown when no messages) */}
                {messages.length === 0 && (
                  <div className="welcome-screen">
                    <div className="welcome-logo">1P</div>
                    <div className="welcome-greeting">Welcome{user ? `, ${displayName.split(' ')[0]}` : ''} 👋</div>
                    <h2>Ask anything about Malaysian policy</h2>
                    <p>I explain bills in plain language, calculate how policies affect your finances, and help you apply for aid — all in one place.</p>
                    <div className="quick-actions">
                      {[
                        { icon: '⛽', title: 'Diesel Subsidy Change', sub: 'Who qualifies & what changes', q: 'How does the diesel subsidy change affect me?' },
                        { icon: '🧾', title: 'Tax Relief Guide', sub: 'Maximise your tax claims', q: 'What tax relief can I claim as a working single parent?' },
                        { icon: '💵', title: 'STR 2026 Payment', sub: 'Eligibility & amounts', q: 'How much STR cash aid will I receive in 2026?' },
                        { icon: '🏦', title: 'EPF Account 3', sub: 'Flexible withdrawal explained', q: 'What can I use EPF Account 3 for?' },
                      ].map(c => (
                        <div key={c.title} className="qa-card" onClick={() => sendMessage(c.q)}>
                          <div className="qac-icon">{c.icon}</div>
                          <div className="qac-title">{c.title}</div>
                          <div className="qac-sub">{c.sub}</div>
                        </div>
                      ))}
                    </div>
                    <div className="profile-nudge" onClick={() => user ? setIsProfileSetupOpen(true) : setShowAuthScreen(true)}>
                      <div className="pn-icon">✨</div>
                      <div className="pn-text">
                        <strong>{user ? 'Profile detected — answers are personalised to you' : 'Sign in to personalise your results'}</strong>
                        {profileTagLine} · {profile.dependants} dependant{profile.dependants !== '1' ? 's' : ''}
                      </div>
                      <div className="pn-cta">{user ? 'Edit →' : 'Sign in →'}</div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                {messages.map(msg => (
                  <div key={msg.id} className={`msg${msg.role === 'user' ? ' user' : ''}`}>
                    <div className={`msg-av ${msg.role === 'user' ? 'user' : 'ai'}`}>
                      {msg.role === 'user' ? initials : '1P'}
                    </div>
                    <div className="msg-content">
                      {msg.typing ? (
                        <div className="typing-bubble">
                          <div className="t-dot"/><div className="t-dot"/><div className="t-dot"/>
                        </div>
                      ) : (
                        <>
                          <div className="bubble" dangerouslySetInnerHTML={{ __html: msg.role === 'user' ? msg.text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : msg.text }} />
                          {msg.showCTA && (
                            <div className="impact-cta" onClick={() => openToolForType(msg.type)}>
                              <div className="icta-icon">🧮</div>
                              <div className="icta-body">
                                <div className="icta-title">Calculate how this policy affects your wallet</div>
                                <div className="icta-sub">Based on your profile: {profileTagLine}</div>
                              </div>
                              <div className="icta-arrow">→</div>
                            </div>
                          )}
                          {msg.refs && (
                            <div className="ref-row">
                              {msg.refs.map(r => <span key={r} className="ref-chip">📋 {r}</span>)}
                            </div>
                          )}
                          {msg.qrs && msg.qrs.length > 0 && (
                            <div className="quick-replies">
                              {msg.qrs.map(q => (
                                <div key={q} className="qr-chip" onClick={() => sendMessage(q)}>{q}</div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}

              </div>
            </div>

            {/* Suggestion chips */}
            <div className="chips-bar">
              <div className="chips-row">
                {CHIPS.map(c => (
                  <div key={c.label} className="chip" onClick={() => sendMessage(c.q)}>
                    {c.emoji} {c.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Input bar */}
            <div className="input-bar">
              <div className="input-wrap">
                <textarea
                  ref={taRef}
                  className="chat-ta"
                  rows={1}
                  value={chatInput}
                  onChange={e => { setChatInput(e.target.value); autoResize(e.target); }}
                  onKeyDown={handleKey}
                  placeholder="Ask about any Malaysian policy, subsidy, or tax…"
                />
                <button className="send-btn" onClick={() => sendMessage()} disabled={busy || !chatInput.trim()}>
                  ➤
                </button>
              </div>
              <div className="input-hint">1Peace gives general policy information. For official matters, verify with the relevant government agency.</div>
            </div>
          </div>

          {/* ── Tool Panel ── */}
          {currentTool && (
            <div className="tool-panel">
              {/* Journey indicator */}
              <div className="journey-bar">
                <div className="journey-steps">
                  {[
                    { n: 1, label: 'Understand' },
                    { n: 2, label: 'Personalise' },
                    { n: 3, label: 'Act' },
                  ].map(({ n, label }, i) => (
                    <div key={n} style={{ display: 'contents' }}>
                      <div className={`jstep${journeyStep > n ? ' done' : journeyStep === n ? ' active' : ''}`}>
                        <div className="jstep-num">{journeyStep > n ? '✓' : n}</div>
                        <span>{label}</span>
                      </div>
                      {i < 2 && <div className={`jstep-line${journeyStep > n ? ' done' : ''}`}/>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Header */}
              <div className="tph">
                <div>
                  <div className="tph-title">{toolMeta[currentTool].title}</div>
                  <div className="tph-sub">{toolMeta[currentTool].sub}</div>
                </div>
                <button className="tph-close" onClick={() => setCurrentTool(null)}>✕</button>
              </div>

              {/* Body */}
              <div className="tool-body">
                {currentTool === 'translator' && (
                  <TranslatorPanel onOpenCalculator={() => openTool('calculator')} />
                )}
                {currentTool === 'calculator' && (
                  <CalculatorPanel
                    key={calcPreselect ?? 'default'}
                    profile={profile}
                    preselect={calcPreselect}
                    onOpenAgent={() => openTool('agent')}
                  />
                )}
                {currentTool === 'agent' && <AgentPanel />}
              </div>
            </div>
          )}

        </div>{/* /main */}
      </div>
      ) : activeModuleView === 'news' ? (
        <div className="flex-1 overflow-y-auto">
          <PolicyTrackerView profile={trackerProfile} aidTotal={aidResult.total} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <PolicyImpactView profile={profile} />
        </div>
      )}
    </div> /* /pb-shell */
  );
}

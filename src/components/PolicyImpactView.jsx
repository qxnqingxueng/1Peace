import { useEffect, useMemo, useState } from 'react';

const CSS = `
.eiv{--blue:#003399;--blue-mid:#1a4fad;--blue-pale:#f0f4ff;--gold:#F7C800;
  --green:#16a34a;--green-light:#f0fdf4;--red:#dc2626;--red-light:#fef2f2;
  --orange:#f59e0b;--orange-light:#fffbea;--border:#e2e8f0;--surface:#f8fafc;
  --muted:#64748b;--dark:#0f172a;
  font-family:'Segoe UI',system-ui,Arial,sans-serif;color:var(--dark);}
.eiv *{box-sizing:border-box;}
.eiv-controls{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:16px;}
.eiv-policy-select{padding:8px 14px;border-radius:10px;border:2px solid var(--border);
  font-size:13px;font-weight:700;background:white;cursor:pointer;color:var(--dark);outline:none;}
.eiv-policy-select:focus{border-color:var(--blue);}
.eiv-range-pills{display:flex;gap:2px;background:#f1f5f9;border-radius:10px;padding:3px;}
.eiv-rp{padding:5px 12px;border-radius:8px;border:none;font-size:12px;font-weight:700;
  cursor:pointer;background:transparent;color:var(--muted);transition:all .15s;}
.eiv-rp.active{background:var(--blue);color:white;}
.eiv-cat-pills{display:flex;gap:6px;flex-wrap:wrap;}
.eiv-cat{padding:4px 10px;border-radius:20px;border:1.5px solid var(--border);font-size:11px;
  font-weight:700;cursor:pointer;background:white;color:var(--muted);transition:all .15s;}
.eiv-cat.active{border-color:var(--blue);background:var(--blue-pale);color:var(--blue);}
.eiv-kpi-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;}
.eiv-kpi{background:white;border:1px solid var(--border);border-radius:14px;padding:14px 16px;
  box-shadow:0 1px 4px rgba(0,0,0,.04);}
.eiv-kpi-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;
  color:var(--muted);margin-bottom:4px;}
.eiv-kpi-val{font-size:22px;font-weight:900;color:var(--dark);}
.eiv-kpi-sub{font-size:11px;color:var(--muted);margin-top:2px;}
.eiv-mid{display:grid;grid-template-columns:1fr 340px;gap:14px;margin-bottom:14px;}
.eiv-card{background:white;border:1px solid var(--border);border-radius:16px;padding:18px 20px;
  box-shadow:0 1px 4px rgba(0,0,0,.04);}
.eiv-card-title{font-size:13px;font-weight:800;color:var(--dark);margin-bottom:2px;}
.eiv-card-sub{font-size:11px;color:var(--muted);margin-bottom:14px;}
.eiv-bottom{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;}
.eiv-infra-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.eiv-infra-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 14px;}
.eiv-infra-icon{font-size:20px;margin-bottom:6px;}
.eiv-infra-name{font-size:12px;font-weight:700;color:var(--dark);}
.eiv-infra-count{font-size:11px;color:var(--muted);margin-top:2px;}
.eiv-infra-bar{height:4px;border-radius:2px;background:#e2e8f0;margin:8px 0 4px;}
.eiv-infra-fill{height:100%;border-radius:2px;transition:width .4s;}
.eiv-severity{display:inline-block;padding:2px 7px;border-radius:20px;font-size:10px;font-weight:800;}
.eiv-severity.high{background:var(--red-light);color:var(--red);}
.eiv-severity.medium{background:var(--orange-light);color:#b45309;}
.eiv-severity.low{background:var(--green-light);color:var(--green);}
.eiv-infra-note{font-size:10px;color:var(--muted);margin-top:5px;line-height:1.4;}
.eiv-policy-badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:800;}
.eiv-stat-row{display:flex;gap:20px;margin-top:10px;}
.eiv-stat{text-align:center;}
.eiv-stat-val{font-size:14px;font-weight:900;}
.eiv-stat-lbl{font-size:10px;color:#94a3b8;}
`;

const POLICIES = [
  { id:'budi',   name:'BUDI MADANI',            label:'Fuel subsidy RM200/mo',    color:'#f59e0b', cat:'Subsidy' },
  { id:'diesel', name:'Diesel Rationalisation', label:'Targeted diesel cap',      color:'#ef4444', cat:'Subsidy' },
  { id:'str',    name:'STR 2026',               label:'Cash aid RM1,500/yr',      color:'#10b981', cat:'Welfare' },
  { id:'epf',    name:'EPF Account 3',          label:'Flexible withdrawal 10%',  color:'#6366f1', cat:'Finance' },
  { id:'peka',   name:'PeKa B40',               label:'Free health screening',    color:'#ec4899', cat:'Health'  },
];

function wave(base, amp, pts, peakAt, peakBoost) {
  return Array.from({ length: pts }, (_, i) => {
    const t = i / pts;
    const trend = base + t * amp * 0.4;
    const noise = Math.sin(i * 1.8) * amp * 0.12 + Math.sin(i * 0.6) * amp * 0.07;
    const peak  = Math.abs(t - peakAt) < 0.07 ? base * peakBoost : 0;
    return Math.max(0, Math.round(trend + noise + peak));
  });
}

const TEMPORAL = {
  '1Y':  { pts:12, labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] },
  '3Y':  { pts:12, labels:['Q1 Y1','Q2','Q3','Q4','Q1 Y2','Q2','Q3','Q4','Q1 Y3','Q2','Q3','Q4'] },
  '5Y':  { pts:10, labels:['Y1','','Y2','','Y3','','Y4','','Y5',''] },
  '10Y': { pts:10, labels:['Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8','Y9','Y10'] },
};

const PDATA = {
  budi: {
    kpi:{ spend:'RM 2.4B', sectors:6, brands:5, years:3 },
    sectors:[
      { name:'Fuel Stations',       pct:92, delta:'+18.4%', gain:true  },
      { name:'Logistics / Haulage', pct:78, delta:'+11.6%', gain:true  },
      { name:'Factories',           pct:67, delta:'+4.2%',  gain:true  },
      { name:'Public Transport',    pct:35, delta:'\u22128.1%',  gain:false },
      { name:'Clinics',             pct:20, delta:'\u22122.3%',  gain:false },
      { name:'Schools',             pct:12, delta:'\u22121.1%',  gain:false },
    ],
    brands:[
      { name:'Petronas', val:2.8, color:'#003087' },
      { name:'Shell',    val:2.1, color:'#DD1D21' },
      { name:'BHPetrol', val:1.4, color:'#E87722' },
      { name:'Caltex',   val:1.2, color:'#009BD9' },
      { name:'Petron',   val:0.8, color:'#E31837' },
    ],
    infra:[
      { type:'Fuel Stations', count:412, hit:380, icon:'\u26fd', sev:'high',   note:'RM200 credit = +RM82.4M monthly throughput' },
      { type:'Factories',     count:287, hit:193, icon:'\ud83c\udfed', sev:'medium', note:'Industrial diesel 15% lower opex' },
      { type:'Logistics Hubs',count:94,  hit:71,  icon:'\ud83d\udece', sev:'medium', note:'Last-mile cost \u2212RM0.08/km' },
      { type:'Public Transit', count:156, hit:55,  icon:'\ud83d\ude8c', sev:'low',    note:'Modal shift \u22128% ridership' },
      { type:'Clinics',       count:203, hit:41,  icon:'\ud83c\udfe5', sev:'low',    note:'Indirect supply-chain saving' },
      { type:'Schools',       count:318, hit:38,  icon:'\ud83c\udfeb', sev:'low',    note:'Family transport budget relief' },
    ],
    series:{ '1Y':wave(180,80,12,0.6,0.35), '3Y':wave(175,120,12,0.7,0.4), '5Y':wave(160,150,10,0.65,0.45), '10Y':wave(140,200,10,0.7,0.5) },
    peakLabel:'Budget peak',
  },
  diesel: {
    kpi:{ spend:'RM 1.8B', sectors:5, brands:4, years:2 },
    sectors:[
      { name:'Fuel Stations',   pct:85, delta:'+14.2%', gain:true  },
      { name:'Haulage / Fleet', pct:80, delta:'+12.8%', gain:true  },
      { name:'Agriculture',     pct:60, delta:'+6.4%',  gain:true  },
      { name:'Public Transport',pct:42, delta:'\u221210.2%', gain:false },
      { name:'Fishing Sector',  pct:33, delta:'\u221214.1%', gain:false },
    ],
    brands:[
      { name:'Petronas', val:3.1, color:'#003087' },
      { name:'Shell',    val:1.9, color:'#DD1D21' },
      { name:'BHPetrol', val:1.1, color:'#E87722' },
      { name:'Caltex',   val:0.9, color:'#009BD9' },
    ],
    infra:[
      { type:'Fuel Stations',  count:412, hit:350, icon:'\u26fd', sev:'high',   note:'Targeted cap removes broad subsidy bleed' },
      { type:'Fishing Fleets', count:88,  hit:72,  icon:'\u2693', sev:'high',   note:'Marine diesel 40% cost increase' },
      { type:'Farm Equipment', count:134, hit:95,  icon:'\ud83c\udf3e', sev:'medium', note:'Agricultural diesel exempt for 2Y' },
      { type:'Haulage Depots', count:74,  hit:61,  icon:'\ud83d\ude9b', sev:'medium', note:'Fleet ops cost +RM0.12/km' },
      { type:'Public Buses',   count:156, hit:68,  icon:'\ud83d\ude8c', sev:'low',    note:'Partial subsidy passthrough' },
    ],
    series:{ '1Y':wave(200,100,12,0.55,0.4), '3Y':wave(195,130,12,0.65,0.45), '5Y':wave(185,160,10,0.6,0.5), '10Y':wave(170,210,10,0.7,0.55) },
    peakLabel:'Rollout surge',
  },
  str: {
    kpi:{ spend:'RM 3.1B', sectors:4, brands:6, years:1 },
    sectors:[
      { name:'Grocery Retail',    pct:88, delta:'+22.3%', gain:true  },
      { name:'Wet Markets',       pct:71, delta:'+14.7%', gain:true  },
      { name:'Convenience Stores',pct:65, delta:'+9.4%',  gain:true  },
      { name:'Luxury Retail',     pct:18, delta:'\u22125.2%',  gain:false },
    ],
    brands:[
      { name:'Mydin',      val:1.8, color:'#16a34a' },
      { name:'AEON',       val:1.4, color:'#dc2626' },
      { name:'99 Speedmart',val:1.1,color:'#f59e0b' },
      { name:'Giant',      val:0.9, color:'#7c3aed' },
      { name:'KK Mart',    val:0.7, color:'#0891b2' },
      { name:'Econsave',   val:0.6, color:'#ea580c' },
    ],
    infra:[
      { type:'Supermarkets', count:214, hit:198, icon:'\ud83d\uded2', sev:'high',   note:'RM1,500 direct spend = +RM321M retail boost' },
      { type:'Wet Markets',  count:156, hit:111, icon:'\ud83e\udd69', sev:'high',   note:'Fresh produce spend up 22%' },
      { type:'Mini Markets', count:820, hit:534, icon:'\ud83c\udfe9', sev:'medium', note:'Convenience channel +9.4% basket size' },
      { type:'Clinics',      count:203, hit:81,  icon:'\ud83c\udfe5', sev:'low',    note:'Health spend from freed income' },
    ],
    series:{ '1Y':wave(240,100,12,0.5,0.45), '3Y':wave(220,120,12,0.6,0.4), '5Y':wave(200,140,10,0.65,0.4), '10Y':wave(180,180,10,0.7,0.45) },
    peakLabel:'Disbursement month',
  },
  epf: {
    kpi:{ spend:'RM 5.2B', sectors:5, brands:4, years:5 },
    sectors:[
      { name:'Consumer Spending', pct:74, delta:'+12.1%', gain:true  },
      { name:'Property Market',   pct:61, delta:'+8.6%',  gain:true  },
      { name:'Education Sector',  pct:48, delta:'+5.3%',  gain:true  },
      { name:'Long-term Savings', pct:72, delta:'\u221218.4%', gain:false },
      { name:'Insurance Sector',  pct:38, delta:'\u22126.2%',  gain:false },
    ],
    brands:[
      { name:'Maybank',   val:2.2, color:'#f59e0b' },
      { name:'CIMB',      val:1.8, color:'#dc2626' },
      { name:'Public Bk', val:1.5, color:'#003087' },
      { name:'RHB',       val:1.1, color:'#16a34a' },
    ],
    infra:[
      { type:'Banks / ATMs',  count:420, hit:380, icon:'\ud83c\udfe6', sev:'high',   note:'Account 3 withdrawals via all major banks' },
      { type:'Property Dev',  count:87,  hit:53,  icon:'\ud83c\udfd7\ufe0f', sev:'medium', note:'Down-payment release drives buyer activity' },
      { type:'Universities',  count:62,  hit:30,  icon:'\ud83c\udf93', sev:'medium', note:'Education fee withdrawal spike Q3' },
      { type:'Clinics',       count:203, hit:61,  icon:'\ud83c\udfe5', sev:'low',    note:'Medical withdrawal category +18%' },
      { type:'Insurance Cos', count:38,  hit:28,  icon:'\ud83d\udccb', sev:'low',    note:'Premium lapses as members self-insure' },
    ],
    series:{ '1Y':wave(380,180,12,0.45,0.55), '3Y':wave(360,200,12,0.5,0.5), '5Y':wave(330,240,10,0.55,0.55), '10Y':wave(300,280,10,0.6,0.6) },
    peakLabel:'Withdrawal launch',
  },
  peka: {
    kpi:{ spend:'RM 0.6B', sectors:3, brands:3, years:4 },
    sectors:[
      { name:'Public Hospitals', pct:82, delta:'+28.4%', gain:true },
      { name:'Private Clinics',  pct:55, delta:'+9.2%',  gain:true },
      { name:'Pharmacies',       pct:48, delta:'+6.8%',  gain:true },
    ],
    brands:[
      { name:'KPJ Healthcare',  val:1.2, color:'#6366f1' },
      { name:'Caring Pharmacy', val:0.8, color:'#ec4899' },
      { name:'Guardian',        val:0.7, color:'#0891b2' },
    ],
    infra:[
      { type:'Hospitals',  count:138, hit:113, icon:'\ud83c\udfe5', sev:'high',   note:'Free cancer, CVD & DM screening' },
      { type:'Clinics',    count:203, hit:112, icon:'\ud83e\ude7a', sev:'high',   note:'Referral load +28% to GPs' },
      { type:'Pharmacies', count:412, hit:198, icon:'\ud83d\udc8a', sev:'medium', note:'Follow-up medication claims up 18%' },
    ],
    series:{ '1Y':wave(40,20,12,0.6,0.4), '3Y':wave(38,25,12,0.65,0.42), '5Y':wave(35,30,10,0.6,0.45), '10Y':wave(30,38,10,0.65,0.5) },
    peakLabel:'Screening drive',
  },
};

function AreaChart({ series, peakLabel, color }) {
  const W = 480, H = 160, PL = 48, PT = 20, PR = 20, PB = 30;
  const iW = W - PL - PR;
  const iH = H - PT - PB;
  const max = Math.max(...series) * 1.15;
  const pts = series.map((v, i) => ({
    x: PL + (i / (series.length - 1)) * iW,
    y: PT + (1 - v / max) * iH,
  }));
  const peakIdx = series.indexOf(Math.max(...series));
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = linePath + ` L${pts[pts.length - 1].x},${PT + iH} L${PL},${PT + iH} Z`;
  const yTicks = [0, 0.5, 1].map(r => ({
    y: PT + (1 - r) * iH,
    label: `${Math.round(r * max)}M`,
  }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:160, overflow:'visible' }}>
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PL} y1={t.y} x2={W - PR} y2={t.y} stroke="#f1f5f9" strokeWidth="1" />
          <text x={PL - 6} y={t.y + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{t.label}</text>
        </g>
      ))}
      <path d={areaPath} fill="url(#ag)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === peakIdx ? 5 : 3}
          fill={i === peakIdx ? color : 'white'} stroke={color} strokeWidth="2" />
      ))}
      {pts[peakIdx] && (
        <g>
          <line x1={pts[peakIdx].x} y1={pts[peakIdx].y - 6} x2={pts[peakIdx].x} y2={PT}
            stroke={color} strokeWidth="1" strokeDasharray="3 2" />
          <text x={pts[peakIdx].x} y={PT - 4} textAnchor="middle" fontSize="9" fontWeight="700" fill={color}>
            {peakLabel}
          </text>
        </g>
      )}
      <line x1={PL} y1={PT + iH} x2={W - PR} y2={PT + iH} stroke="#e2e8f0" strokeWidth="1" />
    </svg>
  );
}

function SectorBars({ sectors }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {sectors.map(s => (
        <div key={s.name}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
            <span style={{ fontSize:11, fontWeight:600, color:'#334155' }}>{s.name}</span>
            <span style={{ fontSize:11, fontWeight:800, color: s.gain ? '#16a34a' : '#dc2626' }}>{s.delta}</span>
          </div>
          <div style={{ height:6, borderRadius:3, background:'#f1f5f9', overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:3, width:`${s.pct}%`,
              background: s.gain ? 'linear-gradient(90deg,#16a34a,#4ade80)' : 'linear-gradient(90deg,#dc2626,#f87171)',
              transition:'width .5s',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function BrandChart({ brands }) {
  const max = Math.max(...brands.map(b => b.val));
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {brands.map(b => (
        <div key={b.name} style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ width:90, fontSize:11, fontWeight:700, color:'#334155', flexShrink:0, textAlign:'right' }}>{b.name}</span>
          <div style={{ flex:1, height:18, borderRadius:4, background:'#f1f5f9', overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:4, width:`${(b.val/max)*100}%`, background:b.color, opacity:.85, transition:'width .5s' }} />
          </div>
          <span style={{ width:48, fontSize:11, fontWeight:800, color:'#334155' }}>RM{b.val}B</span>
        </div>
      ))}
      <div style={{ fontSize:10, color:'#94a3b8', marginTop:2 }}>Annual revenue impact from policy-driven volume shift</div>
    </div>
  );
}

export default function PolicyImpactView() {
  const [policyId,  setPolicyId]  = useState('budi');
  const [range,     setRange]     = useState('1Y');
  const [catFilter, setCatFilter] = useState('All');

  useEffect(() => {
    const el = document.createElement('style');
    el.setAttribute('data-eiv', '1');
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const policy = POLICIES.find(p => p.id === policyId);
  const data   = PDATA[policyId];
  const series = data.series[range];

  const cats = useMemo(() => ['All', ...new Set(POLICIES.map(p => p.cat))], []);

  const visiblePolicies = catFilter === 'All' ? POLICIES : POLICIES.filter(p => p.cat === catFilter);

  const peakVal = Math.max(...series);
  const avgVal  = Math.round(series.reduce((a, b) => a + b, 0) / series.length);

  return (
    <div className="eiv" style={{ padding:'20px 24px' }}>

      <div className="eiv-controls">
        <select className="eiv-policy-select" value={policyId} onChange={e => setPolicyId(e.target.value)}>
          {visiblePolicies.map(p => (
            <option key={p.id} value={p.id}>{p.name} \u2014 {p.label}</option>
          ))}
        </select>
        <div className="eiv-range-pills">
          {['1Y','3Y','5Y','10Y'].map(r => (
            <button key={r} className={`eiv-rp${range === r ? ' active' : ''}`} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
        <div className="eiv-cat-pills">
          {cats.map(c => (
            <button key={c} className={`eiv-cat${catFilter === c ? ' active' : ''}`} onClick={() => setCatFilter(c)}>{c}</button>
          ))}
        </div>
        <span className="eiv-policy-badge" style={{ background: policy.color + '22', color: policy.color }}>{policy.cat}</span>
      </div>

      <div className="eiv-kpi-strip">
        {[
          { label:'Total Budget Spend',    val:data.kpi.spend,             sub:'Allocated ' + range + ' disbursement',      color:policy.color },
          { label:'Sectors Affected',      val:data.kpi.sectors,           sub:'Industries with measurable shift',           color:'' },
          { label:'Operators / Brands',    val:data.kpi.brands,            sub:'Companies with revenue impact',              color:'' },
          { label:'Policy Active (Yrs)',   val:data.kpi.years,             sub:'Peak in yr ' + Math.ceil(data.kpi.years*0.6), color:'' },
        ].map(k => (
          <div className="eiv-kpi" key={k.label}>
            <div className="eiv-kpi-label">{k.label}</div>
            <div className="eiv-kpi-val" style={k.color ? { color:k.color } : {}}>{k.val}</div>
            <div className="eiv-kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="eiv-mid">
        <div className="eiv-card">
          <div className="eiv-card-title">Expenditure Trend \u2014 {policy.name}</div>
          <div className="eiv-card-sub">RM million / period \u00b7 peak annotated</div>
          <AreaChart series={series} peakLabel={data.peakLabel} color={policy.color} />
          <div className="eiv-stat-row">
            {[
              { label:'Peak period', val:`RM${peakVal}M`,    color:policy.color },
              { label:'Avg / period', val:`RM${avgVal}M`,    color:'#334155'    },
              { label:'Total',       val:data.kpi.spend,     color:'#334155'    },
            ].map(m => (
              <div className="eiv-stat" key={m.label}>
                <div className="eiv-stat-val" style={{ color:m.color }}>{m.val}</div>
                <div className="eiv-stat-lbl">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="eiv-card">
          <div className="eiv-card-title">Sector Impact Ranking</div>
          <div className="eiv-card-sub">Which industries gain or lose most</div>
          <SectorBars sectors={data.sectors} />
        </div>
      </div>

      <div className="eiv-bottom">
        <div className="eiv-card">
          <div className="eiv-card-title">Operator / Brand Revenue Impact</div>
          <div className="eiv-card-sub">Annual revenue shift driven by policy-induced volume change</div>
          <BrandChart brands={data.brands} />
        </div>
        <div className="eiv-card">
          <div className="eiv-card-title">Affected Infrastructure</div>
          <div className="eiv-card-sub">{data.infra.reduce((a,b)=>a+b.hit,0).toLocaleString()} of {data.infra.reduce((a,b)=>a+b.count,0).toLocaleString()} facilities impacted in your area</div>
          <div className="eiv-infra-grid">
            {data.infra.map(f => (
              <div className="eiv-infra-card" key={f.type}>
                <div className="eiv-infra-icon">{f.icon}</div>
                <div className="eiv-infra-name">{f.type}</div>
                <div className="eiv-infra-count">{f.hit} / {f.count}</div>
                <div className="eiv-infra-bar">
                  <div className="eiv-infra-fill" style={{
                    width:`${(f.hit/f.count)*100}%`,
                    background: f.sev==='high' ? '#ef4444' : f.sev==='medium' ? '#f59e0b' : '#22c55e',
                  }} />
                </div>
                <span className={`eiv-severity ${f.sev}`}>{f.sev}</span>
                <div className="eiv-infra-note">{f.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

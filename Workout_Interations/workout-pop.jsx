import { useState, useEffect } from "react";

// === STRICT PALETTE — 5 core + 3 accent, full saturation only ===
const BLUE = "#0047AB";
const YELLOW = "#F5C518";
const RED = "#CC2936";
const WHITE = "#FFFFFF";
const BLACK = "#1A1A1A";
const ORANGE = "#E8751A";
const GREEN = "#1B8C4E";
const TEAL = "#008080";

// ============================================================
// GEOMETRIC ART — flat fills, black outlines, ZERO gradients/opacity
// ============================================================
const Art = {
  // 1. WALL DORSIFLEXION — Angular wall + foot + arc
  wallDorsiflexion: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <rect width={w} height={h} fill={YELLOW} />
      <rect x={w*0.55} y={0} width={w*0.45} height={h} fill={BLACK} />
      <rect x={0} y={h*0.7} width={w*0.55} height={h*0.3} fill={WHITE} />
      <polygon points={`${w*0.12},${h*0.7} ${w*0.48},${h*0.7} ${w*0.52},${h*0.38}`} fill={RED} />
      <polygon points={`${w*0.12},${h*0.7} ${w*0.48},${h*0.7} ${w*0.52},${h*0.38}`} fill="none" stroke={BLACK} strokeWidth="3" />
      <path d={`M ${w*0.48} ${h*0.52} A ${w*0.22} ${w*0.22} 0 0 1 ${w*0.53} ${h*0.25}`} fill="none" stroke={YELLOW} strokeWidth="5" />
      <circle cx={w*0.53} cy={h*0.25} r="8" fill={YELLOW} stroke={BLACK} strokeWidth="2" />
      <line x1={w*0.55} y1={0} x2={w*0.55} y2={h} stroke={BLACK} strokeWidth="4" />
      <line x1={0} y1={h*0.7} x2={w*0.55} y2={h*0.7} stroke={BLACK} strokeWidth="3" />
    </svg>
  ),

  // 2. ANKLE CIRCLES — Concentric rings, blue/yellow/red
  ankleCircles: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <rect width={w} height={h} fill={BLUE} />
      <circle cx={w*0.5} cy={h*0.48} r="95" fill={YELLOW} stroke={BLACK} strokeWidth="3" />
      <circle cx={w*0.5} cy={h*0.48} r="68" fill={BLUE} stroke={BLACK} strokeWidth="3" />
      <circle cx={w*0.5} cy={h*0.48} r="44" fill={RED} stroke={BLACK} strokeWidth="3" />
      <circle cx={w*0.5} cy={h*0.48} r="20" fill={WHITE} stroke={BLACK} strokeWidth="2" />
    </svg>
  ),

  // 3. EVERSION HOLD — Force circles against wall
  eversionHold: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <rect width={w} height={h} fill={ORANGE} />
      <rect x={w*0.72} y={0} width={w*0.28} height={h} fill={BLACK} />
      <circle cx={w*0.48} cy={h*0.5} r={w*0.3} fill={WHITE} stroke={BLACK} strokeWidth="3" />
      <circle cx={w*0.48} cy={h*0.5} r={w*0.19} fill={RED} stroke={BLACK} strokeWidth="3" />
      <circle cx={w*0.48} cy={h*0.5} r={w*0.08} fill={YELLOW} stroke={BLACK} strokeWidth="2" />
      {[0.28, 0.38, 0.62, 0.72].map((y, i) => (
        <rect key={i} x={w*0.04} y={h*y-2} width={w*0.18} height={5} fill={BLACK} />
      ))}
    </svg>
  ),

  // 4. SHORT FOOT — Arch dome, yellow/red/black
  shortFoot: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <rect width={w} height={h} fill={YELLOW} />
      <rect x={0} y={h*0.65} width={w} height={h*0.35} fill={WHITE} />
      <line x1={0} y1={h*0.65} x2={w} y2={h*0.65} stroke={BLACK} strokeWidth="4" />
      <ellipse cx={w*0.5} cy={h*0.65} rx={w*0.36} ry={h*0.32} fill={RED} stroke={BLACK} strokeWidth="3" />
      <circle cx={w*0.2} cy={h*0.78} r="10" fill={BLACK} />
      <circle cx={w*0.8} cy={h*0.78} r="10" fill={BLACK} />
      <circle cx={w*0.5} cy={h*0.4} r="10" fill={BLACK} />
      <rect x={w*0.485} y={h*0.12} width={5} height={h*0.22} fill={BLACK} />
      <polygon points={`${w*0.5-10},${h*0.18} ${w*0.5+10},${h*0.18} ${w*0.5},${h*0.08}`} fill={BLACK} />
    </svg>
  ),

  // 5. HIP FLEXOR MARCH — Ascending columns on blue
  hipFlexorMarch: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <rect width={w} height={h} fill={BLUE} />
      {[
        {x:0.04, top:0.72, c:YELLOW}, {x:0.22, top:0.56, c:YELLOW},
        {x:0.40, top:0.40, c:YELLOW}, {x:0.58, top:0.22, c:RED},
        {x:0.76, top:0.08, c:YELLOW},
      ].map((col,i) => (
        <rect key={i} x={w*col.x} y={h*col.top} width={w*0.17} height={h*(1-col.top)}
          fill={col.c} stroke={BLACK} strokeWidth="3" />
      ))}
      {[0.04,0.22,0.40,0.58,0.76].map((x,i) => (
        <ellipse key={i} cx={w*x+w*0.085} cy={h*[0.72,0.56,0.40,0.22,0.08][i]}
          rx={w*0.085} ry="8" fill={RED} stroke={BLACK} strokeWidth="2" />
      ))}
    </svg>
  ),

  // 6. ADDUCTION RAISES — Bold waves, blue/white/yellow
  adductionRaises: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <rect width={w} height={h*0.4} fill={WHITE} />
      <rect y={h*0.4} width={w} height={h*0.6} fill={BLUE} />
      <line x1={0} y1={h*0.4} x2={w} y2={h*0.4} stroke={BLACK} strokeWidth="3" />
      {/* Zig-zag wave */}
      <path d={`M 0 ${h*0.6} L ${w*0.15} ${h*0.5} L ${w*0.3} ${h*0.65} L ${w*0.45} ${h*0.5} L ${w*0.6} ${h*0.65} L ${w*0.75} ${h*0.5} L ${w*0.9} ${h*0.65} L ${w} ${h*0.55} L ${w} ${h} L 0 ${h} Z`}
        fill={TEAL} />
      <path d={`M 0 ${h*0.6} L ${w*0.15} ${h*0.5} L ${w*0.3} ${h*0.65} L ${w*0.45} ${h*0.5} L ${w*0.6} ${h*0.65} L ${w*0.75} ${h*0.5} L ${w*0.9} ${h*0.65} L ${w} ${h*0.55}`}
        fill="none" stroke={BLACK} strokeWidth="3" />
      <circle cx={w*0.75} cy={h*0.2} r={w*0.12} fill={YELLOW} stroke={BLACK} strokeWidth="3" />
    </svg>
  ),

  // 7. SINGLE LEG BALANCE — Figure on bold line
  singleLegBalance: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <rect width={w} height={h*0.65} fill={WHITE} />
      <rect y={h*0.65} width={w} height={h*0.35} fill={YELLOW} />
      <line x1={0} y1={h*0.65} x2={w} y2={h*0.65} stroke={BLACK} strokeWidth="5" />
      <circle cx={w*0.5} cy={h*0.3} r="18" fill={RED} stroke={BLACK} strokeWidth="3" />
      <line x1={w*0.5} y1={h*0.37} x2={w*0.5} y2={h*0.65} stroke={BLACK} strokeWidth="5" />
      <line x1={w*0.22} y1={h*0.45} x2={w*0.78} y2={h*0.5} stroke={BLACK} strokeWidth="4" />
      <circle cx={w*0.22} cy={h*0.45} r="7" fill={RED} stroke={BLACK} strokeWidth="2" />
      <circle cx={w*0.78} cy={h*0.5} r="7" fill={RED} stroke={BLACK} strokeWidth="2" />
    </svg>
  ),

  // 8. SL RDL — Winding white path on yellow
  slRdl: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <rect width={w} height={h} fill={YELLOW} />
      <path d={`M ${w*0.5} 0 Q ${w*0.88} ${h*0.18} ${w*0.32} ${h*0.35} Q ${w*-0.05} ${h*0.5} ${w*0.62} ${h*0.65} Q ${w*0.98} ${h*0.8} ${w*0.5} ${h}`}
        fill={WHITE} stroke={BLACK} strokeWidth="3" />
      <circle cx={w*0.56} cy={h*0.6} r="9" fill={BLACK} />
      <line x1={w*0.56} y1={h*0.64} x2={w*0.56} y2={h*0.76} stroke={BLACK} strokeWidth="3" />
      <line x1={w*0.46} y1={h*0.68} x2={w*0.66} y2={h*0.7} stroke={BLACK} strokeWidth="2" />
    </svg>
  ),

  // 9. A SKIP — Bouncing arcs on red
  aSkip: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <rect width={w} height={h} fill={RED} />
      <rect x={0} y={h*0.68} width={w} height={h*0.32} fill={BLACK} />
      {[0,1,2,3,4].map(i => (
        <path key={i}
          d={`M ${w*(0.02+i*0.2)} ${h*0.68} Q ${w*(0.12+i*0.2)} ${h*(0.28-i*0.03)} ${w*(0.22+i*0.2)} ${h*0.68}`}
          fill="none" stroke={YELLOW} strokeWidth="5" />
      ))}
      <circle cx={w*0.82} cy={h*0.16} r={w*0.14} fill={YELLOW} stroke={BLACK} strokeWidth="3" />
    </svg>
  ),

  // 10. B SKIP — Waves on teal
  bSkip: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <rect width={w} height={h} fill={TEAL} />
      <rect width={w} height={h*0.12} fill={BLACK} />
      <rect y={h*0.88} width={w} height={h*0.12} fill={BLACK} />
      <path d={`M 0 ${h*0.5} Q ${w*0.15} ${h*0.18} ${w*0.3} ${h*0.5} Q ${w*0.45} ${h*0.82} ${w*0.6} ${h*0.45} Q ${w*0.75} ${h*0.12} ${w} ${h*0.5}`}
        fill="none" stroke={YELLOW} strokeWidth="7" />
      <path d={`M 0 ${h*0.55} Q ${w*0.22} ${h*0.75} ${w*0.44} ${h*0.5} Q ${w*0.62} ${h*0.28} ${w*0.82} ${h*0.55} L ${w} ${h*0.48}`}
        fill="none" stroke={WHITE} strokeWidth="4" />
    </svg>
  ),

  // 11. HIGH KNEES — Flames on orange
  highKnees: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <rect width={w} height={h} fill={ORANGE} />
      <rect x={0} y={h*0.65} width={w} height={h*0.35} fill={BLACK} />
      <line x1={0} y1={h*0.65} x2={w} y2={h*0.65} stroke={BLACK} strokeWidth="3" />
      {[0.1,0.3,0.5,0.7,0.9].map((x,i) => (
        <ellipse key={i} cx={w*x} cy={h*0.52}
          rx={w*0.08} ry={h*(0.2+(i%3)*0.06)}
          fill={i%2===0 ? YELLOW : RED} stroke={BLACK} strokeWidth="3" />
      ))}
      {[0.2,0.4,0.6,0.8].map((x,i) => (
        <circle key={i} cx={w*x} cy={h*0.82} r="8" fill={RED} stroke={BLACK} strokeWidth="2" />
      ))}
    </svg>
  ),

  // 12. EASY RUN — Concentric sunset on white
  easyRun: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <rect width={w} height={h*0.55} fill={WHITE} />
      <rect y={h*0.55} width={w} height={h*0.45} fill={BLUE} />
      <line x1={0} y1={h*0.55} x2={w} y2={h*0.55} stroke={BLACK} strokeWidth="3" />
      <circle cx={w*0.5} cy={h*0.42} r={w*0.4} fill={ORANGE} stroke={BLACK} strokeWidth="3" />
      <circle cx={w*0.5} cy={h*0.42} r={w*0.28} fill={RED} stroke={BLACK} strokeWidth="3" />
      <circle cx={w*0.5} cy={h*0.42} r={w*0.16} fill={YELLOW} stroke={BLACK} strokeWidth="3" />
    </svg>
  ),

  // 13. COOLDOWN WALK — Beach parasol, blue/yellow/white
  cooldownWalk: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <rect width={w} height={h*0.6} fill={BLUE} />
      <rect y={h*0.6} width={w} height={h*0.4} fill={YELLOW} />
      <line x1={0} y1={h*0.6} x2={w} y2={h*0.6} stroke={BLACK} strokeWidth="3" />
      <line x1={w*0.6} y1={h*0.1} x2={w*0.6} y2={h*0.75} stroke={BLACK} strokeWidth="5" />
      <path d={`M ${w*0.28} ${h*0.16} A ${w*0.32} ${w*0.32} 0 0 1 ${w*0.92} ${h*0.16}`}
        fill={WHITE} stroke={BLACK} strokeWidth="3" />
      <path d={`M ${w*0.35} ${h*0.16} A ${w*0.25} ${w*0.25} 0 0 1 ${w*0.85} ${h*0.16}`}
        fill={RED} />
      <circle cx={w*0.15} cy={h*0.08} r="14" fill={YELLOW} stroke={BLACK} strokeWidth="3" />
    </svg>
  ),

  // 14. FOAM ROLL QUADS — Rollers on green
  foamRollQuads: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <rect width={w} height={h} fill={GREEN} />
      {[0.22,0.44,0.66].map((y,i) => (
        <g key={i}>
          <rect x={w*0.08} y={h*y-14} width={w*0.84} height={28} rx="14"
            fill={WHITE} stroke={BLACK} strokeWidth="3" />
        </g>
      ))}
      <rect x={w*0.3} y={h*0.84} width={w*0.3} height={5} fill={BLACK} />
      <polygon points={`${w*0.58},${h*0.82} ${w*0.63},${h*0.865} ${w*0.58},${h*0.91}`} fill={BLACK} />
    </svg>
  ),

  // 15. FOAM ROLL CALVES — Vertical paired shapes on blue
  foamRollCalves: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <rect width={w} height={h} fill={BLUE} />
      <rect x={w*0.15} y={h*0.1} width={w*0.25} height={h*0.8} rx="25"
        fill={WHITE} stroke={BLACK} strokeWidth="3" />
      <rect x={w*0.58} y={h*0.1} width={w*0.25} height={h*0.8} rx="25"
        fill={WHITE} stroke={BLACK} strokeWidth="3" />
      {[0.28,0.44,0.58,0.72].map((y,i) => (
        <line key={i} x1={w*0.04} y1={h*y} x2={w*0.96} y2={h*y}
          stroke={YELLOW} strokeWidth="4" />
      ))}
    </svg>
  ),

  // 16. HIP FLEXOR STRETCH — Triangle on yellow
  hipFlexorStretch: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <rect width={w} height={h} fill={YELLOW} />
      <polygon points={`${w*0.5},${h*0.05} ${w*0.02},${h*0.95} ${w*0.98},${h*0.95}`}
        fill={WHITE} stroke={BLACK} strokeWidth="4" />
      <polygon points={`${w*0.5},${h*0.25} ${w*0.18},${h*0.88} ${w*0.82},${h*0.88}`}
        fill={YELLOW} stroke={BLACK} strokeWidth="2" />
      <circle cx={w*0.5} cy={h*0.08} r="9" fill={RED} stroke={BLACK} strokeWidth="3" />
    </svg>
  ),

  // 17. CALF STRETCH — Stairs on blue
  calfStretch: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <rect width={w} height={h} fill={BLUE} />
      {[0,1,2,3,4].map(i => (
        <rect key={i} x={w*(i*0.2)} y={h*(0.82-i*0.16)}
          width={w*0.22} height={h*(0.18+i*0.16)}
          fill={i===4 ? YELLOW : WHITE} stroke={BLACK} strokeWidth="3" />
      ))}
      <circle cx={w*0.88} cy={h*0.08} r={w*0.1} fill={YELLOW} stroke={BLACK} strokeWidth="3" />
    </svg>
  ),
};

const ART_KEYS = [
  "wallDorsiflexion","ankleCircles","eversionHold","shortFoot",
  "hipFlexorMarch","adductionRaises","singleLegBalance","slRdl",
  "aSkip","bSkip","highKnees",
  "easyRun",
  "cooldownWalk","foamRollQuads","foamRollCalves","hipFlexorStretch","calfStretch",
];

const HEIGHTS = [220,270,200,250,230,280,210,260,240,290,195,310,225,245,205,265,235];
const getH = i => HEIGHTS[i%HEIGHTS.length];

const SECTIONS = [
  { title:"Activation", exercises:[
    {name:"Wall Dorsiflexion",detail:"10 per side",sets:1,tip:"Drive knee over toes toward wall, heel stays down"},
    {name:"Ankle Circles",detail:"10 each direction",sets:1},
    {name:"Eversion Hold",detail:"15 sec hold",sets:2,tip:"Press outside of foot against wall — targets peroneals"},
    {name:"Short Foot",detail:"10 sec each side",sets:2,tip:"Big toe, little toe, heel down. Lift arch WITHOUT curling toes"},
    {name:"Hip Flexor March",detail:"10 sec hold",sets:2,tip:"Knee to hip height, pelvis level"},
    {name:"Adduction Raises",detail:"8 each side",sets:1,tip:"Top leg crossed over, lift bottom leg"},
    {name:"SL Balance",detail:"20 sec each",sets:2},
    {name:"SL RDL Reach",detail:"5 each, slow",sets:1},
  ]},
  { title:"Drills", exercises:[
    {name:"A Skip",detail:"2 × 20m",sets:2,tip:"Easy rhythm. Knee up, quick hop. Relaxed"},
    {name:"B Skip",detail:"2 × 20m",sets:2,tip:"Smooth knee drive. DON'T reach. Pulls back under"},
    {name:"High Knees",detail:"2 × 10 sec",sets:2,tip:"Quick contacts, NOT max height. \"Hot coals\""},
  ]},
  { title:"Run", exercises:[
    {name:"Easy Run",detail:"Zone 2 · 30–40 min",sets:1,tip:"Conversation pace. If you can't talk, slow down"},
  ]},
  { title:"Recovery", exercises:[
    {name:"Cooldown Walk",detail:"3–5 min",sets:1},
    {name:"Foam Roll Quads",detail:"45s each",sets:1},
    {name:"Foam Roll Calves",detail:"45s each",sets:1},
    {name:"Hip Flexor Stretch",detail:"30–45s hold",sets:1},
    {name:"Calf Stretch",detail:"30–45s hold",sets:1},
  ]},
];

const ALL = [];
let gi = 0;
SECTIONS.forEach((sec,si) => {
  sec.exercises.forEach((ex,ei) => {
    ALL.push({...ex, si, ei, gi:gi++, sec:sec.title});
  });
});

const STORE = "optimism-pop-v1";

export default function App() {
  const [checked,setChecked] = useState({});
  const [expanded,setExpanded] = useState(null);
  const [tipOpen,setTipOpen] = useState(false);

  useEffect(() => {
    try { const s=localStorage.getItem(STORE); if(s) setChecked(JSON.parse(s)); } catch{}
  },[]);
  useEffect(() => {
    try { localStorage.setItem(STORE,JSON.stringify(checked)); } catch{}
  },[checked]);

  const toggle = (si,ei,s) => {
    const k=`${si}-${ei}-${s}`;
    setChecked(p=>({...p,[k]:!p[k]}));
  };
  const isDone = (si,ei,s) => !!checked[`${si}-${ei}-${s}`];
  const allDone = item => Array.from({length:item.sets},(_,s)=>isDone(item.si,item.ei,s)).every(Boolean);

  const totalSets = ALL.reduce((a,e)=>a+e.sets,0);
  const doneSets = Object.values(checked).filter(Boolean).length;
  const pct = totalSets ? Math.round((doneSets/totalSets)*100) : 0;
  const raceDays = Math.ceil((new Date("2026-05-03")-new Date())/(1000*60*60*24));

  const left=[],right=[];
  let lh=0,rh=0;
  ALL.forEach(item => {
    const h=getH(item.gi);
    if(lh<=rh){left.push(item);lh+=h+10;}
    else{right.push(item);rh+=h+10;}
  });

  const exp = expanded!==null ? ALL[expanded] : null;

  const renderCard = item => {
    const h=getH(item.gi);
    const done=allDone(item);
    const artFn=Art[ART_KEYS[item.gi]]||Art.easyRun;
    return (
      <div key={item.gi}
        onClick={()=>{setExpanded(item.gi);setTipOpen(false);}}
        style={{
          borderRadius:"14px",overflow:"hidden",marginBottom:"10px",
          height:`${h}px`,cursor:"pointer",position:"relative",
          border:`3px solid ${BLACK}`,
          filter: done ? "saturate(0.3)" : "none",
          transition:"filter 0.3s",
        }}>
        <div style={{position:"absolute",inset:0}}>{artFn(200,h)}</div>
        {/* Solid black bar at bottom for text — no gradient */}
        <div style={{
          position:"absolute",bottom:0,left:0,right:0,
          background:BLACK,padding:"10px 14px 12px",
        }}>
          <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:YELLOW}}>
            {item.sec}
          </div>
          <h3 style={{margin:"1px 0 0",fontSize:"18px",fontWeight:800,color:WHITE,lineHeight:1.2,letterSpacing:"-0.01em"}}>
            {item.name}
          </h3>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"4px"}}>
            <span style={{fontSize:"12px",color:WHITE,fontWeight:600}}>{item.detail}</span>
            <div style={{display:"flex",gap:"4px",alignItems:"center"}}>
              {Array.from({length:item.sets},(_,s)=>(
                <div key={s} style={{
                  width:"10px",height:"10px",borderRadius:"2px",
                  background:isDone(item.si,item.ei,s)?YELLOW:WHITE,
                  border:`2px solid ${isDone(item.si,item.ei,s)?YELLOW:WHITE}`,
                }}/>
              ))}
              {done && <span style={{fontSize:"10px",color:YELLOW,fontWeight:800,marginLeft:"2px"}}>✓</span>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight:"100vh",background:YELLOW,
      fontFamily:"'Outfit','Avenir Next',sans-serif",
    }}>
      {/* EXPANDED */}
      {exp && (()=>{
        const artFn=Art[ART_KEYS[exp.gi]]||Art.easyRun;
        const done=allDone(exp);
        return (
          <div style={{
            position:"fixed",inset:0,zIndex:100,
            background:WHITE,display:"flex",flexDirection:"column",overflow:"hidden",
          }}>
            <div style={{position:"relative",height:"42vh",flexShrink:0,borderBottom:`4px solid ${BLACK}`}}>
              <div style={{position:"absolute",inset:0}}>{artFn(400,400)}</div>
              <button onClick={()=>{setExpanded(null);setTipOpen(false);}}
                style={{
                  position:"absolute",top:16,left:16,zIndex:10,
                  width:48,height:48,borderRadius:"50%",
                  background:WHITE,border:`3px solid ${BLACK}`,
                  cursor:"pointer",fontSize:22,fontWeight:800,color:BLACK,
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}>←</button>
              <div style={{
                position:"absolute",top:20,right:16,zIndex:10,
                background:BLACK,borderRadius:"8px",padding:"6px 14px",
              }}>
                <span style={{fontSize:"11px",fontWeight:700,color:YELLOW,letterSpacing:"0.1em",textTransform:"uppercase"}}>
                  {exp.sec}
                </span>
              </div>
            </div>
            <div style={{
              flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",
              padding:"28px 24px 80px",background:WHITE,
            }}>
              <h1 style={{margin:0,fontSize:"34px",fontWeight:800,color:BLACK,letterSpacing:"-0.03em",lineHeight:1.15}}>
                {exp.name}
              </h1>
              <p style={{margin:"6px 0 0",fontSize:"20px",color:BLACK,fontWeight:600}}>
                {exp.detail}
              </p>
              <div style={{display:"flex",gap:"14px",marginTop:"32px",flexWrap:"wrap"}}>
                {Array.from({length:exp.sets},(_,s)=>{
                  const d=isDone(exp.si,exp.ei,s);
                  return (
                    <button key={s}
                      onClick={e=>{e.stopPropagation();toggle(exp.si,exp.ei,s);}}
                      style={{
                        width:72,height:72,borderRadius:14,
                        border:`3px solid ${BLACK}`,
                        cursor:"pointer",fontSize:26,fontWeight:800,
                        background:d?RED:YELLOW,
                        color:d?WHITE:BLACK,
                        transition:"all 0.12s",
                        transform:d?"scale(0.95)":"scale(1)",
                        display:"flex",alignItems:"center",justifyContent:"center",
                      }}>
                      {d?"✓":s+1}
                    </button>
                  );
                })}
              </div>
              {done && <div style={{marginTop:"16px",fontSize:"16px",fontWeight:800,color:GREEN}}>✓ COMPLETE</div>}
              {exp.tip && (
                <div style={{marginTop:"32px"}}>
                  <button onClick={e=>{e.stopPropagation();setTipOpen(!tipOpen);}}
                    style={{background:"none",border:"none",padding:0,cursor:"pointer",fontSize:16,fontWeight:700,color:BLUE}}>
                    {tipOpen?"▾":"▸"} Coaching cue
                  </button>
                  {tipOpen && <p style={{margin:"10px 0 0",fontSize:18,color:BLACK,fontStyle:"italic",lineHeight:1.6}}>{exp.tip}</p>}
                </div>
              )}
              <div style={{marginTop:48,display:"flex",justifyContent:"space-between"}}>
                {exp.gi>0 ? (
                  <button onClick={e=>{e.stopPropagation();setExpanded(exp.gi-1);setTipOpen(false);}}
                    style={{background:WHITE,border:`3px solid ${BLACK}`,borderRadius:12,padding:"14px 24px",cursor:"pointer",fontSize:15,fontWeight:700,color:BLACK}}>
                    ← Prev
                  </button>
                ) : <div/>}
                {exp.gi<ALL.length-1 ? (
                  <button onClick={e=>{e.stopPropagation();setExpanded(exp.gi+1);setTipOpen(false);}}
                    style={{background:YELLOW,border:`3px solid ${BLACK}`,borderRadius:12,padding:"14px 24px",cursor:"pointer",fontSize:15,fontWeight:800,color:BLACK}}>
                    Next →
                  </button>
                ) : (
                  <button onClick={e=>{e.stopPropagation();setExpanded(null);}}
                    style={{background:GREEN,border:`3px solid ${BLACK}`,borderRadius:12,padding:"14px 24px",cursor:"pointer",fontSize:15,fontWeight:800,color:WHITE}}>
                    Done →
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* HEADER */}
      <div style={{background:YELLOW,padding:"20px 16px 14px",borderBottom:`4px solid ${BLACK}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <h1 style={{margin:0,fontSize:"28px",fontWeight:800,color:BLACK}}>Thursday</h1>
            <p style={{margin:"2px 0 0",fontSize:14,color:BLACK,fontWeight:600}}>Run Skill Day</p>
          </div>
          <div style={{background:BLACK,borderRadius:"12px",padding:"8px 14px",textAlign:"center"}}>
            <div style={{fontSize:24,fontWeight:800,color:YELLOW,lineHeight:1}}>{raceDays}</div>
            <div style={{fontSize:8,fontWeight:700,color:WHITE,letterSpacing:"0.12em"}}>DAYS TO RACE</div>
          </div>
        </div>
        <div style={{display:"flex",gap:"8px",marginTop:"12px",overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none",paddingBottom:"2px"}}>
          {SECTIONS.map((sec,i)=>{
            let total=0,dn=0;
            sec.exercises.forEach((ex,ei)=>{total+=ex.sets;for(let s=0;s<ex.sets;s++)if(checked[`${i}-${ei}-${s}`])dn++;});
            const complete=dn===total&&total>0;
            return (
              <div key={i} style={{
                flexShrink:0,padding:"6px 12px",borderRadius:"8px",
                background:complete?GREEN:WHITE,border:`3px solid ${BLACK}`,
                display:"flex",alignItems:"center",gap:"5px",
              }}>
                {complete && <span style={{fontSize:"12px",color:WHITE,fontWeight:800}}>✓</span>}
                <span style={{fontSize:"12px",fontWeight:700,color:complete?WHITE:BLACK,whiteSpace:"nowrap"}}>{sec.title}</span>
                <span style={{fontSize:"11px",fontWeight:700,color:complete?WHITE:BLACK}}>{dn}/{total}</span>
              </div>
            );
          })}
        </div>
        <div style={{marginTop:10}}>
          <div style={{height:8,background:WHITE,borderRadius:4,border:`3px solid ${BLACK}`}}>
            <div style={{width:`${pct}%`,height:"100%",borderRadius:1,background:pct===100?GREEN:RED,transition:"width 0.4s"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
            <span style={{fontSize:12,color:BLACK,fontWeight:700}}>{doneSets}/{totalSets} sets</span>
            <span style={{fontSize:14,fontWeight:800,color:BLACK}}>{pct}%</span>
          </div>
        </div>
      </div>

      {/* MASONRY */}
      <div style={{display:"flex",gap:"10px",padding:"10px 10px 100px"}}>
        <div style={{flex:1}}>{left.map(renderCard)}</div>
        <div style={{flex:1}}>{right.map(renderCard)}</div>
      </div>

      {pct===100 && !expanded && (
        <div style={{
          position:"fixed",bottom:20,left:12,right:12,
          background:GREEN,borderRadius:14,padding:"18px 24px",
          textAlign:"center",border:`4px solid ${BLACK}`,zIndex:50,
        }}>
          <div style={{fontSize:16,fontWeight:800,color:WHITE}}>☀️ WORKOUT COMPLETE</div>
          <div style={{fontSize:13,color:WHITE,fontWeight:600,marginTop:3}}>{raceDays} days to go.</div>
        </div>
      )}
    </div>
  );
}

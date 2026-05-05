import React, { useState, useRef, useEffect } from 'react';

// ==== Node data ====
const ICONS = {
  forms: 'M9 4h6a2 2 0 0 1 2 2v14l-3-2-2 2-2-2-3 2V6a2 2 0 0 1 2-2zM10 9h4M10 13h4M10 17h2',
  phone: 'M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2',
  sms: 'M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12zM8 12h.01M12 12h.01M16 12h.01',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  dq: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM5 5l14 14',
  unsold: 'M3 3v18h18M7 14l4-4 4 4 5-7',
  returned: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
  nocontact: 'M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2M16 4l5 5M21 4l-5 5',
  aged: 'M12 6v6l4 2M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z',
  qualified: 'M5 13l4 4L19 7',
  pvql: 'M12 2 4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6l-8-4zM9 12l2 2 4-4',
  retainer: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6M9 13l2 2 4-4',
  transfer: 'M17 2l4 4-4 4M3 6h18M7 22l-4-4 4-4M21 18H3',
  sold: 'M12 2v20M5 7l7-5 7 5M5 17l7 5 7-5M3 12h18',
};

const SOURCES = [
  { id: 'forms', label: 'Inbound Forms', sub: 'Web · Funnels', icon: ICONS.forms, desc: 'Web forms and ad funnels routed straight into AI intake.', stat: { num: '< 30s', label: 'first contact' } },
  { id: 'calls', label: 'Inbound Calls', sub: 'Voice', icon: ICONS.phone, desc: 'AI voice agent qualifies callers 24/7 — no missed calls.', stat: { num: '100%', label: 'pickup rate' } },
  { id: 'sms', label: 'Inbound SMS', sub: 'Text', icon: ICONS.sms, desc: 'Two-way SMS triage handles overflow conversationally.', stat: { num: '< 12s', label: 'reply time' } },
  { id: 'imports', label: 'Imported Lists', sub: 'CSV · BigQuery', icon: ICONS.list, desc: 'Bulk lists ingested and worked just like fresh leads.', stat: { num: '∞', label: 'volume' } },
];

const LIFECYCLE = [
  { id: 'dq', label: 'DQ Leads', sub: 'Disqualified', icon: ICONS.dq, kind: 'reactivation', desc: 'Previously disqualified leads get re-evaluated and re-engaged.', stat: { num: '31%', label: 'recovery' } },
  { id: 'unsold', label: 'Unsold Leads', sub: 'Never bought', icon: ICONS.unsold, kind: 'reactivation', desc: 'Qualified leads that never converted, re-worked into retainers.', stat: { num: '24%', label: 'reactivation' } },
  { id: 'returned', label: 'Returned Leads', sub: 'Buyer rejected', icon: ICONS.returned, kind: 'reactivation', desc: 'Salvaged from buyer returns and routed to a new home.', stat: { num: '18%', label: 'salvage' } },
  { id: 'nocontact', label: 'No-Contact', sub: 'Unreached', icon: ICONS.nocontact, kind: 'reactivation', desc: 'Leads buyers couldn\'t reach — AI keeps trying across channels.', stat: { num: '42%', label: 'reach rate' } },
  { id: 'aged', label: 'Aged Leads', sub: 'Stale', icon: ICONS.aged, kind: 'reactivation', desc: 'Dormant leads warmed back up with conversational nudges.', stat: { num: '11%', label: 'wake-up' } },
];

const OUTCOMES = [
  { id: 'qualified', label: 'Qualified Leads', sub: 'Vetted', icon: ICONS.qualified, desc: 'Leads that meet your criteria, fully scored and tagged.', stat: { num: '73%', label: 'qual rate' } },
  { id: 'pvql', label: 'PVQL', sub: 'Phone-verified', icon: ICONS.pvql, desc: 'Phone Verified Qualified Leads — buyer-ready inventory.', stat: { num: '$0.94', label: 'avg cost' } },
  { id: 'retainer', label: 'Signed Retainers', sub: 'Closed', icon: ICONS.retainer, desc: 'Retainers signed in-flow with e-sign hand-off.', stat: { num: '14%', label: 'sign rate' } },
  { id: 'transfer', label: 'Warm Transfers', sub: 'Live to attorney', icon: ICONS.transfer, desc: 'Live caller bridged to your attorney with full context.', stat: { num: '< 60s', label: 'handoff' } },
  { id: 'sold', label: 'Sold to Buyer', sub: 'Delivered', icon: ICONS.sold, desc: 'Delivered, paid, and matched to the right buyer profile.', stat: { num: '92%', label: 'match rate' } },
];

// SVG canvas
const W = 1240;
const H = 700;
const X_SRC = 110;
const X_CORE = W / 2;
const X_OUT = W - 110;
const NODE_W = 200;
const NODE_H = 64;

function colY(count, i, top = 60, bottom = H - 60) {
  if (count === 1) return (top + bottom) / 2;
  const span = bottom - top;
  return top + (span * i) / (count - 1);
}

function lifecyclePos(count, i) {
  const cx = X_CORE;
  const cy = H / 2;
  const radius = 230;
  const startAngle = Math.PI * 1.10;
  const endAngle = Math.PI * 1.90;
  const t = count === 1 ? 0.5 : i / (count - 1);
  const angle = startAngle + (endAngle - startAngle) * t;
  return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
}

function curve(p1, p2, bend = 0.35, dir = 1) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const cx1 = p1.x + dx * 0.45;
  const cy1 = p1.y + dy * bend * dir;
  const cx2 = p2.x - dx * 0.45;
  const cy2 = p2.y - dy * bend * dir;
  return `M ${p1.x} ${p1.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.x} ${p2.y}`;
}

function reactivationCurve(p1, p2) {
  const midX = (p1.x + p2.x) / 2;
  const peakY = 50;
  return `M ${p1.x} ${p1.y} C ${p1.x - 80} ${peakY}, ${midX} ${peakY - 20}, ${p2.x} ${p2.y}`;
}

function NodeCard({ node, x, y, layer, onHover, onLeave }) {
  const cardX = x - NODE_W / 2;
  const cardY = y - NODE_H / 2;
  const iconKind = layer === 'reactivation' ? 'reactivation' : (layer === 'outcome' ? 'outcome' : 'forward');
  return (
    <g
      className={`node-group ${layer}`}
      onMouseEnter={(e) => onHover(node, e, layer)}
      onMouseLeave={onLeave}
      data-node-id={node.id}
    >
      <rect className="node-halo" x={cardX - 6} y={cardY - 6} width={NODE_W + 12} height={NODE_H + 12} rx={16} fill={layer === 'reactivation' ? 'rgba(245,158,11,0.12)' : 'rgba(34,211,238,0.12)'} />
      <rect className={`node-card ${layer}`} x={cardX} y={cardY} width={NODE_W} height={NODE_H} rx={14} />
      <rect x={cardX + 12} y={cardY + 12} width={40} height={40} rx={10} fill={layer === 'reactivation' ? 'rgba(245,158,11,0.10)' : 'rgba(34,211,238,0.10)'} />
      <g transform={`translate(${cardX + 20}, ${cardY + 20})`}>
        <path className={`node-icon ${iconKind}`} d={node.icon} />
      </g>
      <text className="node-label" x={cardX + 64} y={cardY + 28}>{node.label}</text>
      <text className="node-sub" x={cardX + 64} y={cardY + 46}>{node.sub}</text>
    </g>
  );
}

function CoreNode() {
  const cx = X_CORE;
  const cy = H / 2;
  return (
    <g>
      <defs>
        <radialGradient id="coreGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#7BE9F8" />
          <stop offset="40%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#0E7A9A" />
        </radialGradient>
        <radialGradient id="coreOuterGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(34,211,238,0.5)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0)" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={150} fill="url(#coreOuterGlow)" />
      <circle className="core-glow" cx={cx} cy={cy} r={70} />
      <circle className="core-ring outer" cx={cx} cy={cy} r={108} strokeDasharray="3 9" />
      <circle className="core-ring" cx={cx} cy={cy} r={88} strokeDasharray="2 6" />
      <circle className="core-disc" cx={cx} cy={cy} r={62} />
      <circle cx={cx} cy={cy} r={62} fill="none" stroke="rgba(255,255,255,0.25)" />
      <text className="core-label" x={cx} y={cy + 4} textAnchor="middle" fontSize="22">AI</text>
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize="9" fill="rgba(6,33,42,0.75)" fontFamily="JetBrains Mono" letterSpacing="0.18em">CORE</text>
    </g>
  );
}

function Particle({ pathId, dur, delay = 0, color = 'cyan', reverse = false }) {
  return (
    <circle r="3" className={color === 'amber' ? 'particle amber' : 'particle'}>
      <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`${delay}s`} keyPoints={reverse ? '1;0' : '0;1'} keyTimes="0;1" calcMode="linear">
        <mpath href={`#${pathId}`} />
      </animateMotion>
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur={`${dur}s`} repeatCount="indefinite" begin={`${delay}s`} />
    </circle>
  );
}

function MobileDiagram() {
  const Pill = ({ n }) => (
    <div className="mob-pill">
      <span className="ico"><svg viewBox="0 0 24 24"><path d={n.icon} /></svg></span>
      <span style={{ flex: 1 }}>{n.label}</span>
      <span className="mono" style={{ fontSize: 11, color: '#64748B' }}>{n.sub}</span>
    </div>
  );
  return (
    <div className="mobile-diagram">
      <div className="mob-core"><span>AI</span></div>
      <div className="mob-section">
        <h4>Sources in</h4>
        {SOURCES.map(n => <Pill key={n.id} n={n} />)}
      </div>
      <div className="mob-section reactivation">
        <h4>Lifecycle · reactivation</h4>
        {LIFECYCLE.map(n => <Pill key={n.id} n={n} />)}
      </div>
      <div className="mob-section">
        <h4>Outcomes out</h4>
        {OUTCOMES.map(n => <Pill key={n.id} n={n} />)}
      </div>
    </div>
  );
}

export default function AIMindmap() {
  const stageRef = useRef(null);
  const [tip, setTip] = useState(null);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) return <MobileDiagram />;

  const srcPos = SOURCES.map((n, i) => ({ ...n, x: X_SRC, y: colY(SOURCES.length, i, 90, H - 90) }));
  const outPos = OUTCOMES.map((n, i) => ({ ...n, x: X_OUT, y: colY(OUTCOMES.length, i, 70, H - 70) }));
  const lifePos = LIFECYCLE.map((n, i) => { const p = lifecyclePos(LIFECYCLE.length, i); return { ...n, x: p.x, y: p.y }; });
  const corePoint = { x: X_CORE, y: H / 2 };

  const fwdSrc = srcPos.map(n => ({ id: `fs-${n.id}`, p1: { x: n.x + NODE_W / 2, y: n.y }, p2: { x: corePoint.x - 64, y: corePoint.y } }));
  const fwdOut = outPos.map(n => ({ id: `fo-${n.id}`, p1: { x: corePoint.x + 64, y: corePoint.y }, p2: { x: n.x - NODE_W / 2, y: n.y } }));
  const lifeConn = lifePos.map(n => ({ id: `fl-${n.id}`, p1: { x: n.x, y: n.y - NODE_H / 2 }, p2: { x: corePoint.x, y: corePoint.y + 50 } }));
  const reactArcs = [
    { id: 'r1', from: 'sold', to: 'dq' },
    { id: 'r2', from: 'transfer', to: 'unsold' },
    { id: 'r3', from: 'qualified', to: 'nocontact' },
  ].map(r => {
    const o = outPos.find(n => n.id === r.from);
    const l = lifePos.find(n => n.id === r.to);
    return { ...r, p1: { x: o.x - NODE_W / 2, y: o.y }, p2: { x: l.x, y: l.y - NODE_H / 2 } };
  });

  const onHover = (node, e, layer) => {
    const rect = stageRef.current.getBoundingClientRect();
    setTip({ node, layer, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const onLeave = () => setTip(null);

  return (
    <div className="viz-stage" ref={stageRef}>
      <svg className="viz-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          {fwdSrc.map(c => <path key={`def-${c.id}`} id={c.id} d={curve(c.p1, c.p2, 0.2)} />)}
          {fwdOut.map(c => <path key={`def-${c.id}`} id={c.id} d={curve(c.p1, c.p2, 0.2)} />)}
          {lifeConn.map(c => <path key={`def-${c.id}`} id={c.id} d={curve(c.p1, c.p2, 0.5, c.p1.y > corePoint.y ? -1 : 1)} />)}
          {reactArcs.map(c => <path key={`def-${c.id}`} id={c.id} d={reactivationCurve(c.p1, c.p2)} />)}
        </defs>
        <g>
          <text className="layer-tag" x={X_SRC} y={36} textAnchor="middle">SOURCES</text>
          <line className="layer-rule" x1={X_SRC - 70} y1={48} x2={X_SRC + 70} y2={48} />
          <text className="layer-tag" x={X_CORE} y={36} textAnchor="middle">AI ENGINE</text>
          <line className="layer-rule" x1={X_CORE - 80} y1={48} x2={X_CORE + 80} y2={48} />
          <text className="layer-tag" x={X_OUT} y={36} textAnchor="middle">OUTCOMES</text>
          <line className="layer-rule" x1={X_OUT - 70} y1={48} x2={X_OUT + 70} y2={48} />
          <text className="layer-tag" x={X_CORE} y={H - 18} textAnchor="middle" fill="#F59E0B" opacity="0.85">LIFECYCLE · REACTIVATION</text>
        </g>
        <g>
          {[...fwdSrc, ...fwdOut].map(c => <use key={`g-${c.id}`} href={`#${c.id}`} className="conn-glow forward" />)}
          {[...fwdSrc, ...fwdOut].map(c => <use key={`b-${c.id}`} href={`#${c.id}`} className="conn forward" />)}
          {[...fwdSrc, ...fwdOut].map((c, i) => <use key={`p-${c.id}`} href={`#${c.id}`} className="conn forward conn-pulse" style={{ animationDelay: `${(i % 5) * 0.6}s` }} />)}
          {lifeConn.map(c => <use key={`lg-${c.id}`} href={`#${c.id}`} className="conn-glow forward" style={{ opacity: 0.10 }} />)}
          {lifeConn.map(c => <use key={`lb-${c.id}`} href={`#${c.id}`} className="conn forward" style={{ stroke: 'rgba(245,158,11,0.35)' }} />)}
          {reactArcs.map(c => <use key={`rg-${c.id}`} href={`#${c.id}`} className="conn-glow reactivation" />)}
          {reactArcs.map(c => <use key={`rb-${c.id}`} href={`#${c.id}`} className="conn reactivation" />)}
        </g>
        <g>
          {fwdSrc.map((c, i) => <React.Fragment key={`pa-${c.id}`}><Particle pathId={c.id} dur={4 + (i % 3) * 0.6} delay={i * 0.7} /><Particle pathId={c.id} dur={4 + (i % 3) * 0.6} delay={i * 0.7 + 2} /></React.Fragment>)}
          {fwdOut.map((c, i) => <React.Fragment key={`pa-${c.id}`}><Particle pathId={c.id} dur={4 + (i % 3) * 0.5} delay={i * 0.5 + 1} /><Particle pathId={c.id} dur={4 + (i % 3) * 0.5} delay={i * 0.5 + 3} /></React.Fragment>)}
          {lifeConn.map((c, i) => <Particle key={`pa-${c.id}`} pathId={c.id} dur={5 + (i % 2)} delay={i * 0.9} color="amber" />)}
          {reactArcs.map((c, i) => <React.Fragment key={`pa-${c.id}`}><Particle pathId={c.id} dur={6} delay={i * 1.2} color="amber" /><Particle pathId={c.id} dur={6} delay={i * 1.2 + 3} color="amber" /></React.Fragment>)}
        </g>
        <CoreNode />
        <g>
          {srcPos.map(n => <NodeCard key={n.id} node={n} x={n.x} y={n.y} layer="forward" onHover={onHover} onLeave={onLeave} />)}
          {outPos.map(n => <NodeCard key={n.id} node={n} x={n.x} y={n.y} layer="outcome" onHover={onHover} onLeave={onLeave} />)}
          {lifePos.map(n => <NodeCard key={n.id} node={n} x={n.x} y={n.y} layer="reactivation" onHover={onHover} onLeave={onLeave} />)}
        </g>
      </svg>
      {tip && (
        <div className={`tooltip show ${tip.layer === 'reactivation' ? 'amber' : ''}`} style={{ left: tip.x, top: tip.y }}>
          <div className="tooltip-title">{tip.node.label}</div>
          <div className="tooltip-desc">{tip.node.desc}</div>
          {tip.node.stat && (
            <div className="tooltip-stat">
              <span className="num">{tip.node.stat.num}</span>
              <span className="label">{tip.node.stat.label}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
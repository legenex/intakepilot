import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Send, RotateCcw, FileText, Phone, CheckCircle2, DollarSign, TrendingUp } from 'lucide-react';

const NODES = [
  { id: 'raw', label: 'Raw Leads', icon: Send, desc: 'Inbound forms, ad leads' },
  { id: 'dq', label: 'DQ Leads', icon: RotateCcw, desc: 'Disqualified, re-qualifiable' },
  { id: 'unsold', label: 'Unsold', icon: TrendingUp, desc: 'Qualified but not bought' },
  { id: 'returned', label: 'Returned', icon: RotateCcw, desc: 'Buyer rejected, salvageable' },
  { id: 'nocontact', label: 'No-Contact', icon: Phone, desc: 'Couldn\'t reach lead' },
  { id: 'pvql', label: 'PVQL', icon: CheckCircle2, desc: 'Phone Verified Qualified' },
  { id: 'retainer', label: 'Retainer', icon: FileText, desc: 'Signed, ready to bill' },
  { id: 'sold', label: 'Sold', icon: DollarSign, desc: 'Delivered, paid' },
];

const CONNECTIONS = [
  { from: 'raw', bidirectional: true },
  { from: 'dq', bidirectional: true },
  { from: 'unsold', bidirectional: true },
  { from: 'returned', bidirectional: true },
  { from: 'nocontact', bidirectional: true },
  { from: 'pvql', to: 'sold', bidirectional: false },
  { from: 'retainer', to: 'sold', bidirectional: false },
];

export default function AIMindmap() {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return <MobileLayout />;
  }

  return (
    <div className="py-16 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">AI Across the Entire Lead Lifecycle</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Re-engage dead leads. Convert raw forms. Capture retainers. The AI works on every lead state, not just new ones.
          </p>
        </div>

        <div className="relative w-full h-96 flex items-center justify-center">
          <SVGConnections hoveredNode={hoveredNode} />
          <DesktopLayout hoveredNode={hoveredNode} setHoveredNode={setHoveredNode} />
        </div>
      </div>
    </div>
  );
}

function DesktopLayout({ hoveredNode, setHoveredNode }) {
  // Circle layout: 8 nodes around a center AI hub
  const angleSlice = (Math.PI * 2) / 8;
  const radius = 140;

  return (
    <>
      {/* Center AI Hub */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-2xl" />
          <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent border border-primary/40 flex items-center justify-center shadow-lg glow-cyan">
            <div className="flex flex-col items-center gap-1">
              <Zap className="w-6 h-6 text-primary-foreground" />
              <span className="text-[10px] font-bold text-primary-foreground">INTAKE</span>
              <span className="text-[9px] text-primary-foreground/80">AI</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Surrounding Nodes */}
      {NODES.map((node, idx) => {
        const angle = angleSlice * idx;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const isHovered = hoveredNode === node.id || hoveredNode === null;
        const isConnected = hoveredNode && (
          node.id === 'sold' ||
          NODES.some(n => n.id === hoveredNode && CONNECTIONS.some(c => c.from === hoveredNode || (c.to && c.to === hoveredNode)))
        );

        return (
          <motion.div
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.05 * idx }}
            viewport={{ once: true }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <motion.div
              animate={{
                opacity: isHovered ? 1 : 0.4,
                scale: hoveredNode === node.id ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
              className={`w-20 h-20 rounded-xl border backdrop-blur-sm flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                isHovered
                  ? 'bg-accent/20 border-accent/60 shadow-lg'
                  : 'bg-card border-border hover:border-accent/40'
              }`}
            >
              <node.icon className={`w-5 h-5 ${isHovered ? 'text-accent' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] font-semibold text-center leading-tight ${isHovered ? 'text-foreground' : 'text-muted-foreground'}`}>
                {node.label}
              </span>
            </motion.div>

            {/* Tooltip */}
            {hoveredNode === node.id && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-3 bg-foreground text-background rounded-lg px-2.5 py-1.5 text-[10px] whitespace-nowrap z-20"
              >
                {node.desc}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </>
  );
}

function SVGConnections({ hoveredNode }) {
  const angleSlice = (Math.PI * 2) / 8;
  const radius = 140;
  const centerX = 50;
  const centerY = 50;

  const getNodePos = (idx) => {
    const angle = angleSlice * idx;
    return {
      x: centerX + (Math.cos(angle) * radius) / 4,
      y: centerY + (Math.sin(angle) * radius) / 4,
    };
  };

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      style={{ pointerEvents: 'none' }}
    >
      {/* Draw connections from center to each node */}
      {NODES.map((node, idx) => {
        const pos = getNodePos(idx);
        const isFocused = hoveredNode === null || hoveredNode === node.id;
        return (
          <motion.line
            key={`center-${node.id}`}
            x1={centerX}
            y1={centerY}
            x2={pos.x}
            y2={pos.y}
            stroke={hoveredNode === node.id ? '#06b6d4' : '#3b82f6'}
            strokeWidth={hoveredNode === node.id ? '0.4' : '0.2'}
            opacity={isFocused ? 0.6 : 0.2}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.1 * idx }}
            viewport={{ once: true }}
          />
        );
      })}

      {/* PVQL -> Sold, Retainer -> Sold connections */}
      {(() => {
        const pvqlIdx = NODES.findIndex(n => n.id === 'pvql');
        const retainerIdx = NODES.findIndex(n => n.id === 'retainer');
        const soldIdx = NODES.findIndex(n => n.id === 'sold');

        const pvqlPos = getNodePos(pvqlIdx);
        const retainerPos = getNodePos(retainerIdx);
        const soldPos = getNodePos(soldIdx);

        return (
          <>
            <motion.line
              x1={pvqlPos.x}
              y1={pvqlPos.y}
              x2={soldPos.x}
              y2={soldPos.y}
              stroke="#22d3ee"
              strokeWidth="0.3"
              opacity={hoveredNode === null || hoveredNode === 'pvql' || hoveredNode === 'sold' ? 0.5 : 0.15}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
            />
            <motion.line
              x1={retainerPos.x}
              y1={retainerPos.y}
              x2={soldPos.x}
              y2={soldPos.y}
              stroke="#22d3ee"
              strokeWidth="0.3"
              opacity={hoveredNode === null || hoveredNode === 'retainer' || hoveredNode === 'sold' ? 0.5 : 0.15}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              viewport={{ once: true }}
            />
          </>
        );
      })()}
    </svg>
  );
}

function MobileLayout() {
  return (
    <div className="py-12 px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">AI Across the Entire Lead Lifecycle</h2>
        <p className="text-sm text-muted-foreground">
          Re-engage dead leads. Convert raw forms. Capture retainers.
        </p>
      </div>

      <div className="space-y-3">
        {NODES.map((node) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border/50"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <node.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{node.label}</p>
              <p className="text-xs text-muted-foreground">{node.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
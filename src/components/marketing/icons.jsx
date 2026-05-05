import React from 'react';

const icon = (path, extra = {}) => {
  const { viewBox = '0 0 24 24', fill = 'none', strokeWidth = 1.75 } = extra;
  return React.forwardRef(({ size = 20, color = 'currentColor', className = '', style = {}, ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox={viewBox}
      fill={fill}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      {...props}
    >
      {path}
    </svg>
  ));
};

export const Arrow = icon(<path d="M5 12h14M13 6l6 6-6 6" />);
export const Bolt = icon(<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />);
export const Workflow = icon(<><rect x="3" y="3" width="5" height="5" rx="1" /><rect x="16" y="3" width="5" height="5" rx="1" /><rect x="9" y="16" width="6" height="5" rx="1" /><path d="M5.5 8v3a1 1 0 001 1h11a1 1 0 001-1V8M12 12v4" /></>);
export const Phone = icon(<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.1 2.18 2 2 0 012.08 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />);
export const Sms = icon(<><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></>);
export const List = icon(<><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>);
export const Doc = icon(<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>);
export const Retainer = icon(<><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>);
export const Transfer = icon(<><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" /></>);
export const Shield = icon(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>);
export const Sparkles = icon(<><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" /><path d="M5 18l.75 2.25L8 21l-2.25.75L5 24l-.75-2.25L2 21l2.25-.75L5 18z" /><path d="M19 4l.5 1.5L21 6l-1.5.5L19 8l-.5-1.5L17 6l1.5-.5L19 4z" /></>);
export const Check = icon(<polyline points="20 6 9 17 4 12" />);
export const ChevronDown = icon(<polyline points="6 9 12 15 18 9" />);
export const Menu = icon(<><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>);
export const Close = icon(<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>);
export const LinkedIn = icon(<><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></>);
export const XTwitter = icon(<path d="M4 4l16 16M4 20L20 4" />);
export const Code = icon(<><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>);
export const Layers = icon(<><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>);
export const Database = icon(<><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></>);
export const Dollar = icon(<><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></>);
export const Users = icon(<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></>);
export const Target = icon(<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>);
export const Gauge = icon(<><path d="M12 2a10 10 0 110 20A10 10 0 0112 2z" /><path d="M12 12l4.5-4.5" /><circle cx="12" cy="12" r="1.5" /></>);
export const Lightning = icon(<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />);
export const Brain = icon(<><path d="M9.5 2a2.5 2.5 0 015 0v.25A4 4 0 0118 6v1a4 4 0 01-4 4H10a4 4 0 01-4-4V6a4 4 0 013.5-3.95V2z" /><path d="M12 11v4" /><path d="M8 15h8" /><path d="M7 19h10" /></>);
export const Lock = icon(<><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>);
export const Eye = icon(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>);
export const HeartRate = icon(<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />);

// Generic dispatcher
const ICONS = {
  arrow: Arrow, bolt: Bolt, workflow: Workflow, phone: Phone, sms: Sms, list: List,
  doc: Doc, retainer: Retainer, transfer: Transfer, shield: Shield, sparkles: Sparkles,
  check: Check, 'chevron-down': ChevronDown, menu: Menu, close: Close,
  linkedin: LinkedIn, 'x-twitter': XTwitter, code: Code, layers: Layers,
  database: Database, dollar: Dollar, users: Users, target: Target, gauge: Gauge,
  lightning: Lightning, brain: Brain, lock: Lock, eye: Eye, 'heart-rate': HeartRate,
};

export function Icon({ name, ...props }) {
  const Component = ICONS[name];
  if (!Component) return null;
  return <Component {...props} />;
}
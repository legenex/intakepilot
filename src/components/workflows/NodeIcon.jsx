import {
  Sparkles, RefreshCw, PenLine, Timer, MessageSquare, PhoneIncoming,
  Webhook, CalendarClock, Star, GitBranch, Tag, Clock, Users, ShieldCheck,
  Network, PenSquare, ArrowRightLeft, StickyNote, Calculator, Mic,
  MessageCircle, Mail, FileUp, Search, Send, Hourglass, Database, Globe,
  Table, Pause, Repeat, Variable, OctagonX, Zap, Activity, AlertCircle,
} from 'lucide-react';

const ICON_MAP = {
  Sparkles, RefreshCw, PenLine, Timer, MessageSquare, PhoneIncoming,
  Webhook, CalendarClock, Star, GitBranch, Tag, Clock, Users, ShieldCheck,
  Network, PenSquare, ArrowRightLeft, StickyNote, Calculator, Mic,
  MessageCircle, Mail, FileUp, Search, Send, Hourglass, Database, Globe,
  Table, Pause, Repeat, Variable, OctagonX, Zap, Activity, AlertCircle,
  TagPlus: Tag,
  TagMinus: Tag,
};

export function getNodeIcon(name) {
  return ICON_MAP[name] || Zap;
}
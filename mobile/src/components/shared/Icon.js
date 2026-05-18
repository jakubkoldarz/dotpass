import React from 'react';
import {
  Nfc,
  Server,
  Settings,
  LogOut,
  ShieldCheck,
  Clock,
  ChevronRight,
  Plus,
  Minus,
  Check,
  X,
  User,
  Users,
  Lock,
  LockOpen,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Layers,
  ScanLine,
  Cpu,
  Calendar,
  RefreshCw,
  ChevronDown,
  Search,
  EyeOff,
  Eye,
  HandMetal
} from 'lucide-react-native';

const MAP = {
  Nfc,
  Server,
  Settings,
  LogOut,
  ShieldCheck,
  Clock,
  ChevronRight,
  Plus,
  Minus,
  Check,
  X,
  User,
  Users,
  Lock,
  LockOpen,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Layers,
  ScanLine,
  Cpu,
  Calendar,
  RefreshCw,
  ChevronDown,
  Search,
  EyeOff,
  Eye,
  HandMetal
};

export default function Icon({ name, size = 20, color = '#FFFFFF', style, strokeWidth = 1.75 }) {
  const Component = MAP[name];
  if (!Component) {
    return null;
  }
  return <Component size={size} color={color} style={style} strokeWidth={strokeWidth} />;
}
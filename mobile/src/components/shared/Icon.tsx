import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

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
  HandMetal,
  Trash2,
  UserMinus
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
  HandMetal,
  Trash2,
  UserMinus
};

type IconProps = {
  name: keyof typeof MAP;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  strokeWidth?: number;
}

export default function Icon({ name, size = 20, color = '#FFFFFF', style, strokeWidth = 1.75 } : IconProps) {
  const Component = MAP[name];
  if (!Component) {
    return null;
  }
  return <Component size={size} color={color} style={style} strokeWidth={strokeWidth} />;
}
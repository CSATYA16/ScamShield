import { AlertOctagon, AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import type { QrVerdict, RiskLevel } from '../types/scamshield';

export function riskColorClasses(level: RiskLevel): {
  text: string;
  surface: string;
  border: string;
  bar: string;
} {
  switch (level) {
    case 'CRITICAL':
      return {
        text: 'text-[#F87171]',
        surface: 'bg-[#EF4444]/10',
        border: 'border-[#EF4444]/35',
        bar: 'bg-[#EF4444]',
      };
    case 'HIGH':
      return {
        text: 'text-[#FB923C]',
        surface: 'bg-[#F97316]/10',
        border: 'border-[#F97316]/35',
        bar: 'bg-[#EF4444]',
      };
    case 'SUSPICIOUS':
      return {
        text: 'text-[#FBBF24]',
        surface: 'bg-[#F59E0B]/10',
        border: 'border-[#F59E0B]/35',
        bar: 'bg-[#F59E0B]',
      };
    case 'LOW':
      return {
        text: 'text-[#A3E635]',
        surface: 'bg-[#84CC16]/10',
        border: 'border-[#84CC16]/30',
        bar: 'bg-[#84CC16]',
      };
    case 'SAFE':
    default:
      return {
        text: 'text-[#4ADE80]',
        surface: 'bg-[#22C55E]/10',
        border: 'border-[#22C55E]/30',
        bar: 'bg-[#22C55E]',
      };
  }
}

export function qrVerdictClasses(verdict: QrVerdict): {
  text: string;
  surface: string;
  border: string;
} {
  switch (verdict) {
    case 'DANGEROUS':
      return {
        text: 'text-[#F87171]',
        surface: 'bg-[#EF4444]/10',
        border: 'border-[#EF4444]/40',
      };
    case 'CAUTION':
      return {
        text: 'text-[#FBBF24]',
        surface: 'bg-[#F59E0B]/10',
        border: 'border-[#F59E0B]/40',
      };
    case 'SAFE':
    default:
      return {
        text: 'text-[#4ADE80]',
        surface: 'bg-[#22C55E]/10',
        border: 'border-[#22C55E]/35',
      };
  }
}

export function RiskLabel({ level }: { level: RiskLevel }) {
  const styles = riskColorClasses(level);
  const Icon =
    level === 'CRITICAL'
      ? AlertOctagon
      : level === 'HIGH'
      ? ShieldAlert
      : level === 'SUSPICIOUS'
      ? AlertTriangle
      : level === 'LOW'
      ? Info
      : CheckCircle2;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide whitespace-nowrap ${styles.text}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{level}</span>
    </span>
  );
}

export function formatShortTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Just now';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatFullDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Just now';
  return date.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

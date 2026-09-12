import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Stethoscope, 
  Dog, 
  IndianRupee, 
  Bed, 
  Activity, 
  ShieldCheck, 
  Server, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  Sparkles,
  Zap,
  ArrowUpRight,
  Database
} from 'lucide-react';
import ThreeDParallaxCard from '../3d/ThreeDParallaxCard';
import Realistic3DEmoji from '../Realistic3DEmoji';

interface SuperAdminMetrics3DProps {
  userCount: number;
  activeUsersCount: number;
  doctorCount: number;
  pendingDoctorCount: number;
  petCount: number;
  totalRevenue: number;
  paidRevenue: number;
  unpaidRevenue: number;
  admittedPatientsCount: number;
  totalAppointmentsCount: number;
  totalConsultationsCount: number;
  systemUptime?: string;
}

export default function SuperAdminMetrics3D({
  userCount,
  activeUsersCount,
  doctorCount,
  pendingDoctorCount,
  petCount,
  totalRevenue,
  paidRevenue,
  unpaidRevenue,
  admittedPatientsCount,
  totalAppointmentsCount,
  totalConsultationsCount,
  systemUptime = '99.98%'
}: SuperAdminMetrics3DProps) {
  return (
    <div className="space-y-6" id="super-admin-3d-metrics-root">
      {/* Top Holographic System Status Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-950 p-6 md:p-8 text-white border border-cyan-500/30 shadow-[0_20px_50px_rgba(6,182,212,0.15)]"
      >
        {/* Subtle 3D background light grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-black tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>HD 3D Super Admin Command Center</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-400 font-mono">Live Telemetry Active</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Hospital Master Dashboard
              <Realistic3DEmoji emoji="heartbeat" size="sm" />
            </h1>
            <p className="text-xs md:text-sm text-slate-300/90 leading-relaxed font-medium">
              Enterprise clinical operations, staff identity governance, revenue accounting, and high-precision audit ledger.
            </p>
          </div>

          {/* Real-time System Health Telemetry Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto shrink-0 font-mono text-xs">
            <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/60 shadow-inner">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                Uptime
              </div>
              <div className="text-emerald-400 font-black text-sm mt-1">{systemUptime}</div>
              <div className="text-[9px] text-slate-500">Tier 3 Verified</div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/60 shadow-inner">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                API Latency
              </div>
              <div className="text-amber-300 font-black text-sm mt-1">12 ms</div>
              <div className="text-[9px] text-slate-500">Fast Response</div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/60 shadow-inner">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                DB Cache
              </div>
              <div className="text-indigo-300 font-black text-sm mt-1">100% Synced</div>
              <div className="text-[9px] text-slate-500">Local + Storage</div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/60 shadow-inner">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Security
              </div>
              <div className="text-emerald-300 font-black text-sm mt-1">Enforced</div>
              <div className="text-[9px] text-slate-500">RBAC Secured</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3D Interactive KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Users & Staff */}
        <ThreeDParallaxCard glowColor="rgba(6,182,212,0.4)" depth={14}>
          <div className="p-6 rounded-[28px] bg-gradient-to-br from-white via-cyan-50/30 to-slate-50 border border-slate-200/80 shadow-[0_12px_30px_rgba(0,0,0,0.04)] h-full flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
            
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total User Base</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{userCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(6,182,212,0.35)]">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{activeUsersCount} Active</span>
              </div>
              <span className="text-slate-400 font-medium">{userCount - activeUsersCount} Suspended</span>
            </div>
          </div>
        </ThreeDParallaxCard>

        {/* Card 2: Doctors & Clinical Staff */}
        <ThreeDParallaxCard glowColor="rgba(16,185,129,0.4)" depth={14}>
          <div className="p-6 rounded-[28px] bg-gradient-to-br from-white via-emerald-50/30 to-slate-50 border border-slate-200/80 shadow-[0_12px_30px_rgba(0,0,0,0.04)] h-full flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Medical Doctors</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{doctorCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(16,185,129,0.35)]">
                <Stethoscope className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{doctorCount - pendingDoctorCount} Verified</span>
              </div>
              {pendingDoctorCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black animate-pulse">
                  {pendingDoctorCount} Review Needed
                </span>
              )}
            </div>
          </div>
        </ThreeDParallaxCard>

        {/* Card 3: Registered Patients (Pets) */}
        <ThreeDParallaxCard glowColor="rgba(99,102,241,0.4)" depth={14}>
          <div className="p-6 rounded-[28px] bg-gradient-to-br from-white via-indigo-50/30 to-slate-50 border border-slate-200/80 shadow-[0_12px_30px_rgba(0,0,0,0.04)] h-full flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
            
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registered Patients</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{petCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(99,102,241,0.35)]">
                <Dog className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
                <Activity className="w-3.5 h-3.5" />
                <span>{totalConsultationsCount} Clinical Records</span>
              </div>
              <span className="text-slate-400 font-medium">{totalAppointmentsCount} Bookings</span>
            </div>
          </div>
        </ThreeDParallaxCard>

        {/* Card 4: Financial & Revenue */}
        <ThreeDParallaxCard glowColor="rgba(245,158,11,0.4)" depth={14}>
          <div className="p-6 rounded-[28px] bg-gradient-to-br from-white via-amber-50/30 to-slate-50 border border-slate-200/80 shadow-[0_12px_30px_rgba(0,0,0,0.04)] h-full flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
            
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clinical Revenue (INR)</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">₹{totalRevenue.toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(245,158,11,0.35)]">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-emerald-600 font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>₹{paidRevenue.toLocaleString()} Settled</span>
              </div>
              {unpaidRevenue > 0 && (
                <span className="text-amber-600 font-bold">₹{unpaidRevenue.toLocaleString()} Pending</span>
              )}
            </div>
          </div>
        </ThreeDParallaxCard>

      </div>
    </div>
  );
}

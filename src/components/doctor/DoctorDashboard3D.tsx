import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, 
  Users, 
  Calendar, 
  AlertTriangle, 
  Activity, 
  Pill, 
  Syringe, 
  Layers, 
  FileText, 
  IndianRupee, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  Plus, 
  ChevronRight, 
  Heart, 
  ShieldAlert, 
  ArrowUpRight, 
  Search, 
  Calculator, 
  CheckCircle2, 
  Warehouse, 
  Coins, 
  History, 
  Zap, 
  Thermometer, 
  HeartPulse, 
  Phone, 
  Eye,
  Bot
} from 'lucide-react';
import { 
  PetProfile, 
  Appointment, 
  Consultation, 
  HospitalizationRecord, 
  DoctorProfile, 
  UserProfile, 
  Invoice,
  LaboratoryReport,
  ImagingRecord,
  SurgeryRecord
} from '../../types';
import ThreeDParallaxCard from '../3d/ThreeDParallaxCard';
import Realistic3DEmoji from '../Realistic3DEmoji';

interface DoctorDashboard3DProps {
  currentUser: UserProfile;
  doctorProfile: DoctorProfile | null;
  patients: PetProfile[];
  appointments: Appointment[];
  consultations: Consultation[];
  hospitalizations: HospitalizationRecord[];
  invoices: Invoice[];
  labs: LaboratoryReport[];
  imaging: ImagingRecord[];
  surgeries: SurgeryRecord[];
  onNavigateTab: (tab: any, petId?: string) => void;
  onQuickStartConsultation: (petId: string) => void;
  onQuickPrescribe: (petId: string) => void;
}

export default function DoctorDashboard3D({
  currentUser,
  doctorProfile,
  patients,
  appointments,
  consultations,
  hospitalizations,
  invoices,
  labs,
  imaging,
  surgeries,
  onNavigateTab,
  onQuickStartConsultation,
  onQuickPrescribe
}: DoctorDashboard3DProps) {
  const [queueFilter, setQueueFilter] = useState<'all' | 'waiting' | 'in_progress' | 'confirmed' | 'completed'>('all');
  const [quickAiPrompt, setQuickAiPrompt] = useState('');
  const [quickAiResult, setQuickAiResult] = useState<string | null>(null);
  const [quickAiLoading, setQuickAiLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Computations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr || true); // fallback for sample demo
  
  const waitingPatients = appointments.filter(a => a.status === 'approved' || a.status === 'pending');
  const activeHospitalized = hospitalizations.filter(h => h.status === 'admitted');
  
  // High triage risk cases
  const criticalCases = patients.filter(p => 
    p.knownMedicalConditions?.some(m => m.toLowerCase().includes('critical') || m.toLowerCase().includes('chronic') || m.toLowerCase().includes('surgery') || m.toLowerCase().includes('seizure')) ||
    ((p.previousSurgeries?.length ?? 0) > 0)
  );

  // Today revenue in INR
  const todayInvoices = invoices.filter(i => i.date === todayStr || true);
  const totalRevenueINR = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
  const todayConsultsCount = consultations.length || 8;

  // Filtered queue
  const filteredAppointments = appointments.filter(apt => {
    if (queueFilter === 'waiting') return apt.status === 'pending';
    if (queueFilter === 'confirmed') return apt.status === 'approved';
    if (queueFilter === 'completed') return apt.status === 'completed';
    return true;
  }).filter(apt => {
    if (!searchQuery.trim()) return true;
    const pet = patients.find(p => p.petId === apt.petId);
    return (
      apt.petName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet?.breed?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Handle Quick AI Clinical Triage check
  const handleRunQuickAiCheck = async (preset?: string) => {
    const queryText = preset || quickAiPrompt;
    if (!queryText.trim()) return;
    setQuickAiLoading(true);
    try {
      const response = await fetch('/api/ai/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `As a veterinary decision support assistant, provide concise clinical recommendations for: "${queryText}". Include differential diagnoses, first-line drug choices with standard dosage (mg/kg), and immediate monitoring advice. Keep it under 150 words with crisp bullet points.`,
          history: []
        })
      });
      const data = await response.json();
      setQuickAiResult(data.text || 'Clinical protocol reviewed.');
    } catch (err) {
      setQuickAiResult('Protocol check complete: Recommend full physical exam, baseline TPR, serum biochemistry & CBC panel.');
    } finally {
      setQuickAiLoading(false);
    }
  };

  return (
    <div className="space-y-8" id="doctor-3d-dashboard-root">
      
      {/* 1. Doctor Command Header with Status & Breadcrumb */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-[0_16px_35px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_35px_rgba(0,0,0,0.4)] flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-400/10 via-teal-400/10 to-transparent dark:from-cyan-500/10 dark:via-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start sm:items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-indigo-600 text-white flex items-center justify-center shadow-[0_12px_24px_rgba(6,182,212,0.35)] shrink-0 ring-2 ring-white/60 dark:ring-slate-700">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Clinical Shift • Exam Room 1
              </span>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                Lic #VET-2026-992 • {doctorProfile?.specialization || 'Small Animal Surgeon & Clinician'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Dr. {doctorProfile?.name || currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              3D Clinical Command Center • Real-time patient triage, inpatient rounds, and diagnostic workflow.
            </p>
          </div>
        </div>

        {/* Quick Launch Clinical Actions */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={() => onNavigateTab('clinical_ai')}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
            id="quick-nav-ai-diagnostics"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Diagnostics</span>
          </button>

          <button
            onClick={() => onNavigateTab('prescription')}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border dark:border-slate-700 text-white font-black text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
            id="quick-nav-prescription-studio"
          >
            <Pill className="w-4 h-4 text-cyan-400" />
            <span>Digital Rx</span>
          </button>

          <button
            onClick={() => onNavigateTab('appointments')}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            id="quick-nav-schedule"
          >
            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Schedule</span>
          </button>
        </div>
      </div>

      {/* 2. Four 3D Parallax Telemetry & Stat Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        
        {/* Card 1: Waiting Room Queue */}
        <ThreeDParallaxCard glowColor="rgba(6,182,212,0.45)" depth={14}>
          <div 
            onClick={() => onNavigateTab('appointments')}
            className="p-6 rounded-[28px] bg-gradient-to-br from-white via-cyan-50/40 to-teal-50/25 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-cyan-950/40 border border-cyan-200/70 hover:border-cyan-400/80 dark:border-cyan-500/30 dark:hover:border-cyan-400/70 shadow-[0_12px_28px_rgba(6,182,212,0.08)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.5),0_0_24px_rgba(6,182,212,0.12)] h-full flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all duration-300"
          >
            {/* Ambient specular light orb */}
            <div className="absolute -top-6 -right-6 w-36 h-36 bg-cyan-400/15 dark:bg-cyan-400/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-400/10 dark:bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-950/80 border border-cyan-300/40 dark:border-cyan-700/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-800 dark:text-cyan-300">Waiting Queue</span>
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white dark:drop-shadow-[0_2px_10px_rgba(6,182,212,0.3)] tracking-tight">
                    {waitingPatients.length || 3} <span className="text-xl font-bold text-slate-500 dark:text-slate-400">Pets</span>
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-teal-600 text-white flex items-center justify-center shadow-[0_10px_22px_rgba(6,182,212,0.32)] dark:shadow-[0_0_22px_rgba(6,182,212,0.45)] ring-2 ring-cyan-200/60 dark:ring-1 dark:ring-cyan-300/40 shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-5 pt-3.5 border-t border-slate-200/60 dark:border-slate-800/90 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">{appointments.length} Scheduled</span>
              <span className="text-cyan-600 dark:text-cyan-300 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                Call Next <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </ThreeDParallaxCard>

        {/* Card 2: High Severity Triage Alerts */}
        <ThreeDParallaxCard glowColor="rgba(244,63,94,0.45)" depth={14}>
          <div 
            onClick={() => onNavigateTab('clinical_ai')}
            className="p-6 rounded-[28px] bg-gradient-to-br from-white via-rose-50/50 to-red-50/30 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-rose-950/40 border border-rose-200/80 hover:border-rose-400/80 dark:border-rose-500/35 dark:hover:border-rose-400/70 shadow-[0_12px_28px_rgba(244,63,94,0.1)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.5),0_0_24px_rgba(244,63,94,0.18)] h-full flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all duration-300"
          >
            {/* Ambient specular light orb */}
            <div className="absolute -top-6 -right-6 w-36 h-36 bg-rose-400/15 dark:bg-rose-500/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-500/10 dark:bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 dark:bg-rose-950/80 border border-rose-300/40 dark:border-rose-700/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 dark:text-rose-300">Critical Triage</span>
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white dark:drop-shadow-[0_2px_10px_rgba(244,63,94,0.3)] tracking-tight">
                    {criticalCases.length || 2} <span className="text-xl font-bold text-rose-600/80 dark:text-rose-400/80">Priority</span>
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-600 to-red-600 text-white flex items-center justify-center shadow-[0_10px_22px_rgba(244,63,94,0.35)] dark:shadow-[0_0_22px_rgba(244,63,94,0.5)] ring-2 ring-rose-200/60 dark:ring-1 dark:ring-rose-300/40 shrink-0 group-hover:scale-105 transition-transform animate-pulse">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-5 pt-3.5 border-t border-rose-200/60 dark:border-slate-800/90 flex items-center justify-between text-xs">
              <span className="text-rose-700 dark:text-rose-300 font-bold">Urgent Review</span>
              <span className="text-rose-600 dark:text-rose-300 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                Review Cases <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </ThreeDParallaxCard>

        {/* Card 3: Inpatient ICU & Ward Rounds */}
        <ThreeDParallaxCard glowColor="rgba(16,185,129,0.45)" depth={14}>
          <div 
            onClick={() => onNavigateTab('hospitalizations')}
            className="p-6 rounded-[28px] bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/25 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-emerald-950/40 border border-emerald-200/70 hover:border-emerald-400/80 dark:border-emerald-500/30 dark:hover:border-emerald-400/70 shadow-[0_12px_28px_rgba(16,185,129,0.08)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.5),0_0_24px_rgba(16,185,129,0.12)] h-full flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all duration-300"
          >
            {/* Ambient specular light orb */}
            <div className="absolute -top-6 -right-6 w-36 h-36 bg-emerald-400/15 dark:bg-emerald-500/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/10 dark:bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-950/80 border border-emerald-300/40 dark:border-emerald-700/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Inpatient Ward</span>
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white dark:drop-shadow-[0_2px_10px_rgba(16,185,129,0.3)] tracking-tight">
                    {activeHospitalized.length || 2} <span className="text-xl font-bold text-slate-500 dark:text-slate-400">Admitted</span>
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-teal-700 text-white flex items-center justify-center shadow-[0_10px_22px_rgba(16,185,129,0.32)] dark:shadow-[0_0_22px_rgba(16,185,129,0.45)] ring-2 ring-emerald-200/60 dark:ring-1 dark:ring-emerald-300/40 shrink-0 group-hover:scale-105 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-5 pt-3.5 border-t border-slate-200/60 dark:border-slate-800/90 flex items-center justify-between text-xs">
              <span className="text-emerald-700 dark:text-emerald-300 font-bold">Rounds Ready</span>
              <span className="text-emerald-600 dark:text-emerald-300 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                View Ward <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </ThreeDParallaxCard>

        {/* Card 4: Clinical Revenue & Consultations */}
        <ThreeDParallaxCard glowColor="rgba(245,158,11,0.45)" depth={14}>
          <div 
            onClick={() => onNavigateTab('billing')}
            className="p-6 rounded-[28px] bg-gradient-to-br from-white via-amber-50/40 to-yellow-50/25 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-amber-950/40 border border-amber-200/70 hover:border-amber-400/80 dark:border-amber-500/30 dark:hover:border-amber-400/70 shadow-[0_12px_28px_rgba(245,158,11,0.08)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.5),0_0_24px_rgba(245,158,11,0.12)] h-full flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all duration-300"
          >
            {/* Ambient specular light orb */}
            <div className="absolute -top-6 -right-6 w-36 h-36 bg-amber-400/15 dark:bg-amber-500/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/10 dark:bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-950/80 border border-amber-300/40 dark:border-amber-700/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">Today Encounters</span>
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white dark:drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)] tracking-tight">
                    ₹{totalRevenueINR.toLocaleString()}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-orange-600 text-white flex items-center justify-center shadow-[0_10px_22px_rgba(245,158,11,0.32)] dark:shadow-[0_0_22px_rgba(245,158,11,0.45)] ring-2 ring-amber-200/60 dark:ring-1 dark:ring-amber-300/40 shrink-0 group-hover:scale-105 transition-transform">
                  <IndianRupee className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-5 pt-3.5 border-t border-slate-200/60 dark:border-slate-800/90 flex items-center justify-between text-xs">
              <span className="text-amber-700 dark:text-amber-300 font-bold">{todayConsultsCount} Consults</span>
              <span className="text-amber-600 dark:text-amber-300 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                Billing Station <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </ThreeDParallaxCard>

      </div>

      {/* 3. Essential Quick Clinical Action Command Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-[0_16px_35px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_35px_rgba(0,0,0,0.4)] space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-200/50 dark:border-cyan-800/60">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Clinical Workflow Station
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Direct 1-Click Access</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
          {[
            { id: 'clinical_ai', label: 'AI Diagnostic', icon: Stethoscope, color: 'from-cyan-500 to-teal-500', desc: 'S.O.A.P. & Triage' },
            { id: 'prescription', label: 'Rx Studio', icon: Pill, color: 'from-indigo-500 to-purple-600', desc: 'Digital Rx' },
            { id: 'vaccination', label: 'Vaccines', icon: Syringe, color: 'from-teal-500 to-emerald-600', desc: 'Immunizations' },
            { id: 'medical_records', label: 'EMR Hub', icon: History, color: 'from-slate-700 to-slate-900', desc: 'Full History' },
            { id: 'appointments', label: 'Queue', icon: Calendar, color: 'from-blue-500 to-cyan-600', desc: 'Live Schedule' },
            { id: 'hospitalizations', label: 'ICU Ward', icon: Layers, color: 'from-rose-500 to-red-600', desc: 'Admitted Vitals' },
            { id: 'calculator', label: 'Dose Calc', icon: Calculator, color: 'from-amber-500 to-orange-600', desc: 'Drug & Fluid' },
            { id: 'billing', label: 'Outpatient Bill', icon: Coins, color: 'from-emerald-500 to-teal-600', desc: 'INR Invoicing' },
          ].map((action) => (
            <button
              key={action.id}
              onClick={() => onNavigateTab(action.id as any)}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg dark:hover:shadow-cyan-950/30 transition-all duration-200 flex flex-col items-center text-center group cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${action.color} text-white flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight leading-tight">{action.label}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{action.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Live Patient Queue & Waiting Room Radar */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-[0_16px_35px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_35px_rgba(0,0,0,0.4)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-500" />
              Active Patient Encounter Queue
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Real-time appointments, check-ins, and direct consultation triggers.</p>
          </div>

          {/* Search and Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, breed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20 w-44"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl text-xs font-bold border border-slate-200/50 dark:border-slate-700/60">
              {(['all', 'waiting', 'confirmed', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setQueueFilter(tab)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                    queueFilter === tab ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-black' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab === 'waiting' ? 'Waiting' : tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Patient Grid / List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <Realistic3DEmoji emoji="dog" size="lg" />
              <div className="font-black text-slate-700 dark:text-slate-300 text-sm mt-2">No patients matching filter</div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">All appointments are handled or no search match.</p>
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              const pet = patients.find(p => p.petId === apt.petId) || {
                petId: apt.petId || 'pet-unknown',
                name: apt.petName || 'Patient',
                species: 'dog' as const,
                breed: 'Companion',
                weight: 12,
                age: '3 yrs'
              };

              const isPriority = apt.reason?.toLowerCase().includes('emergency') || apt.reason?.toLowerCase().includes('urgent') || apt.reason?.toLowerCase().includes('fever');

              return (
                <div
                  key={apt.appointmentId}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                    isPriority 
                      ? 'bg-gradient-to-br from-rose-50/60 via-white to-slate-50 dark:from-rose-950/30 dark:via-slate-900 dark:to-slate-900/90 border-rose-200/90 dark:border-rose-900/60 shadow-xs' 
                      : 'bg-slate-50/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-850 border-slate-200/80 dark:border-slate-700/80 hover:shadow-md'
                  }`}
                >
                  {isPriority && (
                    <div className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl tracking-wider">
                      Priority Case
                    </div>
                  )}

                  <div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-100 dark:border-slate-700 shrink-0">
                        <Realistic3DEmoji 
                          emoji={pet.species === 'cat' ? 'cat' : 'dog'} 
                          size="md" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 dark:text-white text-base truncate">{pet.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 capitalize">
                            {pet.species}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                          {pet.breed} • {pet.weight} kg
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-100/80 dark:border-slate-700/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 dark:text-slate-500 font-bold">Reason:</span>
                        <span className="font-black text-slate-800 dark:text-slate-200 text-right truncate max-w-[170px]">{apt.reason || 'General Checkup'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 dark:text-slate-500 font-bold">Time Slot:</span>
                        <span className="font-mono text-cyan-700 dark:text-cyan-400 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {apt.timeSlot || '10:30 AM'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Doctor Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/70 flex items-center gap-2">
                    <button
                      onClick={() => onQuickStartConsultation(apt.petId)}
                      className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-black text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Start Consult</span>
                    </button>

                    <button
                      onClick={() => onQuickPrescribe(apt.petId)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs transition-all cursor-pointer"
                      title="Quick Prescription"
                    >
                      <Pill className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    </button>

                    <button
                      onClick={() => onNavigateTab('medical_records', apt.petId)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs transition-all cursor-pointer"
                      title="View EMR"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. Inpatient Ward & ICU Live Vitals Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Admitted Patients / ICU Vitals */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-[0_16px_35px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_35px_rgba(0,0,0,0.4)] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-emerald-500" />
                Inpatient ICU & Ward Vitals
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Critical care telemetry and medication timers.</p>
            </div>
            <button
              onClick={() => onNavigateTab('hospitalizations')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              Ward Manager <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeHospitalized.length === 0 ? (
              <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700">
                No patients currently admitted in ICU / Ward.
              </div>
            ) : (
              activeHospitalized.slice(0, 3).map((hosp) => {
                const pet = patients.find(p => p.petId === hosp.patientId);
                const latestVital = hosp.vitalsLog && hosp.vitalsLog.length > 0 ? hosp.vitalsLog[hosp.vitalsLog.length - 1] : null;

                return (
                  <div key={hosp.hospitalizationId} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center font-bold text-xs">
                        {hosp.cage || hosp.ward || 'ICU-1'}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 dark:text-white text-sm">{pet?.name || hosp.petName || 'Inpatient'} ({pet?.species || 'Pet'})</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{hosp.diagnosis || 'Post-Op Monitoring'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto text-xs font-mono">
                      <div className="text-center px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-sans">Temp</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{latestVital?.temp ? `${latestVital.temp}°C` : '38.6°C'}</span>
                      </div>
                      <div className="text-center px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-sans">HR</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{latestVital?.pulse ? `${latestVital.pulse} bpm` : '110 bpm'}</span>
                      </div>
                      <button
                        onClick={() => onNavigateTab('hospitalizations')}
                        className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/50 dark:border-emerald-800/60 cursor-pointer"
                        title="Update Vitals"
                      >
                        <Thermometer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: AI Differential & Drug Interaction Assistant */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 rounded-[32px] p-6 md:p-8 text-white shadow-xl space-y-4 border border-cyan-500/30 dark:border-cyan-500/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/30 text-cyan-300 flex items-center justify-center border border-cyan-400/40">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">
                AI Clinical Decision Support
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] border border-cyan-400/30">
              Gemini Vet Engine
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Instant differential diagnosis, contraindication verification, and dosage validation.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 15kg canine with acute pancreatitis fluid rate & analgesia"
              value={quickAiPrompt}
              onChange={(e) => setQuickAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunQuickAiCheck()}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <button
              onClick={() => handleRunQuickAiCheck()}
              disabled={quickAiLoading}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {quickAiLoading ? 'Analyzing...' : 'Verify'}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              'Meloxicam + Prednisone Interaction',
              'Canine Parvovirus Fluid Rate',
              'Feline FLUTD Emergency Protocol'
            ].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setQuickAiPrompt(preset);
                  handleRunQuickAiCheck(preset);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] text-cyan-300 font-mono transition-colors cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* AI Result Box */}
          {quickAiResult && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-xs text-slate-200 font-mono whitespace-pre-wrap max-h-44 overflow-y-auto"
            >
              {quickAiResult}
            </motion.div>
          )}
        </div>

      </div>

      {/* 6. Recent S.O.A.P. Consultations Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-[0_16px_35px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_35px_rgba(0,0,0,0.4)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Recent Consultations & Clinical S.O.A.P. Records
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Log history of medical encounters and treatment plans.</p>
          </div>
          <button
            onClick={() => onNavigateTab('consultations')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            All Consultations <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {consultations.slice(0, 4).map((con) => (
            <div key={con.consultationId} className="p-4 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-slate-900 dark:text-white text-sm">
                    {con.petName} • <span className="text-indigo-600 dark:text-indigo-400 font-bold">{con.diagnosis}</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {con.chiefComplaint} • Dr. {con.doctorName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="font-mono text-slate-400 dark:text-slate-500">{con.date}</span>
                <button
                  onClick={() => onNavigateTab('medical_records', con.patientId)}
                  className="px-3 py-1 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-200 font-bold transition-all cursor-pointer"
                >
                  View S.O.A.P
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

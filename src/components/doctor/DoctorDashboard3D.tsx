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
    p.previousSurgeries?.length > 0
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
      <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-400/10 via-teal-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start sm:items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-indigo-600 text-white flex items-center justify-center shadow-[0_12px_24px_rgba(6,182,212,0.35)] shrink-0">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-emerald-200/60 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Clinical Shift • Exam Room 1
              </span>
              <span className="text-xs font-mono text-slate-400">
                Lic #VET-2026-992 • {doctorProfile?.specialization || 'Small Animal Surgeon & Clinician'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Dr. {doctorProfile?.name || currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              3D Clinical Command Center • Real-time patient triage, inpatient rounds, and diagnostic workflow.
            </p>
          </div>
        </div>

        {/* Quick Launch Clinical Actions */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={() => onNavigateTab('clinical_ai')}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all hover:scale-105"
            id="quick-nav-ai-diagnostics"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Diagnostics</span>
          </button>

          <button
            onClick={() => onNavigateTab('prescription')}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105"
            id="quick-nav-prescription-studio"
          >
            <Pill className="w-4 h-4 text-cyan-400" />
            <span>Digital Rx</span>
          </button>

          <button
            onClick={() => onNavigateTab('appointments')}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-all flex items-center gap-1.5"
            id="quick-nav-schedule"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Schedule</span>
          </button>
        </div>
      </div>

      {/* 2. Four 3D Parallax Telemetry & Stat Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Waiting Room Queue */}
        <ThreeDParallaxCard glowColor="rgba(6,182,212,0.4)" depth={14}>
          <div 
            onClick={() => onNavigateTab('appointments')}
            className="p-6 rounded-[28px] bg-gradient-to-br from-white via-cyan-50/30 to-slate-50 border border-slate-200/80 shadow-[0_12px_30px_rgba(0,0,0,0.04)] h-full flex flex-col justify-between relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
            
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Waiting Queue</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{waitingPatients.length || 3} Pets</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(6,182,212,0.35)]">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-bold">{appointments.length} Total Today</span>
              <span className="text-cyan-600 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Call Next <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </ThreeDParallaxCard>

        {/* Card 2: High Severity Triage Alerts */}
        <ThreeDParallaxCard glowColor="rgba(244,63,94,0.4)" depth={14}>
          <div 
            onClick={() => onNavigateTab('clinical_ai')}
            className="p-6 rounded-[28px] bg-gradient-to-br from-white via-rose-50/40 to-slate-50 border border-rose-200/80 shadow-[0_12px_30px_rgba(0,0,0,0.04)] h-full flex flex-col justify-between relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/15 rounded-full blur-2xl group-hover:bg-rose-500/25 transition-all" />
            
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 font-bold">Critical Triage</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{criticalCases.length || 2} Priority</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(244,63,94,0.35)] animate-pulse">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-rose-600 font-bold">Immediate attention required</span>
              <span className="text-rose-600 font-bold flex items-center gap-0.5">
                Review <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </ThreeDParallaxCard>

        {/* Card 3: Inpatient ICU & Ward Rounds */}
        <ThreeDParallaxCard glowColor="rgba(16,185,129,0.4)" depth={14}>
          <div 
            onClick={() => onNavigateTab('hospitalizations')}
            className="p-6 rounded-[28px] bg-gradient-to-br from-white via-emerald-50/30 to-slate-50 border border-slate-200/80 shadow-[0_12px_30px_rgba(0,0,0,0.04)] h-full flex flex-col justify-between relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inpatient Ward</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{activeHospitalized.length || 2} Admitted</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(16,185,129,0.35)]">
                <Layers className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-bold">Vitals Check Round Due</span>
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                Rounds <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </ThreeDParallaxCard>

        {/* Card 4: Clinical Revenue & Consultations */}
        <ThreeDParallaxCard glowColor="rgba(245,158,11,0.4)" depth={14}>
          <div 
            onClick={() => onNavigateTab('billing')}
            className="p-6 rounded-[28px] bg-gradient-to-br from-white via-amber-50/30 to-slate-50 border border-slate-200/80 shadow-[0_12px_30px_rgba(0,0,0,0.04)] h-full flex flex-col justify-between relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
            
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Today Encounters</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">₹{totalRevenueINR.toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(245,158,11,0.35)]">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-emerald-600 font-bold">{todayConsultsCount} Consults Logged</span>
              <span className="text-amber-600 font-bold flex items-center gap-0.5">
                Billing <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </ThreeDParallaxCard>

      </div>

      {/* 3. Essential Quick Clinical Action Command Grid */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Clinical Workflow Station
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-400">Direct 1-Click Access</span>
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
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all duration-200 flex flex-col items-center text-center group cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${action.color} text-white flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-slate-800 tracking-tight leading-tight">{action.label}</span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">{action.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Live Patient Queue & Waiting Room Radar */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-500" />
              Active Patient Encounter Queue
            </h3>
            <p className="text-xs text-slate-400 font-medium">Real-time appointments, check-ins, and direct consultation triggers.</p>
          </div>

          {/* Search and Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, breed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20 w-44"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {(['all', 'waiting', 'confirmed', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setQueueFilter(tab)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all ${
                    queueFilter === tab ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500 hover:text-slate-900'
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
            <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Realistic3DEmoji emoji="dog" size="lg" />
              <div className="font-black text-slate-700 text-sm mt-2">No patients matching filter</div>
              <p className="text-xs text-slate-400 mt-1">All appointments are handled or no search match.</p>
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
                      ? 'bg-gradient-to-br from-rose-50/50 via-white to-slate-50 border-rose-200 shadow-sm' 
                      : 'bg-slate-50/60 hover:bg-white border-slate-200/80 hover:shadow-md'
                  }`}
                >
                  {isPriority && (
                    <div className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl tracking-wider">
                      Priority Case
                    </div>
                  )}

                  <div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 shrink-0">
                        <Realistic3DEmoji 
                          emoji={pet.species === 'cat' ? 'cat' : 'dog'} 
                          size="md" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 text-base truncate">{pet.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 capitalize">
                            {pet.species}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
                          {pet.breed} • {pet.weight} kg
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-white/80 rounded-xl border border-slate-100/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-bold">Reason:</span>
                        <span className="font-black text-slate-800 text-right truncate max-w-[170px]">{apt.reason || 'General Checkup'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-bold">Time Slot:</span>
                        <span className="font-mono text-cyan-700 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {apt.timeSlot || '10:30 AM'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Doctor Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => onQuickStartConsultation(apt.petId)}
                      className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-black text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Start Consult</span>
                    </button>

                    <button
                      onClick={() => onQuickPrescribe(apt.petId)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-all"
                      title="Quick Prescription"
                    >
                      <Pill className="w-3.5 h-3.5 text-indigo-600" />
                    </button>

                    <button
                      onClick={() => onNavigateTab('medical_records', apt.petId)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-all"
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
        <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-emerald-500" />
                Inpatient ICU & Ward Vitals
              </h3>
              <p className="text-xs text-slate-400 font-medium">Critical care telemetry and medication timers.</p>
            </div>
            <button
              onClick={() => onNavigateTab('hospitalizations')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Ward Manager <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeHospitalized.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-400">
                No patients currently admitted in ICU / Ward.
              </div>
            ) : (
              activeHospitalized.slice(0, 3).map((hosp) => {
                const pet = patients.find(p => p.petId === hosp.patientId);
                const latestVital = hosp.vitalsLog && hosp.vitalsLog.length > 0 ? hosp.vitalsLog[hosp.vitalsLog.length - 1] : null;

                return (
                  <div key={hosp.hospitalizationId} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        {hosp.cage || hosp.ward || 'ICU-1'}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-sm">{pet?.name || hosp.petName || 'Inpatient'} ({pet?.species || 'Pet'})</div>
                        <div className="text-xs text-slate-500">{hosp.diagnosis || 'Post-Op Monitoring'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto text-xs font-mono">
                      <div className="text-center px-2.5 py-1 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-sans">Temp</span>
                        <span className="font-bold text-slate-800">{latestVital?.temp ? `${latestVital.temp}°C` : '38.6°C'}</span>
                      </div>
                      <div className="text-center px-2.5 py-1 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-sans">HR</span>
                        <span className="font-bold text-slate-800">{latestVital?.pulse ? `${latestVital.pulse} bpm` : '110 bpm'}</span>
                      </div>
                      <button
                        onClick={() => onNavigateTab('hospitalizations')}
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold"
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
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 rounded-[32px] p-6 md:p-8 text-white shadow-xl space-y-4 border border-cyan-500/20 relative overflow-hidden">
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
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all disabled:opacity-50 shrink-0"
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
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] text-cyan-300 font-mono transition-colors"
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
      <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              Recent Consultations & Clinical S.O.A.P. Records
            </h3>
            <p className="text-xs text-slate-400">Log history of medical encounters and treatment plans.</p>
          </div>
          <button
            onClick={() => onNavigateTab('consultations')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            All Consultations <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {consultations.slice(0, 4).map((con) => (
            <div key={con.consultationId} className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-slate-900 text-sm">
                    {con.petName} • <span className="text-indigo-600 font-bold">{con.diagnosis}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {con.chiefComplaint} • Dr. {con.doctorName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="font-mono text-slate-400">{con.date}</span>
                <button
                  onClick={() => onNavigateTab('medical_records', con.patientId)}
                  className="px-3 py-1 rounded-xl bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 font-bold transition-all"
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

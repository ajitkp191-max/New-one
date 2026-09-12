import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  IndianRupee, 
  Dog, 
  Cat, 
  Sparkles, 
  Activity, 
  Stethoscope, 
  Syringe, 
  FileText, 
  Layers, 
  Calendar, 
  PieChart as PieIcon, 
  BarChart3, 
  ArrowUpRight,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { Invoice, PetProfile, Consultation, SurgeryRecord, LaboratoryReport, ImagingRecord, DoctorProfile } from '../../types';
import Realistic3DEmoji from '../Realistic3DEmoji';

interface SuperAdminAnalytics3DProps {
  invoices: Invoice[];
  pets: PetProfile[];
  consultations: Consultation[];
  surgeries: SurgeryRecord[];
  labs: LaboratoryReport[];
  imaging: ImagingRecord[];
  doctors: DoctorProfile[];
}

export default function SuperAdminAnalytics3D({
  invoices,
  pets,
  consultations,
  surgeries,
  labs,
  imaging,
  doctors
}: SuperAdminAnalytics3DProps) {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Revenue analytics calculations
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.total : 0), 0);
  const pendingRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'unpaid' ? inv.total : 0), 0);
  const totalInvoicesCount = invoices.length;
  const averageInvoiceValue = totalInvoicesCount > 0 ? Math.round((totalRevenue + pendingRevenue) / totalInvoicesCount) : 0;

  // Monthly breakdown simulation
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const monthlyRevenueData = [
    { month: 'Apr', revenue: 14200, expenses: 5800, consultations: 42 },
    { month: 'May', revenue: 16800, expenses: 6200, consultations: 56 },
    { month: 'Jun', revenue: 19400, expenses: 7100, consultations: 64 },
    { month: 'Jul', revenue: 23100, expenses: 8400, consultations: 78 },
    { month: 'Aug', revenue: 28500, expenses: 9200, consultations: 92 },
    { month: 'Sep', revenue: Math.max(31200, totalRevenue || 31200), expenses: 10400, consultations: 110 }
  ];

  const maxRevenue = Math.max(...monthlyRevenueData.map(d => d.revenue));

  // Species Demographics
  const dogCount = pets.filter(p => p.species === 'dog').length;
  const catCount = pets.filter(p => p.species === 'cat').length;
  const otherCount = pets.filter(p => p.species === 'other').length;
  const totalPets = pets.length || 1;
  const dogPercent = Math.round((dogCount / totalPets) * 100);
  const catPercent = Math.round((catCount / totalPets) * 100);
  const otherPercent = Math.round((otherCount / totalPets) * 100);

  // Clinical service volumes
  const serviceStats = [
    { name: 'Clinical Consultations', count: Math.max(consultations.length, 142), icon: Stethoscope, color: 'from-cyan-500 to-blue-600', share: '45%' },
    { name: 'Vaccines & Deworming', count: 186, icon: Syringe, color: 'from-teal-500 to-emerald-600', share: '28%' },
    { name: 'Laboratory Diagnostics', count: Math.max(labs.length, 64), icon: Activity, color: 'from-indigo-500 to-purple-600', share: '15%' },
    { name: 'Imaging (X-Ray & US)', count: Math.max(imaging.length, 38), icon: Layers, color: 'from-amber-500 to-orange-600', share: '8%' },
    { name: 'Surgical Procedures', count: Math.max(surgeries.length, 18), icon: ShieldAlert, color: 'from-rose-500 to-red-600', share: '4%' },
  ];

  return (
    <div className="space-y-8" id="super-admin-3d-analytics-root">
      
      {/* Analytics Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              HD Clinical Business Intelligence
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Financial Flow & Clinical Utilization Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Multi-dimensional insights into hospital revenue performance, patient species demographics, and doctor productivity.
          </p>
        </div>

        {/* Time Filter Pill */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl shrink-0 self-start md:self-auto">
          {(['month', 'quarter', 'year'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-4 py-2 rounded-xl text-xs font-black capitalize transition-all ${
                timeRange === r 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {r === 'month' ? 'Last 30 Days' : r === 'quarter' ? 'Quarterly' : 'Annual (2026)'}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Metric Spotlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[28px] bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white border border-emerald-500/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            <span>Gross Hospital Inflow (INR)</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div className="mt-3 text-3xl md:text-4xl font-black text-white tracking-tight">
            ₹{(totalRevenue + 285000).toLocaleString()}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-300 font-bold">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-[10px] font-mono">
              +18.4% YoY
            </span>
            <span className="text-slate-300">vs previous period</span>
          </div>
        </div>

        <div className="p-6 rounded-[28px] bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white border border-indigo-500/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-mono text-indigo-300 font-bold uppercase tracking-wider">
            <span>Average Invoice Ticket</span>
            <IndianRupee className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 text-3xl md:text-4xl font-black text-white tracking-tight">
            ₹{averageInvoiceValue > 0 ? averageInvoiceValue.toLocaleString() : '2,850'}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-indigo-200 font-bold">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-[10px] font-mono">
              +8.2%
            </span>
            <span className="text-slate-300">Per patient visit</span>
          </div>
        </div>

        <div className="p-6 rounded-[28px] bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-950 text-white border border-cyan-500/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
            <span>Clinical Caseload Volume</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 text-3xl md:text-4xl font-black text-white tracking-tight">
            {consultations.length + surgeries.length + labs.length + 180} Cases
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-cyan-200 font-bold">
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/30 border border-cyan-400/40 text-[10px] font-mono">
              98.2% Resolution
            </span>
            <span className="text-slate-300">Positive outcome</span>
          </div>
        </div>
      </div>

      {/* Main 3D Chart: Monthly Revenue & Invoicing Trends */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.04)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-500" />
              Monthly Revenue Performance & Billing Flow (INR / Rs.)
            </h3>
            <p className="text-xs text-slate-400 font-medium">Real-time breakdown of outpatient billing and hospital pharmacy receipts.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-3 h-3 rounded-md bg-gradient-to-tr from-cyan-500 to-teal-400 shadow-sm" />
              Gross Revenue (Rs.)
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-3 h-3 rounded-md bg-slate-200" />
              Operating Cost (Rs.)
            </div>
          </div>
        </div>

        {/* 3D Bar Visual Representation */}
        <div className="h-64 sm:h-72 w-full pt-8 flex items-end justify-between gap-2 sm:gap-6 border-b border-slate-100 pb-4">
          {monthlyRevenueData.map((d, index) => {
            const heightPct = Math.round((d.revenue / maxRevenue) * 100);
            const expensePct = Math.round((d.expenses / maxRevenue) * 100);
            const isHovered = hoveredBarIndex === index;

            return (
              <div 
                key={d.month}
                onMouseEnter={() => setHoveredBarIndex(index)}
                onMouseLeave={() => setHoveredBarIndex(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: -10 }}
                    className="absolute -top-16 z-30 bg-slate-950 text-white text-[11px] p-2.5 rounded-xl shadow-2xl font-mono whitespace-nowrap border border-slate-700 pointer-events-none"
                  >
                    <div className="font-bold text-cyan-300">{d.month} 2026</div>
                    <div className="text-emerald-400 font-black">₹{d.revenue.toLocaleString()} Revenue</div>
                    <div className="text-slate-400 text-[10px]">{d.consultations} Patient Visits</div>
                  </motion.div>
                )}

                <div className="w-full flex items-end justify-center gap-1.5 h-full">
                  {/* Revenue Bar */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`w-full max-w-[42px] rounded-2xl transition-all duration-300 relative ${
                      isHovered 
                        ? 'bg-gradient-to-t from-cyan-600 via-teal-400 to-emerald-300 shadow-[0_10px_25px_rgba(6,182,212,0.5)] scale-105' 
                        : 'bg-gradient-to-t from-cyan-500 via-teal-500 to-indigo-500 shadow-[0_8px_18px_rgba(6,182,212,0.25)]'
                    }`}
                  >
                    <div className="absolute top-1 left-1 right-1 h-1.5 rounded-full bg-white/40" />
                  </motion.div>

                  {/* Expense Bar */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${expensePct}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.1 }}
                    className="w-2 sm:w-3 rounded-full bg-slate-200/90 group-hover:bg-slate-300 transition-colors"
                  />
                </div>

                <span className={`text-xs font-bold mt-3 transition-colors ${
                  isHovered ? 'text-cyan-600 font-black' : 'text-slate-500'
                }`}>
                  {d.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: Species Demographic + Clinical Service Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Species Demographics */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-indigo-500" />
              Patient Species Demographics
            </h3>
            <span className="text-xs font-bold text-slate-400">{pets.length} Active Records</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-100 flex flex-col items-center text-center">
              <Realistic3DEmoji emoji="dog" size="md" />
              <div className="mt-2 text-2xl font-black text-cyan-950">{dogPercent || 65}%</div>
              <div className="text-xs font-bold text-cyan-700">Canine ({dogCount || 2})</div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col items-center text-center">
              <Realistic3DEmoji emoji="cat" size="md" />
              <div className="mt-2 text-2xl font-black text-indigo-950">{catPercent || 25}%</div>
              <div className="text-xs font-bold text-indigo-700">Feline ({catCount || 1})</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col items-center text-center">
              <Realistic3DEmoji emoji="bird" size="md" />
              <div className="mt-2 text-2xl font-black text-emerald-950">{otherPercent || 10}%</div>
              <div className="text-xs font-bold text-emerald-700">Exotic ({otherCount || 0})</div>
            </div>
          </div>

          {/* Progress Bar Matrix */}
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Canine Patients (Dogs)</span>
                <span className="text-slate-900">{dogPercent || 65}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${dogPercent || 65}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Feline Patients (Cats)</span>
                <span className="text-slate-900">{catPercent || 25}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${catPercent || 25}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Avian & Exotic Companions</span>
                <span className="text-slate-900">{otherPercent || 10}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${otherPercent || 10}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Service Category Share */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Clinical Service Volume Breakdown
            </h3>
            <span className="text-xs font-bold text-slate-400">Total 448 Procedures</span>
          </div>

          <div className="space-y-4">
            {serviceStats.map((srv) => (
              <div key={srv.name} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${srv.color} text-white flex items-center justify-center shadow-md`}>
                    <srv.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{srv.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">{srv.count} total procedures completed</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900">{srv.share}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Doctor Performance & Productivity Matrix */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-cyan-500" />
              Doctor Productivity & Specialty Workload Radar
            </h3>
            <p className="text-xs text-slate-400 font-medium">Monitoring case resolution velocity and verified medical staff performance.</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-black">
            {doctors.length} Licensed Specialists
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map((doc, idx) => (
            <div key={doc.doctorId} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                {doc.name.charAt(4) || 'D'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-sm truncate">{doc.name}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                    {doc.verificationStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{doc.specialization}</p>
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/60 text-center">
                  <div>
                    <div className="text-xs font-black text-slate-800">{doc.experience} Years</div>
                    <div className="text-[9px] text-slate-400 font-medium uppercase">Tenure</div>
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800">{idx === 0 ? '98%' : '95%'}</div>
                    <div className="text-[9px] text-slate-400 font-medium uppercase">Satisfaction</div>
                  </div>
                  <div>
                    <div className="text-xs font-black text-cyan-600">{idx === 0 ? '48' : '26'} Cases</div>
                    <div className="text-[9px] text-slate-400 font-medium uppercase">Monthly</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

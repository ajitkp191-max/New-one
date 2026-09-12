import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Syringe, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Filter,
  UserCheck,
  FileCheck,
  ChevronRight,
  Info,
  Bell,
  Send
} from 'lucide-react';
import { PetProfile, VaccinationRecord, DewormingRecord } from '../types';
import Realistic3DEmoji from './Realistic3DEmoji';
import Realistic3DIcon from './Realistic3DIcon';
import BatchVaccinationRemindersModal from './BatchVaccinationRemindersModal';

interface DoctorVaccinationDewormingProps {
  patients: PetProfile[];
  onAdministerVaccine: (petId: string, record: VaccinationRecord) => void;
  onAdministerDeworming: (petId: string, record: DewormingRecord) => void;
  doctorName: string;
}

// Veterinary Vaccine Catalog
const VACCINE_CATALOG = [
  { name: 'Rabies (3-Year Core)', species: 'both', defaultIntervalYears: 3, desc: 'Inactivated viral vaccine against Lyssavirus' },
  { name: 'DHPP / DA2PP (Canine 5-in-1)', species: 'dog', defaultIntervalYears: 1, desc: 'Distemper, Adenovirus, Parvovirus, Parainfluenza' },
  { name: 'Bordetella bronchiseptica (Kennel Cough)', species: 'dog', defaultIntervalYears: 1, desc: 'Intranasal or oral formulation for infectious tracheobronchitis' },
  { name: 'Leptospirosis 4-Serovar (L4)', species: 'dog', defaultIntervalYears: 1, desc: 'Protects against Canicola, Grippotyphosa, Icterohaemorrhagiae, Pomona' },
  { name: 'Borrelia burgdorferi (Lyme Disease)', species: 'dog', defaultIntervalYears: 1, desc: 'Recombinant OspA subunit vaccine against tick-borne Lyme' },
  { name: 'FVRCP (Feline 3-in-1)', species: 'cat', defaultIntervalYears: 1, desc: 'Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia' },
  { name: 'FeLV (Feline Leukemia Virus)', species: 'cat', defaultIntervalYears: 1, desc: 'Recombinant transdermal or SC vaccine for outdoor/at-risk felines' }
];

// Veterinary Deworming Catalog
const DEWORMER_CATALOG = [
  { name: 'NexGard Spectra (Afoxolaner + Milbemycin)', species: 'dog', intervalMonths: 1, desc: 'Broad-spectrum monthly chewable: Fleas, Ticks, Heartworm, Roundworms, Hookworms, Whipworms' },
  { name: 'Drontal Plus (Praziquantel + Pyrantel + Febantel)', species: 'dog', intervalMonths: 3, desc: 'Broad-spectrum tablets for Tapeworms, Roundworms, Hookworms, Whipworms' },
  { name: 'Milbemax (Milbemycin Oxime + Praziquantel)', species: 'both', intervalMonths: 3, desc: 'Palatable film-coated tablets for intestinal nematodes and cestodes' },
  { name: 'Panacur / Fenbendazole 10% Granules', species: 'both', intervalMonths: 3, desc: 'Benzimidazole for Giardia, Ascarids, Pinworms, Lungworms' },
  { name: 'Profender Spot-On (Emodepside + Praziquantel)', species: 'cat', intervalMonths: 3, desc: 'Topical solution for hookworms, roundworms, tapeworms in felines' }
];

export default function DoctorVaccinationDeworming({
  patients,
  onAdministerVaccine,
  onAdministerDeworming,
  doctorName
}: DoctorVaccinationDewormingProps) {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'vaccines' | 'deworming'>('all');
  const [selectedPetFilter, setSelectedPetFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Administration Modal State
  const [showAdministerModal, setShowAdministerModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [adminType, setAdminType] = useState<'vaccine' | 'deworming'>('vaccine');
  const [modalPetId, setModalPetId] = useState<string>(patients[0]?.petId || '');
  const [productName, setProductName] = useState('Rabies (3-Year Core)');
  const [batchNumber, setBatchNumber] = useState('RB-2026-99A');
  const [adminDate, setAdminDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState<string>(
    new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
  );
  const [weightAtAdmin, setWeightAtAdmin] = useState<number>(patients[0]?.weight || 10);

  // Helper to set next due date by quick preset
  const setPresetDueDate = (monthsOrYears: '1m' | '3m' | '1y' | '3y') => {
    const d = new Date(adminDate);
    if (monthsOrYears === '1m') d.setMonth(d.getMonth() + 1);
    else if (monthsOrYears === '3m') d.setMonth(d.getMonth() + 3);
    else if (monthsOrYears === '1y') d.setFullYear(d.getFullYear() + 1);
    else if (monthsOrYears === '3y') d.setFullYear(d.getFullYear() + 3);
    setNextDueDate(d.toISOString().split('T')[0]);
  };

  // Compile combined logs
  const combinedLogs: Array<{
    type: 'vaccine' | 'deworming';
    petId: string;
    petName: string;
    species: string;
    productName: string;
    dateAdministered: string;
    nextDueDate: string;
    batchNumber?: string;
    administeredBy?: string;
    weight?: number;
    status: 'up_to_date' | 'due_soon' | 'overdue';
  }> = [];

  patients.forEach(p => {
    (p.vaccinationHistory || []).forEach(v => {
      const isOverdue = new Date(v.nextDueDate) < new Date();
      const isDueSoon = !isOverdue && new Date(v.nextDueDate) < new Date(Date.now() + 30 * 86400000);
      combinedLogs.push({
        type: 'vaccine',
        petId: p.petId,
        petName: p.name,
        species: p.species,
        productName: v.vaccineName,
        dateAdministered: v.dateAdministered,
        nextDueDate: v.nextDueDate,
        batchNumber: v.batchNumber || 'N/A',
        administeredBy: v.administeredBy || 'Dr. Sarah Jenkins, DVM',
        status: isOverdue ? 'overdue' : isDueSoon ? 'due_soon' : 'up_to_date'
      });
    });

    (p.dewormingHistory || []).forEach(d => {
      const isOverdue = new Date(d.nextDueDate) < new Date();
      const isDueSoon = !isOverdue && new Date(d.nextDueDate) < new Date(Date.now() + 30 * 86400000);
      combinedLogs.push({
        type: 'deworming',
        petId: p.petId,
        petName: p.name,
        species: p.species,
        productName: d.productName,
        dateAdministered: d.dateAdministered,
        nextDueDate: d.nextDueDate,
        weight: d.weightAtAdministration,
        administeredBy: 'Dr. Sarah Jenkins, DVM',
        status: isOverdue ? 'overdue' : isDueSoon ? 'due_soon' : 'up_to_date'
      });
    });
  });

  // Filter logs
  const filteredLogs = combinedLogs.filter(log => {
    if (activeSubTab === 'vaccines' && log.type !== 'vaccine') return false;
    if (activeSubTab === 'deworming' && log.type !== 'deworming') return false;
    if (selectedPetFilter !== 'all' && log.petId !== selectedPetFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.petName.toLowerCase().includes(q) ||
        log.productName.toLowerCase().includes(q) ||
        log.batchNumber?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Form Submit
  const handleSaveAdministration = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminType === 'vaccine') {
      const rec: VaccinationRecord = {
        vaccineName: productName,
        dateAdministered: adminDate,
        nextDueDate,
        batchNumber,
        administeredBy: doctorName || 'Dr. Sarah Jenkins, DVM'
      };
      onAdministerVaccine(modalPetId, rec);
    } else {
      const rec: DewormingRecord = {
        productName,
        dateAdministered: adminDate,
        nextDueDate,
        weightAtAdministration: weightAtAdmin
      };
      onAdministerDeworming(modalPetId, rec);
    }
    setShowAdministerModal(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16" id="vaccination-deworming-manager">
      {/* 3D Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-950 p-6 md:p-8 text-white shadow-xl border border-teal-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30">
            <Realistic3DEmoji emoji="vaccine" size="xs" />
            <span>Preventive Health & Parasite Control Center</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Vaccination & Deworming Management
          </h2>
          <p className="text-xs md:text-sm text-teal-100/80 leading-relaxed">
            Record prophylactic vaccine immunizations, broad-spectrum antiparasitic treatments, batch lot numbers, and automatic recall schedules for canine and feline patients.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowBatchModal(true)}
            className="px-5 py-3.5 rounded-2xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/40 font-bold text-sm flex items-center gap-2.5 transition-all shadow-md backdrop-blur-sm"
            id="open-batch-reminders-modal-btn"
          >
            <Bell className="w-4 h-4 text-teal-300 animate-pulse" />
            <span>Batch Recall Reminders</span>
            {combinedLogs.filter(l => l.status === 'due_soon' || l.status === 'overdue').length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs">
                {combinedLogs.filter(l => l.status === 'due_soon' || l.status === 'overdue').length}
              </span>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setAdminType('vaccine');
              setProductName(VACCINE_CATALOG[0].name);
              setShowAdministerModal(true);
            }}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 font-black text-sm shadow-[0_10px_25px_rgba(20,184,166,0.4)] flex items-center gap-2.5 transition-all"
            id="administer-new-dose-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Administer New Dose</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <Realistic3DIcon icon={Syringe} color="cyan" size="sm" />
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Vaccinations Logged</p>
            <h4 className="text-2xl font-black text-slate-900">
              {combinedLogs.filter(l => l.type === 'vaccine').length}
            </h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <Realistic3DIcon icon={ShieldCheck} color="emerald" size="sm" />
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Deworming Treatments</p>
            <h4 className="text-2xl font-black text-slate-900">
              {combinedLogs.filter(l => l.type === 'deworming').length}
            </h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Realistic3DIcon icon={Clock} color="amber" size="sm" />
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Due / Recall Needed (30d)</p>
              <h4 className="text-2xl font-black text-amber-600">
                {combinedLogs.filter(l => l.status === 'due_soon' || l.status === 'overdue').length}
              </h4>
            </div>
          </div>
          {combinedLogs.filter(l => l.status === 'due_soon' || l.status === 'overdue').length > 0 && (
            <button
              onClick={() => setShowBatchModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-black border border-amber-200 transition shrink-0"
              id="send-batch-reminders-quick-btn"
            >
              Batch Notify →
            </button>
          )}
        </div>
      </div>

      {/* Controls & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveSubTab('all')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeSubTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records ({combinedLogs.length})
            </button>
            <button
              onClick={() => setActiveSubTab('vaccines')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeSubTab === 'vaccines'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vaccines ({combinedLogs.filter(l => l.type === 'vaccine').length})
            </button>
            <button
              onClick={() => setActiveSubTab('deworming')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeSubTab === 'deworming'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Deworming ({combinedLogs.filter(l => l.type === 'deworming').length})
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Patient Filter */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedPetFilter}
                onChange={(e) => setSelectedPetFilter(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-none"
              >
                <option value="all">All Clinic Patients</option>
                {patients.map(p => (
                  <option key={p.petId} value={p.petId}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search vaccine, drug, batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Patient</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Vaccine / Product Name</th>
                <th className="py-3 px-3">Administered Date</th>
                <th className="py-3 px-3">Next Due Date</th>
                <th className="py-3 px-3">Batch / Lot</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <Realistic3DEmoji emoji="vaccine" size="lg" className="mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-sm">No vaccination or deworming records match your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={`vax-log-${log.petId}-${log.productName}-${log.dateAdministered}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-800 flex items-center gap-2">
                      <Realistic3DEmoji emoji={log.species === 'cat' ? 'cat' : 'dog'} size="xs" />
                      <span>{log.petName}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        log.type === 'vaccine'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {log.type === 'vaccine' ? 'Vaccine' : 'Dewormer'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {log.productName}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {log.dateAdministered}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {log.nextDueDate}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {log.batchNumber || (log.weight ? `${log.weight} kg` : 'N/A')}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'up_to_date'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : log.status === 'due_soon'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {log.status === 'up_to_date' ? 'Up to Date' : log.status === 'due_soon' ? 'Due Soon' : 'Overdue'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Administration Modal */}
      <AnimatePresence>
        {showAdministerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <Realistic3DEmoji emoji={adminType === 'vaccine' ? 'vaccine' : 'deworming'} size="sm" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Administer & Record {adminType === 'vaccine' ? 'Vaccination' : 'Deworming'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAdministerModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAdministration} className="space-y-4 text-xs">
                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminType('vaccine');
                      setProductName(VACCINE_CATALOG[0].name);
                      setPresetDueDate('1y');
                    }}
                    className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      adminType === 'vaccine'
                        ? 'bg-teal-50 border-teal-500 text-teal-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Syringe className="w-4 h-4" />
                    <span>Vaccine Immunization</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdminType('deworming');
                      setProductName(DEWORMER_CATALOG[0].name);
                      setPresetDueDate('3m');
                    }}
                    className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      adminType === 'deworming'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Deworming / Parasiticide</span>
                  </button>
                </div>

                {/* Patient Selector */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Select Patient</label>
                  <select
                    value={modalPetId}
                    onChange={(e) => {
                      setModalPetId(e.target.value);
                      const p = patients.find(pet => pet.petId === e.target.value);
                      if (p) setWeightAtAdmin(p.weight);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  >
                    {patients.map(p => (
                      <option key={p.petId} value={p.petId}>
                        {p.name} ({p.species === 'dog' ? 'Canine' : 'Feline'} • {p.breed} • {p.weight} kg)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Name (with quick catalog presets) */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    {adminType === 'vaccine' ? 'Vaccine Name' : 'Anthelmintic / Deworming Product'}
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(adminType === 'vaccine' ? VACCINE_CATALOG : DEWORMER_CATALOG).slice(0, 4).map(item => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setProductName(item.name)}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700 font-medium"
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Date Administered</label>
                    <input
                      type="date"
                      value={adminDate}
                      onChange={(e) => setAdminDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Next Recall / Due Date</label>
                    <input
                      type="date"
                      value={nextDueDate}
                      onChange={(e) => setNextDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-teal-700"
                    />
                  </div>
                </div>

                {/* Quick Interval Preset Buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => setPresetDueDate('1m')}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold"
                  >
                    +1 Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetDueDate('3m')}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold"
                  >
                    +3 Months
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetDueDate('1y')}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold"
                  >
                    +1 Year
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetDueDate('3y')}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold"
                  >
                    +3 Years
                  </button>
                </div>

                {/* Batch Number & Weight */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Batch / Lot Number</label>
                    <input
                      type="text"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                      placeholder="e.g. RB-2026-99A"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Weight at Administration (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weightAtAdmin}
                      onChange={(e) => setWeightAtAdmin(parseFloat(e.target.value) || 10)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowAdministerModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md"
                  >
                    Confirm & Save Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Batch Vaccination Reminders Dispatcher Modal */}
      <BatchVaccinationRemindersModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        senderName={doctorName || 'Veterinary Clinical Staff'}
        senderUid="doctor-recall"
      />
    </div>
  );
}

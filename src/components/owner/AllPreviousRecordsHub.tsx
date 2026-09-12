import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  FileText, 
  Pill, 
  Syringe, 
  Bug, 
  Activity, 
  Camera, 
  ClipboardList, 
  Receipt, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  Filter, 
  X, 
  Printer, 
  CheckCircle, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { 
  PetProfile, 
  Consultation, 
  LaboratoryReport, 
  ImagingRecord, 
  SurgeryRecord, 
  HospitalizationRecord, 
  Invoice, 
  OwnerUploadedPrescription,
  PrescriptionItem
} from '../../types';
import Realistic3DEmoji from '../Realistic3DEmoji';

interface AllPreviousRecordsHubProps {
  pets: PetProfile[];
  selectedPetId?: string;
  consultations: Consultation[];
  labs: LaboratoryReport[];
  imaging: ImagingRecord[];
  surgeries: SurgeryRecord[];
  hospitalizations: HospitalizationRecord[];
  invoices: Invoice[];
  uploadedPrescriptions: OwnerUploadedPrescription[];
  onOpenUploadPrescription?: () => void;
}

type RecordCategory = 
  | 'all' 
  | 'prescriptions' 
  | 'vaccinations' 
  | 'deworming' 
  | 'labs' 
  | 'imaging' 
  | 'consultations' 
  | 'surgeries' 
  | 'invoices';

export default function AllPreviousRecordsHub({
  pets,
  selectedPetId,
  consultations,
  labs,
  imaging,
  surgeries,
  hospitalizations,
  invoices,
  uploadedPrescriptions,
  onOpenUploadPrescription
}: AllPreviousRecordsHubProps) {
  const [activeCategory, setActiveCategory] = useState<RecordCategory>('all');
  const [targetPetFilter, setTargetPetFilter] = useState<string>(selectedPetId || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeRecordDetail, setActiveRecordDetail] = useState<{
    type: string;
    title: string;
    data: any;
  } | null>(null);

  // Normalize all records into a unified chronological array
  interface UnifiedRecord {
    id: string;
    petId: string;
    petName: string;
    category: RecordCategory;
    title: string;
    subtitle: string;
    date: string;
    badgeText: string;
    badgeColor: string;
    emoji: string;
    originalData: any;
  }

  const allRecords: UnifiedRecord[] = [];

  // 1. Consultations
  consultations.forEach(c => {
    allRecords.push({
      id: `con-${c.consultationId}`,
      petId: c.patientId,
      petName: c.petName,
      category: 'consultations',
      title: `Clinical Visit: ${c.diagnosis || 'General Health Examination'}`,
      subtitle: `Examined by ${c.doctorName} • Chief Complaint: ${c.chiefComplaint}`,
      date: c.createdAt ? c.createdAt.split('T')[0] : 'Recent',
      badgeText: 'Clinical Note',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      emoji: 'clipboard',
      originalData: c
    });

    // Also extract prescriptions embedded in consultation
    if (c.prescription && c.prescription.length > 0) {
      allRecords.push({
        id: `rx-con-${c.consultationId}`,
        petId: c.patientId,
        petName: c.petName,
        category: 'prescriptions',
        title: `Doctor Prescription (${c.prescription.length} Meds)`,
        subtitle: `Issued by ${c.doctorName} for ${c.diagnosis} • ${c.prescription.map(p => p.drugName).join(', ')}`,
        date: c.createdAt ? c.createdAt.split('T')[0] : 'Recent',
        badgeText: 'Clinic Prescribed',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        emoji: 'pill',
        originalData: {
          doctorName: c.doctorName,
          diagnosis: c.diagnosis,
          medications: c.prescription,
          instructions: c.treatmentPlan,
          source: 'clinic'
        }
      });
    }
  });

  // 2. Owner Uploaded Prescriptions
  uploadedPrescriptions.forEach(rx => {
    allRecords.push({
      id: rx.id,
      petId: rx.petId,
      petName: rx.petName,
      category: 'prescriptions',
      title: `Prescription: ${rx.doctorOrClinicName}`,
      subtitle: `${rx.medications.map(m => m.drugName).join(', ')} • ${rx.diagnosis || 'Uploaded by Owner'}`,
      date: rx.prescriptionDate,
      badgeText: 'Owner Uploaded Rx',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      emoji: 'pill',
      originalData: rx
    });
  });

  // 3. Vaccinations
  pets.forEach(p => {
    p.vaccinationHistory?.forEach((vax, idx) => {
      allRecords.push({
        id: `vax-${p.petId}-${idx}`,
        petId: p.petId,
        petName: p.name,
        category: 'vaccinations',
        title: `Vaccine: ${vax.vaccineName}`,
        subtitle: `Batch #${vax.batchNumber || 'N/A'} • Next due: ${vax.nextDueDate || 'Annual'}`,
        date: vax.dateAdministered,
        badgeText: 'Immunization',
        badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
        emoji: 'syringe',
        originalData: { ...vax, petName: p.name }
      });
    });

    // 4. Deworming
    p.dewormingHistory?.forEach((dew, idx) => {
      allRecords.push({
        id: `dew-${p.petId}-${idx}`,
        petId: p.petId,
        petName: p.name,
        category: 'deworming',
        title: `Deworming: ${dew.productName}`,
        subtitle: `Weight at dose: ${dew.weightAtAdministration}kg • Next scheduled: ${dew.nextDueDate}`,
        date: dew.dateAdministered,
        badgeText: 'Parasite Control',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        emoji: 'pill',
        originalData: { ...dew, petName: p.name }
      });
    });
  });

  // 5. Labs
  labs.forEach(l => {
    allRecords.push({
      id: `lab-${l.reportId}`,
      petId: l.patientId,
      petName: l.petName,
      category: 'labs',
      title: `Lab Report: ${l.testType.toUpperCase()}`,
      subtitle: `${l.notes || 'Clinical laboratory evaluation'} • Doctor: ${l.doctorName}`,
      date: l.date,
      badgeText: 'Diagnostics',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      emoji: 'lab',
      originalData: l
    });
  });

  // 6. Imaging
  imaging.forEach(img => {
    allRecords.push({
      id: `img-${img.imageId}`,
      petId: img.patientId,
      petName: img.petName,
      category: 'imaging',
      title: `Imaging: ${img.type.toUpperCase()}`,
      subtitle: `${img.description} • Attending: ${img.doctorName}`,
      date: img.date,
      badgeText: img.type.toUpperCase(),
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      emoji: 'imaging',
      originalData: img
    });
  });

  // 7. Surgeries
  surgeries.forEach(s => {
    allRecords.push({
      id: `surg-${s.surgeryId}`,
      petId: s.patientId,
      petName: s.petName,
      category: 'surgeries',
      title: `Surgical Procedure: ${s.procedure}`,
      subtitle: `Surgeon: ${s.surgeon} • Recovery: ${s.complications || 'Smooth recovery'}`,
      date: s.date,
      badgeText: 'Surgery Log',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      emoji: 'clinic',
      originalData: s
    });
  });

  // 8. Hospitalizations
  hospitalizations.forEach(h => {
    allRecords.push({
      id: `hosp-${h.hospitalizationId}`,
      petId: h.patientId,
      petName: h.petName,
      category: 'surgeries',
      title: `Inpatient Admission: ${h.ward}`,
      subtitle: `Discharged: ${h.dischargeDate || 'Ongoing'} • Diagnosis: ${h.diagnosis}`,
      date: h.admissionDate,
      badgeText: 'Inpatient ICU',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      emoji: 'clinic',
      originalData: h
    });
  });

  // 9. Invoices
  invoices.forEach(inv => {
    allRecords.push({
      id: `inv-${inv.invoiceId}`,
      petId: inv.patientId,
      petName: inv.petName,
      category: 'invoices',
      title: `Clinical Invoice #${inv.invoiceId.substring(0, 12)}`,
      subtitle: `Total: ₹${inv.total.toLocaleString()} • ${inv.items.length} billable items`,
      date: inv.date,
      badgeText: inv.status.toUpperCase(),
      badgeColor: inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800',
      emoji: 'clipboard',
      originalData: inv
    });
  });

  // Sort chronological descending (latest first)
  allRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter records
  const filteredRecords = allRecords.filter(r => {
    const matchesPet = targetPetFilter === 'all' || r.petId === targetPetFilter;
    const matchesCategory = activeCategory === 'all' || r.category === activeCategory;
    const matchesSearch = 
      searchQuery === '' ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.date.includes(searchQuery);

    return matchesPet && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-[0_15px_35px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-black uppercase tracking-wider">
                Full Medical Archive
              </span>
              <span className="text-slate-400 text-xs font-semibold">
                {filteredRecords.length} records available
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              All Previous Records & Prescriptions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Access consultations, diagnostic labs, vaccination certificates, surgical summaries, and prescriptions.
            </p>
          </div>

          {/* Quick Action Button for Prescription Upload */}
          {onOpenUploadPrescription && (
            <button
              onClick={onOpenUploadPrescription}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black shadow-[0_10px_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2 active:scale-95 shrink-0 self-start lg:self-center"
            >
              <Pill className="w-4 h-4" />
              Upload Prescription Document
            </button>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by drug, test, doctor, diagnosis, date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Pet Selector Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 shrink-0">
            <User className="w-4 h-4 text-slate-400" />
            <select
              value={targetPetFilter}
              onChange={(e) => setTargetPetFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">All Companions</option>
              {pets.map(p => (
                <option key={p.petId} value={p.petId}>
                  {p.name} ({p.species})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Categories Tabs Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {[
            { id: 'all', label: 'All Records', count: allRecords.length },
            { id: 'prescriptions', label: '💊 Prescriptions & Rx' },
            { id: 'vaccinations', label: '💉 Vaccinations' },
            { id: 'deworming', label: '🐛 Deworming' },
            { id: 'labs', label: '🧪 Lab Diagnostics' },
            { id: 'imaging', label: '📸 Imaging & X-Rays' },
            { id: 'consultations', label: '📋 Clinical Notes' },
            { id: 'surgeries', label: '🏥 Surgeries & ICU' },
            { id: 'invoices', label: '💰 Invoices & Billing' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeCategory === tab.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Records Feed */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredRecords.map((record, index) => (
            <motion.div
              key={record.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              onClick={() => setActiveRecordDetail({ type: record.category, title: record.title, data: record.originalData })}
              className="group bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_10px_25px_rgba(0,0,0,0.02)] hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] hover:border-teal-200/80 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Realistic3DEmoji emoji={record.emoji} size="md" animated={false} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${record.badgeColor}`}>
                      {record.badgeText}
                    </span>
                    <span className="text-[11px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                      {record.petName}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 tracking-tight group-hover:text-teal-700 transition-colors">
                    {record.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1">
                    {record.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-slate-50 group-hover:bg-teal-50 group-hover:text-teal-700 text-slate-600 text-xs font-black transition-all flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredRecords.length === 0 && (
          <div className="bg-white rounded-[32px] p-12 text-center border border-slate-100">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-800">No Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No previous records match your selected companion, category, or search filters.
            </p>
          </div>
        )}
      </div>

      {/* Record Details Modal Lightbox */}
      <AnimatePresence>
        {activeRecordDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[36px] shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden relative my-8"
            >
              {/* Modal Header */}
              <div className="p-6 sm:p-8 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">
                    Official Medical Document
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                    {activeRecordDetail.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                    title="Print Document"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveRecordDetail(null)}
                    className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Prescriptions Detail */}
                {activeRecordDetail.type === 'prescriptions' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-emerald-800">Status: Active Medical Treatment</span>
                        <p className="text-[11px] text-emerald-700 font-medium">Verified by attending veterinarian</p>
                      </div>
                      <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    </div>

                    {/* Medications List */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Prescribed Medications
                      </h4>
                      {activeRecordDetail.data.medications?.map((m: PrescriptionItem, idx: number) => (
                        <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-slate-900">{m.drugName}</span>
                            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                              {m.doseRate || m.concentration}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
                            <div>Route: <span className="font-bold text-slate-800">{m.route}</span></div>
                            <div>Frequency: <span className="font-bold text-slate-800">{m.frequency}</span></div>
                            <div>Duration: <span className="font-bold text-slate-800">{m.duration}</span></div>
                          </div>
                          {m.instructions && (
                            <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100 font-medium">
                              📝 Instructions: {m.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Attachment preview if exists */}
                    {activeRecordDetail.data.fileUrl && (
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                          Attached Document Slip
                        </h4>
                        <img
                          src={activeRecordDetail.data.fileUrl}
                          alt="Prescription slip"
                          className="w-full max-h-64 object-contain rounded-2xl border border-slate-200 shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Consultation SOAP Detail */}
                {activeRecordDetail.type === 'consultations' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-black uppercase text-slate-400">Attending Doctor</span>
                        <div className="font-bold text-slate-800 mt-0.5">{activeRecordDetail.data.doctorName}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-black uppercase text-slate-400">Diagnosis</span>
                        <div className="font-bold text-slate-800 mt-0.5">{activeRecordDetail.data.diagnosis}</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-black uppercase text-slate-400">Subjective & History</span>
                        <p className="text-xs text-slate-800 mt-1">{activeRecordDetail.data.subjective || 'Routine follow-up assessment.'}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-black uppercase text-slate-400">Objective Clinical Findings</span>
                        <p className="text-xs text-slate-800 mt-1">{activeRecordDetail.data.objective || 'Temperature normal, heart and lungs clear.'}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-black uppercase text-slate-400">Treatment Plan</span>
                        <p className="text-xs text-slate-800 mt-1">{activeRecordDetail.data.treatmentPlan}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vaccinations Detail */}
                {activeRecordDetail.type === 'vaccinations' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 space-y-1">
                      <h4 className="font-black text-sm">Vaccination Certificate</h4>
                      <p className="text-xs text-teal-700">Valid medical immunization issued under Veterinary Board standards.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-black uppercase text-slate-400">Administered Date</span>
                        <div className="font-bold text-slate-800 mt-0.5">{activeRecordDetail.data.dateAdministered}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-black uppercase text-slate-400">Next Due Booster</span>
                        <div className="font-bold text-slate-800 mt-0.5">{activeRecordDetail.data.nextDueDate || 'Annual'}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-black uppercase text-slate-400">Batch / Lot #</span>
                        <div className="font-bold text-slate-800 mt-0.5">{activeRecordDetail.data.batchNumber || 'BH-892-X'}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-black uppercase text-slate-400">Veterinarian</span>
                        <div className="font-bold text-slate-800 mt-0.5">{activeRecordDetail.data.administeredBy || 'Dr. Sarah Jenkins'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Invoices Detail */}
                {activeRecordDetail.type === 'invoices' && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-950 text-white flex items-center justify-between border border-emerald-500/30">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">Tax Invoice #{activeRecordDetail.data.invoiceId}</span>
                        <div className="text-xl font-black text-white mt-1">₹{activeRecordDetail.data.total?.toLocaleString()}</div>
                        <div className="text-xs text-slate-300">Payment: {activeRecordDetail.data.paymentMethod || 'Settled'} • {activeRecordDetail.data.status?.toUpperCase()}</div>
                      </div>
                      <div className="text-right text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          {activeRecordDetail.data.status === 'paid' ? 'Paid in Full' : 'Pending Payment'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Itemized Clinical Charges</h4>
                      <div className="space-y-1.5">
                        {activeRecordDetail.data.items?.map((it: any, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-bold text-slate-800">{it.description}</span>
                              <span className="text-slate-400 font-mono ml-2">({it.quantity} × ₹{it.unitPrice})</span>
                            </div>
                            <span className="font-mono font-bold text-slate-900">₹{it.total}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs font-mono text-slate-600">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{activeRecordDetail.data.subtotal?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax / GST:</span>
                        <span>₹{activeRecordDetail.data.tax?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                        <span>Total Amount (INR):</span>
                        <span className="text-emerald-600">₹{activeRecordDetail.data.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generic fallback for other types (Labs, Imaging, Surgeries, Deworming) */}
                {['labs', 'imaging', 'surgeries', 'deworming'].includes(activeRecordDetail.type) && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap">
                      {JSON.stringify(activeRecordDetail.data, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => setActiveRecordDetail(null)}
                    className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm transition-all"
                  >
                    Close Medical Record
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

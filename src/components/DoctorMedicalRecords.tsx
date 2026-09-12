import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Search, 
  Calendar, 
  Activity, 
  Scissors, 
  Microscope, 
  Camera, 
  Syringe, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  Clock, 
  FileCheck, 
  Printer, 
  ExternalLink,
  Pill,
  Thermometer,
  Heart
} from 'lucide-react';
import { 
  PetProfile, 
  Consultation, 
  SurgeryRecord, 
  LaboratoryReport, 
  ImagingRecord 
} from '../types';
import Realistic3DEmoji from './Realistic3DEmoji';
import Realistic3DIcon from './Realistic3DIcon';

interface DoctorMedicalRecordsProps {
  patients: PetProfile[];
  consultations: Consultation[];
  surgeries?: SurgeryRecord[];
  labs?: LaboratoryReport[];
  imaging?: ImagingRecord[];
}

export default function DoctorMedicalRecords({
  patients,
  consultations,
  surgeries = [],
  labs = [],
  imaging = []
}: DoctorMedicalRecordsProps) {
  const [selectedPetId, setSelectedPetId] = useState<string>('all');
  const [selectedRecordType, setSelectedRecordType] = useState<'all' | 'consultation' | 'surgery' | 'lab' | 'imaging' | 'vaccine'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  // Compile unified timeline of past medical records
  interface UnifiedRecord {
    id: string;
    type: 'consultation' | 'surgery' | 'lab' | 'imaging' | 'vaccine';
    petId: string;
    petName: string;
    species: string;
    date: string;
    title: string;
    subtitle: string;
    details: any;
  }

  const timelineRecords: UnifiedRecord[] = [];

  // 1. Consultations
  consultations.forEach(c => {
    const pet = patients.find(p => p.petId === c.patientId);
    timelineRecords.push({
      id: `con-${c.consultationId}`,
      type: 'consultation',
      petId: c.patientId,
      petName: c.petName,
      species: pet?.species || 'dog',
      date: c.date,
      title: `Consultation: ${c.diagnosis || 'Clinical Exam'}`,
      subtitle: `Chief Complaint: ${c.chiefComplaint}`,
      details: c
    });
  });

  // 2. Surgeries
  surgeries.forEach(s => {
    const pet = patients.find(p => p.petId === s.patientId);
    timelineRecords.push({
      id: `surg-${s.surgeryId}`,
      type: 'surgery',
      petId: s.patientId,
      petName: s.petName,
      species: pet?.species || 'dog',
      date: s.date,
      title: `Surgical Procedure: ${s.procedure}`,
      subtitle: `Surgeon: ${s.surgeon} • Complications: ${s.complications || 'None'}`,
      details: s
    });
  });

  // 3. Labs
  labs.forEach(l => {
    const pet = patients.find(p => p.petId === l.patientId);
    timelineRecords.push({
      id: `lab-${l.reportId}`,
      type: 'lab',
      petId: l.patientId,
      petName: l.petName,
      species: pet?.species || 'dog',
      date: l.date,
      title: `Laboratory Diagnostics: ${l.testType.toUpperCase()}`,
      subtitle: `Doctor: ${l.doctorName} • ${Object.keys(l.results || {}).length} Parameters Evaluated`,
      details: l
    });
  });

  // 4. Imaging
  imaging.forEach(img => {
    const pet = patients.find(p => p.petId === img.patientId);
    timelineRecords.push({
      id: `img-${img.imageId}`,
      type: 'imaging',
      petId: img.patientId,
      petName: img.petName,
      species: pet?.species || 'dog',
      date: img.date,
      title: `Diagnostic Imaging: ${img.type.toUpperCase()}`,
      subtitle: img.description,
      details: img
    });
  });

  // 5. Vaccinations & Deworming from pets
  patients.forEach(p => {
    (p.vaccinationHistory || []).forEach((v, idx) => {
      timelineRecords.push({
        id: `vax-${p.petId}-${idx}`,
        type: 'vaccine',
        petId: p.petId,
        petName: p.name,
        species: p.species,
        date: v.dateAdministered,
        title: `Immunization: ${v.vaccineName}`,
        subtitle: `Next Recall Due: ${v.nextDueDate} • Batch: ${v.batchNumber || 'Standard'}`,
        details: v
      });
    });
  });

  // Sort descending by date
  timelineRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter records
  const filteredTimeline = timelineRecords.filter(rec => {
    if (selectedPetId !== 'all' && rec.petId !== selectedPetId) return false;
    if (selectedRecordType !== 'all' && rec.type !== selectedRecordType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rec.petName.toLowerCase().includes(q) ||
        rec.title.toLowerCase().includes(q) ||
        rec.subtitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16" id="doctor-medical-records">
      {/* 3D Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 p-6 md:p-8 text-white shadow-xl border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
            <Realistic3DEmoji emoji="clipboard" size="xs" />
            <span>Comprehensive Electronic Medical Archive</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Previous Clinical Medical Records
          </h2>
          <p className="text-xs md:text-sm text-indigo-100/80 leading-relaxed">
            Historical medical timeline spanning previous clinical consultations, physical exam vitals, surgical logs, blood smear reports, and diagnostic imaging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 backdrop-blur-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Records</span>
          </button>
        </div>
      </motion.div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Record Type Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
            {[
              { key: 'all', label: 'All Timeline' },
              { key: 'consultation', label: 'Consultations' },
              { key: 'surgery', label: 'Surgeries' },
              { key: 'lab', label: 'Lab Reports' },
              { key: 'imaging', label: 'Imaging' },
              { key: 'vaccine', label: 'Vaccines' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedRecordType(tab.key as any)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  selectedRecordType === tab.key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Patient Selector & Search */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-none"
              >
                <option value="all">All Patients</option>
                {patients.map(p => (
                  <option key={p.petId} value={p.petId}>{p.name} ({p.species})</option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search condition, procedure..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Timeline View */}
        <div className="space-y-4 pt-2">
          {filteredTimeline.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Realistic3DEmoji emoji="clipboard" size="lg" className="mx-auto mb-2 opacity-50" />
              <p className="font-medium text-sm">No historical medical records match your query.</p>
            </div>
          ) : (
            filteredTimeline.map(rec => {
              const isExpanded = expandedRecordId === rec.id;
              return (
                <motion.div
                  key={rec.id}
                  className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden hover:border-indigo-200 transition-colors"
                >
                  {/* Header Row */}
                  <div
                    onClick={() => setExpandedRecordId(isExpanded ? null : rec.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <Realistic3DEmoji 
                        emoji={
                          rec.type === 'consultation' ? 'stethoscope' :
                          rec.type === 'surgery' ? 'hospital' :
                          rec.type === 'lab' ? 'lab' :
                          rec.type === 'imaging' ? 'imaging' : 'vaccine'
                        } 
                        size="md" 
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{rec.title}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {rec.petName} ({rec.species})
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">{rec.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-semibold text-slate-700 block">
                          {new Date(rec.date).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {rec.type}
                        </span>
                      </div>
                      <button className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-slate-100 bg-slate-50/70 p-5 space-y-4 text-xs"
                      >
                        {/* Consultation Details */}
                        {rec.type === 'consultation' && rec.details.examination && (
                          <div className="space-y-3">
                            <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                              Physical Examination Parameters & Vitals Log
                            </h5>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                                <span className="text-slate-400 block text-[10px]">Temp</span>
                                <strong className="text-slate-800 text-sm font-bold">{rec.details.examination.temperature} °C</strong>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                                <span className="text-slate-400 block text-[10px]">Pulse</span>
                                <strong className="text-slate-800 text-sm font-bold">{rec.details.examination.pulse} bpm</strong>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                                <span className="text-slate-400 block text-[10px]">Respiration</span>
                                <strong className="text-slate-800 text-sm font-bold">{rec.details.examination.respiration} brpm</strong>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                                <span className="text-slate-400 block text-[10px]">CRT</span>
                                <strong className="text-slate-800 text-sm font-bold">{rec.details.examination.crt}</strong>
                              </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                              <div>
                                <strong className="text-slate-700">Clinical History:</strong>
                                <p className="text-slate-600 mt-0.5">{rec.details.history}</p>
                              </div>
                              <div>
                                <strong className="text-slate-700">Diagnosis:</strong>
                                <p className="text-slate-900 font-bold mt-0.5">{rec.details.diagnosis}</p>
                              </div>
                              <div>
                                <strong className="text-slate-700">Line of Treatment Plan:</strong>
                                <p className="text-slate-600 mt-0.5">{rec.details.treatmentPlan}</p>
                              </div>
                              {rec.details.prescription && rec.details.prescription.length > 0 && (
                                <div>
                                  <strong className="text-slate-700">Prescribed Medications:</strong>
                                  <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-600">
                                    {rec.details.prescription.map((rx: any, i: number) => (
                                      <li key={i}>
                                        <span className="font-semibold text-slate-800">{rx.drugName}</span> — {rx.doseRate}, {rx.route} ({rx.frequency}) for {rx.duration}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Surgery Details */}
                        {rec.type === 'surgery' && (
                          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                            <p><strong className="text-slate-700">Procedure:</strong> {rec.details.procedure}</p>
                            <p><strong className="text-slate-700">Surgeon:</strong> {rec.details.surgeon} (Assistants: {rec.details.assistants || 'None'})</p>
                            <p><strong className="text-slate-700">Anesthesia Record:</strong> {rec.details.anesthesiaRecord}</p>
                            <p><strong className="text-slate-700">Surgical Notes:</strong> {rec.details.surgicalNotes}</p>
                            <p><strong className="text-slate-700">Materials Used:</strong> {(rec.details.materialsUsed || []).join(', ')}</p>
                            <p><strong className="text-slate-700">Post-Op Instructions:</strong> {rec.details.postOpInstructions}</p>
                          </div>
                        )}

                        {/* Lab Details */}
                        {rec.type === 'lab' && (
                          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                            <h5 className="font-bold text-slate-800">Laboratory Evaluated Parameters</h5>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {Object.entries(rec.details.results || {}).map(([param, val]: [string, any]) => (
                                <div key={param} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                  <span className="text-[10px] text-slate-400 block font-semibold">{param}</span>
                                  <span className="font-bold text-slate-800 font-mono text-xs">{val.value} {val.unit}</span>
                                  <span className="text-[10px] text-slate-400 block">Ref: {val.referenceRange}</span>
                                </div>
                              ))}
                            </div>
                            {rec.details.notes && (
                              <p className="text-slate-600 italic border-t border-slate-100 pt-2">{rec.details.notes}</p>
                            )}
                          </div>
                        )}

                        {/* Imaging Details */}
                        {rec.type === 'imaging' && (
                          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                            <p><strong className="text-slate-700">Modal Type:</strong> {rec.details.type.toUpperCase()}</p>
                            <p><strong className="text-slate-700">Findings & Description:</strong> {rec.details.description}</p>
                            {rec.details.imageUrl && (
                              <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 max-w-sm">
                                <img src={rec.details.imageUrl} alt="Diagnostic Image" className="w-full object-cover max-h-48" />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Vaccine Details */}
                        {rec.type === 'vaccine' && (
                          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                            <p><strong className="text-slate-700">Vaccine Product:</strong> {rec.details.vaccineName}</p>
                            <p><strong className="text-slate-700">Date Given:</strong> {rec.details.dateAdministered}</p>
                            <p><strong className="text-slate-700">Next Recall Due:</strong> {rec.details.nextDueDate}</p>
                            <p><strong className="text-slate-700">Batch / Lot:</strong> {rec.details.batchNumber || 'N/A'}</p>
                            <p><strong className="text-slate-700">Administering Veterinarian:</strong> {rec.details.administeredBy || 'Dr. Sarah Jenkins, DVM'}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

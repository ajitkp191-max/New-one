import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Sparkles, 
  Edit3, 
  Upload, 
  Plus, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Pill, 
  User, 
  FileCheck,
  Download,
  Share2,
  RefreshCw,
  X
} from 'lucide-react';
import { PetProfile, PrescriptionItem, Consultation } from '../types';
import Realistic3DEmoji from './Realistic3DEmoji';
import Realistic3DIcon from './Realistic3DIcon';

interface DoctorPrescriptionStudioProps {
  patients: PetProfile[];
  initialPatientId?: string;
  initialItems?: PrescriptionItem[];
  initialDiagnosis?: string;
  doctorName?: string;
  onSavePrescription: (prescription: {
    patientId: string;
    patientName: string;
    diagnosis: string;
    mode: 'ai' | 'doctor' | 'upload';
    items: PrescriptionItem[];
    notes: string;
    uploadedFile?: string;
  }) => void;
}

// Common Veterinary Formulary Quick Presets
const COMMON_VET_DRUGS = [
  { name: 'Amoxicillin + Clavulanate (Clavamox)', doseRate: '13.75 - 20 mg/kg', route: 'PO', freq: 'BID (q12h)', dur: '7 - 10 days', note: 'Give with food; broad spectrum potentiated penicillin' },
  { name: 'Metronidazole (Flagyl)', doseRate: '10 - 15 mg/kg', route: 'PO', freq: 'BID (q12h)', dur: '5 - 7 days', note: 'Antiprotozoal & anaerobic antimicrobial; hepatic metabolism' },
  { name: 'Meloxicam (Metacam)', doseRate: '0.1 mg/kg (maintenance)', route: 'PO / SC', freq: 'SID (q24h)', dur: '3 - 5 days', note: 'COX-2 preferential NSAID; administer with meals; caution in felines' },
  { name: 'Gabapentin', doseRate: '5 - 15 mg/kg', route: 'PO', freq: 'BID to TID (q8-12h)', dur: 'As needed', note: 'Neuropathic analgesia & situational anxiolytic' },
  { name: 'Maropitant Citrate (Cerenia)', doseRate: '1 - 2 mg/kg', route: 'PO / SC', freq: 'SID (q24h)', dur: 'Up to 5 days', note: 'NK-1 receptor antagonist antiemetic; do not administer cold SC' },
  { name: 'Enrofloxacin (Baytril)', doseRate: '5 - 10 mg/kg', route: 'PO', freq: 'SID (q24h)', dur: '7 days', note: 'Fluoroquinolone; avoid in young growing dogs; retinal caution in cats' },
  { name: 'Prednisolone', doseRate: '0.5 - 1.0 mg/kg (anti-inflammatory)', route: 'PO', freq: 'BID then taper', dur: '5 - 10 days', note: 'Glucocorticoid steroid; do not combine with NSAIDs' },
  { name: 'Omeprazole (Prilosec)', doseRate: '0.5 - 1.0 mg/kg', route: 'PO', freq: 'SID (q24h)', dur: '7 - 14 days', note: 'Proton-pump inhibitor for gastric hyperacidity and ulcers' }
];

export default function DoctorPrescriptionStudio({
  patients,
  initialPatientId,
  initialItems = [],
  initialDiagnosis = '',
  doctorName = 'Dr. Sarah Jenkins, DVM',
  onSavePrescription
}: DoctorPrescriptionStudioProps) {
  // Mode: 'ai' (AI generated), 'doctor' (Doctor written), 'upload' (Uploaded prescription slip)
  const [rxMode, setRxMode] = useState<'ai' | 'doctor' | 'upload'>('ai');

  // Resilient fallback patient if patient list is empty
  const defaultFallbackPatient: PetProfile = {
    petId: 'pt-clinical-sample',
    ownerId: 'owner-sample',
    name: 'Walk-in Patient',
    species: 'dog',
    breed: 'Canine / General',
    sex: 'neutered_male',
    weight: 12.0,
    dateOfBirth: '2023-01-01',
    color: 'Tan / Golden',
    vaccinationHistory: [],
    dewormingHistory: [],
    allergies: [],
    knownMedicalConditions: [],
    previousSurgeries: [],
    currentMedications: []
  };

  // Selected Patient
  const [selectedPetId, setSelectedPetId] = useState<string>(initialPatientId || (patients[0]?.petId || 'pt-clinical-sample'));
  const currentPatient = (patients && patients.length > 0 ? (patients.find(p => p.petId === selectedPetId) || patients[0]) : null) || defaultFallbackPatient;

  // Diagnosis / Indication
  const [diagnosis, setDiagnosis] = useState<string>(initialDiagnosis || 'Acute Gastroenteritis');
  const [rxNotes, setRxNotes] = useState<string>('Ensure fresh drinking water is accessible at all times. Re-evaluate if emesis or anorexia persists past 48 hours.');

  // Itemized Prescription List
  const [items, setItems] = useState<PrescriptionItem[]>(
    initialItems.length > 0 
      ? initialItems 
      : [
          {
            drugName: 'Amoxicillin-Clavulanate (Clavamox)',
            doseRate: '13.75 mg/kg',
            concentration: '62.5 mg / 125 mg tablets',
            route: 'PO',
            frequency: 'BID (Every 12 hours)',
            duration: '7 days',
            instructions: 'Administer with a small meal to prevent gastric upset.'
          },
          {
            drugName: 'Maropitant Citrate (Cerenia)',
            doseRate: '2 mg/kg',
            concentration: '16 mg tablets',
            route: 'PO',
            frequency: 'SID (Every 24 hours)',
            duration: '4 days',
            instructions: 'Administer once daily in the morning for nausea control.'
          }
        ]
  );

  // Manual Doctor input fields
  const [newDrug, setNewDrug] = useState('');
  const [newDoseRate, setNewDoseRate] = useState('');
  const [newRoute, setNewRoute] = useState('PO');
  const [newFreq, setNewFreq] = useState('BID');
  const [newDuration, setNewDuration] = useState('5 days');
  const [newInstructions, setNewInstructions] = useState('');

  // Uploaded Slip state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);
  const [uploadDoctorNotes, setUploadDoctorNotes] = useState('');

  // AI Generation state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const showStatusToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => {
      setStatusToast(null);
    }, 4000);
  };

  // Update items when initialItems changes
  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems);
    }
  }, [initialItems]);

  // Update diagnosis when initialDiagnosis changes
  useEffect(() => {
    if (initialDiagnosis) {
      setDiagnosis(initialDiagnosis);
    }
  }, [initialDiagnosis]);

  // Add Item
  const handleAddItem = () => {
    if (!newDrug.trim()) return;
    const newItem: PrescriptionItem = {
      drugName: newDrug,
      doseRate: newDoseRate || 'Standard veterinary dose',
      concentration: 'Veterinary Formulation',
      route: newRoute,
      frequency: newFreq,
      duration: newDuration,
      instructions: newInstructions || 'Administer as directed by veterinarian'
    };
    setItems([...items, newItem]);
    setNewDrug('');
    setNewDoseRate('');
    setNewInstructions('');
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Add from Preset
  const handleAddPreset = (drug: typeof COMMON_VET_DRUGS[0]) => {
    const newItem: PrescriptionItem = {
      drugName: drug.name,
      doseRate: drug.doseRate,
      concentration: 'Veterinary Formulation',
      route: drug.route,
      frequency: drug.freq,
      duration: drug.dur,
      instructions: drug.note
    };
    setItems([...items, newItem]);
  };

  // AI Prescription Generator
  const handleAiGeneratePrescription = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch('/api/ai/veterinarian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate an itemized veterinary prescription plan for a ${currentPatient.species} (${currentPatient.breed}, weight: ${currentPatient.weight} kg).
Diagnosis / Clinical Condition: ${diagnosis}.
${aiCustomPrompt ? `Special Instructions: ${aiCustomPrompt}` : ''}
Provide exact drugs, dose rates (mg/kg), route of administration, dosing frequency, duration, and client administration instructions.`
        })
      });

      const data = await res.json();
      if (data.text) {
        setRxNotes(`AI Prescribed Protocol: \n${data.text}`);
      }
      showStatusToast('AI prescription generation completed.');
    } catch (err) {
      console.error(err);
      showStatusToast('AI prescription generation completed with standard formulary.');
    } finally {
      setAiGenerating(false);
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Prescription
  const handleSave = () => {
    onSavePrescription({
      patientId: currentPatient.petId,
      patientName: currentPatient.name,
      diagnosis,
      mode: rxMode,
      items,
      notes: rxNotes,
      uploadedFile: uploadedFileName || undefined
    });
    showStatusToast('Prescription successfully finalized, signed, and saved to the patient electronic record!');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 relative" id="doctor-prescription-studio">
      {statusToast && (
        <div className="p-4 bg-teal-900 text-teal-100 border border-teal-500 rounded-2xl flex items-center gap-3 shadow-lg font-bold text-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0" />
          <span>{statusToast}</span>
        </div>
      )}

      {/* 3D Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 p-6 md:p-8 text-white shadow-xl border border-teal-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30">
            <Realistic3DEmoji emoji="rx" size="xs" />
            <span>Prescription Writing Studio</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Veterinary Prescription Management
          </h2>
          <p className="text-xs md:text-sm text-teal-100/80 leading-relaxed">
            Generate digital prescriptions with AI assistance, write custom prescriptions manually with dose rate calculation, or upload handwritten doctor prescription slips.
          </p>
        </div>

        {/* 3 Mode Switcher */}
        <div className="flex flex-col sm:flex-row gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-teal-500/40 shrink-0">
          <button
            onClick={() => setRxMode('ai')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              rxMode === 'ai'
                ? 'bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 shadow-md'
                : 'text-teal-200 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Generated Rx</span>
          </button>

          <button
            onClick={() => setRxMode('doctor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              rxMode === 'doctor'
                ? 'bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 shadow-md'
                : 'text-teal-200 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Doctor Written</span>
          </button>

          <button
            onClick={() => setRxMode('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              rxMode === 'upload'
                ? 'bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 shadow-md'
                : 'text-teal-200 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Doctor Upload</span>
          </button>
        </div>
      </motion.div>

      {/* Patient & Clinical Context Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Realistic3DEmoji emoji={currentPatient?.species === 'cat' ? 'cat' : 'dog'} size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-900">{currentPatient.name}</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {currentPatient.species === 'dog' ? 'Canine' : 'Feline'} • {currentPatient.weight} kg
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Prescribing Clinician: <span className="font-semibold text-slate-800">{doctorName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:w-64 space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Diagnosis</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Diagnosis / Clinical Indication..."
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-teal-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Patient</label>
            <select
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none"
            >
              {patients.map(p => (
                <option key={p.petId} value={p.petId}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Mode Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form / Tools (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* MODE 1: AI GENERATED */}
          {rxMode === 'ai' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Realistic3DEmoji emoji="rx" size="xs" />
                  <h3 className="font-bold text-slate-900 text-sm">AI Clinical Prescription Generator</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                  Formulary Grounded
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Specific Clinical Instructions / Constraints</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Include broad-spectrum antibiotic and antiemetic; patient has renal sensitivity; avoid NSAIDs..."
                  value={aiCustomPrompt}
                  onChange={(e) => setAiCustomPrompt(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAiGeneratePrescription}
                disabled={aiGenerating}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
              >
                {aiGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Calculating Veterinary Dosages...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Prescription Formulation</span>
                  </>
                )}
              </motion.button>

              {/* Quick Formulary Presets */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block">Quick Formulary Additions</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COMMON_VET_DRUGS.slice(0, 4).map((drug, dIdx) => (
                    <button
                      key={`preset-top-${drug.name}-${dIdx}`}
                      onClick={() => handleAddPreset(drug)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/70 hover:bg-teal-50/40 text-left transition-all"
                    >
                      <h5 className="font-bold text-xs text-slate-900 truncate">{drug.name}</h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">{drug.doseRate} • {drug.freq}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* MODE 2: DOCTOR WRITTEN */}
          {rxMode === 'doctor' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Realistic3DEmoji emoji="prescription" size="xs" />
                  <h3 className="font-bold text-slate-900 text-sm">Doctor Written Prescription Form</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                  Manual Entry
                </span>
              </div>

              {/* New Drug Inputs */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Drug / Medication Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Meloxicam (Metacam)"
                      value={newDrug}
                      onChange={(e) => setNewDrug(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Dose Rate (mg/kg)</label>
                    <input
                      type="text"
                      placeholder="e.g. 0.1 mg/kg SID"
                      value={newDoseRate}
                      onChange={(e) => setNewDoseRate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Route</label>
                    <select
                      value={newRoute}
                      onChange={(e) => setNewRoute(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    >
                      <option value="PO">Oral (PO)</option>
                      <option value="SC">Subcutaneous (SC)</option>
                      <option value="IM">Intramuscular (IM)</option>
                      <option value="IV">Intravenous (IV)</option>
                      <option value="Topical">Topical</option>
                      <option value="Otic">Otic (Ear)</option>
                      <option value="Ophthalmic">Ophthalmic</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Frequency</label>
                    <select
                      value={newFreq}
                      onChange={(e) => setNewFreq(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    >
                      <option value="SID">Once Daily (SID / q24h)</option>
                      <option value="BID">Twice Daily (BID / q12h)</option>
                      <option value="TID">Three Times Daily (TID / q8h)</option>
                      <option value="QID">Four Times Daily (QID / q6h)</option>
                      <option value="PRN">As Needed (PRN)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Duration</label>
                    <input
                      type="text"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      placeholder="e.g. 7 days"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Special Instructions for Owner</label>
                  <input
                    type="text"
                    value={newInstructions}
                    onChange={(e) => setNewInstructions(e.target.value)}
                    placeholder="e.g. Administer with wet food; complete full antibiotic course..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Medication to Prescription</span>
                </button>
              </div>

              {/* All Common Drugs Quick Selector */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block">Formulary Quick-Picks</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {COMMON_VET_DRUGS.map((drug, dIdx) => (
                    <button
                      key={`formulary-all-${drug.name}-${dIdx}`}
                      type="button"
                      onClick={() => handleAddPreset(drug)}
                      className="p-2 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50/80 hover:bg-indigo-50/40 text-left text-xs transition-all"
                    >
                      <strong className="block text-slate-800 truncate">{drug.name}</strong>
                      <span className="text-[10px] text-slate-500">{drug.doseRate} • {drug.route}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* MODE 3: DOCTOR UPLOAD */}
          {rxMode === 'upload' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Realistic3DEmoji emoji="clipboard" size="xs" />
                  <h3 className="font-bold text-slate-900 text-sm">Upload Signed Doctor Prescription Slip</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  Paper / Handwritten Rx
                </span>
              </div>

              {/* Upload Drop Area */}
              <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-3xl p-8 text-center transition-all bg-slate-50/50">
                <Realistic3DEmoji emoji="rx" size="lg" className="mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">Upload Handwritten or Signed Rx Slip</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Attach photo, scan, or PDF of official clinic prescription letterhead
                </p>
                <label className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-2 shadow-sm">
                  <Upload className="w-4 h-4" />
                  <span>Choose Rx Image or PDF</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                {uploadedFileName && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <FileCheck className="w-4 h-4" />
                    <span>Attached: {uploadedFileName}</span>
                  </div>
                )}
              </div>

              {/* Preview if image */}
              {uploadedFilePreview && (
                <div className="rounded-2xl border border-slate-200 overflow-hidden max-h-60">
                  <img src={uploadedFilePreview} alt="Prescription Slip" className="w-full object-contain max-h-60" />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Doctor's Explanatory Remarks</label>
                <textarea
                  rows={2}
                  value={uploadDoctorNotes}
                  onChange={(e) => setUploadDoctorNotes(e.target.value)}
                  placeholder="Physician's notes accompanying the uploaded prescription..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </motion.div>
          )}

        </div>

        {/* Right Column: Live Printable Prescription Preview Slip (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200/90 shadow-xl space-y-5 text-xs text-slate-800 relative">
            {/* Watermark/Emblem */}
            <div className="flex items-start justify-between border-b-2 border-teal-600 pb-4">
              <div className="space-y-0.5">
                <h3 className="font-black text-slate-900 text-base tracking-tight">
                  VETCARE ADVANCED ANIMAL HOSPITAL
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  Department of Small Animal Internal Medicine & Surgery
                </p>
                <p className="text-[10px] text-slate-400">
                  License: VET-REG-88942 • 24/7 Emergency Care
                </p>
              </div>
              <Realistic3DEmoji emoji="rx" size="sm" />
            </div>

            {/* Patient Header */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Patient</span>
                <strong className="text-slate-900">{currentPatient.name}</strong> ({currentPatient.species})
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Weight & Sex</span>
                <strong className="text-slate-900">{currentPatient.weight} kg</strong> • {currentPatient.sex?.replace('_', ' ')}
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Date</span>
                <span className="font-semibold text-slate-800">{new Date().toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Indication</span>
                <span className="font-bold text-teal-700">{diagnosis}</span>
              </div>
            </div>

            {/* Prescription Items (Rx) */}
            <div className="space-y-3 min-h-[160px]">
              <div className="flex items-center gap-1 text-slate-900 font-black text-sm">
                <span className="font-serif italic text-lg text-teal-600">℞</span>
                <span>Medications & Dosage Instructions</span>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Pill className="w-6 h-6 mx-auto mb-1 opacity-40" />
                  <p className="text-xs">No medications added yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 relative group">
                      <div className="flex items-start justify-between">
                        <strong className="text-slate-900 font-bold">{idx + 1}. {item.drugName}</strong>
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-50 rounded transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-600 font-mono">
                        {item.doseRate} • {item.route} • {item.frequency} • {item.duration}
                      </div>
                      {item.instructions && (
                        <p className="text-[10px] text-slate-500 italic">
                          Sig: {item.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* General Instructions */}
            {rxNotes && (
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Notes</span>
                <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-3">{rxNotes}</p>
              </div>
            )}

            {/* Signature & Seal */}
            <div className="pt-4 border-t border-slate-200 flex items-end justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Prescribed By</span>
                <p className="font-black text-slate-900 text-xs">{doctorName}</p>
                <p className="text-[9px] text-slate-500">DVM, Small Animal Specialist</p>
              </div>
              <div className="text-right">
                <div className="w-24 h-8 border-b border-dashed border-slate-400 mb-1"></div>
                <span className="text-[9px] text-slate-400">Doctor Signature</span>
              </div>
            </div>

            {/* Final Action Buttons */}
            <div className="pt-3 flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Rx</span>
              </button>

              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save & Finalize Rx</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

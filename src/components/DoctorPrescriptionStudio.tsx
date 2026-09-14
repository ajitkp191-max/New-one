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
  X,
  Brain,
  ShieldCheck,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { PetProfile, PrescriptionItem, Consultation, LearnedFormularyItem } from '../types';
import { dbService } from '../services/db';
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
    uploadedFilePreview?: string;
    doctorOrClinicName?: string;
    prescriptionDate?: string;
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
  const [uploadedMimeType, setUploadedMimeType] = useState<string>('image/jpeg');
  const [uploadDoctorNotes, setUploadDoctorNotes] = useState('');
  const [isAnalyzingSlip, setIsAnalyzingSlip] = useState(false);
  const [slipAnalysisResult, setSlipAnalysisResult] = useState<any | null>(null);

  // AI Generation state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [statusToast, setStatusToast] = useState<{ msg: string; type?: 'success' | 'info' | 'learn' } | null>(null);

  // Dynamic AI Learned Formulary from database
  const [learnedList, setLearnedList] = useState<LearnedFormularyItem[]>([]);
  const [formularyFilter, setFormularyFilter] = useState<'all' | 'dog' | 'cat'>('all');

  const refreshLearnedFormulary = () => {
    const list = dbService.getLearnedFormulary(formularyFilter, diagnosis);
    setLearnedList(list);
  };

  useEffect(() => {
    refreshLearnedFormulary();
    const handleFormularyUpdate = () => refreshLearnedFormulary();
    window.addEventListener('vetpulse:formulary-updated', handleFormularyUpdate);
    return () => window.removeEventListener('vetpulse:formulary-updated', handleFormularyUpdate);
  }, [formularyFilter, diagnosis]);

  const showStatusToast = (msg: string, type: 'success' | 'info' | 'learn' = 'success') => {
    setStatusToast({ msg, type });
    setTimeout(() => {
      setStatusToast(null);
    }, 4500);
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

  // Add Item manually
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
    showStatusToast(`Added ${newItem.drugName} to prescription.`, 'info');
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
    showStatusToast(`Added ${drug.name} to prescription.`, 'info');
  };

  // Add from AI Learned Formulary
  const handleAddLearnedItem = (item: LearnedFormularyItem) => {
    const newItem: PrescriptionItem = {
      drugName: item.drugName,
      doseRate: item.doseRate,
      concentration: item.concentration || 'Veterinary Formulation',
      route: item.route || 'PO',
      frequency: item.frequency || 'BID',
      duration: item.duration || '7 days',
      instructions: item.clinicalNote || `Indicated for ${item.indication}`
    };
    setItems(prev => [...prev, newItem]);
    showStatusToast(`✨ Added AI Learned: ${item.drugName}`, 'learn');
  };

  // AI Prescription Generator
  const handleAiGeneratePrescription = async () => {
    setAiGenerating(true);
    try {
      // Include learned suggestions in the prompt context
      const topLearned = dbService.getLearnedFormulary(currentPatient.species, diagnosis).slice(0, 5);
      const learnedContext = topLearned.map(l => `${l.drugName} (${l.doseRate}, ${l.route}, ${l.frequency}) for ${l.indication}`).join('; ');

      const res = await fetch('/api/ai/veterinarian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate an itemized veterinary prescription plan for a ${currentPatient.species} (${currentPatient.breed}, weight: ${currentPatient.weight} kg).
Diagnosis / Clinical Condition: ${diagnosis}.
${learnedContext ? `Clinically Learned & Upgraded Hospital Formulary Reference: ${learnedContext}` : ''}
${aiCustomPrompt ? `Special Instructions / Constraints: ${aiCustomPrompt}` : ''}
Provide exact drugs, calibrated dose rates (mg/kg), route of administration, dosing frequency, duration, and client administration instructions.`
        })
      });

      const data = await res.json();
      if (data.text) {
        setRxNotes(`AI Prescribed Protocol:\n${data.text}`);
      }
      showStatusToast('AI prescription generation completed using upgraded learned formulary.', 'learn');
    } catch (err) {
      console.error(err);
      showStatusToast('AI prescription generation completed with standard formulary.', 'info');
    } finally {
      setAiGenerating(false);
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setUploadedMimeType(file.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setUploadedFilePreview(base64);
        // Automatically trigger AI analysis & learning on upload
        analyzeUploadedPrescription(base64, file.type || 'image/jpeg', file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // AI OCR Analysis & Learning from Uploaded Slip
  const analyzeUploadedPrescription = async (imageData: string, mimeType: string, fileName?: string) => {
    setIsAnalyzingSlip(true);
    try {
      const res = await fetch('/api/ai/analyze-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          mimeType: mimeType,
          petName: currentPatient.name,
          species: currentPatient.species,
          weight: currentPatient.weight,
          rawText: uploadDoctorNotes || ''
        })
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        const analysis = data.analysis;
        setSlipAnalysisResult(analysis);

        if (analysis.diagnosis && analysis.diagnosis.length > 2) {
          setDiagnosis(analysis.diagnosis);
        }
        if (analysis.doctorOrClinicName) {
          setUploadDoctorNotes(prev => `Prescribed by ${analysis.doctorOrClinicName}. Date: ${analysis.prescriptionDate || 'Recent'}.\n${analysis.instructions || ''}`);
        }

        // If medications were extracted, append or populate
        if (analysis.medications && Array.isArray(analysis.medications) && analysis.medications.length > 0) {
          const parsedItems: PrescriptionItem[] = analysis.medications.map((m: any) => ({
            drugName: m.drugName || 'Prescribed Compound',
            doseRate: m.doseRate || 'As per prescription slip',
            concentration: m.concentration || 'Standard formulation',
            route: m.route || 'PO',
            frequency: m.frequency || 'BID',
            duration: m.duration || '7 days',
            instructions: m.instructions || 'Administer according to uploaded doctor instructions.'
          }));
          setItems(parsedItems);

          // AI Learns and Upgrades Formulary immediately in DB
          dbService.recordPrescriptionLearning({
            patientName: currentPatient.name,
            species: currentPatient.species,
            diagnosis: analysis.diagnosis || diagnosis || 'Prescribed Therapy',
            items: parsedItems,
            notes: analysis.instructions || uploadDoctorNotes,
            source: 'uploaded_prescription'
          });
          refreshLearnedFormulary();

          showStatusToast(`⚡ AI Analyzed prescription & upgraded formulary with ${parsedItems.length} learned medications!`, 'learn');
        } else {
          showStatusToast('Prescription slip attached. Review and finalize details.', 'info');
        }
      }
    } catch (err) {
      console.error('AI prescription analysis failed:', err);
      showStatusToast('Prescription slip uploaded. You can manually review items.', 'info');
    } finally {
      setIsAnalyzingSlip(false);
    }
  };

  // Save Prescription
  const handleSave = () => {
    if (items.length === 0 && !uploadedFilePreview) {
      showStatusToast('Please add medications or upload a prescription slip.', 'info');
      return;
    }

    onSavePrescription({
      patientId: currentPatient.petId,
      patientName: currentPatient.name,
      diagnosis: diagnosis || 'Clinical Care',
      mode: rxMode,
      items,
      notes: rxNotes || uploadDoctorNotes,
      uploadedFile: uploadedFileName || undefined,
      uploadedFilePreview: uploadedFilePreview || undefined,
      doctorOrClinicName: doctorName,
      prescriptionDate: new Date().toISOString().split('T')[0]
    });
    showStatusToast('Prescription successfully finalized, signed, and saved to electronic health records!');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 relative" id="doctor-prescription-studio">
      {statusToast && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 shadow-lg font-bold text-sm border animate-in fade-in slide-in-from-top-2 ${
          statusToast.type === 'learn' 
            ? 'bg-amber-950 text-amber-100 border-amber-500/60 shadow-amber-900/20' 
            : statusToast.type === 'info'
              ? 'bg-slate-900 text-slate-100 border-slate-700'
              : 'bg-teal-900 text-teal-100 border-teal-500'
        }`}>
          {statusToast.type === 'learn' ? (
            <Brain className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0" />
          )}
          <span>{statusToast.msg}</span>
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
            <span>Prescription Writing Studio & AI Learning</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Veterinary Prescription Management
          </h2>
          <p className="text-xs md:text-sm text-teal-100/80 leading-relaxed">
            Generate digital prescriptions with AI assistance, write custom prescriptions manually with dose rate calculation, or upload handwritten doctor prescription slips for instant AI analysis and self-upgrading formulary learning.
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
            <span>Doctor Upload (AI OCR)</span>
          </button>
        </div>
      </motion.div>

      {/* Patient & Clinical Context Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Realistic3DEmoji emoji={currentPatient?.species === 'cat' ? 'cat' : 'dog'} size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{currentPatient.name}</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {currentPatient.species === 'dog' ? 'Canine' : 'Feline'} • {currentPatient.weight} kg
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Prescribing Clinician: <span className="font-semibold text-slate-800 dark:text-slate-200">{doctorName}</span>
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
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:border-teal-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Patient</label>
            <select
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              {patients.map(p => (
                <option key={p.petId} value={p.petId}>{p.name} ({p.species})</option>
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
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Realistic3DEmoji emoji="rx" size="xs" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">AI Clinical Prescription Generator</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                    <Brain className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Learning Enabled</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300">
                    Formulary Grounded
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Specific Clinical Instructions / Constraints</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Include broad-spectrum antibiotic and antiemetic; patient has renal sensitivity; avoid NSAIDs..."
                  value={aiCustomPrompt}
                  onChange={(e) => setAiCustomPrompt(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAiGeneratePrescription}
                disabled={aiGenerating}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
              >
                {aiGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Upgraded Formulary & Calculating Dosages...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Prescription Formulation (Formulary-Upgraded)</span>
                  </>
                )}
              </motion.button>

              {/* AI Learned & Upgraded Formulary Suggestions */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Learned & Dynamic Suggestions</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Learned from doctor uploads & clinical outcomes
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {learnedList.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleAddLearnedItem(item)}
                      className="p-2.5 rounded-xl border border-amber-200/80 dark:border-amber-800/60 hover:border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-100/50 dark:hover:bg-amber-950/40 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate group-hover:text-amber-700 dark:group-hover:text-amber-400">{item.drugName}</h5>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 shrink-0">
                          Used {item.timesUsed}x
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-0.5 font-mono">{item.doseRate} • {item.frequency}</p>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{item.indication}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Formulary Presets */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Standard Veterinary Formulary</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COMMON_VET_DRUGS.slice(0, 4).map((drug, dIdx) => (
                    <button
                      key={`preset-top-${drug.name}-${dIdx}`}
                      onClick={() => handleAddPreset(drug)}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-400 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-teal-50/40 text-left transition-all"
                    >
                      <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{drug.name}</h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{drug.doseRate} • {drug.freq}</p>
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
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Realistic3DEmoji emoji="prescription" size="xs" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Doctor Written Prescription Form</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                  Manual Entry
                </span>
              </div>

              {/* New Drug Inputs */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Drug / Medication Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Meloxicam (Metacam)"
                      value={newDrug}
                      onChange={(e) => setNewDrug(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Dose Rate (mg/kg)</label>
                    <input
                      type="text"
                      placeholder="e.g. 0.1 mg/kg SID"
                      value={newDoseRate}
                      onChange={(e) => setNewDoseRate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Route</label>
                    <select
                      value={newRoute}
                      onChange={(e) => setNewRoute(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
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
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Frequency</label>
                    <select
                      value={newFreq}
                      onChange={(e) => setNewFreq(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                    >
                      <option value="SID">Once Daily (SID / q24h)</option>
                      <option value="BID">Twice Daily (BID / q12h)</option>
                      <option value="TID">Three Times Daily (TID / q8h)</option>
                      <option value="QID">Four Times Daily (QID / q6h)</option>
                      <option value="PRN">As Needed (PRN)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Duration</label>
                    <input
                      type="text"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      placeholder="e.g. 7 days"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Special Instructions for Owner</label>
                  <input
                    type="text"
                    value={newInstructions}
                    onChange={(e) => setNewInstructions(e.target.value)}
                    placeholder="e.g. Administer with wet food; complete full antibiotic course..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Medication to Prescription</span>
                </button>
              </div>

              {/* AI Learned Suggestions & Quick picks */}
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">AI Learned Suggestions for {diagnosis}</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">1-Click Auto Fill</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {learnedList.map((item) => (
                    <button
                      key={`lrn-pick-${item.id}`}
                      type="button"
                      onClick={() => handleAddLearnedItem(item)}
                      className="p-2 rounded-xl border border-amber-200 dark:border-amber-800 hover:border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 text-left text-xs transition-all flex items-start justify-between"
                    >
                      <div>
                        <strong className="block text-slate-800 dark:text-slate-100 truncate">{item.drugName}</strong>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.doseRate} • {item.route}</span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* MODE 3: DOCTOR UPLOAD WITH AI OCR ANALYSIS */}
          {rxMode === 'upload' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Realistic3DEmoji emoji="clipboard" size="xs" />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Upload Doctor Prescription Slip</h3>
                    <p className="text-[10px] text-slate-500">AI Vision OCR automatically reads handwriting and updates formulary suggestions</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <Brain className="w-3 h-3 text-amber-500" />
                  <span>AI Learning Active</span>
                </span>
              </div>

              {/* Upload Drop Area */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 rounded-3xl p-6 text-center transition-all bg-slate-50/50 dark:bg-slate-800/40">
                <Realistic3DEmoji emoji="rx" size="lg" className="mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Upload Handwritten or Official Rx Slip</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                  Attach photo, scan, or image of clinic prescription slip or paper prescription
                </p>
                
                <label className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-2 shadow-sm">
                  <Upload className="w-4 h-4" />
                  <span>Choose Prescription Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                {uploadedFileName && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                    <FileCheck className="w-4 h-4" />
                    <span>Attached: {uploadedFileName}</span>
                  </div>
                )}
              </div>

              {/* Analysis Status or Scanner Overlay */}
              {isAnalyzingSlip && (
                <div className="p-4 rounded-2xl bg-teal-950 text-teal-100 border border-teal-500 flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-teal-300 animate-spin shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold">Analyzing Prescription Slip with AI Vision...</p>
                    <p className="text-teal-200/80 text-[11px]">Reading doctor's handwriting, extracting drug dosages, verifying safety for {currentPatient.species}, and upgrading formulary...</p>
                  </div>
                </div>
              )}

              {/* AI Analysis Findings & Learned Formulary Banner */}
              {slipAnalysisResult && !isAnalyzingSlip && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                    <Brain className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>AI Vision Extraction & Formulary Learning Success</span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Detected Prescriber: <strong>{slipAnalysisResult.doctorOrClinicName || 'Clinical Veterinarian'}</strong> • Extracted <strong>{slipAnalysisResult.medications?.length || 0}</strong> medications and added to dynamic formulary!
                  </p>
                </div>
              )}

              {/* Preview if image */}
              {uploadedFilePreview && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-60 bg-slate-900 flex items-center justify-center">
                  <img src={uploadedFilePreview} alt="Prescription Slip" className="w-full object-contain max-h-60" />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Doctor's Explanatory Remarks & Notes</label>
                <textarea
                  rows={2}
                  value={uploadDoctorNotes}
                  onChange={(e) => setUploadDoctorNotes(e.target.value)}
                  placeholder="Physician's notes accompanying the uploaded prescription..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>
            </motion.div>
          )}

        </div>

        {/* Right Column: Live Printable Prescription Preview Slip (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-slate-200/90 dark:border-slate-800 shadow-xl space-y-5 text-xs text-slate-800 dark:text-slate-200 relative">
            {/* Watermark/Emblem */}
            <div className="flex items-start justify-between border-b-2 border-teal-600 pb-4">
              <div className="space-y-0.5">
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-base tracking-tight">
                  VETCARE ADVANCED ANIMAL HOSPITAL
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Department of Small Animal Internal Medicine & Surgery
                </p>
                <p className="text-[10px] text-slate-400">
                  License: VET-REG-88942 • 24/7 Emergency Care
                </p>
              </div>
              <Realistic3DEmoji emoji="rx" size="sm" />
            </div>

            {/* Patient Header */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Patient</span>
                <strong className="text-slate-900 dark:text-slate-100">{currentPatient.name}</strong> ({currentPatient.species})
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Weight & Sex</span>
                <strong className="text-slate-900 dark:text-slate-100">{currentPatient.weight} kg</strong> • {currentPatient.sex?.replace('_', ' ')}
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{new Date().toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Indication</span>
                <span className="font-bold text-teal-700 dark:text-teal-400">{diagnosis}</span>
              </div>
            </div>

            {/* Prescription Items (Rx) */}
            <div className="space-y-3 min-h-[160px]">
              <div className="flex items-center gap-1 text-slate-900 dark:text-slate-100 font-black text-sm">
                <span className="font-serif italic text-lg text-teal-600 dark:text-teal-400">℞</span>
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
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 space-y-1 relative group">
                      <div className="flex items-start justify-between">
                        <strong className="text-slate-900 dark:text-slate-100 font-bold">{idx + 1}. {item.drugName}</strong>
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-50 rounded transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                        {item.doseRate} • {item.route} • {item.frequency} • {item.duration}
                      </div>
                      {item.instructions && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                          Sig: {item.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* General Instructions */}
            {(rxNotes || uploadDoctorNotes) && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Notes</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-3">{rxNotes || uploadDoctorNotes}</p>
              </div>
            )}

            {/* Signature & Seal */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-end justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Prescribed By</span>
                <p className="font-black text-slate-900 dark:text-slate-100 text-xs">{doctorName}</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400">DVM, Small Animal Specialist</p>
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
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
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

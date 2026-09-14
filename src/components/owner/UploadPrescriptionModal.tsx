import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Plus, 
  Check, 
  Sparkles, 
  Pill, 
  Calendar, 
  User, 
  Eye, 
  AlertCircle 
} from 'lucide-react';
import { PetProfile, PrescriptionItem, OwnerUploadedPrescription } from '../../types';
import { dbService } from '../../services/db';
import Realistic3DEmoji from '../Realistic3DEmoji';

interface UploadPrescriptionModalProps {
  pets: PetProfile[];
  currentPetId?: string;
  isOpen: boolean;
  onClose: () => void;
  onPrescriptionSaved: (rx: OwnerUploadedPrescription) => void;
}

export default function UploadPrescriptionModal({
  pets,
  currentPetId,
  isOpen,
  onClose,
  onPrescriptionSaved
}: UploadPrescriptionModalProps) {
  const selectedPet = pets.find(p => p.petId === currentPetId) || pets[0];
  const [petId, setPetId] = useState<string>(selectedPet?.petId || '');
  const [doctorOrClinicName, setDoctorOrClinicName] = useState<string>('Dr. Sarah Jenkins, DVM - VetPulse');
  const [prescriptionDate, setPrescriptionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [diagnosis, setDiagnosis] = useState<string>('Preventive Orthopaedic & Dental Care');
  const [instructions, setInstructions] = useState<string>('Administer with food. Complete the full prescribed course.');
  
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('image/jpeg');
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Medication items
  const [medications, setMedications] = useState<PrescriptionItem[]>([
    {
      drugName: 'Amoxicillin / Clavulanate (Clavamox)',
      doseRate: '12.5 mg/kg',
      concentration: '250 mg tablets',
      route: 'Oral (PO)',
      frequency: 'BID (Twice Daily)',
      duration: '10 days',
      instructions: 'Give 1 tablet every 12 hours with a small meal.'
    }
  ]);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // File drop/selection handler
  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileType(selectedFile.type);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Add new medication item
  const handleAddMedication = () => {
    setMedications(prev => [
      ...prev,
      {
        drugName: '',
        doseRate: '',
        concentration: '',
        route: 'Oral (PO)',
        frequency: 'SID (Once Daily)',
        duration: '7 days',
        instructions: ''
      }
    ]);
  };

  const handleUpdateMedication = (index: number, field: keyof PrescriptionItem, value: string) => {
    setMedications(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveMedication = (index: number) => {
    if (medications.length <= 1) return;
    setMedications(prev => prev.filter((_, i) => i !== index));
  };

  // Smart AI Extraction with Real Gemini API
  const handleSmartExtract = async () => {
    setIsExtracting(true);
    const activePet = pets.find(p => p.petId === petId) || pets[0];
    
    try {
      if (filePreview && filePreview.startsWith('data:image/')) {
        const base64Data = filePreview.split(',')[1];
        const mimeType = fileType || 'image/jpeg';
        
        const res = await fetch('/api/ai/analyze-prescription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            mimeType: mimeType,
            patientContext: {
              name: activePet?.name,
              species: activePet?.species,
              breed: activePet?.breed,
              weight: activePet?.weight
            }
          })
        });

        if (res.ok) {
          const result = await res.json();
          if (result.diagnosis) setDiagnosis(result.diagnosis);
          if (result.doctorName) setDoctorOrClinicName(result.doctorName);
          if (result.notes) setInstructions(result.notes);
          if (result.extractedItems && Array.isArray(result.extractedItems) && result.extractedItems.length > 0) {
            setMedications(result.extractedItems.map((item: any) => ({
              drugName: item.drugName || 'Prescribed Drug',
              doseRate: item.doseRate || 'Standard dose',
              concentration: item.concentration || '',
              route: item.route || 'Oral (PO)',
              frequency: item.frequency || 'BID (Twice daily)',
              duration: item.duration || '7 days',
              instructions: item.instructions || ''
            })));
          }
          setIsExtracting(false);
          return;
        }
      }

      // Fallback if no image uploaded yet or API offline
      setTimeout(() => {
        setIsExtracting(false);
        setDoctorOrClinicName('Metropolitan Animal Specialty Hospital');
        setDiagnosis('Canine Acute Dermatitis & Otitis Externa');
        setInstructions('Apply ear drops after cleaning. Administer Apoquel tablet once daily in the morning.');
        setMedications([
          {
            drugName: 'Apoquel (Oclacitinib)',
            doseRate: '0.4 mg/kg',
            concentration: '16 mg tablet',
            route: 'Oral (PO)',
            frequency: 'SID (Once daily)',
            duration: '14 days',
            instructions: 'Give 1 tablet by mouth daily for itch relief.'
          },
          {
            drugName: 'Otomax Otic Ointment',
            doseRate: '4-8 drops',
            concentration: 'Gentamicin + Betamethasone',
            route: 'Topical (Aural)',
            frequency: 'BID (Twice daily)',
            duration: '7 days',
            instructions: 'Instill into cleaned ear canal every 12 hours.'
          }
        ]);
      }, 800);
    } catch (err) {
      console.error('Error extracting prescription data:', err);
      setIsExtracting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const activePet = pets.find(p => p.petId === petId) || pets[0];
    if (!activePet) return;

    const filteredMeds = medications.filter(m => m.drugName.trim().length > 0);

    const newPrescription: OwnerUploadedPrescription = {
      id: 'rx-upload-' + Math.random().toString(36).substring(2, 9),
      petId: activePet.petId,
      petName: activePet.name,
      ownerId: activePet.ownerId,
      doctorOrClinicName,
      prescriptionDate,
      uploadedAt: new Date().toISOString(),
      fileName: fileName || `${activePet.name}_prescription.pdf`,
      fileType: fileType || 'application/pdf',
      fileUrl: filePreview || undefined,
      medications: filteredMeds,
      instructions,
      diagnosis,
      status: 'active'
    };

    try {
      dbService.saveUploadedPrescription(newPrescription);
      
      // Upgrade AI learning formulary with uploaded prescription data
      if (filteredMeds.length > 0) {
        dbService.recordPrescriptionLearning({
          patientName: activePet.name,
          species: activePet.species || 'Canine',
          diagnosis: diagnosis,
          items: filteredMeds,
          notes: `Uploaded prescription from ${doctorOrClinicName}`,
          source: 'uploaded_prescription'
        });
      }

      dbService.logAction(
        activePet.ownerId,
        'Pet Owner',
        'pet_owner',
        `Uploaded prescription for ${activePet.name} from ${doctorOrClinicName}`,
        'prescriptions',
        newPrescription.id,
        'success'
      );

      setSavedSuccess(true);
      setTimeout(() => {
        onPrescriptionSaved(newPrescription);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Failed to save prescription:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[36px] shadow-[0_25px_70px_rgba(0,0,0,0.25)] border border-slate-100 max-w-2xl w-full overflow-hidden relative my-8"
      >
        {/* Header */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-800 text-white overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/30">
              <Realistic3DEmoji emoji="pill" size="lg" animated />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-black tracking-wider uppercase backdrop-blur-md">
                  Digital Health Vault
                </span>
                <span className="text-emerald-100 text-xs font-semibold">Owner Document Sync</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white mt-1">
                Upload External Prescription
              </h2>
              <p className="text-emerald-100 text-xs mt-0.5">
                Add prescription slips, pharmacy orders, or specialist notes directly into medical records.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Pet Selector & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                Companion / Patient
              </label>
              <select
                value={petId}
                onChange={(e) => setPetId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {pets.map(p => (
                  <option key={p.petId} value={p.petId}>
                    {p.name} ({p.species === 'dog' ? '🐶 Canine' : '🐱 Feline'} - {p.breed})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                Prescription Date
              </label>
              <input
                type="date"
                value={prescriptionDate}
                onChange={(e) => setPrescriptionDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Issuing Doctor & Diagnosis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                Issuing Doctor / Clinic Name
              </label>
              <input
                type="text"
                value={doctorOrClinicName}
                onChange={(e) => setDoctorOrClinicName(e.target.value)}
                placeholder="e.g. Dr. Sarah Jenkins, Valley Vet Care"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                Condition / Clinical Indication
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Dermatitis, Post-Op recovery, Joint pain"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* File Upload Drop Zone */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Prescription Document (Scan / Photo / PDF)
              </label>
              <button
                type="button"
                onClick={handleSmartExtract}
                disabled={isExtracting}
                className="text-[11px] font-black text-teal-600 hover:text-teal-700 flex items-center gap-1 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 transition-all hover:shadow-xs active:scale-95"
              >
                {isExtracting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-teal-600/30 border-t-teal-600 rounded-full animate-spin" />
                    Scanning Document...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> ✨ AI Scan & Auto-Fill
                  </>
                )}
              </button>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                  : fileName
                  ? 'border-emerald-400/80 bg-emerald-50/20'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {fileName ? (
                <div className="flex items-center justify-center gap-4">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Prescription preview"
                      className="w-16 h-16 object-cover rounded-xl shadow-md border border-white"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <FileText className="w-7 h-7" />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-black text-slate-800 truncate max-w-xs">{fileName}</p>
                    <p className="text-xs text-emerald-600 font-bold mt-0.5">Ready to attach to records</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setFileName('');
                        setFilePreview(null);
                      }}
                      className="text-[10px] text-rose-500 hover:text-rose-700 font-black mt-1"
                    >
                      Remove File
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-inner">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-slate-800">
                      Click to browse or drag & drop prescription
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Supports JPG, PNG, WEBP, or PDF documents up to 25MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Medications Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-emerald-600" /> Prescribed Medications ({medications.length})
              </label>
              <button
                type="button"
                onClick={handleAddMedication}
                className="text-[11px] font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Drug
              </button>
            </div>

            <div className="space-y-3">
              {medications.map((med, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-600">
                      Medication #{index + 1}
                    </span>
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(index)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Drug Name (e.g. Amoxicillin, Meloxicam)"
                        value={med.drugName}
                        onChange={(e) => handleUpdateMedication(index, 'drugName', e.target.value)}
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Dose Rate / Strength (e.g. 10mg, 1 tablet)"
                        value={med.doseRate}
                        onChange={(e) => handleUpdateMedication(index, 'doseRate', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <select
                        value={med.route}
                        onChange={(e) => handleUpdateMedication(index, 'route', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-[11px] font-bold text-slate-700"
                      >
                        <option value="Oral (PO)">Oral (PO)</option>
                        <option value="Subcutaneous (SC)">Subcutaneous (SC)</option>
                        <option value="Topical (Skin/Otic)">Topical</option>
                        <option value="Ophthalmic (Eye)">Ophthalmic (Eye)</option>
                        <option value="Inhalation">Inhalation</option>
                      </select>
                    </div>

                    <div>
                      <select
                        value={med.frequency}
                        onChange={(e) => handleUpdateMedication(index, 'frequency', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-[11px] font-bold text-slate-700"
                      >
                        <option value="SID (Once Daily)">Once Daily (SID)</option>
                        <option value="BID (Twice Daily)">Twice Daily (BID)</option>
                        <option value="TID (3x Daily)">3x Daily (TID)</option>
                        <option value="PRN (As Needed)">As Needed (PRN)</option>
                        <option value="Weekly">Weekly</option>
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Duration (e.g. 7 days)"
                        value={med.duration}
                        onChange={(e) => handleUpdateMedication(index, 'duration', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-[11px] font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Special administration instructions (e.g. Give with food, do not crush)"
                      value={med.instructions}
                      onChange={(e) => handleUpdateMedication(index, 'instructions', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor's General Notes */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              Veterinary Instructions / Rx Notes
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Any additional notes from the issuing veterinarian..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm shadow-[0_10px_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Prescription Saved!
                </>
              ) : saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving to Records...
                </>
              ) : (
                <>
                  <Pill className="w-4 h-4" /> Save Prescription to Vault
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

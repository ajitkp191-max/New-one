import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Scale, Calendar, Check, AlertCircle, TrendingUp, Sparkles, Plus, Minus, Info } from 'lucide-react';
import { PetProfile, WeightLogEntry } from '../../types';
import { dbService } from '../../services/db';
import Realistic3DEmoji from '../Realistic3DEmoji';

interface EditPetAgeWeightModalProps {
  pet: PetProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedPet: PetProfile) => void;
}

export default function EditPetAgeWeightModal({
  pet,
  isOpen,
  onClose,
  onUpdated
}: EditPetAgeWeightModalProps) {
  const [weight, setWeight] = useState<number>(pet.weight);
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [dateOfBirth, setDateOfBirth] = useState<string>(pet.dateOfBirth || '2021-04-12');
  const [weightNote, setWeightNote] = useState<string>('Home weigh-in by owner');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Helper to compute age string from date of birth
  const computeAgeDetails = (dobStr: string) => {
    if (!dobStr) return { years: 0, months: 0, text: 'Unknown' };
    const dob = new Date(dobStr);
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years <= 0 && months <= 0) return { years: 0, months: 0, text: 'Under 1 month' };
    if (years === 0) return { years: 0, months, text: `${months} month${months > 1 ? 's' : ''}` };
    if (months === 0) return { years, months: 0, text: `${years} year${years > 1 ? 's' : ''}` };
    return { years, months, text: `${years} yr${years > 1 ? 's' : ''} ${months} mo${months > 1 ? 's' : ''}` };
  };

  const ageDetails = computeAgeDetails(dateOfBirth);

  // Body condition assessment helper
  const getBCSAssessment = (species: string, currentWeight: number) => {
    if (species === 'dog') {
      if (currentWeight < 18) return { bcs: 3, label: 'Slightly Lean', color: 'text-amber-600 bg-amber-50 border-amber-200' };
      if (currentWeight <= 27) return { bcs: 5, label: 'Ideal Body Condition', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      return { bcs: 7, label: 'Heavy / Overweight', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    } else {
      if (currentWeight < 3.5) return { bcs: 3, label: 'Slightly Lean', color: 'text-amber-600 bg-amber-50 border-amber-200' };
      if (currentWeight <= 5.8) return { bcs: 5, label: 'Ideal Body Condition', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      return { bcs: 7, label: 'Heavy / Overweight', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    }
  };

  const bcs = getBCSAssessment(pet.species, weight);

  const handleAdjustWeight = (delta: number) => {
    setWeight(prev => {
      const next = Math.round((prev + delta) * 10) / 10;
      return next > 0.5 ? next : 0.5;
    });
  };

  const handleQuickAgeYears = (targetYears: number) => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - targetYears);
    setDateOfBirth(d.toISOString().split('T')[0]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updated = dbService.updatePetAgeWeight(pet.petId, {
        weight,
        dateOfBirth,
        notes: weightNote
      });

      if (updated) {
        dbService.logAction(
          pet.ownerId,
          'Pet Owner',
          'pet_owner',
          `Updated age and weight for pet ${pet.name} to ${weight}kg, DOB: ${dateOfBirth}`,
          'pets',
          pet.petId,
          'success'
        );

        setSaveSuccess(true);
        setTimeout(() => {
          onUpdated(updated);
          onClose();
        }, 600);
      }
    } catch (err) {
      console.error('Failed to update pet:', err);
    } finally {
      setSaving(false);
    }
  };

  const displayWeight = unit === 'kg' ? weight : Math.round((weight * 2.20462) * 10) / 10;
  const history: WeightLogEntry[] = pet.weightHistory || [
    { date: '2026-04-10', weight: pet.weight - 0.5, notes: 'Previous check' },
    { date: '2026-08-01', weight: pet.weight, notes: 'Last recorded' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[36px] shadow-[0_25px_70px_rgba(0,0,0,0.25)] border border-slate-100 max-w-xl w-full overflow-hidden relative my-8"
      >
        {/* Modal Top Header with 3D Accent */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-teal-500 via-cyan-600 to-sky-600 text-white overflow-hidden">
          {/* Background decorative circles */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-cyan-400/20 blur-xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/30">
              <Realistic3DEmoji emoji={pet.species === 'cat' ? 'cat' : pet.species === 'dog' ? 'dog' : 'paw'} size="lg" animated />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-black tracking-wider uppercase backdrop-blur-md">
                  Vitals Calibration
                </span>
                <span className="text-white/80 text-xs font-semibold">{pet.breed}</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white mt-1">
                Edit {pet.name}'s Age & Weight
              </h2>
              <p className="text-white/80 text-xs mt-0.5">
                Keep {pet.name}'s biometrics accurate for proper dosage and wellness scoring.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
          {/* Weight Section */}
          <div className="bg-slate-50/80 rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/30">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">Current Weight</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Calibrated body mass index</p>
                </div>
              </div>

              {/* Unit Toggle */}
              <div className="flex bg-slate-200/70 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUnit('kg')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    unit === 'kg' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  KG
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('lbs')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    unit === 'lbs' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  LBS
                </button>
              </div>
            </div>

            {/* Stepper + Display */}
            <div className="flex items-center justify-center gap-4 py-2">
              <button
                type="button"
                onClick={() => handleAdjustWeight(-0.5)}
                className="w-11 h-11 rounded-2xl bg-white text-slate-700 hover:bg-teal-50 hover:text-teal-600 border border-slate-200 shadow-sm flex items-center justify-center font-black transition-all active:scale-95"
                title="-0.5 kg"
              >
                -0.5
              </button>
              <button
                type="button"
                onClick={() => handleAdjustWeight(-0.1)}
                className="w-10 h-10 rounded-2xl bg-white text-slate-700 hover:bg-teal-50 hover:text-teal-600 border border-slate-200 shadow-sm flex items-center justify-center transition-all active:scale-95"
                title="-0.1 kg"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="relative px-6 py-2 bg-white rounded-2xl border-2 border-teal-500/30 shadow-inner flex items-baseline gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="0.2"
                  max="120"
                  value={displayWeight}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setWeight(unit === 'kg' ? val : Math.round((val / 2.20462) * 10) / 10);
                  }}
                  className="w-24 text-3xl font-black text-slate-900 text-center focus:outline-none bg-transparent"
                />
                <span className="text-sm font-black text-teal-600">{unit}</span>
              </div>

              <button
                type="button"
                onClick={() => handleAdjustWeight(0.1)}
                className="w-10 h-10 rounded-2xl bg-white text-slate-700 hover:bg-teal-50 hover:text-teal-600 border border-slate-200 shadow-sm flex items-center justify-center transition-all active:scale-95"
                title="+0.1 kg"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleAdjustWeight(0.5)}
                className="w-11 h-11 rounded-2xl bg-white text-slate-700 hover:bg-teal-50 hover:text-teal-600 border border-slate-200 shadow-sm flex items-center justify-center font-black transition-all active:scale-95"
                title="+0.5 kg"
              >
                +0.5
              </button>
            </div>

            {/* BCS Indicator Badge */}
            <div className={`p-3 rounded-2xl border flex items-center justify-between ${bcs.color}`}>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span className="text-xs font-black">BCS: {bcs.bcs}/9 — {bcs.label}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                {pet.species === 'dog' ? 'Target: 22-26 kg' : 'Target: 4.5-5.5 kg'}
              </span>
            </div>

            {/* Weigh-in reason note */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                Weigh-In Note / Context
              </label>
              <input
                type="text"
                value={weightNote}
                onChange={(e) => setWeightNote(e.target.value)}
                placeholder="e.g. Monthly check, post-diet update, clinic visit"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Age & Date of Birth Section */}
          <div className="bg-slate-50/80 rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/30">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">Age & Birthday</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Calculates life stage and vaccination schedule</p>
                </div>
              </div>

              {/* Calculated Age Pill */}
              <div className="px-3.5 py-1.5 rounded-xl bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs font-black">
                {ageDetails.text}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 shadow-sm"
              />
            </div>

            {/* Quick age shortcuts */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                Quick Preset:
              </span>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 7, 10].map(y => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => handleQuickAgeYears(y)}
                    className="px-3 py-1 rounded-lg bg-white hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 border border-slate-200 text-xs font-black transition-all shadow-xs"
                  >
                    {y} {y === 1 ? 'year' : 'years'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Weight Trend Sparkline / History */}
          {history.length > 0 && (
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-teal-600" /> Recent Weight Log
                </span>
                <span className="text-[10px] font-bold text-teal-600">Stable Biometrics</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {history.slice(-3).map((item, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div className="text-[10px] text-slate-400 font-bold">{item.date}</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">{item.weight} kg</div>
                    {item.notes && <div className="text-[9px] text-slate-500 truncate">{item.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
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
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-black text-sm shadow-[0_10px_20px_rgba(20,184,166,0.35)] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Saved!
                </>
              ) : saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Save Updated Vitals
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

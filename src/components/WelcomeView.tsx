import React, { useState } from 'react';
import { 
  Activity, ShieldCheck, User, Sparkles, Key, Check, Info, Stethoscope, 
  Building2, Award, MapPin, Phone, Heart, Calendar, FileText, CheckCircle2, 
  AlertCircle, Clock, PawPrint, Briefcase, ArrowLeft, ArrowRight, Smartphone, Download
} from 'lucide-react';
import { UserRole } from '../types';
import { authService } from '../services/auth';
import { motion } from 'motion/react';
import ThreeDScene from './ThreeDScene';
import threedPetDog from '../assets/images/realistic_3d_dog_1789111353728.jpg';
import threedPetCat from '../assets/images/realistic_3d_cat_1789111372620.jpg';
import threedPetBird from '../assets/images/threed_pet_bird_1789062504097.jpg';
import doctorHero from '../assets/images/threed_male_doctor_1789094307147.jpg';
import propStethoscope from '../assets/images/threed_stethoscope_1789095012554.jpg';
import propPills from '../assets/images/threed_medical_pills_1789095031340.jpg';
import propClipboard from '../assets/images/threed_clipboard_1789095043609.jpg';
import propFirstAid from '../assets/images/realistic_3d_medkit_1789111391618.jpg';
import Realistic3DEmoji from './Realistic3DEmoji';
import Realistic3DIcon from './Realistic3DIcon';

interface WelcomeViewProps {
  onLoginSuccess: () => void;
  onOpenInstallModal?: () => void;
}

export default function WelcomeView({ onLoginSuccess, onOpenInstallModal }: WelcomeViewProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('pet_owner');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  
  // Registration flow state & step tracker
  const [registrationMode, setRegistrationMode] = useState(false);
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [showAuthFlow, setShowAuthFlow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [perfMode, setPerfMode] = useState<'full' | 'reduced-motion' | 'low-perf' | 'disabled'>('full');

  // Common Profile Fields
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [cityInput, setCityInput] = useState('');

  // Doctor-Specific Registration Details
  const [registrationNumberInput, setRegistrationNumberInput] = useState('');
  const [qualificationInput, setQualificationInput] = useState('DVM');
  const [specializationInput, setSpecializationInput] = useState('General Veterinary Medicine');
  const [experienceInput, setExperienceInput] = useState('4');
  const [clinicNameInput, setClinicNameInput] = useState('VetPulse Central Animal Hospital');
  const [consultationTimingsInput, setConsultationTimingsInput] = useState('Mon - Fri (09:00 AM - 05:00 PM)');

  // Pet Owner & Patient Companion Details
  const [emergencyContactInput, setEmergencyContactInput] = useState('');
  const [emergencyPhoneInput, setEmergencyPhoneInput] = useState('');
  const [preferredClinicInput, setPreferredClinicInput] = useState('VetPulse Central Animal Hospital');
  const [petNameInput, setPetNameInput] = useState('');
  const [petSpeciesInput, setPetSpeciesInput] = useState<'dog' | 'cat' | 'other'>('dog');
  const [petBreedInput, setPetBreedInput] = useState('Golden Retriever');
  const [petSexInput, setPetSexInput] = useState<'neutered_male' | 'spayed_female' | 'male' | 'female'>('neutered_male');
  const [petDobInput, setPetDobInput] = useState('2023-04-15');
  const [petWeightInput, setPetWeightInput] = useState('14.5');

  // Practice Owner / Admin Specific Details
  const [facilityTypeInput, setFacilityTypeInput] = useState('Multi-Specialty Veterinary Hospital');
  const [clinicLicenseInput, setClinicLicenseInput] = useState('');

  // Non-blocking UI alerts
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const handleDemoLogin = async (role: UserRole) => {
    setLoading(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      authService.simulateRoleSwitch(role);
      onLoginSuccess();
    } catch (err: any) {
      setFormError(err.message || "Failed to switch to demo role.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!nameInput.trim() || !phoneInput.trim() || !emailInput.trim() || !passwordInput.trim()) {
      setFormError("Please fill in all mandatory account details (Name, Phone, Email, and Password).");
      return;
    }
    setRegStep(2);
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!emailInput) {
      setFormError("Please enter your account email address.");
      return;
    }
    setLoading(true);

    try {
      let additionalData = undefined;

      if (registrationMode) {
        if (selectedRole === 'doctor') {
          if (!registrationNumberInput.trim()) {
            setFormError("Veterinary Medical Registration / License Number is mandatory for doctor registration.");
            setLoading(false);
            return;
          }

          additionalData = {
            name: nameInput.trim(),
            phoneNumber: phoneInput.trim(),
            address: addressInput.trim(),
            city: cityInput.trim(),
            clinicName: clinicNameInput.trim(),
            registrationNumber: registrationNumberInput.trim(),
            qualification: qualificationInput.trim(),
            specialization: specializationInput.trim(),
            experience: Number(experienceInput) || 1,
            consultationTimings: consultationTimingsInput.trim(),
          };
        } else if (selectedRole === 'pet_owner') {
          additionalData = {
            name: nameInput.trim(),
            phoneNumber: phoneInput.trim(),
            address: addressInput.trim(),
            city: cityInput.trim(),
            emergencyContact: emergencyContactInput.trim() || nameInput.trim(),
            emergencyPhone: emergencyPhoneInput.trim() || phoneInput.trim(),
            preferredClinic: preferredClinicInput.trim(),
            initialPet: petNameInput.trim() ? {
              name: petNameInput.trim(),
              species: petSpeciesInput,
              breed: petBreedInput.trim() || 'Companion',
              sex: petSexInput,
              dateOfBirth: petDobInput,
              weight: parseFloat(petWeightInput) || 10.0,
            } : undefined
          };
        } else {
          // Practice Owner / Admin
          additionalData = {
            name: nameInput.trim(),
            phoneNumber: phoneInput.trim(),
            clinicName: clinicNameInput.trim() || 'VetPulse Premium Medical Hub',
            registrationNumber: clinicLicenseInput.trim() || 'CLINIC-LIC-2026',
            address: addressInput.trim(),
            city: cityInput.trim(),
          };
        }
      }

      await authService.loginWithEmail(emailInput, selectedRole, passwordInput, registrationMode, additionalData);
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Authentication failed. Please check credentials or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setFormError(null);
    setFormSuccess(null);
    if (!emailInput) {
      setFormError("Please enter your email address first to reset your password.");
      return;
    }
    try {
      await authService.resetPassword(emailInput);
      setFormSuccess("Password reset email sent. Please check your inbox.");
    } catch (err: any) {
      setFormError(err.message || "Failed to send reset email.");
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col items-center justify-start py-8 px-4 md:px-8" id="welcome-view-container">
      {/* Pure White Background Grid Pattern for Medical Clinical Precision */}
      <div className="absolute inset-0 z-0 bg-white pointer-events-none" />

      {/* Floating 3D Medical Props (Realistic Blended Claymorphic Style) */}
      <div className="absolute top-10 left-6 z-1" style={{ transform: 'rotate(6deg)' }}>
        <Realistic3DEmoji emoji="🩺" />
      </div>
      <div className="absolute bottom-20 right-10 z-1" style={{ transform: 'rotate(-10deg)' }}>
        <Realistic3DEmoji emoji="💊" />
      </div>

      <div className="absolute top-20 right-8 z-1">
        <Realistic3DEmoji emoji="📋" />
      </div>
      <div className="absolute bottom-10 left-14 z-1" style={{ transform: 'rotate(8deg)' }}>
        <Realistic3DEmoji emoji="🚑" />
      </div>

      {/* Main Core Header App Layout */}
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10 mt-4">
        
        {/* Left Side: 3D Animated Hero Presentation */}
        <div className={`flex-1 flex flex-col items-center lg:items-start text-center lg:text-left transition-all duration-500 ${showAuthFlow ? 'opacity-30 lg:opacity-100 scale-95 lg:scale-100' : 'opacity-100 scale-100'}`}>
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <Realistic3DIcon icon={Activity} color="cyan" size="md" />
              <h2 className="text-3xl font-black tracking-tight text-slate-900">VetPulse Pro</h2>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 leading-[1.1]">
              Your Health <br /> 
              <span className="text-cyan-500">Our Priority</span>
            </h1>
            <p className="text-slate-500 text-base max-w-md leading-relaxed font-medium">
              Advanced healthcare for a better and healthier companion. Experience our clinical-grade animated 3D veterinary care system.
            </p>
          </div>

          {/* 3D Doctor Hero Image with Interactive Pedestal & Animated Companion Badges */}
          <div className="relative w-full max-w-sm aspect-square mb-6 flex items-center justify-center">
            {/* Animated Background Pedestal Glow */}
            <motion.div 
              className="absolute w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div 
              className="relative z-10 w-full h-full flex items-center justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: [0, -10, 0] 
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <img 
                src={doctorHero} 
                alt="3D Doctor" 
                className="w-full h-full object-contain mix-blend-multiply drop-shadow-[0_24px_48px_rgba(0,0,0,0.12)]"
              />
            </motion.div>

            {/* Floating 3D Dog Companion Badge */}
            <motion.div
              className="absolute -bottom-2 -left-4 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-[0_16px_32px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center gap-3 z-20"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-50 shadow-inner">
                <img src={threedPetDog} alt="3D Pet Dog" className="w-full h-full object-cover" />
              </div>
              <div className="pr-2">
                <span className="block text-[11px] font-black text-slate-900">Bella (Golden)</span>
                <span className="block text-[9px] font-bold text-emerald-500">● Vitals Normal</span>
              </div>
            </motion.div>

            {/* Floating 3D Cat Companion Badge */}
            <motion.div
              className="absolute top-6 -right-4 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-[0_16px_32px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center gap-3 z-20"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-50 shadow-inner">
                <img src={threedPetCat} alt="3D Pet Cat" className="w-full h-full object-cover" />
              </div>
              <div className="pr-2">
                <span className="block text-[11px] font-black text-slate-900">Luna (Siamese)</span>
                <span className="block text-[9px] font-bold text-cyan-500">● Checkup Booked</span>
              </div>
            </motion.div>
          </div>

          {!showAuthFlow && (
            <div className="w-full space-y-5 flex flex-col items-center lg:items-start">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <button 
                  onClick={() => setShowAuthFlow(true)}
                  className="px-8 py-4 bg-cyan-500 text-white rounded-[24px] font-black text-lg shadow-[0_12px_24px_rgba(0,188,212,0.4)] hover:bg-cyan-600 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Get Started →
                </button>

                {onOpenInstallModal && (
                  <button
                    onClick={onOpenInstallModal}
                    className="px-6 py-4 bg-slate-900/90 hover:bg-slate-900 text-white rounded-[24px] font-bold text-base border border-slate-700 shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <Smartphone className="w-5 h-5 text-teal-400" />
                    <span>Download on Mobile</span>
                  </button>
                )}
              </div>

              {/* Instant 1-Click Demo Access Cards */}
              <div className="w-full max-w-md pt-3">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Instant 1-Click Clinical Demo Portals
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('doctor')}
                    className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-cyan-400 shadow-sm hover:shadow-md transition-all text-left group cursor-pointer"
                  >
                    <div className="text-xl mb-1 group-hover:scale-110 transition-transform">🩺</div>
                    <div className="font-bold text-xs text-slate-900">Veterinarian</div>
                    <div className="text-[10px] text-slate-400">Dr. Sarah Mitchell</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('pet_owner')}
                    className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-cyan-400 shadow-sm hover:shadow-md transition-all text-left group cursor-pointer"
                  >
                    <div className="text-xl mb-1 group-hover:scale-110 transition-transform">🐾</div>
                    <div className="font-bold text-xs text-slate-900">Pet Parent</div>
                    <div className="text-[10px] text-slate-400">Emily (Luna & Max)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('owner')}
                    className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-cyan-400 shadow-sm hover:shadow-md transition-all text-left group cursor-pointer"
                  >
                    <div className="text-xl mb-1 group-hover:scale-110 transition-transform">👑</div>
                    <div className="font-bold text-xs text-slate-900">Hospital Admin</div>
                    <div className="text-[10px] text-slate-400">Dr. Arthur Vance</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Comprehensive Auth & Registration Modal */}
        {showAuthFlow && (
          <div className="w-full lg:w-[540px] shrink-0 fixed lg:relative inset-x-0 bottom-0 top-0 lg:top-auto lg:bottom-auto lg:inset-x-auto z-50 flex items-center justify-center p-4 bg-black/30 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none">
            <motion.div 
              className="bg-white/95 backdrop-blur-2xl rounded-[36px] border border-slate-200/80 shadow-[0_30px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8 w-full max-h-[92vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="space-y-5">
                
                {/* Header with Mode Toggle & Close Button */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-black uppercase tracking-wider border border-cyan-200/60">
                        {registrationMode ? 'New Account Registration' : 'Clinical Access Verification'}
                      </span>
                    </div>
                    <h3 className="font-black text-2xl text-slate-900 mt-1">
                      {registrationMode ? 'Create Your Account' : 'Sign In'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowAuthFlow(false)} 
                    className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Close Dialog"
                  >
                    ✕
                  </button>
                </div>

                {/* Inline Alert / Notification Messages */}
                {formError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span className="flex-1">{formError}</span>
                  </div>
                )}
                {formSuccess && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-2xl flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span className="flex-1">{formSuccess}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-b border-slate-100 pb-3">
                  <button 
                    onClick={() => {
                      setRegistrationMode(!registrationMode);
                      setRegStep(1);
                    }}
                    className="text-xs text-cyan-600 hover:text-cyan-700 font-bold hover:underline flex items-center gap-1"
                    id="toggle-auth-mode-btn"
                  >
                    {registrationMode ? '← Already have an account? Sign In' : 'New to VetPulse? Register here →'}
                  </button>
                  {registrationMode && (
                    <span className="text-[11px] font-black uppercase text-slate-400">
                      Step {regStep} of 2
                    </span>
                  )}
                </div>

                {/* Role Selectors Pills */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Select Registration Role</span>
                    <span className="text-cyan-600 font-bold lowercase">{selectedRole.replace('_', ' ')}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1.5 rounded-[20px] border border-slate-200/60">
                    {(['pet_owner', 'doctor', 'owner'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setSelectedRole(r);
                          setRegStep(1);
                        }}
                        className={`py-2.5 rounded-[16px] text-xs font-black uppercase transition-all duration-200 flex flex-col items-center gap-1 ${
                          selectedRole === r 
                            ? 'bg-cyan-500 text-white shadow-[0_4px_12px_rgba(0,188,212,0.25)] scale-[1.02]' 
                            : 'text-slate-600 hover:bg-slate-200/60'
                        }`}
                        id={`select-role-${r}-btn`}
                      >
                        {r === 'owner' ? 'Practice Admin' : r === 'doctor' ? 'Veterinarian' : 'Pet Owner'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ================= REGISTRATION MODE FORM ================= */}
                {registrationMode ? (
                  <div className="space-y-4 pt-1">
                    
                    {/* Stepper Header Pills */}
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setRegStep(1)}
                        className={`flex-1 py-1.5 px-3 rounded-xl border text-center transition ${
                          regStep === 1 
                            ? 'bg-cyan-50 border-cyan-300 text-cyan-800' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        1. Account & Contact
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (nameInput && phoneInput && emailInput && passwordInput) {
                            setRegStep(2);
                          } else {
                            alert("Please fill in Name, Phone, Email, and Password first.");
                          }
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-xl border text-center transition ${
                          regStep === 2 
                            ? 'bg-cyan-50 border-cyan-300 text-cyan-800' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        2. {selectedRole === 'doctor' ? 'Doctor Credentials' : selectedRole === 'pet_owner' ? 'Pet & Companion Info' : 'Clinic Details'}
                      </button>
                    </div>

                    {/* Step 1: Account, Personal & Contact Information */}
                    {regStep === 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-3.5"
                      >
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                            <span>Full Name <span className="text-rose-500">*</span></span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {selectedRole === 'doctor' ? 'Include Dr. title if preferred' : 'Primary account holder'}
                            </span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                              <User className="h-4 w-4" />
                            </span>
                            <input
                              type="text"
                              value={nameInput}
                              onChange={(e) => setNameInput(e.target.value)}
                              placeholder={selectedRole === 'doctor' ? "Dr. Sarah Mitchell" : "Emily Watson"}
                              required
                              className="w-full bg-slate-50 border border-slate-200 rounded-[18px] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-slate-800"
                              id="reg-name-input"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Phone / Mobile <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                <Phone className="h-4 w-4" />
                              </span>
                              <input
                                type="tel"
                                value={phoneInput}
                                onChange={(e) => setPhoneInput(e.target.value)}
                                placeholder="+1 (555) 234-5678"
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-[18px] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-slate-800"
                                id="reg-phone-input"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              City / Region
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                <MapPin className="h-4 w-4" />
                              </span>
                              <input
                                type="text"
                                value={cityInput}
                                onChange={(e) => setCityInput(e.target.value)}
                                placeholder="New York, NY"
                                className="w-full bg-slate-50 border border-slate-200 rounded-[18px] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-slate-800"
                                id="reg-city-input"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Physical Street Address
                          </label>
                          <input
                            type="text"
                            value={addressInput}
                            onChange={(e) => setAddressInput(e.target.value)}
                            placeholder="742 Evergreen Terrace"
                            className="w-full bg-slate-50 border border-slate-200 rounded-[18px] py-2.5 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-slate-800"
                            id="reg-address-input"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Email Address <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="email"
                              value={emailInput}
                              onChange={(e) => setEmailInput(e.target.value)}
                              placeholder="name@example.com"
                              required
                              className="w-full bg-slate-50 border border-slate-200 rounded-[18px] py-2.5 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-slate-800"
                              id="reg-email-input"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Password <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                <Key className="h-4 w-4" />
                              </span>
                              <input
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-[18px] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-slate-800"
                                id="reg-password-input"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="w-full py-3.5 bg-slate-900 text-white rounded-[20px] text-sm font-black tracking-wide hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 mt-3 active:scale-98"
                          id="reg-next-step-btn"
                        >
                          <span>Continue to {selectedRole === 'doctor' ? 'Professional Credentials' : selectedRole === 'pet_owner' ? 'Companion Information' : 'Facility Credentials'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}

                    {/* Step 2: Role-Specific Clinical / Companion / Facility Details */}
                    {regStep === 2 && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-3.5"
                      >
                        {/* ================= DOCTOR ESSENTIAL DETAILS ================= */}
                        {selectedRole === 'doctor' && (
                          <div className="space-y-3.5">
                            <div className="p-3 bg-cyan-50/70 rounded-2xl border border-cyan-100 flex items-start gap-2 text-xs text-cyan-900">
                              <Stethoscope className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                              <p>
                                <strong>Medical Registry Mandate:</strong> Please provide your official state or national veterinary licensing board registration number and primary qualifications.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Registration / License Number <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                    <Award className="h-4 w-4 text-cyan-500" />
                                  </span>
                                  <input
                                    type="text"
                                    value={registrationNumberInput}
                                    onChange={(e) => setRegistrationNumberInput(e.target.value)}
                                    placeholder="VET-LIC-89231"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[18px] py-2.5 pl-10 pr-4 text-sm font-mono focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-semibold text-slate-900"
                                    id="reg-doc-license"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Highest Qualification <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={qualificationInput}
                                  onChange={(e) => setQualificationInput(e.target.value)}
                                  placeholder="DVM, BVSc & AH, DACVIM"
                                  required
                                  className="w-full bg-slate-50 border border-slate-200 rounded-[18px] py-2.5 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-slate-800"
                                  id="reg-doc-qualification"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Clinical Specialization <span className="text-rose-500">*</span>
                                </label>
                                <select
                                  value={specializationInput}
                                  onChange={(e) => setSpecializationInput(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-[18px] py-2.5 px-3 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-slate-800"
                                  id="reg-doc-specialization"
                                >
                                  <option value="General Veterinary Medicine">General Veterinary Medicine</option>
                                  <option value="Small Animal Soft Tissue & Orthopedic Surgery">Small Animal Surgery</option>
                                  <option value="Veterinary Internal Medicine">Internal Medicine</option>
                                  <option value="Emergency & Critical Care">Emergency & Critical Care</option>
                                  <option value="Feline Internal Medicine">Feline Practice</option>
                                  <option value="Exotic Animal & Avian Medicine">Exotics & Avian</option>
                                  <option value="Veterinary Dermatology">Veterinary Dermatology</option>
                                  <option value="Veterinary Cardiology">Veterinary Cardiology</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Clinical Experience (Years) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="50"
                                  value={experienceInput}
                                  onChange={(e) => setExperienceInput(e.target.value)}
                                  placeholder="5"
                                  required
                                  className="w-full bg-slate-50 border border-slate-200 rounded-[18px] py-2.5 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-slate-800"
                                  id="reg-doc-experience"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Primary Affiliated Hospital / Practice Name <span className="text-rose-500">*</span>
                              </label>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                  <Building2 className="h-4 w-4" />
                                </span>
                                <input
                                  type="text"
                                  value={clinicNameInput}
                                  onChange={(e) => setClinicNameInput(e.target.value)}
                                  placeholder="St. Jude Companion Animal Hospital"
                                  required
                                  className="w-full bg-slate-50 border border-slate-200 rounded-[18px] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-slate-800"
                                  id="reg-doc-clinic"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Clinical Consultation Schedule
                              </label>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                  <Clock className="h-4 w-4" />
                                </span>
                                <input
                                  type="text"
                                  value={consultationTimingsInput}
                                  onChange={(e) => setConsultationTimingsInput(e.target.value)}
                                  placeholder="Mon - Fri (09:00 AM - 05:00 PM)"
                                  className="w-full bg-slate-50 border border-slate-200 rounded-[18px] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-slate-800"
                                  id="reg-doc-timings"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ================= PET OWNER ESSENTIAL DETAILS ================= */}
                        {selectedRole === 'pet_owner' && (
                          <div className="space-y-3.5">
                            {/* Emergency Contact */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Emergency Contact Person
                                </label>
                                <input
                                  type="text"
                                  value={emergencyContactInput}
                                  onChange={(e) => setEmergencyContactInput(e.target.value)}
                                  placeholder="e.g. John Watson (Spouse)"
                                  className="w-full bg-slate-50 border border-slate-200 rounded-[18px] py-2.5 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-slate-800"
                                  id="reg-owner-emergency-contact"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Emergency Contact Phone
                                </label>
                                <input
                                  type="tel"
                                  value={emergencyPhoneInput}
                                  onChange={(e) => setEmergencyPhoneInput(e.target.value)}
                                  placeholder="+1 (555) 987-6543"
                                  className="w-full bg-slate-50 border border-slate-200 rounded-[18px] py-2.5 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-slate-800"
                                  id="reg-owner-emergency-phone"
                                />
                              </div>
                            </div>

                            {/* Initial Companion / Pet Details Card */}
                            <div className="p-4 bg-gradient-to-br from-slate-50 to-cyan-50/50 rounded-2xl border border-slate-200/80 space-y-3">
                              <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wide">
                                <PawPrint className="w-4 h-4 text-cyan-600" />
                                <span>Register Your First Companion (Optional)</span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Provide basic details now so your veterinarian can review previous records and schedule routine checkups immediately.
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                    Pet / Companion Name
                                  </label>
                                  <input
                                    type="text"
                                    value={petNameInput}
                                    onChange={(e) => setPetNameInput(e.target.value)}
                                    placeholder="e.g. Luna"
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-cyan-500 font-medium"
                                    id="reg-pet-name"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                    Species
                                  </label>
                                  <select
                                    value={petSpeciesInput}
                                    onChange={(e) => setPetSpeciesInput(e.target.value as any)}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-cyan-500 font-medium"
                                    id="reg-pet-species"
                                  >
                                    <option value="dog">Canine (Dog)</option>
                                    <option value="cat">Feline (Cat)</option>
                                    <option value="other">Avian / Other Pet</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                    Breed
                                  </label>
                                  <input
                                    type="text"
                                    value={petBreedInput}
                                    onChange={(e) => setPetBreedInput(e.target.value)}
                                    placeholder="e.g. Golden Retriever"
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-cyan-500 font-medium"
                                    id="reg-pet-breed"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                    Sex & Reproductive Status
                                  </label>
                                  <select
                                    value={petSexInput}
                                    onChange={(e) => setPetSexInput(e.target.value as any)}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-cyan-500 font-medium"
                                    id="reg-pet-sex"
                                  >
                                    <option value="neutered_male">Neutered Male</option>
                                    <option value="spayed_female">Spayed Female</option>
                                    <option value="male">Intact Male</option>
                                    <option value="female">Intact Female</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                    Date of Birth / Est. Age
                                  </label>
                                  <input
                                    type="date"
                                    value={petDobInput}
                                    onChange={(e) => setPetDobInput(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-cyan-500 font-medium"
                                    id="reg-pet-dob"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                    Weight (in kg)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={petWeightInput}
                                    onChange={(e) => setPetWeightInput(e.target.value)}
                                    placeholder="14.5"
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-cyan-500 font-medium"
                                    id="reg-pet-weight"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ================= PRACTICE OWNER / ADMIN ESSENTIAL DETAILS ================= */}
                        {selectedRole === 'owner' && (
                          <div className="space-y-3.5">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Clinic / Hospital Official Entity Name <span className="text-rose-500">*</span>
                              </label>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                  <Building2 className="h-4 w-4" />
                                </span>
                                <input
                                  type="text"
                                  value={clinicNameInput}
                                  onChange={(e) => setClinicNameInput(e.target.value)}
                                  placeholder="VetPulse Specialty Animal Hospital"
                                  required
                                  className="w-full bg-slate-50 border border-slate-200 rounded-[18px] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-slate-800"
                                  id="reg-admin-clinic-name"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Facility Operational Type <span className="text-rose-500">*</span>
                                </label>
                                <select
                                  value={facilityTypeInput}
                                  onChange={(e) => setFacilityTypeInput(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-[18px] py-2.5 px-3 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-slate-800"
                                  id="reg-admin-facility-type"
                                >
                                  <option value="Multi-Specialty Veterinary Hospital">Multi-Specialty Veterinary Hospital</option>
                                  <option value="24/7 Emergency & Critical Care Center">24/7 Emergency Care</option>
                                  <option value="Primary Companion Animal Clinic">Primary Companion Animal Clinic</option>
                                  <option value="Veterinary Diagnostic & Surgery Center">Diagnostic & Surgery Center</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Practice License / Tax ID <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={clinicLicenseInput}
                                  onChange={(e) => setClinicLicenseInput(e.target.value)}
                                  placeholder="HOSP-REG-94821"
                                  required
                                  className="w-full bg-slate-50 border border-slate-200 rounded-[18px] py-2.5 px-4 text-sm font-mono focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-semibold text-slate-900"
                                  id="reg-admin-license"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Navigation Buttons: Back + Submit */}
                        <div className="flex gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={() => setRegStep(1)}
                            className="py-3 px-4 rounded-[20px] bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition flex items-center gap-1.5"
                            id="reg-back-btn"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleCustomLogin}
                            disabled={loading}
                            className="flex-1 py-3.5 bg-cyan-500 text-white rounded-[20px] text-sm font-black tracking-wide hover:bg-cyan-600 transition-all shadow-[0_10px_20px_rgba(0,188,212,0.3)] flex items-center justify-center gap-2 active:scale-98"
                            id="reg-final-submit-btn"
                          >
                            {loading ? (
                              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                              <>
                                <ShieldCheck className="w-4 h-4" />
                                <span>Complete Registration & Enter</span>
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  /* ================= SIGN IN MODE FORM ================= */
                  <form onSubmit={handleCustomLogin} className="space-y-3.5 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                          <User className="h-4 w-4" />
                        </span>
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="e.g. name@vetpulse.com"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-[20px] py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-slate-800"
                          id="auth-email-input"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1 ml-1">
                        <label className="block text-xs font-bold text-slate-700">Password</label>
                        <button 
                          type="button" 
                          onClick={handleForgotPassword}
                          className="text-[11px] text-cyan-600 hover:underline font-bold"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                          <Key className="h-4 w-4" />
                        </span>
                        <input
                          type="password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-[20px] py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-slate-800"
                          id="auth-password-input"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-cyan-500 text-white rounded-[24px] text-base font-black tracking-wide hover:bg-cyan-600 transition-all duration-200 shadow-[0_12px_24px_rgba(0,188,212,0.3)] flex items-center justify-center gap-2 mt-2 active:scale-98 cursor-pointer"
                      id="auth-submit-btn"
                    >
                      {loading ? (
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        'Verify Credentials & Enter'
                      )}
                    </button>

                    {/* Quick Demo Fillers for Reviewers */}
                    <div className="pt-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-center">
                        Or enter with demo credentials
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEmailInput('sarah.mitchell@vetpulse.com');
                            setPasswordInput('doctor123');
                            setSelectedRole('doctor');
                            handleDemoLogin('doctor');
                          }}
                          className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-cyan-50 border border-slate-200 text-[10px] font-bold text-slate-700 hover:text-cyan-700 transition cursor-pointer text-center"
                        >
                          🩺 Doctor
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmailInput('emily.watson@gmail.com');
                            setPasswordInput('owner123');
                            setSelectedRole('pet_owner');
                            handleDemoLogin('pet_owner');
                          }}
                          className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-cyan-50 border border-slate-200 text-[10px] font-bold text-slate-700 hover:text-cyan-700 transition cursor-pointer text-center"
                        >
                          🐾 Pet Parent
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmailInput('admin@vetpulse.com');
                            setPasswordInput('admin123');
                            setSelectedRole('owner');
                            handleDemoLogin('owner');
                          }}
                          className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-cyan-50 border border-slate-200 text-[10px] font-bold text-slate-700 hover:text-cyan-700 transition cursor-pointer text-center"
                        >
                          👑 Admin
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Status info */}
                <div className="mt-4 p-2.5 bg-slate-50 rounded-2xl border border-slate-200/60 flex gap-2 items-start text-[11px] text-slate-600">
                  <Info className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">Veterinary Telemetry: </span>
                    Clinical grade 3D visualizations active with real-time biometric telemetry and authenticated doctor licensing verification.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, ShieldCheck, User, Sparkles, Key, Check, Info, Stethoscope, 
  Building2, Award, MapPin, Phone, Heart, Calendar, FileText, CheckCircle2, 
  AlertCircle, Clock, PawPrint, Briefcase, ArrowLeft, ArrowRight, Smartphone,
  Eye, EyeOff, Lock
} from 'lucide-react';
import { UserRole } from '../types';
import { authService } from '../services/auth';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import DarkModeToggle from './DarkModeToggle';
import emoji3dPuppy from '../assets/images/emoji_3d_puppy_1789274564327.jpg';
import emoji3dCat from '../assets/images/emoji_3d_cat_1789274582580.jpg';
import emoji3dDog from '../assets/images/emoji_3d_dog_1789274599897.jpg';

interface SlideToActionButtonProps {
  label: string;
  onComplete: () => void;
  id?: string;
}

function SlideToActionButton({ label, onComplete, id }: SlideToActionButtonProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [maxDrag, setMaxDrag] = useState(160);
  const [isCompleted, setIsCompleted] = useState(false);
  const isDraggingRef = useRef(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const addTimeout = (fn: () => void, delay: number) => {
    const t = setTimeout(fn, delay);
    timeoutsRef.current.push(t);
    return t;
  };

  useEffect(() => {
    const updateBounds = () => {
      if (trackRef.current) {
        const trackWidth = trackRef.current.offsetWidth;
        setMaxDrag(Math.max(40, trackWidth - 48));
      }
    };
    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => {
      window.removeEventListener('resize', updateBounds);
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    setIsCompleted(false);
    x.set(0);
  }, [label, x]);

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragEnd = () => {
    const currentX = x.get();
    if (currentX >= maxDrag * 0.45) {
      setIsCompleted(true);
      animate(x, maxDrag, { duration: 0.15 });
      addTimeout(() => {
        onComplete();
        addTimeout(() => {
          setIsCompleted(false);
          animate(x, 0, { duration: 0.25 });
        }, 120);
      }, 120);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 450, damping: 28 });
    }
    // Keep isDraggingRef true briefly to absorb the subsequent browser click event
    addTimeout(() => {
      isDraggingRef.current = false;
    }, 180);
  };

  const textOpacity = useTransform(x, [0, maxDrag * 0.6], [1, 0.15]);
  const textTranslateX = useTransform(x, [0, maxDrag], [0, 10]);

  return (
    <div
      ref={trackRef}
      id={id}
      className="relative flex-1 h-12 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800/90 dark:hover:bg-slate-750 text-white rounded-full flex items-center justify-between p-1.5 shadow-md hover:shadow-lg transition-all overflow-hidden select-none border border-slate-700/70 dark:border-slate-700 group cursor-pointer"
      onClick={() => {
        if (isDraggingRef.current || isCompleted) return;
        setIsCompleted(true);
        animate(x, maxDrag, { duration: 0.18 });
        addTimeout(() => {
          onComplete();
          addTimeout(() => {
            setIsCompleted(false);
            animate(x, 0, { duration: 0.2 });
          }, 100);
        }, 120);
      }}
    >
      {/* Background slide trail fill */}
      <motion.div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-500/25 via-cyan-500/25 to-sky-500/20 rounded-full pointer-events-none"
        style={{ width: useTransform(x, (val) => `${val + 40}px`) }}
      />

      {/* Action Text Label with Shimmer Arrows */}
      <motion.div
        style={{ opacity: textOpacity, x: textTranslateX }}
        className="absolute inset-x-0 pr-5 text-right font-bold text-xs tracking-wide flex items-center justify-end gap-1 pointer-events-none text-slate-100 dark:text-slate-100"
      >
        <span>Slide to {label}</span>
        <span className="text-[11px] text-teal-400 font-semibold tracking-tight group-hover:translate-x-0.5 transition-transform">
          ›››
        </span>
      </motion.div>

      {/* Draggable Clinical Handle */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.05}
        dragMomentum={false}
        style={{ x }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative z-10 w-9 h-9 rounded-full bg-gradient-to-tr from-teal-400 via-cyan-400 to-sky-400 text-slate-950 flex items-center justify-center shadow-[0_2px_10px_rgba(20,184,166,0.35)] font-bold text-xs cursor-grab active:cursor-grabbing shrink-0 transition-shadow"
        title="Slide or tap to continue"
      >
        {isCompleted ? '✨' : <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />}
      </motion.div>
    </div>
  );
}

interface WelcomeViewProps {
  onLoginSuccess: () => void;
  onOpenInstallModal?: () => void;
}

export default function WelcomeView({ onLoginSuccess, onOpenInstallModal }: WelcomeViewProps) {
  // Onboarding 3-step Walkthrough state
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3>(1);
  const [flowStage, setFlowStage] = useState<'onboarding' | 'auth'>('onboarding');

  // Instant in-memory preloader for onboarding images
  useEffect(() => {
    [emoji3dPuppy, emoji3dCat, emoji3dDog].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const [selectedRole, setSelectedRole] = useState<UserRole>('pet_owner');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration flow state & step tracker (Let's Get Started -> Sign In -> Sign Up)
  const [registrationMode, setRegistrationMode] = useState(false);
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

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
  const [clinicNameInput, setClinicNameInput] = useState('PawCare Animal Hospital');
  const [consultationTimingsInput, setConsultationTimingsInput] = useState('Mon - Fri (09:00 AM - 05:00 PM)');

  // Pet Owner & Patient Companion Details
  const [emergencyContactInput, setEmergencyContactInput] = useState('');
  const [emergencyPhoneInput, setEmergencyPhoneInput] = useState('');
  const [preferredClinicInput, setPreferredClinicInput] = useState('PawCare Animal Hospital');
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
            clinicName: clinicNameInput.trim() || 'PawCare Premium Medical Hub',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-teal-50/40 to-sky-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden flex flex-col items-center justify-center p-3 sm:p-6 transition-colors duration-300" id="welcome-view-container">
      {/* Ambient background light orbs for clinical polish */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-teal-400/10 dark:bg-teal-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-sky-400/10 dark:bg-sky-500/5 blur-3xl pointer-events-none" />

      {/* Top Floating Utility Bar */}
      <div className="w-full max-w-[410px] flex justify-between items-center z-30 mb-2.5 px-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-white/90 dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs border border-slate-200/60 dark:border-slate-700/60">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <span className="font-black text-xs tracking-tight text-slate-800 dark:text-slate-100">VetPulse Pro</span>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold block leading-none">Clinical Veterinary Network</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DarkModeToggle variant="full" />
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="px-2.5 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800 hover:bg-white text-teal-700 dark:text-teal-300 shadow-xs text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
              title="Download & Run on Mobile"
            >
              <Smartphone className="w-3.5 h-3.5 text-teal-500" />
              <span className="hidden xs:inline">App</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Mobile App Frame */}
      <div className="w-full max-w-[410px] min-h-[730px] bg-white dark:bg-slate-900 rounded-[44px] shadow-[0_24px_55px_-12px_rgba(15,23,42,0.15),0_10px_20px_-8px_rgba(15,23,42,0.06)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col justify-between overflow-hidden relative border border-slate-200/80 dark:border-slate-800 select-none">
        
        {/* ========================================================= */}
        {/* 1. ONBOARDING 3-STEP WALKTHROUGH MODE                      */}
        {/* ========================================================= */}
        {flowStage === 'onboarding' ? (
          <div className="w-full h-full flex-1 flex flex-col justify-between p-5 relative">
            
            {/* Top Bar with Quick Skip & Step Badge */}
            <div className="w-full flex items-center justify-between mt-1 px-1 z-20">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                Step {onboardingStep} of 3
              </span>
              <button
                type="button"
                onClick={() => {
                  setRegistrationMode(false);
                  setFlowStage('auth');
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-800 dark:hover:text-white transition px-2.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Skip
              </button>
            </div>

            {/* Hero Visual Area with Modern Radiant Clinical Backdrop & Mascot */}
            <div className="relative w-full h-[320px] mt-2 flex items-center justify-center">
              
              {/* Clinical Gradient Scalloped Wave Backdrop */}
              <div className="absolute inset-x-0 top-0 bottom-4 bg-gradient-to-tr from-teal-500 via-cyan-500 to-sky-500 dark:from-teal-600 dark:via-cyan-600 dark:to-sky-600 rounded-t-[36px] rounded-b-[44px] overflow-hidden flex items-center justify-center shadow-inner">
                
                {/* Floating Micro Feature Badges */}
                <div className="absolute top-3 right-4 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-black tracking-wide border border-white/30 shadow-xs flex items-center gap-1 z-20">
                  <Sparkles className="w-3 h-3 text-amber-200" />
                  <span>
                    {onboardingStep === 1 ? 'Smart AI Triage' : onboardingStep === 2 ? 'Clinical Records' : 'Instant Delivery'}
                  </span>
                </div>

                {/* Subtle light reflections */}
                <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-white/20 blur-xl pointer-events-none" />
                <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-cyan-400/30 blur-xl pointer-events-none" />
              </div>

              {/* Dynamic Step-Specific 3D Mascot Image */}
              <div className="relative z-10 w-full h-full flex items-center justify-center p-2">
                {[
                  { step: 1, src: emoji3dPuppy, alt: "3D Emoji Puppy" },
                  { step: 2, src: emoji3dCat, alt: "3D Emoji Kitten" },
                  { step: 3, src: emoji3dDog, alt: "3D Emoji Dog" }
                ].map((item) => (
                  <div
                    key={item.step}
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-350 ease-out transform ${
                      onboardingStep === item.step
                        ? 'opacity-100 scale-100 pointer-events-auto z-10'
                        : 'opacity-0 scale-95 pointer-events-none z-0'
                    }`}
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="eager"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-[250px] h-[250px] object-cover rounded-3xl drop-shadow-[0_16px_28px_rgba(15,23,42,0.22)] select-none border-2 border-white/70 dark:border-slate-700/70"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Indicator Dots: [━] • • */}
            <div className="flex items-center gap-2 px-2 mt-3">
              <button
                type="button"
                onClick={() => setOnboardingStep(1)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  onboardingStep === 1 
                    ? 'w-7 h-2 bg-teal-600 dark:bg-teal-400' 
                    : 'w-2 h-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
                title="Page 1"
              />
              <button
                type="button"
                onClick={() => setOnboardingStep(2)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  onboardingStep === 2 
                    ? 'w-7 h-2 bg-teal-600 dark:bg-teal-400' 
                    : 'w-2 h-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
                title="Page 2"
              />
              <button
                type="button"
                onClick={() => setOnboardingStep(3)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  onboardingStep === 3 
                    ? 'w-7 h-2 bg-teal-600 dark:bg-teal-400' 
                    : 'w-2 h-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
                title="Page 3"
              />
            </div>

            {/* Typography Content for Active Step */}
            <div className="px-2 mt-3 min-h-[110px]">
              {onboardingStep === 1 && (
                <motion.div
                  key="text-1"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight">
                    Smart<br />Pet Healthcare
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed">
                    Intelligent care protocols, symptom checks, and 24/7 clinical AI support.
                  </p>
                </motion.div>
              )}

              {onboardingStep === 2 && (
                <motion.div
                  key="text-2"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight">
                    Personalized<br />Clinical Care
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed">
                    Tailored vaccination schedules, dietary analytics, and direct vet consultations.
                  </p>
                </motion.div>
              )}

              {onboardingStep === 3 && (
                <motion.div
                  key="text-3"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight">
                    Instant Rx &<br />Medical Supplies
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed">
                    Automated prescription refills, clinic pharmacy dispatch, and doorstep delivery.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Bottom Navigation Controls: Slidable Action Button + Circular Back Button */}
            <div className="flex items-center gap-3 px-1 mt-4 mb-1">
              <SlideToActionButton
                id="onboarding-primary-action-btn"
                label={onboardingStep === 1 ? "Start" : onboardingStep === 2 ? 'Next' : 'Get Started'}
                onComplete={() => {
                  if (onboardingStep < 3) {
                    setOnboardingStep((prev) => (prev + 1) as 1 | 2 | 3);
                  } else {
                    // Step 3 finished -> Take user to Sign In page first!
                    setRegistrationMode(false);
                    setFlowStage('auth');
                  }
                }}
              />

              <button
                type="button"
                onClick={() => {
                  if (onboardingStep > 1) {
                    setOnboardingStep((prev) => (prev - 1) as 1 | 2 | 3);
                  }
                }}
                disabled={onboardingStep === 1}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  onboardingStep === 1
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-60'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 shadow-xs'
                }`}
                title="Previous"
                id="onboarding-secondary-action-btn"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Demo Login Link */}
            <div className="text-center pt-2 pb-0.5">
              <button
                type="button"
                onClick={() => {
                  setRegistrationMode(false);
                  setFlowStage('auth');
                }}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition"
              >
                Already have an account? <span className="text-teal-600 dark:text-teal-400 font-extrabold hover:underline">Sign In</span>
              </button>
            </div>

          </div>
        ) : (
          /* ========================================================= */
          /* 2. SIGN IN / SIGN UP AUTHENTICATION PAGE                  */
          /* ========================================================= */
          <div className="w-full h-full flex-1 flex flex-col justify-between p-5 relative overflow-y-auto max-h-[760px]">
            
            {/* Top Navigation & Mode Switch */}
            <div className="space-y-3">
              <div className="flex items-center justify-start">
                <button
                  type="button"
                  onClick={() => setFlowStage('onboarding')}
                  className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Back to Walkthrough"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Onboarding</span>
                </button>
              </div>

              {/* Title & Mode Switcher */}
              <div className="text-center pt-1">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {!registrationMode ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {!registrationMode ? 'Sign in to access your veterinary dashboard' : 'Join our veterinary care network'}
                </p>
              </div>

              {/* Tab Selector: Sign In (1st) than Sign Up (2nd) */}
              <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setRegistrationMode(false)}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    !registrationMode
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                  id="auth-tab-signin"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegistrationMode(true);
                    setRegStep(1);
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    registrationMode
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                  id="auth-tab-signup"
                >
                  Sign Up
                </button>
              </div>

              {/* Inline Alerts */}
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span className="flex-1">{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-2xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span className="flex-1">{formSuccess}</span>
                </div>
              )}

              {/* Role Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Select Your Account Role
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                  {(['pet_owner', 'doctor', 'owner'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setSelectedRole(r);
                        setRegStep(1);
                      }}
                      className={`py-2 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                        selectedRole === r
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-700/70'
                      }`}
                      id={`select-role-${r}-btn`}
                    >
                      {r === 'owner' ? '👑 Admin' : r === 'doctor' ? '🩺 Doctor' : '🐾 Parent'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Body: Registration Mode vs Login Mode */}
              {registrationMode ? (
                /* REGISTRATION FLOW (Step 1 & Step 2) */
                <div className="space-y-3 pt-2">
                  
                  {/* Step indicators */}
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className={`flex-1 py-1.5 px-2 rounded-xl border text-center text-[11px] font-bold transition ${
                        regStep === 1
                          ? 'bg-sky-50 border-sky-300 text-sky-800 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      1. Account Info
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (nameInput && phoneInput && emailInput && passwordInput) {
                          setRegStep(2);
                        } else {
                          setFormError('Please fill in Name, Phone, Email, and Password first.');
                        }
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-xl border text-center text-[11px] font-bold transition ${
                        regStep === 2
                          ? 'bg-sky-50 border-sky-300 text-sky-800 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      2. {selectedRole === 'doctor' ? 'Credentials' : selectedRole === 'pet_owner' ? 'Pet Profile' : 'Clinic'}
                    </button>
                  </div>

                  {regStep === 1 ? (
                    <form onSubmit={handleNextStep} className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Full Name *
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                            <User className="h-4 w-4" />
                          </span>
                          <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            placeholder={selectedRole === 'doctor' ? "Dr. Sarah Mitchell" : "Emily Watson"}
                            required
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                            id="reg-name-input"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            placeholder="+1 555-0199"
                            required
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                            id="reg-phone-input"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={cityInput}
                            onChange={(e) => setCityInput(e.target.value)}
                            placeholder="New York, NY"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                            id="reg-city-input"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="name@domain.com"
                          required
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                          id="reg-email-input"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-3 pr-9 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                            id="reg-password-input"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-[#19191c] hover:bg-[#2c2c32] dark:bg-sky-500 text-white rounded-xl text-xs font-black tracking-wide shadow-md transition-all flex items-center justify-center gap-1 mt-2 cursor-pointer"
                        id="reg-step1-next-btn"
                      >
                        <span>Continue to Step 2</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => setRegistrationMode(false)}
                          className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                        >
                          Already have an account? <span className="text-sky-600 dark:text-sky-400 font-extrabold hover:underline">Sign In</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Step 2: Role Details (Pet details, Doctor license, etc) */
                    <form onSubmit={handleCustomLogin} className="space-y-2.5">
                      {selectedRole === 'pet_owner' && (
                        <>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Pet Companion Name *
                            </label>
                            <input
                              type="text"
                              value={petNameInput}
                              onChange={(e) => setPetNameInput(e.target.value)}
                              placeholder="e.g. Milo or Luna"
                              required
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                              id="reg-petname-input"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Species
                              </label>
                              <select
                                value={petSpeciesInput}
                                onChange={(e) => setPetSpeciesInput(e.target.value as any)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-2 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                              >
                                <option value="dog">🐕 Canine (Dog)</option>
                                <option value="cat">🐈 Feline (Cat)</option>
                                <option value="other">🦜 Avian / Other</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Breed
                              </label>
                              <input
                                type="text"
                                value={petBreedInput}
                                onChange={(e) => setPetBreedInput(e.target.value)}
                                placeholder="Golden Retriever"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {selectedRole === 'doctor' && (
                        <>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Veterinary License Number *
                            </label>
                            <input
                              type="text"
                              value={registrationNumberInput}
                              onChange={(e) => setRegistrationNumberInput(e.target.value)}
                              placeholder="VET-LIC-2026-NY"
                              required
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Specialization
                            </label>
                            <input
                              type="text"
                              value={specializationInput}
                              onChange={(e) => setSpecializationInput(e.target.value)}
                              placeholder="General Veterinary Medicine"
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                        </>
                      )}

                      {selectedRole === 'owner' && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Hospital / Clinic Facility Name
                          </label>
                          <input
                            type="text"
                            value={clinicNameInput}
                            onChange={(e) => setClinicNameInput(e.target.value)}
                            placeholder="PawCare Animal Medical Center"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setRegStep(1)}
                          className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-black tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          id="reg-submit-btn"
                        >
                          {loading ? (
                            <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Complete Sign Up</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                /* SIGN IN FORM */
                <form onSubmit={handleCustomLogin} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="user@pawcare.com"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                      id="auth-email-input"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-3 pr-9 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                        id="auth-password-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex justify-end mt-1">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 dark:from-teal-600 dark:to-cyan-600 dark:hover:from-teal-500 dark:hover:to-cyan-500 text-white rounded-xl text-xs font-black tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
                    id="auth-login-submit-btn"
                  >
                    {loading ? (
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRegistrationMode(true);
                        setRegStep(1);
                      }}
                      className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      Don't have an account? <span className="text-teal-600 dark:text-teal-400 font-extrabold hover:underline">Sign Up</span>
                    </button>
                  </div>
                </form>
              )}

              {/* 1-Click Instant Clinical Demo Portals */}
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center mb-1.5">
                  1-Click Instant Demo Portals
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInput('emily.watson@gmail.com');
                      setPasswordInput('owner123');
                      setSelectedRole('pet_owner');
                      handleDemoLogin('pet_owner');
                    }}
                    className="py-2 px-1 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 text-center transition cursor-pointer shadow-xs active:scale-95 group"
                  >
                    <div className="text-sm mb-0.5">🐾</div>
                    <div className="font-black text-slate-900 dark:text-white">Pet Parent</div>
                    <div className="text-[9px] text-slate-400">Emily</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInput('sarah.mitchell@vetpulse.com');
                      setPasswordInput('doctor123');
                      setSelectedRole('doctor');
                      handleDemoLogin('doctor');
                    }}
                    className="py-2 px-1 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 text-center transition cursor-pointer shadow-xs active:scale-95 group"
                  >
                    <div className="text-sm mb-0.5">🩺</div>
                    <div className="font-black text-slate-900 dark:text-white">Doctor</div>
                    <div className="text-[9px] text-slate-400">Dr. Sarah</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInput('admin@vetpulse.com');
                      setPasswordInput('admin123');
                      setSelectedRole('owner');
                      handleDemoLogin('owner');
                    }}
                    className="py-2 px-1 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 text-center transition cursor-pointer shadow-xs active:scale-95 group"
                  >
                    <div className="text-sm mb-0.5">👑</div>
                    <div className="font-black text-slate-900 dark:text-white">Admin</div>
                    <div className="text-[9px] text-slate-400">Dr. Hayes</div>
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Back to Walkthrough */}
            <div className="pt-3 text-center">
              <button
                type="button"
                onClick={() => setFlowStage('onboarding')}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                ← View Onboarding Walkthrough
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

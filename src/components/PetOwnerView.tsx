import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Heart, 
  Calendar, 
  FileText, 
  MessageSquare, 
  User, 
  Plus, 
  Activity, 
  LogOut, 
  Sparkles, 
  CalendarDays, 
  FileCheck, 
  Coins, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  CheckCircle,
  HelpCircle,
  Eye,
  Camera,
  Download,
  ArrowRight,
  ArrowLeft,
  Scale,
  Upload,
  CalendarPlus,
  Clock,
  ShieldCheck,
  Pill,
  ChevronRight,
  Stethoscope,
  Send,
  Bot,
  Bell
} from 'lucide-react';
import { 
  PetProfile, 
  Appointment, 
  Consultation, 
  LaboratoryReport, 
  Invoice, 
  NotificationItem, 
  UserProfile,
  OwnerUploadedPrescription,
  ImagingRecord,
  SurgeryRecord,
  HospitalizationRecord
} from '../types';
import { dbService } from '../services/db';
import { authService } from '../services/auth';
import threedPetDog from '../assets/images/realistic_3d_dog_1789111353728.jpg';
import threedPetCat from '../assets/images/realistic_3d_cat_1789111372620.jpg';
import threedPetBird from '../assets/images/threed_pet_bird_1789062504097.jpg';
import Realistic3DEmoji from './Realistic3DEmoji';
import Realistic3DIcon from './Realistic3DIcon';
import EditPetAgeWeightModal from './owner/EditPetAgeWeightModal';
import UploadPrescriptionModal from './owner/UploadPrescriptionModal';
import Upcoming3DNotifications from './owner/Upcoming3DNotifications';
import NotificationSoundToggle from './NotificationSoundToggle';
import AllPreviousRecordsHub from './owner/AllPreviousRecordsHub';
import { motion, AnimatePresence } from 'motion/react';

const getPet3DImage = (species: string) => {
  const s = species.toLowerCase();
  if (s.includes('dog')) return threedPetDog;
  if (s.includes('cat')) return threedPetCat;
  if (s.includes('bird') || s.includes('parrot')) return threedPetBird;
  return null;
};

// Calculate human-readable age from date of birth
const computePetAge = (dobString?: string) => {
  if (!dobString) return 'Age unknown';
  const birth = new Date(dobString);
  const now = new Date();
  if (isNaN(birth.getTime())) return 'Age unknown';

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (now.getDate() < birth.getDate()) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years < 0) return 'Just born';
  if (years === 0) {
    return months <= 1 ? `${Math.max(1, months)} month` : `${months} months`;
  }
  return months > 0 ? `${years} yr ${months} mo` : `${years} yrs`;
};

interface PetOwnerViewProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

export default function PetOwnerView({ currentUser, onLogout }: PetOwnerViewProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'pets' | 'appointments' | 'records' | 'ai' | 'profile'>('home');
  const [tabHistory, setTabHistory] = useState<string[]>([]);

  // Navigation handlers
  const navigateToTab = (tab: typeof activeTab) => {
    if (tab !== activeTab) {
      setTabHistory(prev => [...prev, activeTab]);
      setActiveTab(tab);
    }
  };

  const handleGoBack = () => {
    if (tabHistory.length > 0) {
      const prev = tabHistory[tabHistory.length - 1] as typeof activeTab;
      setTabHistory(h => h.slice(0, -1));
      setActiveTab(prev);
    } else if (activeTab !== 'home') {
      setActiveTab('home');
    }
  };

  const handleGoHome = () => {
    if (activeTab !== 'home') {
      setTabHistory(prev => [...prev, activeTab]);
      setActiveTab('home');
    }
  };

  // Listen to Global Header Events
  useEffect(() => {
    const onBack = () => handleGoBack();
    const onHome = () => handleGoHome();
    window.addEventListener('vetpulse:navigate-back', onBack);
    window.addEventListener('vetpulse:navigate-home', onHome);
    return () => {
      window.removeEventListener('vetpulse:navigate-back', onBack);
      window.removeEventListener('vetpulse:navigate-home', onHome);
    };
  }, [tabHistory, activeTab]);

  const [pets, setPets] = useState<PetProfile[]>([]);
  const [selectedCompanionIndex, setSelectedCompanionIndex] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [labs, setLabs] = useState<LaboratoryReport[]>([]);
  const [imaging, setImaging] = useState<ImagingRecord[]>([]);
  const [surgeries, setSurgeries] = useState<SurgeryRecord[]>([]);
  const [hospitalizations, setHospitalizations] = useState<HospitalizationRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [uploadedPrescriptions, setUploadedPrescriptions] = useState<OwnerUploadedPrescription[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // 3D Modals state
  const [showEditAgeWeightModal, setShowEditAgeWeightModal] = useState(false);
  const [petForEdit, setPetForEdit] = useState<PetProfile | null>(null);

  const [showUploadPrescriptionModal, setShowUploadPrescriptionModal] = useState(false);
  const [petForUploadPrescription, setPetForUploadPrescription] = useState<PetProfile | null>(null);

  // Notifications Helpers
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const handleMarkAllNotificationsRead = () => {
    dbService.markAllRead(currentUser.uid);
    setNotifications(dbService.getNotifications(currentUser.uid));
    showToast('All notifications marked as read');
  };

  const handleDismissNotification = (id: string) => {
    dbService.dismissNotification(id);
    setNotifications(dbService.getNotifications(currentUser.uid));
  };

  // AI Assistant state
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: "Hello! I am your VetPulse Smart Health Assistant. I can help with preventive care, vaccination schedules, diet & weight goals, toxic food warnings, and deworming advice. How can I assist you and your pets today?" }
  ]);
  const [userMsgInput, setUserMsgInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // New Pet Creation Form States
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState<'dog' | 'cat' | 'other'>('dog');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetSex, setNewPetSex] = useState<'male' | 'female' | 'neutered_male' | 'spayed_female'>('neutered_male');
  const [newPetDob, setNewPetDob] = useState('2023-01-01');
  const [newPetWeight, setNewPetWeight] = useState('8.5');
  const [newPetColor, setNewPetColor] = useState('');
  const [newPetMicrochip, setNewPetMicrochip] = useState('');
  const [newPetAllergies, setNewPetAllergies] = useState('');
  const [creatingPet, setCreatingPet] = useState(false);

  // Appointment Booking Form States
  const [selectedPetId, setSelectedPetId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('doc-1');
  const [appointmentDate, setAppointmentDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [appointmentReason, setAppointmentReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Sync DB records
  const syncData = () => {
    const allPets = dbService.getPets().filter(p => p.ownerId === currentUser.uid);
    const petIds = allPets.map(p => p.petId);
    setPets(allPets);
    if (allPets.length > 0 && selectedPetId === '') {
      setSelectedPetId(allPets[0].petId);
    }
    setAppointments(dbService.getAppointments().filter(a => a.ownerId === currentUser.uid));
    setConsultations(dbService.getConsultations().filter(c => petIds.includes(c.patientId)));
    setLabs(dbService.getLabs().filter(l => petIds.includes(l.patientId)));
    setImaging(dbService.getImaging().filter(i => petIds.includes(i.patientId)));
    setSurgeries(dbService.getSurgeries().filter(s => petIds.includes(s.patientId)));
    setHospitalizations(dbService.getHospitalizations().filter(h => petIds.includes(h.patientId)));
    setInvoices(dbService.getInvoices().filter(i => petIds.includes(i.patientId)));
    setUploadedPrescriptions(dbService.getUploadedPrescriptions().filter(p => p.ownerId === currentUser.uid));
    setNotifications(dbService.getNotifications());
  };

  useEffect(() => {
    syncData();
  }, [currentUser]);

  const activeCompanion = pets[selectedCompanionIndex] || pets[0];

  const getNextCheckupDisplay = (pet?: PetProfile) => {
    if (!pet) return 'No checkups scheduled';
    const upcomingApt = appointments.find(a => a.petId === pet.petId && (a.status === 'approved' || a.status === 'pending'));
    if (upcomingApt) {
      return new Date(upcomingApt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    const nextVax = pet.vaccinationHistory?.find(v => v.nextDueDate && new Date(v.nextDueDate) >= new Date());
    if (nextVax && nextVax.nextDueDate) {
      return new Date(nextVax.nextDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return 'Annual Exam Due Soon';
  };

  // Open Edit Age & Weight Modal
  const handleOpenEditAgeWeight = (pet: PetProfile) => {
    setPetForEdit(pet);
    setShowEditAgeWeightModal(true);
  };

  // Open Upload Prescription Modal
  const handleOpenUploadPrescription = (pet?: PetProfile) => {
    setPetForUploadPrescription(pet || activeCompanion || pets[0] || null);
    setShowUploadPrescriptionModal(true);
  };

  // Handle adding new pet profile
  const handleAddPetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName) return;

    setCreatingPet(true);

    setTimeout(() => {
      const newPet: PetProfile = {
        petId: 'pet-' + Math.random().toString(36).substring(2, 9),
        petRegistrationNumber: 'VP-REG-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        ownerId: currentUser.uid,
        name: newPetName,
        species: newPetSpecies,
        breed: newPetBreed || 'Mixed Breed',
        sex: newPetSex,
        dateOfBirth: newPetDob,
        weight: Number(newPetWeight),
        color: newPetColor || 'Standard',
        microchipNumber: newPetMicrochip || undefined,
        photoUrl: '',
        vaccinationHistory: [],
        dewormingHistory: [],
        allergies: newPetAllergies ? newPetAllergies.split(',').map(s => s.trim()) : [],
        knownMedicalConditions: [],
        previousSurgeries: [],
        currentMedications: [],
        weightHistory: [
          {
            date: new Date().toISOString().split('T')[0],
            weight: Number(newPetWeight),
            notes: 'Owner Initial Setup'
          }
        ]
      };

      dbService.savePet(newPet);
      dbService.logAction(currentUser.uid, currentUser.name, 'pet_owner', `Registered companion: ${newPetName} (${newPetBreed})`, 'pets', newPet.petId, 'success');
      
      setCreatingPet(false);
      setNewPetName('');
      setNewPetBreed('');
      setShowAddPetModal(false);
      syncData();
    }, 400);
  };

  // Delete pet profile
  const handleDeletePet = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}'s companion profile and records?`)) {
      dbService.deletePet(id);
      dbService.logAction(currentUser.uid, currentUser.name, 'pet_owner', `Deleted companion profile: ${name}`, 'pets', id, 'success');
      syncData();
    }
  };

  // Schedule an appointment
  const handleScheduleAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId || !appointmentReason) return;

    setBookingLoading(true);

    setTimeout(() => {
      const pet = pets.find(p => p.petId === selectedPetId);
      const docObj = dbService.getDoctor(selectedDoctorId);

      const newApt: Appointment = {
        appointmentId: 'apt-' + Math.random().toString(36).substring(2, 9),
        petId: selectedPetId,
        petName: pet?.name || 'Pet',
        ownerId: currentUser.uid,
        ownerName: currentUser.name,
        doctorId: selectedDoctorId,
        doctorName: docObj?.name || 'Veterinarian',
        date: appointmentDate,
        timeSlot: appointmentTime,
        reason: appointmentReason,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      dbService.saveAppointment(newApt);
      dbService.logAction(currentUser.uid, currentUser.name, 'pet_owner', `Requested appointment for ${newApt.petName} with ${newApt.doctorName}`, 'appointments', newApt.appointmentId, 'success');
      
      setBookingLoading(false);
      setAppointmentReason('');
      syncData();
      showToast('Appointment request submitted successfully!');
    }, 400);
  };

  // Cancel appointment
  const handleCancelAppointment = (id: string) => {
    const apt = appointments.find(a => a.appointmentId === id);
    if (apt) {
      const updated = { ...apt, status: 'cancelled' as const };
      dbService.saveAppointment(updated);
      dbService.logAction(currentUser.uid, currentUser.name, 'pet_owner', `Cancelled appointment scheduled on ${apt.date}`, 'appointments', id, 'success');
      syncData();
    }
  };

  // Quick Book from notification
  const handleNotificationBook = (petId: string, reason?: string) => {
    setSelectedPetId(petId);
    if (reason) setAppointmentReason(`Follow-up: ${reason}`);
    setActiveTab('appointments');
  };

  // AI Message submit
  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMsgInput.trim() || aiLoading) return;

    const userText = userMsgInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setUserMsgInput('');
    setAiLoading(true);

    try {
      const response = await fetch('/api/ai/pet-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText, history: [] })
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, { sender: 'ai', text: data.text || 'Our veterinary AI engine is reviewing your query...' }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Thank you for reaching out. Please monitor your pet closely and call our veterinary desk at +1 (800) 555-0100 for any urgent clinical symptoms.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/60 dark:bg-slate-950 relative overflow-hidden h-full min-h-0" id="pet-owner-view-container">
      <div className="flex-1 flex flex-col md:flex-row relative z-10 h-full overflow-hidden">
        
        {/* Navigation Dock */}
        <nav className="md:w-24 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex md:flex-col items-center justify-between p-4 z-40 shadow-sm transition-colors">
          <div className="hidden md:flex flex-col items-center gap-6 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-indigo-600 text-white flex items-center justify-center shadow-[0_10px_20px_rgba(6,182,212,0.35)]">
              <Activity className="h-6 w-6" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              VetPulse
            </span>
          </div>

          <div className="flex md:flex-col items-center justify-center gap-5 w-full overflow-x-auto md:overflow-x-visible no-scrollbar py-2">
            {[
              { id: 'home', icon: Home, label: 'Radar' },
              { id: 'pets', icon: Heart, label: 'Companions' },
              { id: 'appointments', icon: Calendar, label: 'Visits' },
              { id: 'records', icon: FileText, label: 'All Records' },
              { id: 'ai', icon: MessageSquare, label: 'AI Vet' },
              { id: 'profile', icon: User, label: 'Profile' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`p-3.5 rounded-[22px] transition-all duration-300 group relative cursor-pointer ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-[0_12px_24px_rgba(6,182,212,0.35)] scale-110' 
                    : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-cyan-400'
                }`}
                title={item.label}
              >
                <item.icon className="h-5 w-5" />
                <span className="hidden md:block absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={onLogout}
            className="p-3.5 rounded-[22px] text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-500 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 custom-scrollbar relative transition-colors">
          {toastMessage && (
            <div className="fixed top-6 right-6 z-50 p-4 bg-slate-900 text-white shadow-2xl rounded-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
              <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />
              <span className="text-xs font-bold">{toastMessage}</span>
            </div>
          )}

          {/* Quick Navigation Breadcrumb & Toolbar */}
          <div className="max-w-6xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-sm" id="petowner-toolbar-container">
            <div className="flex items-center gap-2">
              {/* Back Button */}
              <button
                onClick={handleGoBack}
                className="px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all active:scale-95 border border-slate-200/60 shadow-xs group"
                title="Go to previous tab"
                id="petowner-back-btn"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-cyan-600 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>

              {/* Home / Pet Radar Button */}
              <button
                onClick={handleGoHome}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${
                  activeTab === 'home' 
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md shadow-cyan-500/25' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Go to Pet Radar"
                id="petowner-home-btn"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Pet Radar</span>
              </button>

              {activeTab !== 'home' && (
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  /
                  <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 capitalize font-mono text-[11px] font-black border border-teal-200/60">
                    {activeTab === 'records' ? 'All Medical Records' : activeTab === 'pets' ? 'My Companions' : activeTab}
                  </span>
                </span>
              )}
            </div>

            {/* Quick-Jump Section Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'home', label: 'Radar', icon: Home },
                { id: 'pets', label: 'Companions', icon: Heart },
                { id: 'appointments', label: 'Visits', icon: Calendar },
                { id: 'records', label: 'Records Hub', icon: FileText },
                { id: 'ai', label: 'AI Vet', icon: MessageSquare },
                { id: 'profile', label: 'Profile', icon: User }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => navigateToTab(btn.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                    activeTab === btn.id 
                      ? 'bg-slate-900 text-cyan-300 font-black' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <btn.icon className="w-3 h-3" />
                  <span>{btn.label}</span>
                </button>
              ))}

              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

              {/* Clinical Notifications & Recall Bell */}
              <button
                onClick={() => setShowNotificationsModal(true)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-1.5 relative"
                title="Clinical Notifications & Recalls"
                id="petowner-bell-btn"
              >
                <Bell className="w-3 h-3 text-cyan-600" />
                <span>Notices</span>
                {unreadNotificationsCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center -mr-1">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Sound Mute Toggle */}
              <NotificationSoundToggle variant="badge" id="petowner-toolbar-sound-toggle" />

              <button
                onClick={() => setShowAddPetModal(true)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-all flex items-center gap-1"
                id="quick-add-pet-btn"
              >
                <Plus className="w-3 h-3" />
                <span>Add Pet</span>
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            
            {/* 1. HOME RADAR TAB */}
            {activeTab === 'home' && (
              <div key="home" className="max-w-6xl mx-auto space-y-8 pb-20">
                {/* Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-[0_15px_35px_rgba(0,0,0,0.03)]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                        Smart Pet Care Radar
                      </span>
                      <span className="text-slate-400 text-xs font-semibold">
                        {pets.length} Companions Registered
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Welcome, {currentUser.name.split(' ')[0]} 👋
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      All previous medical records, upcoming care radars, biometrics, and prescription management.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => handleOpenUploadPrescription(activeCompanion)}
                      className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-md flex items-center gap-2 transition-all"
                    >
                      <Pill className="w-4 h-4" />
                      Upload Prescription
                    </button>
                    <button
                      onClick={() => setShowAddPetModal(true)}
                      className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-md flex items-center gap-2 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Companion
                    </button>
                  </div>
                </div>

                {/* Companion Selector Tabs */}
                {pets.length > 0 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {pets.map((pet, idx) => (
                      <button
                        key={pet.petId}
                        onClick={() => setSelectedCompanionIndex(idx)}
                        className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all font-black text-xs whitespace-nowrap border ${
                          selectedCompanionIndex === idx
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105'
                            : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        <Realistic3DEmoji emoji={pet.species === 'cat' ? 'cat' : 'dog'} size="sm" animated={selectedCompanionIndex === idx} />
                        <span>{pet.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          selectedCompanionIndex === idx ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {computePetAge(pet.dateOfBirth)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* FEATURED COMPANION CARD */}
                {activeCompanion && (
                  <div className="bg-white rounded-[32px] border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-[24px] overflow-hidden bg-gradient-to-tr from-cyan-100 to-teal-100 border-2 border-white shadow-md shrink-0">
                          {getPet3DImage(activeCompanion.species) ? (
                            <img src={getPet3DImage(activeCompanion.species)!} alt={activeCompanion.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Realistic3DEmoji emoji="paw" size="lg" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-black text-slate-900">{activeCompanion.name}</h2>
                            <span className="px-3 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-black uppercase">
                              {activeCompanion.species}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-semibold">{activeCompanion.breed} • {activeCompanion.sex ? activeCompanion.sex.replace('_', ' ') : 'Companion'}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-600 font-medium mt-1">
                            <span>🎂 Age: <strong>{computePetAge(activeCompanion.dateOfBirth)}</strong></span>
                            <span>⚖️ Weight: <strong>{activeCompanion.weight} kg</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleOpenEditAgeWeight(activeCompanion)}
                          className="px-4 py-2.5 rounded-2xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-black flex items-center gap-1.5 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit Biometrics
                        </button>
                        <button
                          onClick={() => handleOpenUploadPrescription(activeCompanion)}
                          className="px-4 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-black flex items-center gap-1.5 transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Upload Rx
                        </button>
                        <button
                          onClick={() => handleNotificationBook(activeCompanion.petId)}
                          className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-1.5 transition-colors"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Book Visit
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* UPCOMING NOTIFICATIONS & PREVENTIVE RADAR */}
                <div className="pt-2">
                  <Upcoming3DNotifications
                    pets={pets}
                    appointments={appointments}
                    notifications={notifications}
                    onBookAppointment={handleNotificationBook}
                  />
                </div>
              </div>
            )}

            {/* 2. COMPANIONS TAB */}
            {activeTab === 'pets' && (
              <div key="pets" className="max-w-6xl mx-auto space-y-8 pb-20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-sm">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      My Companions
                    </h1>
                    <p className="text-slate-500 font-medium text-xs sm:text-sm">
                      Manage companion biometric baselines, age tracking, and medical dossiers.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddPetModal(true)}
                    className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-md flex items-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Register New Pet
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pets.map((pet) => {
                    const img = getPet3DImage(pet.species);
                    return (
                      <div
                        key={pet.petId}
                        className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-[24px] overflow-hidden bg-gradient-to-tr from-cyan-100 to-teal-100 border-2 border-white shadow-md shrink-0">
                              {img ? (
                                <img src={img} alt={pet.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Realistic3DEmoji emoji="paw" size="md" />
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-black text-slate-900">{pet.name}</h3>
                                <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-black uppercase">
                                  {pet.species}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-semibold">{pet.breed}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeletePet(pet.petId, pet.name)}
                            className="p-2 text-slate-300 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-colors"
                            title="Delete companion profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Biometric parameters */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-[9px] font-black uppercase text-slate-400 block">Age</span>
                            <span className="font-black text-slate-800 text-sm">{computePetAge(pet.dateOfBirth)}</span>
                          </div>
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-[9px] font-black uppercase text-slate-400 block">Weight</span>
                            <span className="font-black text-slate-800 text-sm">{pet.weight} kg</span>
                          </div>
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                            <span className="text-[9px] font-black uppercase text-slate-400 block">Microchip</span>
                            <span className="font-black text-slate-800 truncate block">{pet.microchipNumber || 'None'}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleOpenEditAgeWeight(pet)}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-black transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit Biometrics
                          </button>

                          <button
                            onClick={() => handleOpenUploadPrescription(pet)}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-black transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Upload Rx
                          </button>

                          <button
                            onClick={() => handleNotificationBook(pet.petId)}
                            className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Book
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. APPOINTMENTS TAB */}
            {activeTab === 'appointments' && (
              <div key="appointments" className="max-w-5xl mx-auto space-y-8 pb-20">
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Clinical Appointments & Visits
                    </h1>
                    <p className="text-slate-500 font-medium text-xs sm:text-sm">
                      Schedule checkups, surgeries, diagnostics, and routine health exams.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-black">
                    {appointments.length} Scheduled
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Booking Form Card */}
                  <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-sm h-fit">
                    <form onSubmit={handleScheduleAppointment} className="space-y-4">
                      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <CalendarPlus className="w-5 h-5 text-cyan-600" />
                        Book a Clinical Visit
                      </h3>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Select Companion</label>
                        <select
                          value={selectedPetId}
                          onChange={(e) => setSelectedPetId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          {pets.map(p => (
                            <option key={p.petId} value={p.petId}>{p.name} ({p.species})</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Date</label>
                          <input
                            type="date"
                            value={appointmentDate}
                            onChange={(e) => setAppointmentDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-2.5 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Time Slot</label>
                          <select
                            value={appointmentTime}
                            onChange={(e) => setAppointmentTime(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-2.5 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          >
                            <option value="09:00 AM">09:00 AM</option>
                            <option value="10:00 AM">10:00 AM</option>
                            <option value="11:30 AM">11:30 AM</option>
                            <option value="02:00 PM">02:00 PM</option>
                            <option value="04:30 PM">04:30 PM</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Reason for Visit</label>
                        <textarea
                          value={appointmentReason}
                          onChange={(e) => setAppointmentReason(e.target.value)}
                          placeholder="e.g. Annual vaccination booster, checkup for mild coughing..."
                          required
                          rows={3}
                          className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={bookingLoading}
                        className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-black text-xs shadow-md transition-all disabled:opacity-50"
                      >
                        {bookingLoading ? 'Submitting...' : 'Confirm Appointment Request'}
                      </button>
                    </form>
                  </div>

                  {/* Appointments List */}
                  <div className="lg:col-span-7 space-y-4">
                    <h3 className="text-base font-black text-slate-900">Scheduled Clinical Encounters</h3>
                    {appointments.length > 0 ? (
                      appointments.map((apt) => (
                        <div key={apt.appointmentId} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-slate-900">{apt.petName}</h4>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  apt.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                  apt.status === 'completed' ? 'bg-cyan-100 text-cyan-800' :
                                  apt.status === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {apt.status}
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 font-medium">{apt.reason}</p>

                              <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold pt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                                  {apt.date} at {apt.timeSlot}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Stethoscope className="w-3.5 h-3.5 text-emerald-500" />
                                  {apt.doctorName}
                                </span>
                              </div>
                            </div>

                            {apt.status === 'pending' && (
                              <button
                                onClick={() => handleCancelAppointment(apt.appointmentId)}
                                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 rounded-[32px] bg-white border border-slate-100 text-center space-y-3">
                        <Realistic3DEmoji emoji="clipboard" size="lg" />
                        <p className="text-sm font-black text-slate-700">No visits currently booked.</p>
                        <p className="text-xs text-slate-400">Use the form on the left to request a clinical slot.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. ALL PREVIOUS RECORDS HUB */}
            {activeTab === 'records' && (
              <div key="records" className="max-w-6xl mx-auto space-y-8 pb-20">
                <AllPreviousRecordsHub
                  pets={pets}
                  selectedPetId={activeCompanion?.petId}
                  consultations={consultations}
                  labs={labs}
                  imaging={imaging}
                  surgeries={surgeries}
                  hospitalizations={hospitalizations}
                  invoices={invoices}
                  uploadedPrescriptions={uploadedPrescriptions}
                  onOpenUploadPrescription={() => handleOpenUploadPrescription(activeCompanion)}
                />
              </div>
            )}

            {/* 5. AI VET ASSISTANT TAB */}
            {activeTab === 'ai' && (
              <div key="ai" className="max-w-4xl mx-auto space-y-6 pb-20">
                <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-700 rounded-[32px] p-6 sm:p-8 text-white shadow-md">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        VetPulse AI Medical Intelligence
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Smart Companion Health Assistant</h2>
                    <p className="text-cyan-100 text-xs sm:text-sm max-w-xl">
                      Ask about symptoms, food toxicity, vaccination timelines, or post-operative care.
                    </p>
                  </div>
                </div>

                {/* Chat Bubble Scroll Area */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        msg.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-gradient-to-tr from-cyan-500 to-teal-500 text-white'
                      }`}>
                        {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                      </div>

                      <div className={`p-4 rounded-[24px] max-w-[80%] text-xs leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-slate-900 text-white rounded-tr-sm' 
                          : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {aiLoading && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500 text-white flex items-center justify-center animate-pulse">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 text-slate-400 text-xs flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                        Clinical AI is analyzing symptoms & formulating recommendations...
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input Dock */}
                <form onSubmit={handleSendAiMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={userMsgInput}
                    onChange={(e) => setUserMsgInput(e.target.value)}
                    placeholder="e.g. Is chocolate safe for my dog? What are signs of ear infection in cats?"
                    className="flex-1 bg-white border border-slate-200/80 rounded-[24px] py-4 px-6 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="px-6 py-4 rounded-[24px] bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-black shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Ask AI
                  </button>
                </form>
              </div>
            )}

            {/* 6. PROFILE TAB */}
            {activeTab === 'profile' && (
              <div key="profile" className="max-w-2xl mx-auto space-y-8 pb-20">
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[24px] bg-gradient-to-tr from-cyan-500 to-teal-500 text-white flex items-center justify-center text-2xl font-black shadow-lg">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-black text-slate-900">{currentUser.name}</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                          Verified Owner
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-semibold">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Total Companions</span>
                      <span className="text-xl font-black text-slate-900">{pets.length}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Prescriptions Stored</span>
                      <span className="text-xl font-black text-slate-900">{uploadedPrescriptions.length}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-medium">Account ID: {currentUser.uid}</span>
                    <button
                      onClick={onLogout}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black transition-colors flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* MODALS */}
      {showEditAgeWeightModal && petForEdit && (
        <EditPetAgeWeightModal
          pet={petForEdit}
          isOpen={showEditAgeWeightModal}
          onClose={() => {
            setShowEditAgeWeightModal(false);
            setPetForEdit(null);
          }}
          onUpdated={() => {
            setShowEditAgeWeightModal(false);
            setPetForEdit(null);
            syncData();
          }}
        />
      )}

      {showUploadPrescriptionModal && petForUploadPrescription && (
        <UploadPrescriptionModal
          pets={pets}
          currentPetId={petForUploadPrescription.petId}
          isOpen={showUploadPrescriptionModal}
          onClose={() => {
            setShowUploadPrescriptionModal(false);
            setPetForUploadPrescription(null);
          }}
          onPrescriptionSaved={() => {
            setShowUploadPrescriptionModal(false);
            setPetForUploadPrescription(null);
            syncData();
          }}
        />
      )}

      {/* ADD COMPANION MODAL */}
      <AnimatePresence>
        {showAddPetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddPetModal(false)}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[36px] max-w-lg w-full p-6 sm:p-8 border border-slate-100 shadow-2xl relative z-10"
            >
              <form onSubmit={handleAddPetSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xl font-black text-slate-900">Register Companion</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddPetModal(false)}
                    className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Companion Name</label>
                  <input
                    type="text"
                    required
                    value={newPetName}
                    onChange={(e) => setNewPetName(e.target.value)}
                    placeholder="e.g. Barnaby"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Species</label>
                    <select
                      value={newPetSpecies}
                      onChange={(e) => setNewPetSpecies(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="dog">Dog 🐶</option>
                      <option value="cat">Cat 🐱</option>
                      <option value="other">Bird / Other 🦜</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Breed</label>
                    <input
                      type="text"
                      value={newPetBreed}
                      onChange={(e) => setNewPetBreed(e.target.value)}
                      placeholder="e.g. Golden Retriever"
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Sex & Status</label>
                    <select
                      value={newPetSex}
                      onChange={(e) => setNewPetSex(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="neutered_male">Neutered Male ♂</option>
                      <option value="spayed_female">Spayed Female ♀</option>
                      <option value="male">Intact Male</option>
                      <option value="female">Intact Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Color / Markings</label>
                    <input
                      type="text"
                      value={newPetColor}
                      onChange={(e) => setNewPetColor(e.target.value)}
                      placeholder="e.g. Golden & White"
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={newPetDob}
                      onChange={(e) => setNewPetDob(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newPetWeight}
                      onChange={(e) => setNewPetWeight(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Microchip Number (Optional)</label>
                    <input
                      type="text"
                      value={newPetMicrochip}
                      onChange={(e) => setNewPetMicrochip(e.target.value)}
                      placeholder="e.g. 98514100293"
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Allergies (comma-separated)</label>
                    <input
                      type="text"
                      value={newPetAllergies}
                      onChange={(e) => setNewPetAllergies(e.target.value)}
                      placeholder="e.g. Chicken, Penicillin"
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={creatingPet}
                    className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-black text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    {creatingPet ? 'Saving Companion...' : 'Save Companion Profile'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Clinical Notifications & Recall Center Modal */}
        {showNotificationsModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
            id="petowner-notifications-modal"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      Clinical Alerts & Recall Notices
                    </h3>
                    <p className="text-xs text-slate-300">
                      Preventive reminders, scheduled booster recalls & hospital updates
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={handleMarkAllNotificationsRead}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-teal-200 transition"
                      id="mark-all-read-btn"
                    >
                      Mark All Read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotificationsModal(false)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notification Audio & Sound Alert Control */}
              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <NotificationSoundToggle variant="full" id="petowner-modal-sound-banner" />
              </div>

              {/* Notification Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3 divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <CheckCircle className="w-10 h-10 mx-auto mb-2 text-teal-500/50" />
                    <h4 className="text-sm font-bold text-slate-700">No New Notifications</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      You are completely up-to-date on all pet recalls and appointments.
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isVaccine = n.type === 'vaccination';
                    const isDeworming = n.type === 'deworming';
                    const isAppointment = n.type === 'appointment';

                    return (
                      <div
                        key={n.notificationId}
                        className={`pt-3 first:pt-0 p-3 rounded-2xl transition ${
                          !n.read ? 'bg-teal-50/60 border border-teal-200/80 shadow-xs' : 'bg-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              isVaccine
                                ? 'bg-teal-100 text-teal-700'
                                : isDeworming
                                ? 'bg-emerald-100 text-emerald-700'
                                : isAppointment
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {isVaccine ? (
                                <ShieldCheck className="w-4 h-4" />
                              ) : isDeworming ? (
                                <Pill className="w-4 h-4" />
                              ) : isAppointment ? (
                                <Calendar className="w-4 h-4" />
                              ) : (
                                <Bell className="w-4 h-4" />
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h5 className="text-xs font-black text-slate-900">
                                  {n.title}
                                </h5>
                                {!n.read && (
                                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                                )}
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400 font-bold block pt-1">
                                {new Date(n.date).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {(isVaccine || isDeworming) && (
                              <button
                                onClick={() => {
                                  setShowNotificationsModal(false);
                                  handleNotificationBook(pets[0]?.petId || '');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
                              >
                                Book Now
                              </button>
                            )}
                            <button
                              onClick={() => handleDismissNotification(n.notificationId)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                              title="Dismiss notification"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {notifications.length} total notice{notifications.length !== 1 ? 's' : ''} on record
                </span>
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="px-5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

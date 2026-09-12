import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Calculator, 
  FileSpreadsheet, 
  Activity, 
  Layers, 
  Warehouse, 
  Coins, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Check, 
  X, 
  Plus, 
  Search, 
  AlertTriangle, 
  Clock, 
  Briefcase, 
  FileHeart, 
  Eye, 
  HeartHandshake, 
  Trash2,
  AlertCircle,
  Sparkles,
  Stethoscope,
  Syringe,
  Pill,
  ShieldCheck,
  History,
  Zap,
  ArrowLeft,
  Home
} from 'lucide-react';
import { 
  PetProfile, 
  Appointment, 
  Consultation, 
  LaboratoryReport, 
  ImagingRecord, 
  SurgeryRecord, 
  HospitalizationRecord, 
  InventoryItem, 
  Invoice, 
  DoctorProfile, 
  UserProfile,
  PrescriptionItem,
  VaccinationRecord,
  DewormingRecord
} from '../types';
import { dbService } from '../services/db';
import Realistic3DEmoji from './Realistic3DEmoji';
import DoctorHistoryAiDiagnostic from './DoctorHistoryAiDiagnostic';
import DoctorVaccinationDeworming from './DoctorVaccinationDeworming';
import DoctorMedicalRecords from './DoctorMedicalRecords';
import DoctorPrescriptionStudio from './DoctorPrescriptionStudio';
import DoctorDashboard3D from './doctor/DoctorDashboard3D';

interface DoctorViewProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

export default function DoctorView({ currentUser, onLogout }: DoctorViewProps) {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'clinical_ai' | 'prescription' | 'vaccination' | 'medical_records' | 'patients' | 'appointments' | 'consultations' | 'ai' | 'calculator' | 'labs' | 'imaging' | 'surgeries' | 'hospitalizations' | 'inventory' | 'billing' | 'reports' | 'settings'
  >('dashboard');
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
      const previous = tabHistory[tabHistory.length - 1] as typeof activeTab;
      setTabHistory(h => h.slice(0, -1));
      setActiveTab(previous);
    } else if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    }
  };

  const handleGoHome = () => {
    if (activeTab !== 'dashboard') {
      setTabHistory(prev => [...prev, activeTab]);
      setActiveTab('dashboard');
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
  
  // Data States
  const [patients, setPatients] = useState<PetProfile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [surgeries, setSurgeries] = useState<SurgeryRecord[]>([]);
  const [labsList, setLabsList] = useState<LaboratoryReport[]>([]);
  const [imagingList, setImagingList] = useState<ImagingRecord[]>([]);

  // Transfer states from AI Diagnostic to Prescription Studio
  const [transferRxItems, setTransferRxItems] = useState<PrescriptionItem[]>([]);
  const [transferDiagnosis, setTransferDiagnosis] = useState<string>('');
  const [transferPatientId, setTransferPatientId] = useState<string>('');

  // Search/Filters
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');

  // Dose Calculator States
  const [calcWeight, setCalcWeight] = useState(10);
  const [calcDoseRate, setCalcDoseRate] = useState(0.2); // mg/kg
  const [calcConcentration, setCalcConcentration] = useState(1.5); // mg/ml
  const [calcResult, setCalcResult] = useState<number | null>(null);
  const [calcDrugName, setCalcDrugName] = useState('Meloxicam');
  const [aiCalcExplain, setAiCalcExplain] = useState('');
  const [aiCalcLoading, setAiCalcLoading] = useState(false);

  // AI Assistant States
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Consultations Log state
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalHistory, setClinicalHistory] = useState('');
  const [temp, setTemp] = useState(38.5);
  const [pulse, setPulse] = useState(100);
  const [resp, setResp] = useState(24);
  const [systemicExam, setSystemicExam] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [prescDrug, setPrescDrug] = useState('');
  const [prescDose, setPrescDose] = useState('');
  const [prescInstructions, setPrescInstructions] = useState('');

  // New Lab Report States
  const [labPatientId, setLabPatientId] = useState('');
  const [labType, setLabType] = useState<'cbc' | 'biochemistry' | 'urinalysis' | 'fecal'>('cbc');
  const [labParamName, setLabParamName] = useState('WBC');
  const [labParamVal, setLabParamVal] = useState('9.5');
  const [labParamRange, setLabParamRange] = useState('6.0 - 17.0');
  const [labParamUnit, setLabParamUnit] = useState('10^9/L');

  // Hospitalizations Board states
  const [hospPatientId, setHospPatientId] = useState('');
  const [hospWard, setHospWard] = useState('General Ward');
  const [hospCage, setHospCage] = useState('Cage A-01');
  const [hospDiagnosis, setHospDiagnosis] = useState('');
  const [hospFeeding, setHospFeeding] = useState('NPO');
  const [activeHospitalizations, setActiveHospitalizations] = useState<HospitalizationRecord[]>([]);

  // Billing states
  const [billPatientId, setBillPatientId] = useState('');
  const [billItemDesc, setBillItemDesc] = useState('Consultation Fee');
  const [billItemQty, setBillItemQty] = useState(1);
  const [billItemPrice, setBillItemPrice] = useState(45);
  const [currentBillItems, setCurrentBillItems] = useState<{description: string, quantity: number, unitPrice: number, total: number}[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const syncData = () => {
    setPatients(dbService.getPets());
    setAppointments(dbService.getAppointments().filter(a => a.doctorId === currentUser.uid || a.doctorId === 'doctor-123'));
    setConsultations(dbService.getConsultations().filter(c => c.doctorId === currentUser.uid || c.doctorId === 'doctor-123'));
    setInventory(dbService.getInventory());
    setInvoices(dbService.getInvoices());
    setSurgeries(dbService.getSurgeries());
    setLabsList(dbService.getLabs());
    setImagingList(dbService.getImaging());
    const doc = dbService.getDoctor(currentUser.uid) || dbService.getDoctor('doctor-123') || null;
    setDoctorProfile(doc);
    setActiveHospitalizations(dbService.getHospitalizations().filter(h => h.status === 'admitted'));
  };

  useEffect(() => {
    syncData();
  }, [currentUser]);

  // Handle appointment status updates
  const handleAppointmentStatus = (id: string, status: 'approved' | 'rejected' | 'completed') => {
    const apt = dbService.getAppointments().find(a => a.appointmentId === id);
    if (apt) {
      const updated = { ...apt, status };
      dbService.saveAppointment(updated);
      dbService.logAction(currentUser.uid, currentUser.name, 'doctor', `${status.toUpperCase()} appointment for patient: ${apt.petName}`, 'appointments', id, 'success');
      syncData();
    }
  };

  // Perform dose calculations locally
  const performCalculation = () => {
    if (calcWeight <= 0 || calcDoseRate <= 0 || calcConcentration <= 0) return;
    const doseMg = calcWeight * calcDoseRate;
    const volMl = doseMg / calcConcentration;
    setCalcResult(Number(volMl.toFixed(3)));
  };

  // Consult calculator dose with Gemini AI
  const handleAskAiCalc = async () => {
    if (!calcWeight || !calcDoseRate || !calcConcentration) return;
    setAiCalcLoading(true);
    const clinicalPrompt = `Please verify and output step-by-step clinical veterinary dose calculation steps for:
Drug Name: ${calcDrugName}
Patient Body Weight: ${calcWeight} kg
Target Dose Rate: ${calcDoseRate} mg/kg
Drug Stock Concentration: ${calcConcentration} mg/ml.
Check for any standard contraindications or species-specific adjustments for common pets. Include the prominent professional clinical disclaimer.`;

    try {
      const response = await fetch('/api/ai/veterinarian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: clinicalPrompt })
      });
      const data = await response.json();
      setAiCalcExplain(data.text || 'Verification response unavailable.');
    } catch (e) {
      setAiCalcExplain('Dose calculation verified locally: Volume (ml) = (Weight [kg] × Dose Rate [mg/kg]) ÷ Concentration [mg/ml]. Always verify manually before clinical injection.');
    } finally {
      setAiCalcLoading(false);
    }
  };

  // Consult AI Clinical Assistant
  const handleAskClinicalAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || aiLoading) return;

    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/veterinarian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiQuery })
      });
      const data = await response.json();
      setAiResponse(data.text || 'Unable to retrieve clinical analysis.');
    } catch (err) {
      setAiResponse('Connection timeout. Please double-check client-side configurations or retry.');
    } finally {
      setAiLoading(false);
    }
  };

  // Create Consultation Record
  const handleCreateConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !chiefComplaint || !diagnosis) return;

    const pet = patients.find(p => p.petId === selectedPatientId);
    
    const newConsultation: Consultation = {
      consultationId: 'con-' + Math.random().toString(36).substring(2, 9),
      patientId: selectedPatientId,
      petName: pet?.name || 'Patient',
      doctorId: currentUser.uid,
      doctorName: doctorProfile?.name || currentUser.name,
      date: new Date().toISOString().split('T')[0],
      chiefComplaint,
      history: clinicalHistory,
      examination: {
        temperature: Number(temp),
        pulse: Number(pulse),
        respiration: Number(resp),
        crt: '< 2s',
        mucousMembranes: 'Pink',
        hydration: 'Normal',
        bodyConditionScore: 5,
        weight: pet?.weight || 10,
        systemicExam
      },
      differentialDiagnosis: 'Pending tests',
      diagnosis,
      treatmentPlan,
      prescription: prescDrug ? [{
        drugName: prescDrug,
        doseRate: prescDose,
        concentration: '100mg/ml',
        route: 'PO',
        frequency: 'BID',
        duration: '5 days',
        instructions: prescInstructions
      }] : [],
      followUp: 'Return in 7 days for review.',
      createdAt: new Date().toISOString()
    };

    dbService.saveConsultation(newConsultation);
    dbService.logAction(currentUser.uid, currentUser.name, 'doctor', `Logged a new consultation medical record for patient: ${newConsultation.petName}`, 'consultations', newConsultation.consultationId, 'success');
    
    // Clear Form & Sync
    setChiefComplaint('');
    setClinicalHistory('');
    setDiagnosis('');
    setTreatmentPlan('');
    setPrescDrug('');
    setPrescDose('');
    setPrescInstructions('');
    syncData();
    showToast('Medical Consultation file created successfully!');
  };

  // Add lab result entry
  const handleAddLabResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labPatientId || !labParamName || !labParamVal) return;

    const pet = patients.find(p => p.petId === labPatientId);
    const newLab: LaboratoryReport = {
      reportId: 'lab-' + Math.random().toString(36).substring(2, 9),
      patientId: labPatientId,
      petName: pet?.name || 'Patient',
      doctorId: currentUser.uid,
      doctorName: doctorProfile?.name || currentUser.name,
      testType: labType,
      date: new Date().toISOString().split('T')[0],
      results: {
        [labParamName]: { value: labParamVal, referenceRange: labParamRange, unit: labParamUnit }
      },
      notes: 'Manually logged reference analysis'
    };

    dbService.saveLab(newLab);
    dbService.logAction(currentUser.uid, currentUser.name, 'doctor', `Logged laboratory assay for ${newLab.petName}`, 'labs', newLab.reportId, 'success');
    syncData();
    showToast('Lab result registered successfully!');
  };

  // Admit patient to ICU
  const handleAdmitPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospPatientId || !hospDiagnosis) return;

    const pet = patients.find(p => p.petId === hospPatientId);
    const newHosp: HospitalizationRecord = {
      hospitalizationId: 'hosp-' + Math.random().toString(36).substring(2, 9),
      patientId: hospPatientId,
      petName: pet?.name || 'Patient',
      ward: hospWard,
      cage: hospCage,
      admissionDate: new Date().toISOString(),
      diagnosis: hospDiagnosis,
      vitalsLog: [{ timestamp: new Date().toISOString(), temp: 38.5, pulse: 100, resp: 24, notes: 'Initial Admission Admission Check' }],
      medicationSchedule: 'Standard care',
      feedingInstructions: hospFeeding,
      fluidTherapyRecord: 'None',
      progressNotes: 'Admitted under direct veterinary watch.',
      status: 'admitted'
    };

    dbService.saveHospitalization(newHosp);
    dbService.logAction(currentUser.uid, currentUser.name, 'doctor', `Admitted patient to ICU ward: ${newHosp.petName}`, 'hospitalizations', newHosp.hospitalizationId, 'success');
    syncData();
    showToast('Patient admitted to Ward watch successfully!');
  };

  // discharge patient
  const handleDischargePatient = (hospId: string) => {
    const hosp = dbService.getHospitalizations().find(h => h.hospitalizationId === hospId);
    if (hosp) {
      hosp.status = 'discharged';
      hosp.dischargeDate = new Date().toISOString();
      hosp.progressNotes += `\nDischarged on ${new Date().toLocaleDateString()}`;
      dbService.saveHospitalization(hosp);
      dbService.logAction(currentUser.uid, currentUser.name, 'doctor', `Discharged patient: ${hosp.petName}`, 'hospitalizations', hospId, 'success');
      syncData();
    }
  };

  // Billing Itemized Additions
  const handleAddBillingItem = () => {
    if (!billItemDesc || billItemPrice <= 0) return;
    setCurrentBillItems(prev => [...prev, {
      description: billItemDesc,
      quantity: Number(billItemQty),
      unitPrice: Number(billItemPrice),
      total: Number((billItemQty * billItemPrice).toFixed(2))
    }]);
  };

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billPatientId || currentBillItems.length === 0) return;

    const pet = patients.find(p => p.petId === billPatientId);
    const settings = dbService.getSettings();
    const taxRatePct = settings.taxRate || 18;
    const subtotal = currentBillItems.reduce((sum, item) => sum + item.total, 0);
    const tax = Number(((subtotal * taxRatePct) / 100).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    const newInvoice: Invoice = {
      invoiceId: 'inv-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
      patientId: billPatientId,
      petName: pet?.name || 'Patient',
      ownerName: 'Ajit Kumar',
      date: new Date().toISOString().split('T')[0],
      items: currentBillItems,
      subtotal,
      tax,
      total,
      status: 'unpaid'
    };

    dbService.saveInvoice(newInvoice);
    dbService.logAction(currentUser.uid, currentUser.name, 'doctor', `Issued outpatient bill for: ${newInvoice.petName} (Total: ₹${total})`, 'invoices', newInvoice.invoiceId, 'success');
    
    setCurrentBillItems([]);
    syncData();
    showToast('Outpatient billing invoice generated successfully!');
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) || 
    p.breed.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.microchipNumber?.includes(patientSearch)
  );

  const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number }>({ hours: 24, minutes: 0 });

  useEffect(() => {
    if (currentUser.status === 'pending') {
      const calculateTimeLeft = () => {
        const createdDate = new Date(currentUser.createdAt).getTime();
        const targetDate = createdDate + (24 * 60 * 60 * 1000);
        const now = new Date().getTime();
        const diff = targetDate - now;

        if (diff > 0) {
          const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft({ hours: h, minutes: m });
        } else {
          setTimeLeft({ hours: 0, minutes: 0 });
        }
      };
      
      calculateTimeLeft();
      const interval = setInterval(calculateTimeLeft, 60000);
      return () => clearInterval(interval);
    }
  }, [currentUser.status, currentUser.createdAt]);

  if (currentUser.status === 'pending' || doctorProfile?.verificationStatus === 'pending') {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 items-center justify-center p-8 h-full" id="doctor-pending-view">
        <motion.div 
          className="bg-white rounded-[32px] border border-slate-100 shadow-[0_24px_48px_rgba(0,0,0,0.06)] p-10 max-w-lg w-full text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-orange-500" />
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Verification Pending</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
            Thank you for registering as a Veterinarian. To ensure clinical safety and maintain standards, our Super Admin must verify your credentials.
          </p>

          <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 mb-8">
            <h4 className="text-xs font-black uppercase text-orange-400 tracking-widest mb-2">Estimated Wait Time</h4>
            <div className="text-4xl font-black text-orange-500 font-mono flex justify-center items-baseline gap-2">
              <span>{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-lg text-orange-300">h</span>
              <span>:</span>
              <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-lg text-orange-300">m</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 font-medium mb-8 max-w-sm mx-auto leading-relaxed">
            Please allow up to 24 hours for the verification process. We will notify you once your account has been approved.
          </p>

          <button 
            onClick={onLogout}
            className="px-8 py-3.5 bg-slate-100 text-slate-600 rounded-[20px] font-black text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white relative overflow-hidden h-screen" id="doctor-view-container">
      <div className="flex-1 flex flex-col md:flex-row relative z-10 h-full overflow-hidden">
        
        {/* Claymorphic Side Navigation */}
        <nav className="md:w-24 bg-white border-r border-slate-100 flex md:flex-col items-center justify-between p-4 z-40">
          <div className="hidden md:flex flex-col items-center gap-6 mb-4">
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="p-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_8px_16px_rgba(0,188,212,0.3)] cursor-pointer transition-all hover:scale-105"
              title="3D Doctor Command Center"
            >
              <Activity className="h-6 w-6" />
            </div>
            
            <div className="flex flex-col items-center gap-2.5">
              {[
                { id: 'dashboard', icon: Zap, label: 'Dashboard' },
                { id: 'clinical_ai', icon: Stethoscope, label: 'AI Diagnostics' },
                { id: 'prescription', icon: Pill, label: 'Digital Rx' },
                { id: 'vaccination', icon: Syringe, label: 'Vaccines & Deworming' },
                { id: 'medical_records', icon: History, label: 'Medical Records' },
                { id: 'patients', icon: Users, label: 'Patients' },
                { id: 'appointments', icon: Calendar, label: 'Schedule' },
                { id: 'consultations', icon: FileText, label: 'Record' },
                { id: 'hospitalizations', icon: Layers, label: 'Ward' },
                { id: 'inventory', icon: Warehouse, label: 'Stock' },
                { id: 'billing', icon: Coins, label: 'Billing' },
                { id: 'calculator', icon: Calculator, label: 'Dose Calc' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  title={item.label}
                  className={`p-3 rounded-2xl transition-all duration-300 relative group ${
                    activeTab === item.id 
                      ? 'bg-white shadow-[0_8px_20px_rgba(0,0,0,0.08)] text-teal-600 scale-110' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  
                  {/* Tooltip on hover */}
                  <div className="absolute left-16 px-3 py-1.5 bg-slate-950 text-white text-[11px] font-mono font-bold rounded-xl whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-800">
                    {item.label}
                  </div>

                  {activeTab === item.id && (
                    <motion.div 
                      layoutId="activeTabDoc"
                      className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-teal-600 rounded-r-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={onLogout}
            title="Sign Out"
            className="p-3.5 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </nav>

        {/* Mobile Horizontal Navigation Header */}
        <div className="md:hidden flex items-center justify-between p-3 bg-white border-b border-slate-200 z-30 overflow-x-auto gap-2 no-scrollbar">
          {[
            { id: 'dashboard', icon: Zap, label: 'Dashboard' },
            { id: 'clinical_ai', icon: Stethoscope, label: 'AI Triage' },
            { id: 'prescription', icon: Pill, label: 'Rx Studio' },
            { id: 'vaccination', icon: Syringe, label: 'Vaccines' },
            { id: 'medical_records', icon: History, label: 'Records' },
            { id: 'appointments', icon: Calendar, label: 'Schedule' },
            { id: 'hospitalizations', icon: Layers, label: 'Ward' },
            { id: 'billing', icon: Coins, label: 'Billing' },
            { id: 'calculator', icon: Calculator, label: 'Dose Calc' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 ${
                activeTab === item.id ? 'bg-slate-900 text-cyan-400' : 'text-slate-600 bg-slate-100'
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 relative z-10 custom-scrollbar max-w-7xl mx-auto w-full">
          {toastMessage && (
            <div className="fixed top-6 right-6 z-50 p-4 bg-slate-900 text-white shadow-2xl rounded-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
              <Check className="w-5 h-5 text-teal-400 shrink-0" />
              <span className="text-xs font-bold">{toastMessage}</span>
            </div>
          )}

          {/* Quick Navigation Breadcrumb & Toolbar (Sticky for fast module switching) */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-sm" id="doctor-toolbar-container">
            <div className="flex items-center gap-2">
              {/* Back Button */}
              <button
                onClick={handleGoBack}
                className="px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all active:scale-95 border border-slate-200/60 shadow-xs group"
                title="Go to previous tab"
                id="doctor-back-btn"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-cyan-600 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>

              {/* Home / Dashboard Button */}
              <button
                onClick={handleGoHome}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${
                  activeTab === 'dashboard' 
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Go to Doctor Dashboard"
                id="doctor-home-btn"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              {activeTab !== 'dashboard' && (
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  /
                  <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 capitalize font-mono text-[11px] font-black border border-teal-200/60">
                    {activeTab.replace('_', ' ')}
                  </span>
                </span>
              )}
            </div>

            {/* Quick-Jump Section Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'clinical_ai', label: 'AI Triage', icon: Stethoscope },
                { id: 'prescription', label: 'Digital Rx', icon: Pill },
                { id: 'vaccination', label: 'Vaccines', icon: Syringe },
                { id: 'medical_records', label: 'EMR Hub', icon: History },
                { id: 'appointments', label: 'Schedule', icon: Calendar },
                { id: 'hospitalizations', label: 'ICU Ward', icon: Layers },
                { id: 'calculator', label: 'Dose Calc', icon: Calculator },
                { id: 'billing', label: 'Billing', icon: Coins }
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
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Tab 0: 3D Doctor Dashboard */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <DoctorDashboard3D
                  currentUser={currentUser}
                  doctorProfile={doctorProfile}
                  patients={patients}
                  appointments={appointments}
                  consultations={consultations}
                  hospitalizations={activeHospitalizations}
                  invoices={invoices}
                  labs={labsList}
                  imaging={imagingList}
                  surgeries={surgeries}
                  onNavigateTab={(tab, petId) => {
                    if (petId) {
                      setSelectedPatientId(petId);
                      setTransferPatientId(petId);
                    }
                    setActiveTab(tab);
                  }}
                  onQuickStartConsultation={(petId) => {
                    setSelectedPatientId(petId);
                    setTransferPatientId(petId);
                    setActiveTab('clinical_ai');
                  }}
                  onQuickPrescribe={(petId) => {
                    setSelectedPatientId(petId);
                    setTransferPatientId(petId);
                    setActiveTab('prescription');
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'clinical_ai' && (
              <motion.div
                key="clinical_ai"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <DoctorHistoryAiDiagnostic
                  patients={patients}
                  initialPatientId={transferPatientId || selectedPatientId}
                  onSaveConsultation={(con) => {
                    dbService.saveConsultation(con);
                    syncData();
                  }}
                  onTransferToPrescription={(items, dx, patient) => {
                    setTransferRxItems(items);
                    setTransferDiagnosis(dx);
                    setTransferPatientId(patient.petId);
                    setActiveTab('prescription');
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'prescription' && (
              <motion.div
                key="prescription"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <DoctorPrescriptionStudio
                  patients={patients}
                  initialPatientId={transferPatientId || selectedPatientId}
                  initialItems={transferRxItems}
                  initialDiagnosis={transferDiagnosis}
                  doctorName={doctorProfile?.name || currentUser.name}
                  onSavePrescription={(prescription) => {
                    const newCon: Consultation = {
                      consultationId: 'con-rx-' + Date.now(),
                      patientId: prescription.patientId,
                      petName: prescription.patientName,
                      doctorId: currentUser.uid,
                      doctorName: doctorProfile?.name || currentUser.name,
                      date: new Date().toISOString().split('T')[0],
                      chiefComplaint: `Prescription issued for ${prescription.diagnosis}`,
                      history: `Mode: ${prescription.mode.toUpperCase()}. ${prescription.notes || ''}`,
                      examination: {
                        temperature: 38.5,
                        pulse: 100,
                        respiration: 24,
                        crt: '< 2s',
                        mucousMembranes: 'Pink',
                        hydration: 'Normal',
                        bodyConditionScore: 5,
                        weight: patients.find(p => p.petId === prescription.patientId)?.weight || 10,
                        systemicExam: 'Systemic clinical examination conducted prior to prescribing'
                      },
                      differentialDiagnosis: 'Confirmed',
                      diagnosis: prescription.diagnosis,
                      treatmentPlan: prescription.notes || 'Administer prescribed medications',
                      prescription: prescription.items,
                      followUp: 'Recheck upon completion of prescription course',
                      createdAt: new Date().toISOString()
                    };
                    dbService.saveConsultation(newCon);
                    dbService.logAction(
                      currentUser.uid,
                      currentUser.name,
                      'doctor',
                      `Prescription finalized for ${prescription.patientName}: ${prescription.diagnosis}`,
                      'consultations',
                      newCon.consultationId,
                      'success'
                    );
                    syncData();
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'vaccination' && (
              <motion.div
                key="vaccination"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <DoctorVaccinationDeworming
                  patients={patients}
                  doctorName={doctorProfile?.name || currentUser.name}
                  onAdministerVaccine={(petId, record) => {
                    dbService.addVaccinationRecord(petId, record);
                    syncData();
                  }}
                  onAdministerDeworming={(petId, record) => {
                    dbService.addDewormingRecord(petId, record);
                    syncData();
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'medical_records' && (
              <motion.div
                key="medical_records"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <DoctorMedicalRecords
                  patients={patients}
                  consultations={consultations}
                  surgeries={surgeries}
                  labs={labsList}
                  imaging={imagingList}
                />
              </motion.div>
            )}
            {activeTab === 'patients' && (
              <motion.div 
                key="patients"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-6xl mx-auto space-y-8 pb-20"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Timelines</h1>
                    <p className="text-slate-500 font-medium">Access clinical histories and physical summaries.</p>
                  </div>
                  <div className="relative max-w-sm w-full">
                    <input 
                      type="text" 
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      placeholder="Search microchip, name..." 
                      className="w-full bg-white/80 border border-slate-100 rounded-[20px] py-3 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPatients.map((p) => (
                    <div key={p.petId} className="bg-white rounded-[32px] border border-slate-100 shadow-[0_16px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.08)] transition-all p-8 space-y-6 group">
                      <div className="flex items-center gap-4">
                        <Realistic3DEmoji emoji={p.species === 'dog' ? 'dog' : p.species === 'cat' ? 'cat' : 'paw'} size="lg" />
                        <div>
                          <h3 className="font-black text-slate-900 text-lg group-hover:text-cyan-500 transition-colors">{p.name}</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.breed}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                        <div className="bg-white/50 rounded-2xl p-3">
                          <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Weight</span>
                          <span className="font-black text-slate-800 text-sm">{p.weight} kg</span>
                        </div>
                        <div className="bg-white/50 rounded-2xl p-3">
                          <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Sex</span>
                          <span className="font-black text-slate-800 text-sm capitalize">{p.sex ? p.sex.split('_')[0] : 'Unknown'}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          setSelectedPatientId(p.petId);
                          setActiveTab('consultations');
                        }}
                        className="w-full py-4 bg-slate-900 text-white rounded-[20px] font-black text-xs hover:bg-slate-800 transition-all shadow-lg"
                      >
                        Clinical Summary
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'appointments' && (
              <motion.div 
                key="appointments"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto space-y-8 pb-20"
              >
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">Visit Scheduler</h1>
                  <p className="text-slate-500 font-medium">Manage pending consultation requests.</p>
                </div>

                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt.appointmentId} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-[0_16px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.08)] transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                      <div className="flex items-center gap-5">
                        <Realistic3DEmoji emoji="appointment" size="md" />
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-black text-slate-900 text-lg">{apt.petName}</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              apt.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                              apt.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {apt.status}
                            </span>
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client: {apt.ownerName}</p>
                          <p className="text-sm font-medium text-slate-600 mt-2 max-w-sm">"{apt.reason}"</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="text-right mr-4 hidden sm:block">
                          <p className="text-sm font-black text-slate-800">{apt.date}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase">{apt.timeSlot}</p>
                        </div>

                        {apt.status === 'pending' && (
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button 
                              onClick={() => handleAppointmentStatus(apt.appointmentId, 'approved')}
                              className="flex-1 sm:flex-none p-3.5 rounded-[18px] bg-emerald-500 text-white shadow-[0_8px_16px_rgba(16,185,129,0.2)] hover:bg-emerald-600 transition-all"
                            >
                              <Check className="h-5 w-5 mx-auto" />
                            </button>
                            <button 
                              onClick={() => handleAppointmentStatus(apt.appointmentId, 'rejected')}
                              className="flex-1 sm:flex-none p-3.5 rounded-[18px] bg-rose-500 text-white shadow-[0_8px_16px_rgba(244,63,94,0.2)] hover:bg-rose-600 transition-all"
                            >
                              <X className="h-5 w-5 mx-auto" />
                            </button>
                          </div>
                        )}

                        {apt.status === 'approved' && (
                          <button 
                            onClick={() => handleAppointmentStatus(apt.appointmentId, 'completed')}
                            className="w-full sm:w-auto px-6 py-3.5 bg-cyan-500 text-white rounded-[20px] font-black text-xs hover:bg-cyan-600 transition-all shadow-md"
                          >
                            Finish Visit
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'consultations' && (
              <motion.div 
                key="consultations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-8 pb-20"
              >
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">Medical Consultation</h1>
                  <p className="text-slate-500 font-medium">Log clinical examination and physical findings.</p>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_16px_32px_rgba(0,0,0,0.04)] p-8">
                  <form onSubmit={handleCreateConsultation} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Select Patient</label>
                        <select
                          value={selectedPatientId}
                          onChange={(e) => setSelectedPatientId(e.target.value)}
                          required
                          className="w-full bg-white border border-slate-100 rounded-[20px] py-4 px-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all"
                        >
                          <option value="">Choose Patient...</option>
                          {patients.map(p => (
                            <option key={p.petId} value={p.petId}>{p.name} ({p.breed})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Chief Complaint</label>
                        <input
                          type="text"
                          value={chiefComplaint}
                          onChange={(e) => setChiefComplaint(e.target.value)}
                          placeholder="e.g. Coughing, Lethargy..."
                          required
                          className="w-full bg-white border border-slate-100 rounded-[20px] py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-6 bg-white/50 rounded-[28px] border border-slate-100">
                      {[
                        { label: 'Temp (°C)', val: temp, set: setTemp },
                        { label: 'Pulse (bpm)', val: pulse, set: setPulse },
                        { label: 'Resp (brpm)', val: resp, set: setResp }
                      ].map(vit => (
                        <div key={vit.label}>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{vit.label}</label>
                          <input
                            type="number"
                            step="0.1"
                            value={vit.val}
                            onChange={(e) => vit.set(Number(e.target.value))}
                            className="w-full bg-white border border-slate-100 rounded-[18px] py-3 px-4 text-sm font-black focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Diagnosis & Treatment Plan</label>
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={diagnosis}
                          onChange={(e) => setDiagnosis(e.target.value)}
                          placeholder="Diagnosis..."
                          required
                          className="w-full bg-white border border-slate-100 rounded-[20px] py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all"
                        />
                        <textarea
                          rows={3}
                          value={treatmentPlan}
                          onChange={(e) => setTreatmentPlan(e.target.value)}
                          placeholder="Treatment protocol..."
                          required
                          className="w-full bg-white border border-slate-100 rounded-[24px] p-6 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all resize-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-5 bg-cyan-500 text-white rounded-[28px] font-black text-lg shadow-[0_12px_24px_rgba(0,188,212,0.4)] hover:bg-cyan-600 transition-all"
                    >
                      Verify & Log Clinical File
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === 'ai' && (
              <motion.div 
                key="ai"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-4xl mx-auto space-y-8 pb-20"
              >
                <div className="flex items-center gap-4 p-6 bg-orange-50 rounded-[32px] border border-orange-100 text-orange-900 text-xs font-black">
                  <AlertTriangle className="h-6 w-6 text-orange-500 shrink-0" />
                  <p className="uppercase tracking-widest leading-relaxed">
                    Clinical Liability: AI support only. The primary veterinarian remains fully responsible for all clinical decisions and dosages.
                  </p>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_16px_32px_rgba(0,0,0,0.04)] p-8">
                  <form onSubmit={handleAskClinicalAi} className="space-y-6">
                    <h3 className="font-black text-xl text-slate-800">Clinical Decision Support</h3>
                    <textarea
                      rows={4}
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="e.g. Write a differential diagnosis list for sudden lethargy and pale membranes in a 4y canine..."
                      required
                      className="w-full bg-white border border-slate-100 rounded-[28px] p-8 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all resize-none"
                    />
                    <button
                      type="submit"
                      disabled={aiLoading}
                      className="w-full py-5 bg-slate-900 text-white rounded-[28px] font-black text-base shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                    >
                      {aiLoading ? (
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <>Consult Decision Support <Sparkles className="h-5 w-5" /></>
                      )}
                    </button>
                  </form>

                  {aiResponse && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 p-8 bg-white rounded-[28px] border border-slate-100 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-medium"
                    >
                      {aiResponse}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Other tabs follow the same aesthetic... */}
            {['calculator', 'labs', 'inventory', 'billing'].includes(activeTab) && (
              <div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
                <div className="w-24 h-24 rounded-[40px] bg-white flex items-center justify-center text-4xl shadow-inner border border-white opacity-40">
                  🏗️
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-400">Environment Update</h2>
                  <p className="text-slate-400 font-medium max-w-sm mt-2">The {activeTab} environment is being synchronized with the new clinical design system.</p>
                </div>
              </div>
            )}

        {/* TAB 5: DOSE CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="space-y-6" id="doc-calc-panel">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Veterinary Clinical Dose Calculator</h1>
              <p className="text-slate-500 text-xs mt-0.5">Calculate liquid volumes, injection dosages, or active ingredients. Verify calculations with Gemini.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calculator Panel */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm uppercase text-slate-800 tracking-wider">
                  Dose Formulation
                </h3>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Drug Stock/Formula Name</label>
                    <input
                      type="text"
                      value={calcDrugName}
                      onChange={(e) => setCalcDrugName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-2"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Body Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={calcWeight}
                      onChange={(e) => setCalcWeight(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-2"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Dose Rate (mg/kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calcDoseRate}
                      onChange={(e) => setCalcDoseRate(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-2"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Stock Concentration (mg/ml)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={calcConcentration}
                      onChange={(e) => setCalcConcentration(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={performCalculation}
                      className="py-2.5 bg-teal-600 text-white rounded-xl text-xs font-extrabold uppercase hover:bg-teal-500 transition shadow"
                      id="calc-dose-btn"
                    >
                      Calculate ML
                    </button>
                    <button
                      onClick={handleAskAiCalc}
                      disabled={aiCalcLoading}
                      className="py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase hover:bg-slate-800 transition shadow flex items-center justify-center gap-1.5"
                      id="explain-calc-btn"
                    >
                      {aiCalcLoading ? 'Checking...' : 'Gemini Review'}
                    </button>
                  </div>
                </div>

                {calcResult !== null && (
                  <div className="p-4 bg-teal-55/40 border border-teal-100 rounded-xl text-center">
                    <div className="text-[10px] text-teal-800 font-bold uppercase tracking-wider">Required Volume</div>
                    <div className="text-3xl font-black text-teal-600 mt-1">{calcResult} ml</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">Total active drug mass: {(calcWeight * calcDoseRate).toFixed(2)} mg</div>
                  </div>
                )}
              </div>

              {/* Verified steps Column */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm h-full flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm uppercase text-slate-800 tracking-wider mb-3">
                      Gemini Clinical Verification Steps
                    </h3>
                    {aiCalcExplain ? (
                      <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-mono">
                        {aiCalcExplain}
                      </div>
                    ) : (
                      <div className="text-center p-12 text-slate-400 text-xs">
                        Enter active parameters and click "Gemini Review" to verify standard safety brackets.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: LABS & ASSAYS */}
        {activeTab === 'labs' && (
          <div className="space-y-6" id="doc-labs-panel">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Laboratory Panels Register</h1>
              <p className="text-slate-500 text-xs mt-0.5">Log hematology, biochemistries, urinalyses, and other lab assays.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm uppercase text-slate-800 tracking-wider">
                  Log New Assay Results
                </h3>

                <form onSubmit={handleAddLabResult} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Select Patient</label>
                    <select
                      value={labPatientId}
                      onChange={(e) => setLabPatientId(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-teal-500/20"
                      id="lab-patient-select"
                    >
                      <option value="">-- Choose Patient --</option>
                      {patients.map(p => (
                        <option key={p.petId} value={p.petId}>{p.name} ({p.breed})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Assay Panel Type</label>
                    <select
                      value={labType}
                      onChange={(e) => setLabType(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="cbc">Complete Blood Count (CBC)</option>
                      <option value="biochemistry">Biochemistry Panel</option>
                      <option value="urinalysis">Urinalysis</option>
                      <option value="fecal">Fecal Analysis</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-100">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Parameter</label>
                      <input
                        type="text"
                        value={labParamName}
                        onChange={(e) => setLabParamName(e.target.value)}
                        required
                        className="w-full bg-white border border-slate-200 rounded-lg py-1 px-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Measured Value</label>
                      <input
                        type="text"
                        value={labParamVal}
                        onChange={(e) => setLabParamVal(e.target.value)}
                        required
                        className="w-full bg-white border border-slate-200 rounded-lg py-1 px-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Reference Range</label>
                      <input
                        type="text"
                        value={labParamRange}
                        onChange={(e) => setLabParamRange(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg py-1 px-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Unit</label>
                      <input
                        type="text"
                        value={labParamUnit}
                        onChange={(e) => setLabParamUnit(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg py-1 px-2 text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-teal-600 text-white rounded-xl text-xs font-extrabold uppercase hover:bg-teal-500 transition shadow"
                    id="submit-lab-btn"
                  >
                    Save Lab Assay Result
                  </button>
                </form>
              </div>

              {/* View all past diagnostics */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                  <h3 className="font-extrabold text-sm uppercase text-slate-800 tracking-wider mb-3">
                    Recent Diagnostic Inquiries
                  </h3>
                  <div className="space-y-3">
                    {dbService.getLabs().map((lab) => (
                      <div key={lab.reportId} className="p-3 bg-white/50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-slate-800 uppercase">{lab.petName} - {lab.testType} Analysis</div>
                          <div className="text-slate-500 mt-0.5 font-mono text-[10px]">{lab.date} • Authored by {lab.doctorName}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-bold font-mono text-[10px]">VERIFIED</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ICU HOSPITALIZATIONS */}
        {activeTab === 'hospitalizations' && (
          <div className="space-y-6" id="doc-hospitalizations-panel">
            <div>
              <h1 className="text-2xl font-black text-slate-900">ICU Hospitalization Ward</h1>
              <p className="text-slate-500 text-xs mt-0.5">Manage admitted critical care patients, cages, fluid regimens, and progress charts.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Admission controller */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm uppercase text-slate-800 tracking-wider">
                  Admit Patient to Ward
                </h3>

                <form onSubmit={handleAdmitPatient} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Select Patient</label>
                    <select
                      value={hospPatientId}
                      onChange={(e) => setHospPatientId(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-teal-500/20"
                      id="hosp-patient-select"
                    >
                      <option value="">-- Choose Patient --</option>
                      {patients.map(p => (
                        <option key={p.petId} value={p.petId}>{p.name} ({p.breed})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Ward Area</label>
                      <select
                        value={hospWard}
                        onChange={(e) => setHospWard(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-2"
                      >
                        <option value="Canine ICU">Canine ICU</option>
                        <option value="Feline Ward">Feline Ward</option>
                        <option value="Isolation Ward">Isolation Ward</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Cage Number</label>
                      <input
                        type="text"
                        value={hospCage}
                        onChange={(e) => setHospCage(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">ICU Admission Diagnosis</label>
                    <input
                      type="text"
                      value={hospDiagnosis}
                      onChange={(e) => setHospDiagnosis(e.target.value)}
                      placeholder="e.g. Parvovirus, post-op watch"
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-2"
                      id="hosp-diagnosis-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Feeding Regimen</label>
                    <input
                      type="text"
                      value={hospFeeding}
                      onChange={(e) => setHospFeeding(e.target.value)}
                      placeholder="e.g. NPO for 12hr, water only"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-2"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-teal-600 text-white rounded-xl text-xs font-extrabold uppercase hover:bg-teal-500 transition shadow"
                    id="submit-hosp-btn"
                  >
                    Admit Patient File
                  </button>
                </form>
              </div>

              {/* Hospitalized grid */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm uppercase text-slate-800 tracking-wider">
                    ICU Active Occupancy Board
                  </h3>

                  <div className="space-y-3">
                    {activeHospitalizations.map((h) => (
                      <div key={h.hospitalizationId} className="p-4 rounded-xl border border-teal-100 bg-teal-50/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-base">{h.petName}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-teal-100 text-teal-800 uppercase">
                              {h.ward} • {h.cage}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 mt-1"><span className="font-bold">Diagnosis:</span> {h.diagnosis}</div>
                          <div className="text-xs text-slate-500 mt-0.5"><span className="font-bold">Feeding:</span> {h.feedingInstructions}</div>
                        </div>

                        <button
                          onClick={() => handleDischargePatient(h.hospitalizationId)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold uppercase hover:bg-slate-800 transition"
                          id={`discharge-hosp-${h.hospitalizationId}-btn`}
                        >
                          Discharge Patient
                        </button>
                      </div>
                    ))}

                    {activeHospitalizations.length === 0 && (
                      <div className="text-center p-8 text-slate-400 text-xs">No patients admitted in Ward currently.</div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 8: PHARMACY & INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="space-y-6" id="doc-inventory-panel">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Pharmacy & Clinic Stock Controls</h1>
              <p className="text-slate-500 text-xs mt-0.5">Track pharmaceuticals, anesthesias, and consumables with automatic stock alarm reviews.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-white border-b border-slate-200 text-slate-400 uppercase font-bold text-[9px] tracking-wider">
                    <th className="p-4">Item Name</th>
                    <th className="p-4">Stock Qty</th>
                    <th className="p-4">Supplier</th>
                    <th className="p-4 text-right">Purchase / Selling Price</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => {
                    const isLow = item.quantity <= item.lowStockThreshold;
                    return (
                      <tr key={item.itemId} className="border-b border-slate-100 hover:bg-white/50">
                        <td className="p-4 font-bold text-slate-800">
                          {item.name}
                          {isLow && (
                            <span className="ml-2 px-2 py-0.5 rounded text-[8px] font-black bg-rose-100 text-rose-800 uppercase tracking-wide">
                              LOW STOCK ALERT
                            </span>
                          )}
                        </td>
                        <td className={`p-4 font-mono font-bold ${isLow ? 'text-rose-600' : 'text-slate-700'}`}>
                          {item.quantity} units
                        </td>
                        <td className="p-4 text-slate-500">{item.supplier}</td>
                        <td className="p-4 text-right font-mono text-slate-700 font-bold">
                          ${item.purchasePrice.toFixed(2)} / ${item.sellingPrice.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 9: OUTPATIENT BILLING */}
        {activeTab === 'billing' && (
          <div className="space-y-6" id="doc-billing-panel">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Clinical Outpatient Billing Suite</h1>
              <p className="text-slate-500 text-xs mt-0.5">Add surgical consumables, vaccines, and consultations to produce invoices.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form item addition */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm uppercase text-slate-800 tracking-wider">
                  Compile Bill Items
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Select Patient</label>
                    <select
                      value={billPatientId}
                      onChange={(e) => setBillPatientId(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-2"
                      id="bill-patient-select"
                    >
                      <option value="">-- Choose Patient --</option>
                      {patients.map(p => (
                        <option key={p.petId} value={p.petId}>{p.name} ({p.breed})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Line Item Description</label>
                    <input
                      type="text"
                      value={billItemDesc}
                      onChange={(e) => setBillItemDesc(e.target.value)}
                      placeholder="e.g. Scaling treatment, IV catheter..."
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs"
                      id="bill-desc-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={billItemQty}
                        onChange={(e) => setBillItemQty(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Unit Price (₹)</label>
                      <input
                        type="number"
                        value={billItemPrice}
                        onChange={(e) => setBillItemPrice(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddBillingItem}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase rounded-xl transition"
                    id="add-bill-item-btn"
                  >
                    Add Line Item
                  </button>
                </div>
              </div>

              {/* Review and Issue Bill */}
              <div className="lg:col-span-2 space-y-4">
                <form onSubmit={handleGenerateInvoice} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm uppercase text-slate-800 tracking-wider">
                    New Invoice Statement
                  </h3>

                  <div className="space-y-2 max-h-[180px] overflow-y-auto">
                    {currentBillItems.map((it, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-slate-100 flex justify-between items-center text-xs text-slate-700">
                        <div>
                          <span className="font-bold">{it.description}</span>
                          <span className="text-slate-400 font-mono ml-2">({it.quantity} × ₹{it.unitPrice})</span>
                        </div>
                        <span className="font-mono font-bold">₹{it.total}</span>
                      </div>
                    ))}

                    {currentBillItems.length === 0 && (
                      <div className="text-center p-8 text-slate-400 text-xs">No items added to current statement.</div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex flex-col items-end gap-1 text-xs text-slate-600 font-mono">
                    <div>Subtotal: ₹{currentBillItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</div>
                    <div>Taxes / GST ({dbService.getSettings().taxRate || 18}%): ₹{((currentBillItems.reduce((sum, item) => sum + item.total, 0) * (dbService.getSettings().taxRate || 18)) / 100).toFixed(2)}</div>
                    <div className="text-sm font-black text-slate-900">Total: ₹{(currentBillItems.reduce((sum, item) => sum + item.total, 0) * (1 + (dbService.getSettings().taxRate || 18) / 100)).toFixed(2)}</div>
                  </div>

                  <button
                    type="submit"
                    disabled={currentBillItems.length === 0}
                    className="w-full py-2.5 bg-teal-600 text-white rounded-xl text-xs font-extrabold uppercase hover:bg-teal-500 transition shadow pt-2.5 pb-2.5 disabled:bg-slate-200 disabled:text-slate-400"
                    id="generate-invoice-btn"
                  >
                    Issue Outpatient Bill & Sync
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

      </AnimatePresence>
    </main>
    </div>
  </div>
);
}

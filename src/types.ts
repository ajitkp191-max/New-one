export type UserRole = 'owner' | 'doctor' | 'pet_owner';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  emailVerified: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'active';
  phoneNumber?: string;
  address?: string;
  city?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  preferredClinic?: string;
  clinicName?: string;
  licenseNumber?: string;
  isOnline?: boolean;
  lastActive?: string;
}

export interface DoctorProfile {
  doctorId: string; // Same as UserProfile uid
  name: string;
  photoUrl?: string;
  qualification: string;
  registrationNumber: string;
  specialization: string;
  clinicName: string;
  experience: number; // Years
  contactEmail: string;
  contactPhone: string;
  consultationTimings: string;
  services: string[];
  location: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
}

export interface WeightLogEntry {
  date: string;
  weight: number;
  notes?: string;
}

export interface PetProfile {
  petId: string;
  ownerId: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  sex: 'male' | 'female' | 'neutered_male' | 'spayed_female';
  dateOfBirth: string;
  weight: number; // in kg
  weightHistory?: WeightLogEntry[];
  color: string;
  microchipNumber?: string;
  petRegistrationNumber?: string;
  photoUrl?: string;
  vaccinationHistory: VaccinationRecord[];
  dewormingHistory: DewormingRecord[];
  allergies: string[];
  knownMedicalConditions: string[];
  previousSurgeries: string[];
  currentMedications: string[];
  emergencyInfo?: string;
}

export interface OwnerUploadedPrescription {
  id: string;
  petId: string;
  petName: string;
  ownerId: string;
  doctorOrClinicName: string;
  prescriptionDate: string;
  uploadedAt: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  medications: PrescriptionItem[];
  instructions?: string;
  diagnosis?: string;
  status: 'verified' | 'active' | 'archived';
}

export interface Appointment {
  appointmentId: string;
  petId: string;
  petName: string;
  ownerId: string;
  ownerName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  timeSlot: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface Consultation {
  consultationId: string;
  patientId: string; // Pet ID
  petName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  chiefComplaint: string;
  history: string;
  examination: {
    temperature: number; // °C
    pulse: number; // bpm
    respiration: number; // bpm
    crt: string; // Capillary Refill Time (e.g. "< 2s")
    mucousMembranes: string; // e.g. "Pink", "Pale"
    hydration: string; // e.g. "Normal", "Mildly Dehydrated"
    bodyConditionScore: number; // 1-9 scale
    weight: number;
    systemicExam: string;
  };
  differentialDiagnosis: string;
  diagnosis: string;
  treatmentPlan: string;
  prescription?: PrescriptionItem[];
  followUp: string;
  attachments?: ClinicalAttachment[];
  createdAt: string;
}

export interface PrescriptionItem {
  drugName: string;
  doseRate: string; // e.g., "5 mg/kg"
  concentration: string; // e.g., "100 mg/ml" or "50 mg tablet"
  route: string; // PO, SC, IM, IV, etc.
  frequency: string; // BID, TID, SID, etc.
  duration: string; // e.g. "7 days"
  instructions: string;
}

export interface ClinicalAttachment {
  name: string;
  type: 'image' | 'pdf' | 'document';
  url: string;
  uploadedAt: string;
}

export interface LaboratoryReport {
  reportId: string;
  patientId: string;
  petName: string;
  doctorId: string;
  doctorName: string;
  testType: 'cbc' | 'biochemistry' | 'urinalysis' | 'fecal' | 'parasites' | 'cytology' | 'microbiology' | 'other';
  date: string;
  results: { [parameter: string]: { value: string; referenceRange: string; unit: string } };
  pdfUrl?: string;
  imageUrl?: string;
  notes?: string;
}

export interface ImagingRecord {
  imageId: string;
  patientId: string;
  petName: string;
  doctorId: string;
  doctorName: string;
  type: 'x-ray' | 'ultrasound' | 'ct' | 'mri' | 'ecg' | 'endoscopy' | 'clinical_photo';
  imageUrl: string;
  description: string;
  date: string;
}

export interface SurgeryRecord {
  surgeryId: string;
  patientId: string;
  petName: string;
  date: string;
  procedure: string;
  surgeon: string;
  assistants?: string;
  preOpAssessment: string;
  anesthesiaRecord: string;
  surgicalNotes: string;
  materialsUsed: string[];
  complications: string;
  postOpInstructions: string;
  followUp: string;
}

export interface HospitalizationRecord {
  hospitalizationId: string;
  patientId: string;
  petName: string;
  ward: string;
  cage: string;
  admissionDate: string;
  dischargeDate?: string;
  diagnosis: string;
  vitalsLog: { timestamp: string; temp: number; pulse: number; resp: number; notes: string }[];
  medicationSchedule: string;
  feedingInstructions: string;
  fluidTherapyRecord: string;
  progressNotes: string;
  status: 'admitted' | 'discharged';
}

export interface VaccinationRecord {
  vaccineName: string;
  dateAdministered: string;
  nextDueDate: string;
  batchNumber?: string;
  administeredBy?: string;
}

export interface DewormingRecord {
  productName: string;
  dateAdministered: string;
  nextDueDate: string;
  weightAtAdministration: number;
}

export interface InventoryItem {
  itemId: string;
  name: string;
  type: 'medicine' | 'vaccine' | 'consumable' | 'surgical_material' | 'equipment';
  quantity: number;
  lowStockThreshold: number;
  expiryDate?: string;
  batchNumber?: string;
  supplier: string;
  purchasePrice: number;
  sellingPrice: number;
  lastUpdated: string;
}

export interface Invoice {
  invoiceId: string;
  patientId: string;
  petName: string;
  ownerName: string;
  date: string;
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'paid' | 'unpaid' | 'cancelled';
  paymentMethod?: string;
}

export interface AuditLog {
  logId: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  timestamp: string;
  resourceType: string;
  resourceId: string;
  result: 'success' | 'failure';
}

export interface AppSettings {
  allowDoctorSelfVerification: boolean;
  maintenanceMode: boolean;
  hospitalName: string;
  currency: string;
  supportEmail: string;
  supportPhone: string;
  emergencyHotline?: string;
  taxRate?: number;
  consultationBaseFee?: number;
  systemBroadcast?: string;
  enableAiTriage?: boolean;
  twoFactorEnforced?: boolean;
  sessionTimeoutMinutes?: number;
  ipWhitelist?: string;
}

export interface NotificationItem {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'appointment' | 'vaccination' | 'deworming' | 'inventory' | 'verification' | 'billing' | 'general';
}

export interface DuePreventiveItem {
  id: string;
  petId: string;
  petName: string;
  petSpecies: 'dog' | 'cat' | 'other';
  ownerId: string;
  ownerName?: string;
  productName: string;
  type: 'vaccination' | 'deworming';
  nextDueDate: string;
  status: 'overdue' | 'due_soon';
  daysRemaining: number;
  administeredBy?: string;
  batchNumber?: string;
}

export interface BatchReminderResult {
  sentCount: number;
  totalEligible: number;
  dispatchedAt: string;
  items: DuePreventiveItem[];
}

export type PerformanceMode = 'full' | 'reduced-motion' | 'low-perf' | 'disabled';

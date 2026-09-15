import { 
  UserProfile, 
  UserRole,
  DoctorProfile, 
  PetProfile, 
  Appointment, 
  Consultation, 
  LaboratoryReport, 
  ImagingRecord, 
  SurgeryRecord, 
  HospitalizationRecord, 
  InventoryItem, 
  Invoice, 
  AuditLog, 
  AppSettings, 
  NotificationItem,
  VaccinationRecord,
  DewormingRecord,
  OwnerUploadedPrescription,
  WeightLogEntry,
  DuePreventiveItem,
  BatchReminderResult,
  LearnedFormularyItem,
  PrescriptionItem
} from '../types';
import { db, auth } from './firebaseClient';
import { playNotificationSound } from './soundService';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}



// Rich clinical defaults to ensure all 3 portals (Doctor, Pet Owner, Practice Admin) are immediately functional and interactive
const DEFAULT_USERS: UserProfile[] = [
  {
    uid: 'doc-sarah-mitchell',
    email: 'sarah.mitchell@vetpulse.com',
    name: 'Dr. Sarah Mitchell, DVM',
    role: 'doctor',
    createdAt: '2026-01-10T08:00:00.000Z',
    emailVerified: true,
    status: 'active',
    phoneNumber: '+1 (555) 234-5678',
    address: '452 Medical Pavilion Blvd',
    city: 'Seattle, WA',
    clinicName: 'VetPulse Specialty Animal Hospital',
    licenseNumber: 'VET-LIC-89231'
  },
  {
    uid: 'owner-emily-watson',
    email: 'emily.watson@gmail.com',
    name: 'Emily Watson',
    role: 'pet_owner',
    createdAt: '2026-01-15T10:30:00.000Z',
    emailVerified: true,
    status: 'active',
    phoneNumber: '+1 (555) 876-5432',
    address: '742 Evergreen Terrace',
    city: 'Seattle, WA',
    emergencyContact: 'John Watson (Spouse)',
    emergencyPhone: '+1 (555) 987-6543',
    preferredClinic: 'VetPulse Specialty Animal Hospital'
  },
  {
    uid: 'owner-admin-vance',
    email: 'admin@vetpulse.com',
    name: 'Dr. Arthur Vance',
    role: 'owner',
    createdAt: '2025-11-01T09:00:00.000Z',
    emailVerified: true,
    status: 'active',
    phoneNumber: '+1 (555) 345-6789',
    address: '100 Hospital Way, Suite 400',
    city: 'Seattle, WA',
    clinicName: 'VetPulse Specialty Animal Hospital',
    licenseNumber: 'HOSP-REG-94821'
  }
];

const DEFAULT_DOCTORS: DoctorProfile[] = [
  {
    doctorId: 'doc-sarah-mitchell',
    name: 'Dr. Sarah Mitchell, DVM',
    qualification: 'DVM, DACVIM (Internal Medicine)',
    registrationNumber: 'VET-LIC-89231',
    specialization: 'Small Animal Soft Tissue & Internal Medicine',
    clinicName: 'VetPulse Specialty Animal Hospital',
    experience: 8,
    contactEmail: 'sarah.mitchell@vetpulse.com',
    contactPhone: '+1 (555) 234-5678',
    consultationTimings: 'Mon - Fri (09:00 AM - 05:00 PM)',
    services: ['General Health Examination', 'Preventive Vaccinations', 'Diagnostic Ultrasound', 'Internal Medicine', 'Soft Tissue Surgery'],
    location: 'Seattle, WA - Main Pavilion',
    isVerified: true,
    verificationStatus: 'approved'
  }
];

const DEFAULT_PETS: PetProfile[] = [
  {
    petId: 'pet-luna-siamese',
    ownerId: 'owner-emily-watson',
    name: 'Luna',
    species: 'cat',
    breed: 'Siamese',
    sex: 'spayed_female',
    dateOfBirth: '2023-04-12',
    weight: 3.8,
    color: 'Seal Point',
    microchipNumber: '985141002938471',
    petRegistrationNumber: 'VP-CAT-9021',
    allergies: ['Ceftriaxone'],
    knownMedicalConditions: ['Mild feline dental gingivitis'],
    previousSurgeries: ['Routine Ovariohysterectomy (2023)'],
    currentMedications: ['Oral Dental Probiotic Chew (Daily)'],
    emergencyInfo: 'Emergency Contact: Emily Watson (+1 555-876-5432)',
    vaccinationHistory: [
      {
        vaccineName: 'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)',
        dateAdministered: '2025-10-15',
        nextDueDate: '2026-10-15',
        batchNumber: 'BT-FVRCP-8832',
        administeredBy: 'Dr. Sarah Mitchell, DVM'
      },
      {
        vaccineName: 'Rabies PureVax 1-Year Feline',
        dateAdministered: '2025-10-15',
        nextDueDate: '2026-10-15',
        batchNumber: 'BT-RAB-7721',
        administeredBy: 'Dr. Sarah Mitchell, DVM'
      }
    ],
    dewormingHistory: [
      {
        productName: 'Profender Topical Anthelmintic',
        dateAdministered: '2026-01-10',
        nextDueDate: '2026-04-10',
        weightAtAdministration: 3.8
      }
    ]
  },
  {
    petId: 'pet-max-golden',
    ownerId: 'owner-emily-watson',
    name: 'Max',
    species: 'dog',
    breed: 'Golden Retriever',
    sex: 'neutered_male',
    dateOfBirth: '2022-08-20',
    weight: 28.5,
    color: 'Golden Honey',
    microchipNumber: '985141009182345',
    petRegistrationNumber: 'VP-DOG-4412',
    allergies: ['Chicken meal protein'],
    knownMedicalConditions: ['Seasonal environmental dermatitis'],
    previousSurgeries: ['Routine Orchiectomy (2023)'],
    currentMedications: ['Apoquel 16mg (As needed during spring)'],
    emergencyInfo: 'Emergency Contact: Emily Watson (+1 555-876-5432)',
    vaccinationHistory: [
      {
        vaccineName: 'DHPP Core Annual (Distemper, Hepatitis, Parvovirus, Parainfluenza)',
        dateAdministered: '2025-08-18',
        nextDueDate: '2026-08-18',
        batchNumber: 'BT-DHPP-9941',
        administeredBy: 'Dr. Sarah Mitchell, DVM'
      },
      {
        vaccineName: 'Rabies 3-Year Canine Immunization',
        dateAdministered: '2024-08-18',
        nextDueDate: '2027-08-18',
        batchNumber: 'BT-RAB3-1029',
        administeredBy: 'Dr. Sarah Mitchell, DVM'
      }
    ],
    dewormingHistory: [
      {
        productName: 'NexGard Spectra (Chewable Afoxolaner/Milbemycin)',
        dateAdministered: '2026-02-01',
        nextDueDate: '2026-03-01',
        weightAtAdministration: 28.5
      }
    ]
  }
];

const DEFAULT_APPOINTMENTS: Appointment[] = [
  {
    appointmentId: 'apt-luna-checkup',
    petId: 'pet-luna-siamese',
    petName: 'Luna',
    ownerId: 'owner-emily-watson',
    ownerName: 'Emily Watson',
    doctorId: 'doc-sarah-mitchell',
    doctorName: 'Dr. Sarah Mitchell, DVM',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    timeSlot: '10:30 AM',
    reason: 'Routine Bi-Annual Wellness Exam & Dental Tartar Assessment',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    appointmentId: 'apt-max-booster',
    petId: 'pet-max-golden',
    petName: 'Max',
    ownerId: 'owner-emily-watson',
    ownerName: 'Emily Watson',
    doctorId: 'doc-sarah-mitchell',
    doctorName: 'Dr. Sarah Mitchell, DVM',
    date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    timeSlot: '02:00 PM',
    reason: 'Spring Allergy Check & Weight Management Consultation',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_CONSULTATIONS: Consultation[] = [
  {
    consultationId: 'con-luna-wellness',
    patientId: 'pet-luna-siamese',
    petName: 'Luna',
    doctorId: 'doc-sarah-mitchell',
    doctorName: 'Dr. Sarah Mitchell, DVM',
    date: '2025-10-15',
    chiefComplaint: 'Routine bi-annual wellness exam and coat health assessment',
    history: 'Indoor feline, standard dry kibble, no reported emesis or lethargy.',
    examination: {
      temperature: 38.4,
      pulse: 140,
      respiration: 26,
      crt: '< 2s',
      mucousMembranes: 'Pink & moist',
      hydration: 'Normal (< 5%)',
      bodyConditionScore: 5,
      weight: 3.8,
      systemicExam: 'Mild Grade 1 supragingival tartar on upper carnassials. Heart and lungs clear on auscultation.'
    },
    differentialDiagnosis: 'Periodontal Stage 1 vs Healthy Adult',
    diagnosis: 'Healthy Feline Adult - Stage 1 Dental Prophylaxis Recommended',
    treatmentPlan: 'Begin veterinary water additive or dental enzyme chew twice weekly. Recheck oral cavity in 6 months.',
    prescription: [
      {
        drugName: 'Chlorhexidine Oral Hygiene Gel',
        doseRate: 'Pea-sized dab',
        concentration: '0.12% oral rinse',
        route: 'Topical Gingival',
        frequency: 'SID (Once Daily)',
        duration: '30 Days',
        instructions: 'Apply gently along upper gumline post-meal.'
      }
    ],
    followUp: 'Bi-annual checkup in 6 months.',
    createdAt: '2025-10-15T11:00:00.000Z'
  }
];

const DEFAULT_LABS: LaboratoryReport[] = [
  {
    reportId: 'lab-luna-cbc',
    patientId: 'pet-luna-siamese',
    petName: 'Luna',
    doctorId: 'doc-sarah-mitchell',
    doctorName: 'Dr. Sarah Mitchell, DVM',
    testType: 'cbc',
    date: '2025-10-15',
    results: {
      WBC: { value: '8.4', referenceRange: '5.5 - 19.5', unit: '10^9/L' },
      RBC: { value: '7.6', referenceRange: '5.0 - 10.0', unit: '10^12/L' },
      HGB: { value: '12.2', referenceRange: '9.3 - 15.3', unit: 'g/dL' },
      HCT: { value: '38.5', referenceRange: '28.0 - 47.0', unit: '%' },
      PLT: { value: '320', referenceRange: '175 - 500', unit: '10^9/L' }
    },
    notes: 'All CBC indices within normal physiological limits. No evidence of systemic infection or anemia.'
  }
];

const DEFAULT_IMAGING: ImagingRecord[] = [];

const DEFAULT_INVENTORY: InventoryItem[] = [
  {
    itemId: 'inv-clavamox-250',
    name: 'Amoxicillin / Clavulanate (Clavamox 250mg)',
    type: 'medicine',
    quantity: 240,
    lowStockThreshold: 50,
    expiryDate: '2027-06-30',
    supplier: 'Zoetis Animal Health',
    batchNumber: 'ZT-9921B',
    purchasePrice: 1.80,
    sellingPrice: 3.25,
    lastUpdated: '2026-01-10T08:00:00.000Z'
  },
  {
    itemId: 'inv-carprofen-75',
    name: 'Carprofen (Rimadyl 75mg)',
    type: 'medicine',
    quantity: 180,
    lowStockThreshold: 40,
    expiryDate: '2027-04-15',
    supplier: 'Zoetis Animal Health',
    batchNumber: 'ZT-7740C',
    purchasePrice: 1.50,
    sellingPrice: 2.80,
    lastUpdated: '2026-01-10T08:00:00.000Z'
  },
  {
    itemId: 'inv-nexgard-large',
    name: 'NexGard Spectra (Canine 15-30kg)',
    type: 'medicine',
    quantity: 95,
    lowStockThreshold: 25,
    expiryDate: '2027-11-20',
    supplier: 'Boehringer Ingelheim',
    batchNumber: 'BI-8831A',
    purchasePrice: 11.20,
    sellingPrice: 18.50,
    lastUpdated: '2026-01-10T08:00:00.000Z'
  },
  {
    itemId: 'inv-apoquel-16',
    name: 'Apoquel (Oclacitinib Maleate 16mg)',
    type: 'medicine',
    quantity: 110,
    lowStockThreshold: 30,
    expiryDate: '2027-08-10',
    supplier: 'Zoetis Animal Health',
    batchNumber: 'ZT-6612A',
    purchasePrice: 2.40,
    sellingPrice: 4.10,
    lastUpdated: '2026-01-10T08:00:00.000Z'
  }
];

const DEFAULT_INVOICES: Invoice[] = [
  {
    invoiceId: 'inv-2026-001',
    patientId: 'pet-luna-siamese',
    petName: 'Luna',
    ownerName: 'Emily Watson',
    date: '2025-10-15',
    items: [
      { description: 'Comprehensive Clinical Wellness Exam', quantity: 1, unitPrice: 65.00, total: 65.00 },
      { description: 'FVRCP & PureVax Rabies Vaccines', quantity: 1, unitPrice: 55.00, total: 55.00 },
      { description: 'Dental Care Topical Probiotic Gel', quantity: 1, unitPrice: 24.50, total: 24.50 }
    ],
    subtotal: 144.50,
    tax: 14.45,
    total: 158.95,
    status: 'paid',
    paymentMethod: 'Credit Card (Stripe Verified)'
  }
];

const DEFAULT_AUDIT: AuditLog[] = [
  {
    logId: 'aud-sys-init',
    timestamp: new Date().toISOString(),
    userId: 'doc-sarah-mitchell',
    userName: 'Dr. Sarah Mitchell, DVM',
    role: 'doctor',
    action: 'System initialized with clinical telemetry protocols.',
    resourceType: 'system',
    resourceId: 'core-telemetry',
    result: 'success'
  }
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    notificationId: 'notif-luna-booster',
    userId: 'owner-emily-watson',
    title: 'Upcoming Booster Reminder',
    message: 'Luna is scheduled for FVRCP & Rabies booster evaluation on October 15.',
    type: 'vaccination',
    read: false,
    date: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    notificationId: 'notif-max-nexgard',
    userId: 'owner-emily-watson',
    title: 'Monthly Heartworm & Flea Protection Due',
    message: 'Max is due for monthly NexGard Spectra chewable tablet administration.',
    type: 'deworming',
    read: false,
    date: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

const DEFAULT_SURGERIES: SurgeryRecord[] = [];

const DEFAULT_HOSPITALIZATIONS: HospitalizationRecord[] = [
  {
    hospitalizationId: 'hosp-001',
    patientId: 'pet-luna-siamese',
    petName: 'Luna',
    ward: 'Feline ICU Suite A',
    cage: 'K-04',
    admissionDate: '2025-10-15',
    dischargeDate: '2025-10-16',
    diagnosis: 'Post-Procedural Dental Prophylaxis Recovery & Fluid Therapy',
    vitalsLog: [
      {
        timestamp: '2025-10-15T14:30:00.000Z',
        temp: 38.3,
        pulse: 135,
        resp: 24,
        notes: 'Patient alert, comfortable, iv catheter intact.'
      }
    ],
    medicationSchedule: 'Hydration maintenance fluid therapy at 2ml/kg/hr; Meloxicam 0.1mg/kg PO SID.',
    feedingInstructions: 'Wet recovery diet (Hills a/d) in warm small portions.',
    fluidTherapyRecord: 'Lactated Ringers Solution (LRS) 150ml over 6 hours.',
    progressNotes: 'Patient recovering smoothly with stable vitals.',
    status: 'discharged'
  }
];

const DEFAULT_UPLOADED_PRESCRIPTIONS: OwnerUploadedPrescription[] = [];

const DEFAULT_LEARNED_FORMULARY: LearnedFormularyItem[] = [
  {
    id: 'lrn-amox-clav',
    drugName: 'Amoxicillin + Clavulanate (Clavamox / Synulox)',
    doseRate: '13.75 - 20 mg/kg',
    concentration: '62.5mg, 125mg, 250mg, 500mg tablets / 62.5mg/ml drops',
    route: 'PO',
    frequency: 'BID (Every 12 hours)',
    duration: '7 - 10 days',
    indication: 'Broad-spectrum antimicrobial for Skin, Respiratory, Urinary & Soft tissue infections',
    targetSpecies: 'all',
    source: 'ai_verified',
    learnedAt: '2026-01-10T08:00:00.000Z',
    timesUsed: 42,
    doctorConfidence: 'High (First-Line Protocol)',
    clinicalNote: 'Administer with small meal to prevent GI upset. Safe for both dogs and cats.'
  },
  {
    id: 'lrn-metronidazole',
    drugName: 'Metronidazole (Flagyl)',
    doseRate: '10 - 15 mg/kg',
    concentration: '200mg / 400mg tablets, 50mg/ml suspension',
    route: 'PO',
    frequency: 'BID (Every 12 hours)',
    duration: '5 - 7 days',
    indication: 'Acute enteritis, Giardiasis, anaerobic intestinal infections, IBD colitis',
    targetSpecies: 'all',
    source: 'ai_verified',
    learnedAt: '2026-01-12T10:00:00.000Z',
    timesUsed: 35,
    doctorConfidence: 'High (First-Line Protocol)',
    clinicalNote: 'Reduce dose in severe hepatic impairment. Neurotoxicity warning at very high chronic doses.'
  },
  {
    id: 'lrn-cerenia',
    drugName: 'Maropitant Citrate (Cerenia)',
    doseRate: '1 - 2 mg/kg',
    concentration: '16mg, 24mg, 60mg tablets / 10mg/ml injection',
    route: 'PO / SC',
    frequency: 'SID (Every 24 hours)',
    duration: '3 - 5 days',
    indication: 'Acute emesis control, motion sickness, visceral analgesia support',
    targetSpecies: 'all',
    source: 'ai_verified',
    learnedAt: '2026-01-14T11:30:00.000Z',
    timesUsed: 38,
    doctorConfidence: 'High (First-Line Protocol)',
    clinicalNote: 'Neurokinin-1 (NK1) receptor antagonist. Keep injectable refrigerated to reduce sting on SC injection.'
  },
  {
    id: 'lrn-meloxicam',
    drugName: 'Meloxicam (Metacam / Loxicom)',
    doseRate: '0.1 mg/kg canine / 0.05 mg/kg feline maintenance',
    concentration: '1.5mg/ml canine, 0.5mg/ml feline oral suspension',
    route: 'PO / SC',
    frequency: 'SID (Every 24 hours)',
    duration: '3 - 5 days',
    indication: 'Musculoskeletal pain, post-operative soft tissue inflammation, osteoarthritis',
    targetSpecies: 'all',
    source: 'ai_verified',
    learnedAt: '2026-01-15T09:00:00.000Z',
    timesUsed: 29,
    doctorConfidence: 'High (First-Line Protocol)',
    clinicalNote: 'Always administer with food. Ensure normal hydration. Never combine with corticosteroids.'
  },
  {
    id: 'lrn-gabapentin',
    drugName: 'Gabapentin (Neurontin)',
    doseRate: '5 - 15 mg/kg canine / 10 - 20 mg/kg feline',
    concentration: '100mg, 300mg capsules / 50mg/ml solution',
    route: 'PO',
    frequency: 'BID - TID (Every 8-12 hours)',
    duration: 'As needed / 7 - 14 days',
    indication: 'Neuropathic pain, chronic arthritic hyperalgesia, feline pre-visit anxiety sedation',
    targetSpecies: 'all',
    source: 'ai_verified',
    learnedAt: '2026-01-18T14:00:00.000Z',
    timesUsed: 26,
    doctorConfidence: 'High (First-Line Protocol)',
    clinicalNote: 'Caution: Do NOT use human liquid formulations containing xylitol in dogs.'
  },
  {
    id: 'lrn-apoquel',
    drugName: 'Oclacitinib (Apoquel)',
    doseRate: '0.4 - 0.6 mg/kg',
    concentration: '3.6mg, 5.4mg, 16mg tablets',
    route: 'PO',
    frequency: 'BID for 14 days, then SID maintenance',
    duration: '14 - 30 days',
    indication: 'Allergic dermatitis, Atopic dermatitis, Flea allergy pruritus control',
    targetSpecies: 'dog',
    source: 'ai_verified',
    learnedAt: '2026-01-20T16:00:00.000Z',
    timesUsed: 24,
    doctorConfidence: 'High (First-Line Protocol)',
    clinicalNote: 'JAK-1 inhibitor providing rapid pruritus relief within 4 hours. Dogs >= 12 months only.'
  },
  {
    id: 'lrn-doxycycline',
    drugName: 'Doxycycline Hyclate / Monohydrate',
    doseRate: '10 mg/kg SID or 5 mg/kg BID',
    concentration: '50mg, 100mg tablets / 50mg/ml suspension',
    route: 'PO',
    frequency: 'SID (Once daily) or BID',
    duration: '10 - 28 days',
    indication: 'Tick-borne rickettsial diseases (Ehrlichia, Anaplasma, Lyme), Kennel Cough, Chlamydia',
    targetSpecies: 'all',
    source: 'ai_verified',
    learnedAt: '2026-01-22T12:00:00.000Z',
    timesUsed: 19,
    doctorConfidence: 'High (First-Line Protocol)',
    clinicalNote: 'In felines, always follow oral tablets with 5-10 ml of water flush to prevent esophageal stricture.'
  },
  {
    id: 'lrn-pimobendan',
    drugName: 'Pimobendan (Vetmedin)',
    doseRate: '0.25 - 0.3 mg/kg',
    concentration: '1.25mg, 2.5mg, 5mg, 10mg chewable tablets',
    route: 'PO',
    frequency: 'BID (Every 12 hours)',
    duration: 'Chronic / Ongoing',
    indication: 'Myxomatous Mitral Valve Disease (MMVD Stage B2/C), Dilated Cardiomyopathy (DCM)',
    targetSpecies: 'dog',
    source: 'ai_verified',
    learnedAt: '2026-01-25T15:00:00.000Z',
    timesUsed: 18,
    doctorConfidence: 'High (First-Line Protocol)',
    clinicalNote: 'Inodilator. Give on an empty stomach at least 1 hour before feeding for maximum bioavailability.'
  }
];

// Initialize our sandbox database
class LocalDatabaseService {
  private users: UserProfile[] = [];
  private doctors: DoctorProfile[] = [];
  private pets: PetProfile[] = [];
  private appointments: Appointment[] = [];
  private consultations: Consultation[] = [];
  private labs: LaboratoryReport[] = [];
  private imaging: ImagingRecord[] = [];
  private surgeries: SurgeryRecord[] = [];
  private hospitalizations: HospitalizationRecord[] = [];
  private inventory: InventoryItem[] = [];
  private invoices: Invoice[] = [];
  private audit: AuditLog[] = [];
  private notifications: NotificationItem[] = [];
  private uploadedPrescriptions: OwnerUploadedPrescription[] = [];
  private learnedFormulary: LearnedFormularyItem[] = [];
  private settings: AppSettings = {
    allowDoctorSelfVerification: true,
    maintenanceMode: false,
    hospitalName: 'VetPulse Premium Medical Hub',
    currency: 'INR (₹ / Rs.)',
    supportEmail: 'support@vetpulse.com',
    supportPhone: '+91 98765 43210',
    emergencyHotline: '+91 1800 555 0199',
    consultationBaseFee: 800,
    taxRate: 18,
    enableAiTriage: true,
    twoFactorEnforced: false,
    sessionTimeoutMinutes: 60
  };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      this.users = this.getOrInit('vp_users', DEFAULT_USERS);
      this.doctors = this.getOrInit('vp_doctors', DEFAULT_DOCTORS);
      this.pets = this.getOrInit('vp_pets', DEFAULT_PETS);
      this.appointments = this.getOrInit('vp_appointments', DEFAULT_APPOINTMENTS);
      this.consultations = this.getOrInit('vp_consultations', DEFAULT_CONSULTATIONS);
      this.labs = this.getOrInit('vp_labs', DEFAULT_LABS);
      this.imaging = this.getOrInit('vp_imaging', DEFAULT_IMAGING);
      this.surgeries = this.getOrInit('vp_surgeries', DEFAULT_SURGERIES);
      this.hospitalizations = this.getOrInit('vp_hospitalizations', DEFAULT_HOSPITALIZATIONS);
      this.inventory = this.getOrInit('vp_inventory', DEFAULT_INVENTORY);
      this.invoices = this.getOrInit('vp_invoices', DEFAULT_INVOICES);
      this.audit = this.getOrInit('vp_audit', DEFAULT_AUDIT);
      this.notifications = this.getOrInit('vp_notifications', DEFAULT_NOTIFICATIONS);
      this.uploadedPrescriptions = this.getOrInit('vp_uploaded_prescriptions', DEFAULT_UPLOADED_PRESCRIPTIONS);
      this.learnedFormulary = this.getOrInit('vp_learned_formulary', DEFAULT_LEARNED_FORMULARY);
      const savedSettings = localStorage.getItem('vp_settings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        if (this.settings.currency === 'USD') {
          this.settings.currency = 'INR (₹ / Rs.)';
        }
      }
    } catch (e) {
      console.error('Failed to parse local storage, loading default mocks instead', e);
      this.resetToDefaults();
    }
  }

  private getOrInit<T>(key: string, defaultVal: T[]): T[] {
    const val = localStorage.getItem(key);
    if (!val) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return [...defaultVal];
    }
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed) && parsed.length === 0 && defaultVal.length > 0) {
        localStorage.setItem(key, JSON.stringify(defaultVal));
        return [...defaultVal];
      }
      return parsed;
    } catch {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return [...defaultVal];
    }
  }

  private save<T>(key: string, val: T[]) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  private resetToDefaults() {
    this.users = [...DEFAULT_USERS];
    this.doctors = [...DEFAULT_DOCTORS];
    this.pets = [...DEFAULT_PETS];
    this.appointments = [...DEFAULT_APPOINTMENTS];
    this.consultations = [...DEFAULT_CONSULTATIONS];
    this.labs = [...DEFAULT_LABS];
    this.imaging = [...DEFAULT_IMAGING];
    this.surgeries = [...DEFAULT_SURGERIES];
    this.hospitalizations = [...DEFAULT_HOSPITALIZATIONS];
    this.inventory = [...DEFAULT_INVENTORY];
    this.invoices = [...DEFAULT_INVOICES];
    this.audit = [...DEFAULT_AUDIT];
    this.notifications = [...DEFAULT_NOTIFICATIONS];
    this.uploadedPrescriptions = [...DEFAULT_UPLOADED_PRESCRIPTIONS];
    this.learnedFormulary = [...DEFAULT_LEARNED_FORMULARY];
    localStorage.clear();
    this.save('vp_users', this.users);
    this.save('vp_doctors', this.doctors);
    this.save('vp_pets', this.pets);
    this.save('vp_appointments', this.appointments);
    this.save('vp_consultations', this.consultations);
    this.save('vp_labs', this.labs);
    this.save('vp_imaging', this.imaging);
    this.save('vp_surgeries', this.surgeries);
    this.save('vp_hospitalizations', this.hospitalizations);
    this.save('vp_inventory', this.inventory);
    this.save('vp_invoices', this.invoices);
    this.save('vp_audit', this.audit);
    this.save('vp_notifications', this.notifications);
    this.save('vp_uploaded_prescriptions', this.uploadedPrescriptions);
    this.save('vp_learned_formulary', this.learnedFormulary);
  }

  // AUDIT LOGGER helper
  public logAction(userId: string, userName: string, role: UserRole, action: string, resourceType: string, resourceId: string, result: 'success' | 'failure' = 'success') {
    const log: AuditLog = {
      logId: 'log-' + Math.random().toString(36).substring(2, 9),
      userId,
      userName,
      role,
      action,
      timestamp: new Date().toISOString(),
      resourceType,
      resourceId,
      result
    };
    this.audit.unshift(log);
    this.save('vp_audit', this.audit);
  }

  // CRUDS FOR EACH SECTION
  // --- Users ---
  public getUsers() { return this.users; }
  public saveUserProfile(user: UserProfile) {
    const idx = this.users.findIndex(u => u.uid === user.uid);
    if (idx >= 0) this.users[idx] = user;
    else this.users.push(user);
    this.save('vp_users', this.users);
  }
  public deleteUser(uid: string) {
    this.users = this.users.filter(u => u.uid !== uid);
    this.doctors = this.doctors.filter(d => d.doctorId !== uid);
    this.save('vp_users', this.users);
    this.save('vp_doctors', this.doctors);
  }

  // --- Doctors ---
  public getDoctors() { return this.doctors; }
  public getDoctor(id: string) { return this.doctors.find(d => d.doctorId === id); }
  public saveDoctorProfile(doctor: DoctorProfile) {
    const idx = this.doctors.findIndex(d => d.doctorId === doctor.doctorId);
    if (idx >= 0) this.doctors[idx] = doctor;
    else this.doctors.push(doctor);
    this.save('vp_doctors', this.doctors);
  }

  // --- Pets ---
  public getPets() { return this.pets; }
  public getPetsByOwner(ownerId: string) { return this.pets.filter(p => p.ownerId === ownerId); }
  public savePet(pet: PetProfile) {
    const idx = this.pets.findIndex(p => p.petId === pet.petId);
    if (idx >= 0) this.pets[idx] = pet;
    else this.pets.push(pet);
    this.save('vp_pets', this.pets);
  }
  public deletePet(petId: string) {
    this.pets = this.pets.filter(p => p.petId !== petId);
    this.save('vp_pets', this.pets);
  }

  public addVaccinationRecord(petId: string, record: VaccinationRecord) {
    const pet = this.pets.find(p => p.petId === petId);
    if (pet) {
      if (!pet.vaccinationHistory) pet.vaccinationHistory = [];
      pet.vaccinationHistory.unshift(record);
      this.savePet(pet);
      this.addNotification(
        pet.ownerId,
        'New Vaccine Administered',
        `${record.vaccineName} was administered to ${pet.name}. Next due: ${record.nextDueDate}.`,
        'vaccination'
      );
    }
  }

  public addDewormingRecord(petId: string, record: DewormingRecord) {
    const pet = this.pets.find(p => p.petId === petId);
    if (pet) {
      if (!pet.dewormingHistory) pet.dewormingHistory = [];
      pet.dewormingHistory.unshift(record);
      this.savePet(pet);
      this.addNotification(
        pet.ownerId,
        'Deworming Administered',
        `${record.productName} was administered to ${pet.name}. Next due: ${record.nextDueDate}.`,
        'deworming'
      );
    }
  }

  // --- Automated Batch Preventive & Vaccination Reminders ---
  public getDuePreventiveItems(daysThreshold: number = 30): DuePreventiveItem[] {
    const results: DuePreventiveItem[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    this.pets.forEach(pet => {
      const owner = this.users.find(u => u.uid === pet.ownerId);

      // Check Vaccinations
      pet.vaccinationHistory?.forEach((vax, idx) => {
        if (vax.nextDueDate) {
          const dueDate = new Date(vax.nextDueDate);
          dueDate.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= daysThreshold) {
            results.push({
              id: `vax-${pet.petId}-${idx}-${vax.nextDueDate}`,
              petId: pet.petId,
              petName: pet.name,
              petSpecies: pet.species,
              ownerId: pet.ownerId,
              ownerName: owner?.name || 'Pet Parent',
              productName: vax.vaccineName,
              type: 'vaccination',
              nextDueDate: vax.nextDueDate,
              status: diffDays < 0 ? 'overdue' : 'due_soon',
              daysRemaining: diffDays,
              administeredBy: vax.administeredBy,
              batchNumber: vax.batchNumber
            });
          }
        }
      });

      // Check Deworming
      pet.dewormingHistory?.forEach((dew, idx) => {
        if (dew.nextDueDate) {
          const dueDate = new Date(dew.nextDueDate);
          dueDate.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= daysThreshold) {
            results.push({
              id: `dew-${pet.petId}-${idx}-${dew.nextDueDate}`,
              petId: pet.petId,
              petName: pet.name,
              petSpecies: pet.species,
              ownerId: pet.ownerId,
              ownerName: owner?.name || 'Pet Parent',
              productName: dew.productName,
              type: 'deworming',
              nextDueDate: dew.nextDueDate,
              status: diffDays < 0 ? 'overdue' : 'due_soon',
              daysRemaining: diffDays
            });
          }
        }
      });
    });

    // Sort by most urgent (overdue first, then soonest due date)
    return results.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  public triggerBatchVaccinationReminders(
    daysThreshold: number = 30,
    senderName: string = 'VetPulse Clinical Preventive Health',
    senderUid: string = 'system',
    customMessagePrefix?: string,
    targetItemIds?: string[]
  ): BatchReminderResult {
    const allEligible = this.getDuePreventiveItems(daysThreshold);
    const eligible = targetItemIds && targetItemIds.length > 0
      ? allEligible.filter(item => targetItemIds.includes(item.id))
      : allEligible;

    let sentCount = 0;

    eligible.forEach(item => {
      // Prevent duplicate notification if sent within the past 18 hours for the exact pet & product
      const isRecentDuplicate = this.notifications.some(n => 
        n.userId === item.ownerId &&
        n.message.includes(item.petName) &&
        n.message.includes(item.productName) &&
        (Date.now() - new Date(n.date).getTime()) < 18 * 60 * 60 * 1000
      );

      if (!isRecentDuplicate) {
        const isOverdue = item.daysRemaining < 0;
        const formattedDate = new Date(item.nextDueDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        const title = isOverdue
          ? `⚠️ Overdue Recall: ${item.petName}'s ${item.type === 'vaccination' ? 'Vaccine' : 'Deworming'}`
          : `🔔 Recall Reminder: ${item.petName}'s ${item.type === 'vaccination' ? 'Vaccination' : 'Deworming'} Due`;

        const statusDetail = isOverdue
          ? `was due on ${formattedDate} (${Math.abs(item.daysRemaining)} days ago)`
          : `is scheduled for ${formattedDate} (in ${item.daysRemaining} days)`;

        const prefix = customMessagePrefix ? `${customMessagePrefix} ` : '';
        const message = `${prefix}Automated Preventive Reminder: ${item.petName}'s ${item.productName} ${statusDetail}. Please book a booster appointment promptly to maintain protective antibody titers and immunity.`;

        this.addNotification(item.ownerId, title, message, item.type);
        sentCount++;
      }
    });

    this.logAction(
      senderUid,
      senderName,
      'doctor',
      `Dispatched automated batch vaccination & preventive reminders: ${sentCount} notices sent to pet owners (${eligible.length} eligible).`,
      'vaccinations',
      'batch-reminders',
      'success'
    );

    return {
      sentCount,
      totalEligible: eligible.length,
      dispatchedAt: new Date().toISOString(),
      items: eligible
    };
  }

  // --- Appointments ---
  public getAppointments() { return this.appointments; }
  public saveAppointment(apt: Appointment) {
    const idx = this.appointments.findIndex(a => a.appointmentId === apt.appointmentId);
    if (idx >= 0) this.appointments[idx] = apt;
    else this.appointments.push(apt);
    this.save('vp_appointments', this.appointments);

    // Create a matching notification for pet owner
    this.addNotification(apt.ownerId, 'Appointment Updated', `Your appointment on ${apt.date} at ${apt.timeSlot} is now ${apt.status}.`, 'appointment');
  }

  // --- Consultations ---
  public getConsultations() { return this.consultations; }
  public getConsultationsByPatient(patientId: string) { return this.consultations.filter(c => c.patientId === patientId); }
  public saveConsultation(con: Consultation) {
    const idx = this.consultations.findIndex(c => c.consultationId === con.consultationId);
    if (idx >= 0) this.consultations[idx] = con;
    else this.consultations.unshift(con);
    this.save('vp_consultations', this.consultations);

    // Sync pet current medications if prescription items are present
    const pet = this.pets.find(p => p.petId === con.patientId);
    if (con.prescription && con.prescription.length > 0) {
      if (pet) {
        const medNames = con.prescription.map(p => `${p.drugName} (${p.doseRate || ''} ${p.frequency || ''})`.trim());
        const combined = Array.from(new Set([...medNames, ...(pet.currentMedications || [])])).slice(0, 8);
        pet.currentMedications = combined;
        this.savePet(pet);
      }

      // Automatically learn from this prescription to upgrade future AI suggestions
      this.recordPrescriptionLearning({
        patientName: con.petName,
        species: pet?.species,
        diagnosis: con.diagnosis || con.chiefComplaint || 'Clinical Therapy',
        items: con.prescription,
        notes: con.treatmentPlan || con.followUp,
        source: con.prescriptionMode === 'upload' ? 'uploaded_prescription' : 'doctor_rx'
      });
    }

    // If there is an uploaded prescription slip or image, also sync with uploadedPrescriptions
    if (con.uploadedSlipUrl || con.uploadedSlipName) {
      const rxUpload: OwnerUploadedPrescription = {
        id: 'rx-' + con.consultationId,
        petId: con.patientId,
        petName: con.petName,
        ownerId: pet?.ownerId || 'owner-emily-watson',
        doctorOrClinicName: con.doctorName || 'Veterinarian Prescription',
        prescriptionDate: con.date || new Date().toISOString().split('T')[0],
        uploadedAt: con.createdAt || new Date().toISOString(),
        fileName: con.uploadedSlipName || `Prescription_${con.petName}_${con.date}.png`,
        fileType: 'image/jpeg',
        fileUrl: con.uploadedSlipUrl,
        medications: con.prescription || [],
        instructions: con.treatmentPlan || con.followUp || '',
        diagnosis: con.diagnosis || 'Prescribed Medical Therapy',
        status: 'active'
      };
      
      const rxIdx = this.uploadedPrescriptions.findIndex(r => r.id === rxUpload.id);
      if (rxIdx >= 0) this.uploadedPrescriptions[rxIdx] = rxUpload;
      else this.uploadedPrescriptions.unshift(rxUpload);
      this.save('vp_uploaded_prescriptions', this.uploadedPrescriptions);
    }
  }

  // --- Labs ---
  public getLabs() { return this.labs; }
  public getLabsByPatient(patientId: string) { return this.labs.filter(l => l.patientId === patientId); }
  public saveLab(lab: LaboratoryReport) {
    const idx = this.labs.findIndex(l => l.reportId === lab.reportId);
    if (idx >= 0) this.labs[idx] = lab;
    else this.labs.push(lab);
    this.save('vp_labs', this.labs);
  }

  // --- Imaging ---
  public getImaging() { return this.imaging; }
  public getImagingByPatient(patientId: string) { return this.imaging.filter(i => i.patientId === patientId); }
  public saveImaging(img: ImagingRecord) {
    const idx = this.imaging.findIndex(i => i.imageId === img.imageId);
    if (idx >= 0) this.imaging[idx] = img;
    else this.imaging.push(img);
    this.save('vp_imaging', this.imaging);
  }

  // --- Surgeries ---
  public getSurgeries() { return this.surgeries; }
  public getSurgeriesByPatient(patientId: string) { return this.surgeries.filter(s => s.patientId === patientId); }
  public saveSurgery(surg: SurgeryRecord) {
    const idx = this.surgeries.findIndex(s => s.surgeryId === surg.surgeryId);
    if (idx >= 0) this.surgeries[idx] = surg;
    else this.surgeries.push(surg);
    this.save('vp_surgeries', this.surgeries);
  }

  // --- Hospitalizations ---
  public getHospitalizations() { return this.hospitalizations; }
  public getHospitalizationsByPatient(patientId: string) { return this.hospitalizations.filter(h => h.patientId === patientId); }
  public saveHospitalization(hosp: HospitalizationRecord) {
    const idx = this.hospitalizations.findIndex(h => h.hospitalizationId === hosp.hospitalizationId);
    if (idx >= 0) this.hospitalizations[idx] = hosp;
    else this.hospitalizations.push(hosp);
    this.save('vp_hospitalizations', this.hospitalizations);
  }

  // --- Inventory ---
  public getInventory() { return this.inventory; }
  public saveInventoryItem(item: InventoryItem) {
    const idx = this.inventory.findIndex(i => i.itemId === item.itemId);
    if (idx >= 0) this.inventory[idx] = item;
    else this.inventory.push(item);
    this.save('vp_inventory', this.inventory);
  }

  // --- Invoices ---
  public getInvoices() { return this.invoices; }
  public saveInvoice(inv: Invoice) {
    const idx = this.invoices.findIndex(i => i.invoiceId === inv.invoiceId);
    if (idx >= 0) this.invoices[idx] = inv;
    else this.invoices.push(inv);
    this.save('vp_invoices', this.invoices);
  }

  // --- Audit ---
  public getAudit() { return this.audit; }

  // --- Settings ---
  public getSettings() { return this.settings; }
  public saveSettings(set: AppSettings) {
    this.settings = set;
    localStorage.setItem('vp_settings', JSON.stringify(set));
  }

  // --- Uploaded Prescriptions ---
  public getUploadedPrescriptions() { return this.uploadedPrescriptions; }
  public getUploadedPrescriptionsByPet(petId: string) { return this.uploadedPrescriptions.filter(p => p.petId === petId); }
  public getUploadedPrescriptionsByOwner(ownerId: string) { return this.uploadedPrescriptions.filter(p => p.ownerId === ownerId); }
  public saveUploadedPrescription(rx: OwnerUploadedPrescription) {
    const idx = this.uploadedPrescriptions.findIndex(p => p.id === rx.id);
    if (idx >= 0) {
      this.uploadedPrescriptions[idx] = rx;
    } else {
      this.uploadedPrescriptions.unshift(rx);
    }
    this.save('vp_uploaded_prescriptions', this.uploadedPrescriptions);

    // Sync medications with the pet profile
    const pet = this.pets.find(p => p.petId === rx.petId);
    if (pet && rx.medications && rx.medications.length > 0) {
      const medNames = rx.medications.map(p => `${p.drugName} (${p.doseRate || ''} ${p.frequency || ''})`.trim());
      const combined = Array.from(new Set([...medNames, ...(pet.currentMedications || [])])).slice(0, 8);
      pet.currentMedications = combined;
      this.savePet(pet);
    }

    // AI learns from this uploaded prescription
    if (rx.medications && rx.medications.length > 0) {
      this.recordPrescriptionLearning({
        patientName: rx.petName,
        species: pet?.species,
        diagnosis: rx.diagnosis || 'Prescribed Care',
        items: rx.medications,
        notes: rx.instructions,
        source: 'uploaded_prescription'
      });
    }

    this.addNotification(rx.ownerId, 'Prescription Saved', `Prescription for ${rx.petName} from ${rx.doctorOrClinicName} was successfully saved to health records.`, 'general');
  }
  public deleteUploadedPrescription(id: string) {
    this.uploadedPrescriptions = this.uploadedPrescriptions.filter(p => p.id !== id);
    this.save('vp_uploaded_prescriptions', this.uploadedPrescriptions);
  }

  // --- AI Learned Formulary & Dynamic Suggestions ---
  public getLearnedFormulary(species?: string, indication?: string): LearnedFormularyItem[] {
    let list = [...this.learnedFormulary];
    if (species && species !== 'all') {
      const sp = species.toLowerCase();
      list = list.filter(item => item.targetSpecies === 'all' || item.targetSpecies === sp);
    }
    if (indication && indication.trim().length > 0) {
      const term = indication.toLowerCase();
      // Sort items matching indication to the top
      list.sort((a, b) => {
        const aMatch = a.indication.toLowerCase().includes(term) || a.drugName.toLowerCase().includes(term) ? 1 : 0;
        const bMatch = b.indication.toLowerCase().includes(term) || b.drugName.toLowerCase().includes(term) ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
        return b.timesUsed - a.timesUsed;
      });
    } else {
      list.sort((a, b) => b.timesUsed - a.timesUsed);
    }
    return list;
  }

  public recordPrescriptionLearning(prescription: {
    patientName?: string;
    species?: string;
    diagnosis: string;
    items: PrescriptionItem[];
    notes?: string;
    source?: 'uploaded_prescription' | 'doctor_rx' | 'ai_verified';
  }): LearnedFormularyItem[] {
    if (!prescription.items || prescription.items.length === 0) return this.learnedFormulary;

    let hasChanges = false;
    const targetSpecies: 'dog' | 'cat' | 'all' = prescription.species?.toLowerCase().includes('cat') 
      ? 'cat' 
      : prescription.species?.toLowerCase().includes('dog') 
        ? 'dog' 
        : 'all';

    prescription.items.forEach(item => {
      if (!item.drugName || item.drugName.trim().length < 2) return;
      const cleanName = item.drugName.trim();
      const lowerName = cleanName.toLowerCase();

      // Find if we already have this drug or similar in learned formulary
      const existingIdx = this.learnedFormulary.findIndex(f => 
        f.drugName.toLowerCase() === lowerName ||
        f.drugName.toLowerCase().includes(lowerName) ||
        lowerName.includes(f.drugName.toLowerCase().split(' ')[0])
      );

      if (existingIdx >= 0) {
        const existing = this.learnedFormulary[existingIdx];
        existing.timesUsed += 1;
        existing.learnedAt = new Date().toISOString();
        if (item.doseRate && (!existing.doseRate || existing.doseRate.length < 3)) {
          existing.doseRate = item.doseRate;
        }
        if (item.frequency && (!existing.frequency || existing.frequency.length < 3)) {
          existing.frequency = item.frequency;
        }
        if (prescription.diagnosis && !existing.indication.toLowerCase().includes(prescription.diagnosis.toLowerCase())) {
          existing.indication = `${existing.indication}, ${prescription.diagnosis}`.slice(0, 150);
        }
        if (prescription.patientName) {
          existing.learnedFromPatient = prescription.patientName;
        }
        hasChanges = true;
      } else {
        // Create a new learned item in our AI formulary
        const newItem: LearnedFormularyItem = {
          id: 'lrn-' + Math.random().toString(36).substring(2, 9),
          drugName: cleanName,
          doseRate: item.doseRate || 'Standard veterinary dose',
          concentration: item.concentration || '',
          route: item.route || 'PO',
          frequency: item.frequency || 'BID',
          duration: item.duration || '7 days',
          indication: prescription.diagnosis || 'Prescribed Clinical Therapy',
          targetSpecies,
          source: prescription.source || 'uploaded_prescription',
          learnedFromPatient: prescription.patientName,
          learnedAt: new Date().toISOString(),
          timesUsed: 1,
          doctorConfidence: 'AI Learned & Clinician Approved',
          clinicalNote: item.instructions || prescription.notes || 'Learned from real clinical prescription.'
        };
        this.learnedFormulary.unshift(newItem);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.save('vp_learned_formulary', this.learnedFormulary);
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('vetpulse:formulary-updated', { 
            detail: { count: this.learnedFormulary.length } 
          }));
        }
      } catch (e) {
        // Ignore in non-browser context
      }
    }

    return this.learnedFormulary;
  }

  // --- Pet Age & Weight Updates ---
  public updatePetAgeWeight(petId: string, updates: { weight?: number; dateOfBirth?: string; notes?: string }) {
    const pet = this.pets.find(p => p.petId === petId);
    if (!pet) return null;
    if (updates.dateOfBirth) {
      pet.dateOfBirth = updates.dateOfBirth;
    }
    if (updates.weight !== undefined && updates.weight > 0) {
      pet.weight = updates.weight;
      if (!pet.weightHistory) pet.weightHistory = [];
      pet.weightHistory.push({
        date: new Date().toISOString().split('T')[0],
        weight: updates.weight,
        notes: updates.notes || 'Weight updated by owner'
      });
    }
    this.savePet(pet);
    return pet;
  }

  // --- Notifications ---
  public getNotifications(userId?: string) {
    if (userId) return this.notifications.filter(n => n.userId === userId);
    return this.notifications;
  }
  public addNotification(userId: string, title: string, message: string, type: NotificationItem['type']) {
    const not: NotificationItem = {
      notificationId: 'not-' + Math.random().toString(36).substring(2, 9),
      userId,
      title,
      message,
      date: new Date().toISOString(),
      read: false,
      type
    };
    this.notifications.unshift(not);
    this.save('vp_notifications', this.notifications);

    // Play chime only if user has turned notification sound ON (OFF by default)
    playNotificationSound(type === 'vaccination' ? 'booster' : type === 'appointment' ? 'alert' : 'general');
  }
  public markAllRead(userId: string) {
    this.notifications = this.notifications.map(n => n.userId === userId ? { ...n, read: true } : n);
    this.save('vp_notifications', this.notifications);
  }
  public dismissNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.notificationId !== notificationId);
    this.save('vp_notifications', this.notifications);
  }

  public broadcastNotification(title: string, message: string, type: NotificationItem['type'] = 'general') {
    this.users.forEach(u => {
      this.addNotification(u.uid, title, message, type);
    });
  }

  public getDatabaseExport() {
    return JSON.stringify({
      users: this.users,
      doctors: this.doctors,
      pets: this.pets,
      appointments: this.appointments,
      consultations: this.consultations,
      labs: this.labs,
      imaging: this.imaging,
      surgeries: this.surgeries,
      hospitalizations: this.hospitalizations,
      inventory: this.inventory,
      invoices: this.invoices,
      audit: this.audit,
      settings: this.settings,
      uploadedPrescriptions: this.uploadedPrescriptions,
      learnedFormulary: this.learnedFormulary
    }, null, 2);
  }

  public restoreDatabase(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.users && Array.isArray(data.users)) {
        this.users = data.users;
        this.save('vp_users', this.users);
      }
      if (data.doctors && Array.isArray(data.doctors)) {
        this.doctors = data.doctors;
        this.save('vp_doctors', this.doctors);
      }
      if (data.pets && Array.isArray(data.pets)) {
        this.pets = data.pets;
        this.save('vp_pets', this.pets);
      }
      if (data.appointments && Array.isArray(data.appointments)) {
        this.appointments = data.appointments;
        this.save('vp_appointments', this.appointments);
      }
      if (data.consultations && Array.isArray(data.consultations)) {
        this.consultations = data.consultations;
        this.save('vp_consultations', this.consultations);
      }
      if (data.labs && Array.isArray(data.labs)) {
        this.labs = data.labs;
        this.save('vp_labs', this.labs);
      }
      if (data.imaging && Array.isArray(data.imaging)) {
        this.imaging = data.imaging;
        this.save('vp_imaging', this.imaging);
      }
      if (data.surgeries && Array.isArray(data.surgeries)) {
        this.surgeries = data.surgeries;
        this.save('vp_surgeries', this.surgeries);
      }
      if (data.hospitalizations && Array.isArray(data.hospitalizations)) {
        this.hospitalizations = data.hospitalizations;
        this.save('vp_hospitalizations', this.hospitalizations);
      }
      if (data.inventory && Array.isArray(data.inventory)) {
        this.inventory = data.inventory;
        this.save('vp_inventory', this.inventory);
      }
      if (data.invoices && Array.isArray(data.invoices)) {
        this.invoices = data.invoices;
        this.save('vp_invoices', this.invoices);
      }
      if (data.audit && Array.isArray(data.audit)) {
        this.audit = data.audit;
        this.save('vp_audit', this.audit);
      }
      if (data.uploadedPrescriptions && Array.isArray(data.uploadedPrescriptions)) {
        this.uploadedPrescriptions = data.uploadedPrescriptions;
        this.save('vp_uploaded_prescriptions', this.uploadedPrescriptions);
      }
      if (data.learnedFormulary && Array.isArray(data.learnedFormulary)) {
        this.learnedFormulary = data.learnedFormulary;
        this.save('vp_learned_formulary', this.learnedFormulary);
      }
      if (data.settings && typeof data.settings === 'object') {
        this.settings = data.settings;
        this.saveSettings(this.settings);
      }
      return true;
    } catch (err) {
      console.error('Failed to restore database from backup:', err);
      return false;
    }
  }

  public resetToDefaultData() {
    localStorage.removeItem('vp_users');
    localStorage.removeItem('vp_doctors');
    localStorage.removeItem('vp_pets');
    localStorage.removeItem('vp_appointments');
    localStorage.removeItem('vp_consultations');
    localStorage.removeItem('vp_labs');
    localStorage.removeItem('vp_imaging');
    localStorage.removeItem('vp_surgeries');
    localStorage.removeItem('vp_hospitalizations');
    localStorage.removeItem('vp_inventory');
    localStorage.removeItem('vp_invoices');
    localStorage.removeItem('vp_audit');
    localStorage.removeItem('vp_settings');
    localStorage.removeItem('vp_uploaded_prescriptions');
    localStorage.removeItem('vp_learned_formulary');
    localStorage.removeItem('vp_notifications');
    this.resetToDefaults();
  }
}

export const dbService = new LocalDatabaseService();

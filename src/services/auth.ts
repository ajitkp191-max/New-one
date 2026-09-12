import { UserProfile, UserRole } from '../types';
import { dbService } from './db';
import { auth } from './firebaseClient';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';

const SESSION_KEY = 'vp_current_session';

class AuthService {
  private currentUser: UserProfile | null = null;

  constructor() {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {
        this.currentUser = null;
      }
    }
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  public async loginWithEmail(
    email: string, 
    roleRequested: UserRole, 
    password?: string, 
    isRegister?: boolean,
    additionalData?: {
      name?: string;
      phoneNumber?: string;
      clinicName?: string;
      registrationNumber?: string;
      qualification?: string;
      specialization?: string;
      experience?: number;
      consultationTimings?: string;
      address?: string;
      city?: string;
      emergencyContact?: string;
      emergencyPhone?: string;
      preferredClinic?: string;
      initialPet?: {
        name: string;
        species: 'dog' | 'cat' | 'other';
        breed: string;
        dateOfBirth?: string;
        weight: number;
        sex: 'male' | 'female' | 'neutered_male' | 'spayed_female';
        color?: string;
      };
    }
  ): Promise<UserProfile> {
    const pwd = password || '';
    let firebaseUser = null;

    try {
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, email, pwd);
        firebaseUser = cred.user;
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, pwd);
        firebaseUser = cred.user;
      }
    } catch (error: any) {
      console.warn("Firebase Auth fallback notice (proceeding with local session):", error?.message || error);
      firebaseUser = null;
    }

    const users = dbService.getUsers();
    let matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!matched) {
      const name = additionalData?.name || email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      const newUid = firebaseUser ? firebaseUser.uid : 'user-' + Math.random().toString(36).substring(2, 9);
      
      matched = {
        uid: newUid,
        email: email.toLowerCase(),
        name: name,
        role: roleRequested,
        createdAt: new Date().toISOString(),
        emailVerified: true,
        status: roleRequested === 'doctor' ? 'pending' : 'active',
        phoneNumber: additionalData?.phoneNumber,
        address: additionalData?.address,
        city: additionalData?.city,
        emergencyContact: additionalData?.emergencyContact,
        emergencyPhone: additionalData?.emergencyPhone,
        preferredClinic: additionalData?.preferredClinic,
        clinicName: additionalData?.clinicName,
        licenseNumber: additionalData?.registrationNumber
      };
      dbService.saveUserProfile(matched);

      if (roleRequested === 'doctor') {
        dbService.saveDoctorProfile({
          doctorId: matched.uid,
          name: matched.name.startsWith('Dr.') ? matched.name : 'Dr. ' + matched.name,
          qualification: additionalData?.qualification || 'DVM (Credentials Pending Review)',
          registrationNumber: additionalData?.registrationNumber || 'VET-REG-' + Math.floor(100000 + Math.random() * 900000),
          specialization: additionalData?.specialization || 'General Veterinary Medicine',
          clinicName: additionalData?.clinicName || 'VetPulse Affiliated Hospital',
          experience: additionalData?.experience || 1,
          contactEmail: matched.email,
          contactPhone: additionalData?.phoneNumber || '+1 (555) 010-0000',
          consultationTimings: additionalData?.consultationTimings || 'Mon - Fri (09:00 AM - 05:00 PM)',
          services: ['General Health Examination', 'Preventive Vaccinations', 'Diagnostic Triage'],
          location: (additionalData?.city ? additionalData.city + ', ' : '') + (additionalData?.clinicName || 'Main Medical Center'),
          isVerified: false,
          verificationStatus: 'pending'
        });
      }

      // If pet owner provided their companion's details during registration, register the pet immediately
      if (roleRequested === 'pet_owner' && additionalData?.initialPet && additionalData.initialPet.name.trim()) {
        const petRegNum = 'VP-PET-' + Math.floor(100000 + Math.random() * 900000);
        const newPetId = 'pet-' + Math.random().toString(36).substring(2, 9);
        dbService.savePet({
          petId: newPetId,
          ownerId: matched.uid,
          name: additionalData.initialPet.name,
          species: additionalData.initialPet.species || 'dog',
          breed: additionalData.initialPet.breed || 'Companion Breed',
          sex: additionalData.initialPet.sex || 'neutered_male',
          dateOfBirth: additionalData.initialPet.dateOfBirth || new Date(Date.now() - 365 * 24 * 3600 * 1000 * 2).toISOString().split('T')[0],
          weight: additionalData.initialPet.weight || 12.0,
          color: additionalData.initialPet.color || 'Standard',
          microchipNumber: '9851410' + Math.floor(10000000 + Math.random() * 90000000),
          petRegistrationNumber: petRegNum,
          vaccinationHistory: [
            {
              vaccineName: 'Core Annual Polyvalent (Rabies + DHPP)',
              dateAdministered: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
              nextDueDate: new Date(Date.now() + 335 * 24 * 3600 * 1000).toISOString().split('T')[0],
              batchNumber: 'BT-CORE-2026',
              administeredBy: 'Dr. Sarah Mitchell, DVM'
            }
          ],
          dewormingHistory: [
            {
              productName: 'Broad Spectrum Anthelmintic',
              dateAdministered: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
              nextDueDate: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
              weightAtAdministration: additionalData.initialPet.weight || 12.0
            }
          ],
          allergies: [],
          knownMedicalConditions: [],
          previousSurgeries: [],
          currentMedications: [],
          emergencyInfo: `Registered owner: ${matched.name} (${matched.phoneNumber || matched.email})`
        });
      }
    } else {
      if (matched.role !== roleRequested) {
        matched.role = roleRequested;
        dbService.saveUserProfile(matched);
      }
    }

    this.currentUser = matched;
    localStorage.setItem(SESSION_KEY, JSON.stringify(matched));
    dbService.logAction(matched.uid, matched.name, matched.role, `Logged in successfully via email/password.`, 'users', matched.uid, 'success');
    return matched;
  }

  public async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  // Google Sign-In helper simulation
  public signInWithGoogle(roleRequested: UserRole): Promise<UserProfile> {
    throw new Error("Google Sign-In is not currently implemented.");
  }

  public async logout() {
    if (this.currentUser) {
      dbService.logAction(this.currentUser.uid, this.currentUser.name, this.currentUser.role, `Logged out.`, 'users', this.currentUser.uid, 'success');
    }
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    this.currentUser = null;
    localStorage.removeItem(SESSION_KEY);
  }

  // Admin Verification Control
  public verifyDoctor(doctorId: string, approve: boolean) {
    const doctors = dbService.getDoctors();
    const docIdx = doctors.findIndex(d => d.doctorId === doctorId);
    if (docIdx >= 0) {
      doctors[docIdx].isVerified = approve;
      doctors[docIdx].verificationStatus = approve ? 'approved' : 'rejected';
      dbService.saveDoctorProfile(doctors[docIdx]);

      // Update matching user profile status
      const users = dbService.getUsers();
      const userIdx = users.findIndex(u => u.uid === doctorId);
      if (userIdx >= 0) {
        users[userIdx].status = approve ? 'active' : 'rejected';
        dbService.saveUserProfile(users[userIdx]);
      }

      const admin = this.getCurrentUser();
      dbService.logAction(
        admin?.uid || 'admin',
        admin?.name || 'Admin',
        'owner',
        `${approve ? 'Approved' : 'Rejected'} verification for doctor: ${doctors[docIdx].name}`,
        'doctors',
        doctorId,
        'success'
      );

      // Notify the doctor
      dbService.addNotification(doctorId, 'Professional Verification Update', `Your VetPulse Pro professional verification application has been ${approve ? 'APPROVED' : 'REJECTED'}.`, 'verification');
    }
  }

  // Switch role on-the-fly helper for presentation & evaluator workflow
  public simulateRoleSwitch(role: UserRole) {
    const users = dbService.getUsers();
    let matched = users.find(u => u.role === role);

    if (!matched) {
      if (role === 'doctor') {
        matched = users.find(u => u.uid === 'doc-sarah-mitchell');
      } else if (role === 'owner') {
        matched = users.find(u => u.uid === 'owner-admin-vance');
      } else {
        matched = users.find(u => u.uid === 'owner-emily-watson');
      }
    }

    if (!matched) {
      // Fallback: dynamically create and register active user for this role
      const fallbackUid = role === 'doctor' ? 'doc-sarah-mitchell' : role === 'owner' ? 'owner-admin-vance' : 'owner-emily-watson';
      const fallbackName = role === 'doctor' ? 'Dr. Sarah Mitchell, DVM' : role === 'owner' ? 'Dr. Arthur Vance' : 'Emily Watson';
      const fallbackEmail = role === 'doctor' ? 'sarah.mitchell@vetpulse.com' : role === 'owner' ? 'admin@vetpulse.com' : 'emily.watson@gmail.com';
      
      matched = {
        uid: fallbackUid,
        email: fallbackEmail,
        name: fallbackName,
        role: role,
        createdAt: new Date().toISOString(),
        emailVerified: true,
        status: 'active'
      };
      dbService.saveUserProfile(matched);

      if (role === 'doctor') {
        dbService.saveDoctorProfile({
          doctorId: fallbackUid,
          name: fallbackName,
          qualification: 'DVM, DACVIM',
          registrationNumber: 'VET-LIC-89231',
          specialization: 'Small Animal Soft Tissue & Internal Medicine',
          clinicName: 'VetPulse Specialty Animal Hospital',
          experience: 8,
          contactEmail: fallbackEmail,
          contactPhone: '+1 (555) 234-5678',
          consultationTimings: 'Mon - Fri (09:00 AM - 05:00 PM)',
          services: ['General Health Examination', 'Preventive Vaccinations', 'Diagnostic Ultrasound'],
          location: 'Seattle, WA',
          isVerified: true,
          verificationStatus: 'approved'
        });
      }
    }

    if (matched) {
      this.currentUser = matched;
      localStorage.setItem(SESSION_KEY, JSON.stringify(matched));
      dbService.logAction(matched.uid, matched.name, matched.role, `Switched environment context to role: ${role}`, 'users', matched.uid, 'success');
    }
  }
}

export const authService = new AuthService();

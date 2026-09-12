import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Check, 
  X, 
  UserX, 
  UserCheck, 
  Trash2, 
  Mail, 
  Phone, 
  Award, 
  FileText, 
  Building2, 
  Sparkles,
  Key,
  Filter,
  Radio,
  Clock,
  Activity,
  Circle,
  Stethoscope,
  Wifi,
  WifiOff
} from 'lucide-react';
import { UserProfile, DoctorProfile, UserRole } from '../../types';
import Realistic3DEmoji from '../Realistic3DEmoji';

interface SuperAdminUserManagementProps {
  users: UserProfile[];
  doctors: DoctorProfile[];
  currentUserId: string;
  onToggleUserStatus: (userId: string, currentStatus: string) => void;
  onVerifyDoctor: (doctorId: string, approve: boolean) => void;
  onCreateUser: (newUser: UserProfile, doctorData?: Partial<DoctorProfile>) => void;
  onDeleteUser: (userId: string, userName: string) => void;
}

export default function SuperAdminUserManagement({
  users,
  doctors,
  currentUserId,
  onToggleUserStatus,
  onVerifyDoctor,
  onCreateUser,
  onDeleteUser
}: SuperAdminUserManagementProps) {
  const [activeSubTab, setActiveSubTab] = useState<'all_users' | 'doctors_credentials'>('all_users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<'all' | 'online' | 'offline'>('all');

  // Create User Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('doctor');
  
  // Doctor specific fields
  const [newDocQualification, setNewDocQualification] = useState('DVM, UC Davis School of Veterinary Medicine');
  const [newDocRegNumber, setNewDocRegNumber] = useState('VET-2026-');
  const [newDocSpecialty, setNewDocSpecialty] = useState('General Veterinary Surgery & Internal Medicine');
  const [newDocClinic, setNewDocClinic] = useState('VetPulse Premium Medical Hub');
  const [newDocExp, setNewDocExp] = useState(6);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUid = `${newUserRole}-${Math.random().toString(36).substring(2, 9)}`;
    const userObj: UserProfile = {
      uid: newUid,
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      phoneNumber: newUserPhone.trim() || undefined,
      role: newUserRole,
      createdAt: new Date().toISOString(),
      emailVerified: true,
      status: 'active',
      isOnline: true,
      lastActive: 'Active now'
    };

    let docObj: Partial<DoctorProfile> | undefined;
    if (newUserRole === 'doctor') {
      docObj = {
        doctorId: newUid,
        name: newUserName.trim(),
        qualification: newDocQualification,
        registrationNumber: newDocRegNumber,
        specialization: newDocSpecialty,
        clinicName: newDocClinic,
        experience: Number(newDocExp),
        contactEmail: newUserEmail.trim().toLowerCase(),
        contactPhone: newUserPhone || '+1 (555) 000-0000',
        consultationTimings: 'Mon - Fri (09:00 AM - 05:00 PM)',
        services: ['General Consultation', 'Soft Tissue Surgery', 'Diagnostic Ultrasound'],
        location: 'Central Veterinary Wing',
        isVerified: true,
        verificationStatus: 'approved'
      };
    }

    onCreateUser(userObj, docObj);

    // Reset
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setShowAddModal(false);
  };

  // Helper to determine online state
  const isUserOnline = (user: UserProfile) => {
    if (user.uid === currentUserId) return true;
    if (user.status === 'suspended') return false;
    if (user.isOnline !== undefined) return user.isOnline;
    // Default fallback for demo
    return user.status === 'active';
  };

  const getUserActivityLabel = (user: UserProfile) => {
    if (user.uid === currentUserId) return 'Active Now (You)';
    if (user.status === 'suspended') return 'Account Suspended';
    const online = isUserOnline(user);
    if (online) {
      if (user.role === 'doctor') return 'In Clinic • On Duty';
      if (user.role === 'owner') return 'Super Admin • Active';
      return 'Client Portal • Active';
    }
    return user.lastActive || 'Offline • Off Shift';
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phoneNumber && u.phoneNumber.includes(searchTerm));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const onlineState = isUserOnline(u);
    const matchesActivity = 
      activityFilter === 'all' || 
      (activityFilter === 'online' && onlineState) || 
      (activityFilter === 'offline' && !onlineState);

    return matchesSearch && matchesRole && matchesStatus && matchesActivity;
  });

  const pendingDoctors = doctors.filter(d => d.verificationStatus === 'pending');
  const onlineStaffCount = users.filter(u => (u.role === 'doctor' || u.role === 'owner') && isUserOnline(u)).length;
  const totalStaffCount = users.filter(u => u.role === 'doctor' || u.role === 'owner').length;
  const offlineStaffCount = totalStaffCount - onlineStaffCount;

  return (
    <div className="space-y-8" id="super-admin-user-management-root">
      
      {/* Header Banner & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)]">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-600" />
              Staff & User Identity Governance (RBAC)
            </span>

            {/* Live Activity Telemetry Badge */}
            <span className="px-3 py-1 rounded-full bg-slate-900 text-slate-100 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400">{onlineStaffCount} Staff Online</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{offlineStaffCount} Offline</span>
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            User Access, Presence & Medical Credentials
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Supervise live staff presence indicators, role-based access control (RBAC), and doctor state medical licenses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-black text-xs shadow-md shadow-cyan-500/25 flex items-center gap-2 transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Staff / User</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveSubTab('all_users')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
            activeSubTab === 'all_users'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>All User Identities ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('doctors_credentials')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 relative ${
            activeSubTab === 'doctors_credentials'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Doctor Credentials Board ({doctors.length})</span>
          {pendingDoctors.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse">
              {pendingDoctors.length} Review
            </span>
          )}
        </button>
      </div>

      {/* Sub-Tab 1: All Users Directory */}
      {activeSubTab === 'all_users' && (
        <div className="space-y-6">
          
          {/* Filters Bar with Activity Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="all">All Roles (Admin, Doctor, Pet Owner)</option>
                <option value="owner">Super Admin</option>
                <option value="doctor">Medical Doctor</option>
                <option value="pet_owner">Pet Owner / Client</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="all">All Statuses (Active & Suspended)</option>
                <option value="active">Active Accounts</option>
                <option value="suspended">Suspended Accounts</option>
                <option value="pending">Pending Verification</option>
              </select>
            </div>

            {/* Live Activity Status Filter */}
            <div>
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="all">All Activity Statuses</option>
                <option value="online">🟢 Online Now (Active Session)</option>
                <option value="offline">⚪ Offline (Off Shift)</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/75 border-b border-slate-100">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="p-6">User & Contact</th>
                    <th className="p-6">Assigned Role</th>
                    <th className="p-6">Presence & Activity</th>
                    <th className="p-6">Account Status</th>
                    <th className="p-6">Registered On</th>
                    <th className="p-6 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredUsers.map((u) => {
                    const online = isUserOnline(u);
                    const activityLabel = getUserActivityLabel(u);

                    return (
                      <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                        
                        {/* User & Avatar with 3D Status Ring */}
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-sm ${
                                u.role === 'owner' ? 'bg-gradient-to-tr from-indigo-600 to-purple-600' :
                                u.role === 'doctor' ? 'bg-gradient-to-tr from-cyan-600 to-teal-600' :
                                'bg-gradient-to-tr from-slate-700 to-slate-900'
                              }`}>
                                {u.name.charAt(0)}
                              </div>
                              
                              {/* Visual Activity Status Indicator Dot on Avatar */}
                              <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                                {online ? (
                                  <span className="relative flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white shadow-sm"></span>
                                  </span>
                                ) : (
                                  <span className="inline-flex rounded-full h-3.5 w-3.5 bg-slate-400 border-2 border-white shadow-sm"></span>
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                                {u.name}
                                {u.uid === currentUserId && (
                                  <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[9px] font-black uppercase">
                                    You (Super Admin)
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {u.email}</span>
                                {u.phoneNumber && (
                                  <span className="flex items-center gap-1">• <Phone className="w-3 h-3" /> {u.phoneNumber}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            u.role === 'owner' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' :
                            u.role === 'doctor' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200/60' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role === 'owner' ? 'Super Admin' : u.role === 'doctor' ? 'Veterinary Doctor' : 'Pet Owner'}
                          </span>
                        </td>

                        {/* Activity & Presence Status Badge */}
                        <td className="p-6">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${
                              online
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs'
                                : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                            }`}>
                              {online ? (
                                <>
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                  </span>
                                  <span>Online</span>
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                                  <span>Offline</span>
                                </>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium pl-1">
                              {activityLabel}
                            </span>
                          </div>
                        </td>

                        {/* Account Status */}
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${
                            u.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                            u.status === 'suspended' ? 'bg-rose-50 text-rose-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'active' ? 'bg-emerald-500' :
                              u.status === 'suspended' ? 'bg-rose-500' : 'bg-amber-500'
                            }`} />
                            {u.status}
                          </span>
                        </td>

                        {/* Registration Date */}
                        <td className="p-6 text-slate-500 font-medium">
                          {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>

                        {/* Actions */}
                        <td className="p-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.uid !== currentUserId && (
                              <>
                                <button
                                  onClick={() => onToggleUserStatus(u.uid, u.status)}
                                  className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1.5 shadow-sm ${
                                    u.status === 'suspended'
                                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                                  }`}
                                >
                                  {u.status === 'suspended' ? (
                                    <>
                                      <UserCheck className="w-3.5 h-3.5" />
                                      <span>Activate</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserX className="w-3.5 h-3.5" />
                                      <span>Suspend</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  onClick={() => onDeleteUser(u.uid, u.name)}
                                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                                  title="Remove User Profile"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Doctor Credentials & License Verification Board */}
      {activeSubTab === 'doctors_credentials' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {doctors.map((doc) => {
              const matchedUser = users.find(u => u.uid === doc.doctorId);
              const isOnline = matchedUser ? isUserOnline(matchedUser) : true;

              return (
                <div 
                  key={doc.doctorId}
                  className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] space-y-6 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-500 text-white flex items-center justify-center font-black text-xl shadow-md">
                            🎓
                          </div>
                          {/* Live Presence Indicator */}
                          <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                            {isOnline ? (
                              <span className="relative flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white shadow-sm"></span>
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full h-3.5 w-3.5 bg-slate-400 border-2 border-white shadow-sm"></span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black text-slate-900">{doc.name}</h3>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{doc.specialization}</p>
                          
                          {/* Online/Offline Status Text Badge */}
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {isOnline ? 'Online (On Duty)' : 'Offline (Off Duty)'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        doc.verificationStatus === 'approved' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : doc.verificationStatus === 'pending'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {doc.verificationStatus}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Medical License / Registration:</span>
                        <span className="text-slate-900 font-mono font-bold">{doc.registrationNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Alma Mater & Degree:</span>
                        <span className="text-slate-800 font-semibold">{doc.qualification}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Clinical Experience:</span>
                        <span className="text-slate-800 font-bold">{doc.experience} Years Active Practice</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Hospital Base:</span>
                        <span className="text-slate-800 font-semibold">{doc.clinicName}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Authorized Services:</span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {doc.services.map((s, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      onClick={() => onVerifyDoctor(doc.doctorId, false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-black text-xs transition-colors"
                    >
                      Decline / Revoke
                    </button>
                    <button
                      onClick={() => onVerifyDoctor(doc.doctorId, true)}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Credentials</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Create New User */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-md">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Provision New Identity</h3>
                    <p className="text-xs text-slate-500">Create staff, veterinary doctor, or client credentials.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Account Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'doctor', label: 'Doctor', icon: '🩺' },
                      { id: 'pet_owner', label: 'Pet Owner', icon: '🐾' },
                      { id: 'owner', label: 'Super Admin', icon: '👑' }
                    ].map((r) => (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => setNewUserRole(r.id as any)}
                        className={`p-3 rounded-2xl border font-black text-xs flex flex-col items-center gap-1 transition-all ${
                          newUserRole === r.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-lg">{r.icon}</span>
                        <span>{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder={newUserRole === 'doctor' ? 'e.g. Dr. Alexander Price, DVM' : 'e.g. Rachel Adams'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="user@vetpulse.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Phone (Optional)</label>
                    <input
                      type="text"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </div>
                </div>

                {/* Doctor Additional Fields */}
                {newUserRole === 'doctor' && (
                  <div className="p-4 bg-cyan-50/50 rounded-2xl border border-cyan-100 space-y-3">
                    <div className="text-[10px] font-black uppercase tracking-wider text-cyan-800 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-cyan-600" />
                      Doctor Credentials & Registration
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">State License / Reg #</label>
                        <input
                          type="text"
                          value={newDocRegNumber}
                          onChange={(e) => setNewDocRegNumber(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Experience (Years)</label>
                        <input
                          type="number"
                          value={newDocExp}
                          onChange={(e) => setNewDocExp(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Specialization</label>
                      <input
                        type="text"
                        value={newDocSpecialty}
                        onChange={(e) => setNewDocSpecialty(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 font-black text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-black shadow-md shadow-cyan-500/25 transition-all"
                  >
                    Provision Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

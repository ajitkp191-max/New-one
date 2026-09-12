import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  ShieldAlert, 
  TrendingUp, 
  Database, 
  Settings, 
  LogOut, 
  Activity, 
  Building2, 
  ShieldCheck, 
  Radio, 
  Clock, 
  Bell, 
  Sparkles, 
  Search, 
  Plus, 
  Check, 
  X,
  FileSpreadsheet,
  Download,
  RotateCcw,
  Zap,
  Server,
  Layers,
  HeartPulse,
  Package,
  Calendar,
  ArrowLeft,
  Home
} from 'lucide-react';
import { 
  UserProfile, 
  DoctorProfile, 
  AuditLog, 
  AppSettings, 
  PetProfile, 
  Invoice, 
  HospitalizationRecord, 
  InventoryItem, 
  Appointment, 
  Consultation, 
  SurgeryRecord, 
  LaboratoryReport, 
  ImagingRecord,
  NotificationItem
} from '../types';
import { dbService } from '../services/db';
import { authService } from '../services/auth';

// 3D Super Admin Sub-Components
import SuperAdminMetrics3D from './owner/SuperAdminMetrics3D';
import SuperAdminAnalytics3D from './owner/SuperAdminAnalytics3D';
import SuperAdminUserManagement from './owner/SuperAdminUserManagement';
import SuperAdminHospitalOperations from './owner/SuperAdminHospitalOperations';
import SuperAdminSecurityAudit from './owner/SuperAdminSecurityAudit';
import SuperAdminMasterSettings from './owner/SuperAdminMasterSettings';
import Realistic3DEmoji from './Realistic3DEmoji';

interface OwnerViewProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

export default function OwnerView({ currentUser, onLogout }: OwnerViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'users' | 'hospital' | 'security' | 'settings'>('overview');
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
    } else if (activeTab !== 'overview') {
      setActiveTab('overview');
    }
  };

  const handleGoHome = () => {
    if (activeTab !== 'overview') {
      setTabHistory(prev => [...prev, activeTab]);
      setActiveTab('overview');
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
  
  // Database Data States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [hospitalizations, setHospitalizations] = useState<HospitalizationRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [surgeries, setSurgeries] = useState<SurgeryRecord[]>([]);
  const [labs, setLabs] = useState<LaboratoryReport[]>([]);
  const [imaging, setImaging] = useState<ImagingRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const syncData = () => {
    setUsers(dbService.getUsers());
    setDoctors(dbService.getDoctors());
    setPets(dbService.getPets());
    setInvoices(dbService.getInvoices());
    setHospitalizations(dbService.getHospitalizations());
    setInventory(dbService.getInventory());
    setAppointments(dbService.getAppointments());
    setConsultations(dbService.getConsultations());
    setSurgeries(dbService.getSurgeries());
    setLabs(dbService.getLabs());
    setImaging(dbService.getImaging());
    setAuditLogs(dbService.getAudit());
    setAppSettings(dbService.getSettings());
  };

  useEffect(() => {
    syncData();
  }, [currentUser]);

  // Doctor credentials approval
  const handleVerifyDoctor = (doctorId: string, approve: boolean) => {
    authService.verifyDoctor(doctorId, approve);
    const doc = doctors.find(d => d.doctorId === doctorId);
    dbService.logAction(
      currentUser.uid,
      currentUser.name,
      'owner',
      `${approve ? 'Approved' : 'Declined'} medical credentials for ${doc?.name || doctorId}`,
      'doctors',
      doctorId,
      'success'
    );
    syncData();
    showToast(`Doctor credentials ${approve ? 'approved' : 'declined'} successfully!`);
  };

  // Suspend/Activate User status
  const handleToggleUserStatus = (userId: string, currentStatus: string) => {
    const matched = dbService.getUsers().find(u => u.uid === userId);
    if (matched) {
      const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
      matched.status = nextStatus;
      dbService.saveUserProfile(matched);
      dbService.logAction(
        currentUser.uid, 
        currentUser.name, 
        'owner', 
        `${nextStatus === 'suspended' ? 'Suspended' : 'Re-activated'} user profile: ${matched.name}`, 
        'users', 
        userId, 
        'success'
      );
      syncData();
      showToast(`User ${matched.name} is now ${nextStatus}.`);
    }
  };

  // Create User
  const handleCreateUser = (newUser: UserProfile, doctorData?: Partial<DoctorProfile>) => {
    dbService.saveUserProfile(newUser);
    if (newUser.role === 'doctor' && doctorData) {
      const fullDoc: DoctorProfile = {
        doctorId: newUser.uid,
        name: newUser.name,
        qualification: doctorData.qualification || 'DVM, Cornell University',
        registrationNumber: doctorData.registrationNumber || 'VET-2026-000',
        specialization: doctorData.specialization || 'General Veterinary Medicine',
        clinicName: doctorData.clinicName || 'VetPulse Premium Medical Hub',
        experience: doctorData.experience || 5,
        contactEmail: newUser.email,
        contactPhone: newUser.phoneNumber || '+1 (555) 000-0000',
        consultationTimings: 'Mon - Fri (09:00 AM - 05:00 PM)',
        services: doctorData.services || ['General Consultation', 'Soft Tissue Surgery'],
        location: 'Central Clinical Pavilion',
        isVerified: true,
        verificationStatus: 'approved'
      };
      dbService.saveDoctorProfile(fullDoc);
    }

    dbService.logAction(
      currentUser.uid,
      currentUser.name,
      'owner',
      `Created new ${newUser.role} profile: ${newUser.name} (${newUser.email})`,
      'users',
      newUser.uid,
      'success'
    );
    syncData();
    showToast(`Provisioned account for ${newUser.name} successfully!`);
  };

  // Delete User
  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to permanently remove ${userName}? This action is logged.`)) {
      dbService.deleteUser(userId);
      dbService.logAction(
        currentUser.uid,
        currentUser.name,
        'owner',
        `Permanently removed user account: ${userName}`,
        'users',
        userId,
        'success'
      );
      syncData();
      showToast(`User ${userName} has been removed.`, 'info');
    }
  };

  // Update master settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    dbService.saveSettings(newSettings);
    dbService.logAction(currentUser.uid, currentUser.name, 'owner', `Updated master hospital parameters.`, 'settings', 'master', 'success');
    syncData();
    showToast('Master hospital configuration saved successfully!');
  };

  // Emergency Broadcast Announcement
  const handleBroadcastAnnouncement = (title: string, message: string) => {
    dbService.broadcastNotification(title, message, 'general');
    dbService.logAction(
      currentUser.uid,
      currentUser.name,
      'owner',
      `Sent emergency hospital-wide broadcast: "${title}"`,
      'broadcast',
      'system',
      'success'
    );
    syncData();
    showToast(`Broadcast "${title}" dispatched to all user dashboards!`);
  };

  // Inventory Stock update
  const handleUpdateInventoryStock = (itemId: string, newQuantity: number) => {
    const item = inventory.find(i => i.itemId === itemId);
    if (item) {
      item.quantity = newQuantity;
      item.lastUpdated = new Date().toISOString();
      dbService.saveInventoryItem(item);
      syncData();
      showToast(`Stock for ${item.name} updated to ${newQuantity} units.`);
    }
  };

  // Appointment status update
  const handleUpdateAppointmentStatus = (appointmentId: string, newStatus: Appointment['status']) => {
    const apt = appointments.find(a => a.appointmentId === appointmentId);
    if (apt) {
      apt.status = newStatus;
      dbService.saveAppointment(apt);
      dbService.logAction(
        currentUser.uid,
        currentUser.name,
        'owner',
        `Updated appointment for ${apt.petName} to ${newStatus}`,
        'appointment',
        appointmentId,
        'success'
      );
      syncData();
      showToast(`Appointment status updated to ${newStatus}.`);
    }
  };

  // Export Database JSON
  const handleExportDatabase = () => {
    const rawData = dbService.getDatabaseExport();
    const blob = new Blob([rawData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vetpulse_hd_master_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    dbService.logAction(currentUser.uid, currentUser.name, 'owner', `Exported full database backup.`, 'database', 'backup', 'success');
    syncData();
    showToast('Database backup downloaded successfully!');
  };

  // Restore Database JSON
  const handleRestoreDatabase = (jsonContent: string) => {
    const success = dbService.restoreDatabase(jsonContent);
    if (success) {
      dbService.logAction(currentUser.uid, currentUser.name, 'owner', `Restored database from external JSON backup.`, 'database', 'restore', 'success');
      syncData();
      showToast('Database successfully restored and re-indexed!');
    }
    return success;
  };

  // Reset demo data
  const handleResetDatabase = () => {
    dbService.resetToDefaultData();
    syncData();
    showToast('Database reset to pristine default hospital demo dataset.', 'info');
  };

  // Export Audit CSV
  const handleExportAuditCsv = () => {
    const headers = ['Log ID', 'Timestamp', 'Operator', 'Role', 'Action', 'Resource Type', 'Resource ID', 'Result'];
    const rows = auditLogs.map(l => [
      l.logId,
      l.timestamp,
      `"${l.userName.replace(/"/g, '""')}"`,
      l.role,
      `"${l.action.replace(/"/g, '""')}"`,
      l.resourceType,
      l.resourceId,
      l.result
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vetpulse_audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Audit CSV report downloaded successfully!');
  };

  // Metrics summary
  const activeUsersCount = users.filter(u => u.status === 'active').length;
  const pendingDoctorCount = doctors.filter(d => d.verificationStatus === 'pending').length;
  const paidRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.total : 0), 0);
  const unpaidRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'unpaid' ? inv.total : 0), 0);
  const totalRevenue = paidRevenue + unpaidRevenue;
  const admittedPatientsCount = hospitalizations.filter(h => h.status === 'admitted').length;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden h-screen font-sans" id="super-admin-3d-master-view">
      
      {/* Toast Overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border text-xs font-black flex items-center gap-2.5 ${
              toastMessage.type === 'error'
                ? 'bg-rose-950 text-rose-200 border-rose-800 shadow-rose-900/30'
                : toastMessage.type === 'info'
                ? 'bg-slate-900 text-cyan-300 border-slate-700 shadow-slate-900/30'
                : 'bg-emerald-950 text-emerald-200 border-emerald-800 shadow-emerald-900/30'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col md:flex-row relative z-10 h-full overflow-hidden">
        
        {/* 3D Claymorphic HD Side Navigation */}
        <nav className="md:w-24 bg-white border-r border-slate-200/80 flex md:flex-col items-center justify-between p-4 z-40 shadow-sm shrink-0">
          <div className="hidden md:flex flex-col items-center gap-8 mb-8">
            
            {/* Top 3D Brand Badge */}
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-indigo-600 text-white shadow-[0_10px_25px_rgba(6,182,212,0.4)] flex items-center justify-center transform hover:rotate-6 transition-transform">
              <Activity className="h-6 w-6" />
            </div>
            
            {/* Nav Menu Items */}
            <div className="flex flex-col items-center gap-3.5">
              {[
                { id: 'overview', icon: Zap, label: '3D Radar & KPIs' },
                { id: 'analytics', icon: TrendingUp, label: 'HD Business Analytics' },
                { id: 'users', icon: Users, label: 'Staff Identity & RBAC' },
                { id: 'hospital', icon: Building2, label: 'Hospital Operations' },
                { id: 'security', icon: ShieldCheck, label: 'Security & Audit' },
                { id: 'settings', icon: Settings, label: 'Master Config' }
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    title={item.label}
                    className={`p-3.5 rounded-2xl transition-all duration-300 relative group flex items-center justify-center ${
                      isActive 
                        ? 'bg-slate-900 text-cyan-400 shadow-[0_10px_25px_rgba(15,23,42,0.3)] scale-110' 
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    
                    {/* Tooltip on hover */}
                    <div className="absolute left-16 px-3 py-1.5 bg-slate-950 text-white text-[11px] font-mono font-bold rounded-xl whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-800">
                      {item.label}
                    </div>

                    {isActive && (
                      <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-cyan-500 rounded-r-full shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Avatar & Logout */}
          <div className="flex md:flex-col items-center gap-3">
            <div 
              title={`Logged in as ${currentUser.name} (Super Admin)`}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xs shadow-md"
            >
              {currentUser.name.charAt(0)}
            </div>

            <button 
              onClick={onLogout}
              title="Sign Out"
              className="p-3 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </nav>

        {/* Mobile Horizontal Navigation Header */}
        <div className="md:hidden flex items-center justify-between p-3 bg-white border-b border-slate-200 z-30 overflow-x-auto gap-2">
          {[
            { id: 'overview', icon: Zap, label: 'Radar' },
            { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
            { id: 'users', icon: Users, label: 'Users' },
            { id: 'hospital', icon: Building2, label: 'Hospital' },
            { id: 'security', icon: ShieldCheck, label: 'Security' },
            { id: 'settings', icon: Settings, label: 'Settings' }
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

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 relative z-10 custom-scrollbar max-w-7xl mx-auto w-full">
          
          {/* Quick Navigation Breadcrumb & Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-sm" id="owner-toolbar-container">
            <div className="flex items-center gap-2">
              {/* Back Button */}
              <button
                onClick={handleGoBack}
                className="px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all active:scale-95 border border-slate-200/60 shadow-xs group"
                title="Go to previous tab"
                id="owner-back-btn"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-cyan-600 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>

              {/* Home / Admin Radar Button */}
              <button
                onClick={handleGoHome}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${
                  activeTab === 'overview' 
                    ? 'bg-slate-900 text-cyan-400 shadow-md' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Go to Super Admin Radar"
                id="owner-home-btn"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Admin Radar</span>
              </button>

              {activeTab !== 'overview' && (
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  /
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 capitalize font-mono text-[11px] font-black border border-indigo-200/60">
                    {activeTab === 'hospital' ? 'Hospital Operations' : activeTab === 'users' ? 'Staff & RBAC' : activeTab}
                  </span>
                </span>
              )}
            </div>

            {/* Quick-Jump Section Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'overview', label: '3D Radar', icon: Zap },
                { id: 'analytics', label: 'HD Analytics', icon: TrendingUp },
                { id: 'users', label: 'Staff & RBAC', icon: Users },
                { id: 'hospital', label: 'Hospital Ops', icon: Building2 },
                { id: 'security', label: 'Audit Trail', icon: ShieldCheck },
                { id: 'settings', label: 'Settings', icon: Settings }
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

              <button
                onClick={handleExportDatabase}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-all flex items-center gap-1"
                title="Backup JSON"
                id="backup-database-quick-btn"
              >
                <Download className="w-3 h-3" />
                <span>Backup</span>
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            
            {/* Tab 1: Executive 3D Radar & KPIs */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8 pb-20"
              >
                <SuperAdminMetrics3D
                  userCount={users.length}
                  activeUsersCount={activeUsersCount}
                  doctorCount={doctors.length}
                  pendingDoctorCount={pendingDoctorCount}
                  petCount={pets.length}
                  totalRevenue={totalRevenue}
                  paidRevenue={paidRevenue}
                  unpaidRevenue={unpaidRevenue}
                  admittedPatientsCount={admittedPatientsCount}
                  totalAppointmentsCount={appointments.length}
                  totalConsultationsCount={consultations.length}
                />

                {/* Quick Action Matrix & Real-time Activity Pulse */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left 2 Cols: Live Activity Feed */}
                  <div className="lg:col-span-2 bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                          <Activity className="w-5 h-5 text-cyan-500" />
                          Live Hospital Activity Pulse
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">Real-time telemetry of clinical records, appointments, and staff actions.</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Stream
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto custom-scrollbar">
                      {auditLogs.slice(0, 8).map((log) => (
                        <div key={log.logId} className="py-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors rounded-2xl px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {log.role === 'doctor' ? '🩺' : log.role === 'owner' ? '👑' : '🐾'}
                            </div>
                            <div>
                              <div className="font-black text-slate-900 text-xs">{log.action}</div>
                              <div className="text-[11px] text-slate-400 font-medium">
                                Operator: {log.userName} • Resource: {log.resourceType}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-mono text-slate-400 font-bold">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right 1 Col: Quick Executive Triggers */}
                  <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] space-y-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                          <Zap className="w-5 h-5 text-amber-500" />
                          Master Triggers
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">Instant executive controls & actions.</p>
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={() => setActiveTab('users')}
                          className="w-full p-4 rounded-2xl bg-cyan-50 hover:bg-cyan-100 text-cyan-950 font-black text-xs flex items-center justify-between transition-colors border border-cyan-200/60"
                        >
                          <span className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-cyan-600" />
                            Provision New Staff Account
                          </span>
                          <span>→</span>
                        </button>

                        <button
                          onClick={() => setActiveTab('settings')}
                          className="w-full p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-950 font-black text-xs flex items-center justify-between transition-colors border border-rose-200/60"
                        >
                          <span className="flex items-center gap-2">
                            <Radio className="w-4 h-4 text-rose-600" />
                            Dispatch Emergency Broadcast
                          </span>
                          <span>→</span>
                        </button>

                        <button
                          onClick={handleExportDatabase}
                          className="w-full p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-black text-xs flex items-center justify-between transition-colors border border-indigo-200/60"
                        >
                          <span className="flex items-center gap-2">
                            <Download className="w-4 h-4 text-indigo-600" />
                            Download Immutable Database JSON
                          </span>
                          <span>→</span>
                        </button>

                        <button
                          onClick={handleExportAuditCsv}
                          className="w-full p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-black text-xs flex items-center justify-between transition-colors border border-emerald-200/60"
                        >
                          <span className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            Export Regulatory CSV Audit
                          </span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1">
                      <div className="text-[10px] font-mono text-cyan-400 uppercase font-black">Cluster Deployment</div>
                      <div className="text-xs font-bold">Cloud Run Enterprise Container</div>
                      <div className="text-[10px] text-slate-400">Port 3000 • SSL Secured</div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* Tab 2: HD Business Analytics */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8 pb-20"
              >
                <SuperAdminAnalytics3D
                  invoices={invoices}
                  pets={pets}
                  consultations={consultations}
                  surgeries={surgeries}
                  labs={labs}
                  imaging={imaging}
                  doctors={doctors}
                />
              </motion.div>
            )}

            {/* Tab 3: Staff & User Identity Governance */}
            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8 pb-20"
              >
                <SuperAdminUserManagement
                  users={users}
                  doctors={doctors}
                  currentUserId={currentUser.uid}
                  onToggleUserStatus={handleToggleUserStatus}
                  onVerifyDoctor={handleVerifyDoctor}
                  onCreateUser={handleCreateUser}
                  onDeleteUser={handleDeleteUser}
                />
              </motion.div>
            )}

            {/* Tab 4: Hospital Logistics & ICU Wards */}
            {activeTab === 'hospital' && (
              <motion.div
                key="hospital"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8 pb-20"
              >
                <SuperAdminHospitalOperations
                  hospitalizations={hospitalizations}
                  inventory={inventory}
                  appointments={appointments}
                  consultations={consultations}
                  surgeries={surgeries}
                  labs={labs}
                  imaging={imaging}
                  onUpdateInventoryStock={handleUpdateInventoryStock}
                  onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
                />
              </motion.div>
            )}

            {/* Tab 5: Security Governance & Audit Trail */}
            {activeTab === 'security' && appSettings && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8 pb-20"
              >
                <SuperAdminSecurityAudit
                  auditLogs={auditLogs}
                  settings={appSettings}
                  onUpdateSettings={handleSaveSettings}
                  onExportAuditCsv={handleExportAuditCsv}
                  onExportAuditJson={handleExportDatabase}
                />
              </motion.div>
            )}

            {/* Tab 6: Master Parameters & Disaster Recovery */}
            {activeTab === 'settings' && appSettings && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8 pb-20"
              >
                <SuperAdminMasterSettings
                  settings={appSettings}
                  onSaveSettings={handleSaveSettings}
                  onBroadcastAnnouncement={handleBroadcastAnnouncement}
                  onExportDatabase={handleExportDatabase}
                  onRestoreDatabase={handleRestoreDatabase}
                  onResetDatabase={handleResetDatabase}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Building2, 
  Megaphone, 
  IndianRupee, 
  Database, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  AlertTriangle, 
  Check, 
  Mail, 
  Phone, 
  Radio
} from 'lucide-react';
import { AppSettings } from '../../types';
import NotificationSoundToggle from '../NotificationSoundToggle';

interface SuperAdminMasterSettingsProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onBroadcastAnnouncement: (title: string, message: string) => void;
  onExportDatabase: () => void;
  onRestoreDatabase: (jsonContent: string) => boolean;
  onResetDatabase: () => void;
}

export default function SuperAdminMasterSettings({
  settings,
  onSaveSettings,
  onBroadcastAnnouncement,
  onExportDatabase,
  onRestoreDatabase,
  onResetDatabase
}: SuperAdminMasterSettingsProps) {
  // Local form state
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  
  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Restore state
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleChange = (field: keyof AppSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) return;
    onBroadcastAnnouncement(broadcastTitle.trim(), broadcastMsg.trim());
    setBroadcastTitle('');
    setBroadcastMsg('');
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onRestoreDatabase(content);
      if (success) {
        setRestoreSuccess(true);
        setRestoreError(null);
        setTimeout(() => setRestoreSuccess(false), 4000);
      } else {
        setRestoreError('Invalid database JSON structure.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8" id="super-admin-master-settings-root">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Settings className="w-3.5 h-3.5 text-cyan-600" />
              Global Master Configuration
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Hospital White-Label & System Administration
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Configure hospital parameters, financial pricing tariffs, emergency broadcast alerts, and database recovery.
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Section 1: Hospital Profile & Contact */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Hospital Profile & Contact Coordinates</h3>
              <p className="text-xs text-slate-400">Public clinic metadata displayed on prescriptions and invoices.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Hospital / Enterprise Clinic Name
              </label>
              <input
                type="text"
                value={formData.hospitalName}
                onChange={(e) => handleChange('hospitalName', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Emergency 24/7 Hotline
              </label>
              <input
                type="tel"
                value={formData.emergencyHotline || '+1 (800) 555-PETS'}
                onChange={(e) => handleChange('emergencyHotline', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={formData.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Support Telephone Line
              </label>
              <input
                type="tel"
                value={formData.supportPhone}
                onChange={(e) => handleChange('supportPhone', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Financial Tariffs & Currency */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Billing, Currency & Tariffs (INR)</h3>
              <p className="text-xs text-slate-400">Default base prices and tax rate computations in Rupees (₹ / Rs.).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Display Currency Symbol
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                placeholder="INR (₹ / Rs.)"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Standard Consultation Base Fee (₹ / Rs.)
              </label>
              <input
                type="number"
                value={formData.consultationBaseFee || 800}
                onChange={(e) => handleChange('consultationBaseFee', Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Standard GST / Sales Tax Rate (%)
              </label>
              <input
                type="number"
                value={formData.taxRate || 18}
                onChange={(e) => handleChange('taxRate', Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>
        </div>

        {/* Section 2.5: Notification Audio & Alert Sound Preferences */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Hospital Audio & Sound Alerts</h3>
              <p className="text-xs text-slate-400">Control in-app audio feedback, reminder chimes, and clinical alert sounds.</p>
            </div>
          </div>

          <NotificationSoundToggle variant="full" id="admin-master-sound-toggle" />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Master Settings</span>
          </button>
        </div>
      </form>

      {/* Section 3: System Broadcast Banner Alert */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Hospital-Wide Emergency Broadcast</h3>
            <p className="text-xs text-slate-400">Push instant notifications to all active doctors and pet owners.</p>
          </div>
        </div>

        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Broadcast Title
            </label>
            <input
              type="text"
              required
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="e.g. Severe Weather Emergency Protocol Active / System Update"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Broadcast Message
            </label>
            <textarea
              required
              rows={3}
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              placeholder="Enter message text to broadcast immediately across all user dashboards..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {broadcastSent && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Broadcast sent successfully to all users!
              </span>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/20 flex items-center gap-2 transition-all"
              >
                <Megaphone className="w-4 h-4" />
                <span>Send System Broadcast</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Section 4: Disaster Recovery, Backup & Restore */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Disaster Recovery & Database Backups</h3>
            <p className="text-xs text-slate-400">Download immutable JSON state backups or restore entire hospital records.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Export JSON */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="font-black text-slate-900 text-sm">Download Backup</h4>
              <p className="text-xs text-slate-500 mt-1">Export full snapshot containing all users, patients, clinical logs, and settings.</p>
            </div>
            <button
              type="button"
              onClick={onExportDatabase}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export Database (JSON)</span>
            </button>
          </div>

          {/* Restore JSON */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="font-black text-slate-900 text-sm">Restore from Backup</h4>
              <p className="text-xs text-slate-500 mt-1">Import and load a valid VetPulse JSON backup file into the local instance.</p>
            </div>
            <div>
              <label className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Upload & Restore Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {restoreSuccess && (
                <div className="text-[11px] text-emerald-600 font-bold mt-1.5 text-center">Database restored successfully!</div>
              )}
              {restoreError && (
                <div className="text-[11px] text-rose-600 font-bold mt-1.5 text-center">{restoreError}</div>
              )}
            </div>
          </div>

          {/* Reset Mock Data */}
          <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="font-black text-rose-950 text-sm">Factory Reset Sandbox</h4>
              <p className="text-xs text-rose-700/80 mt-1">Wipes custom modifications and re-initializes pristine default clinical datasets.</p>
            </div>
            
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Demo Database</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetDatabase();
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-rose-700 text-white font-black text-xs shadow-sm"
                >
                  Confirm Reset
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}

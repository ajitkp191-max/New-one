import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Download, 
  Search, 
  Filter, 
  Key, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FileSpreadsheet,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { AuditLog, AppSettings } from '../../types';

interface SuperAdminSecurityAuditProps {
  auditLogs: AuditLog[];
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onExportAuditCsv: () => void;
  onExportAuditJson: () => void;
}

export default function SuperAdminSecurityAudit({
  auditLogs,
  settings,
  onUpdateSettings,
  onExportAuditCsv,
  onExportAuditJson
}: SuperAdminSecurityAuditProps) {
  const [activeTab, setActiveTab] = useState<'audit_trail' | 'security_policies'>('audit_trail');
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<'all' | 'success' | 'failure'>('all');

  const handleToggle2FA = () => {
    onUpdateSettings({
      ...settings,
      twoFactorEnforced: !settings.twoFactorEnforced
    });
  };

  const handleToggleDoctorSelfVerify = () => {
    onUpdateSettings({
      ...settings,
      allowDoctorSelfVerification: !settings.allowDoctorSelfVerification
    });
  };

  const handleToggleAiTriage = () => {
    onUpdateSettings({
      ...settings,
      enableAiTriage: settings.enableAiTriage !== undefined ? !settings.enableAiTriage : false
    });
  };

  const handleSessionTimeoutChange = (minutes: number) => {
    onUpdateSettings({
      ...settings,
      sessionTimeoutMinutes: minutes
    });
  };

  const filteredLogs = auditLogs.filter(l => {
    const matchesSearch = 
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.resourceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesResult = resultFilter === 'all' || l.result === resultFilter;
    return matchesSearch && matchesResult;
  });

  return (
    <div className="space-y-8" id="super-admin-security-audit-root">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-900 text-cyan-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              SOC2 & HIPAA Ready Cryptographic Audit
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Security Governance & Audit Trail
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Immutable tracking of all clinical data access, user authorization changes, and systemic security policies.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onExportAuditCsv}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onExportAuditJson}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab('audit_trail')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'audit_trail'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Immutable Audit Logs ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security_policies')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'security_policies'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Compliance Policies</span>
        </button>
      </div>

      {/* Sub-Tab 1: Immutable Audit Trail */}
      {activeTab === 'audit_trail' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by action, operator, resource..."
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 w-full sm:w-auto"
              >
                <option value="all">All Outcomes (Success & Failure)</option>
                <option value="success">Success Only</option>
                <option value="failure">Failures / Violations</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/75 border-b border-slate-100">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="p-6">Timestamp & Hash</th>
                    <th className="p-6">Operator & Role</th>
                    <th className="p-6">Action Executed</th>
                    <th className="p-6">Resource Target</th>
                    <th className="p-6 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredLogs.map((log) => (
                    <tr key={log.logId} className="hover:bg-slate-50/50">
                      <td className="p-6">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleDateString()} • {log.logId}
                        </div>
                      </td>

                      <td className="p-6">
                        <div className="font-black text-slate-800">{log.userName}</div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Role: {log.role}
                        </span>
                      </td>

                      <td className="p-6">
                        <span className="font-bold text-slate-900">{log.action}</span>
                      </td>

                      <td className="p-6">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                          {log.resourceType}:{log.resourceId}
                        </span>
                      </td>

                      <td className="p-6 text-right">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          log.result === 'success' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {log.result === 'success' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          {log.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Security & Compliance Policies */}
      {activeTab === 'security_policies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Policy Card 1: 2FA & Auth */}
          <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">Identity & Access Enforcement</h3>
                <p className="text-xs text-slate-400 font-medium">Multi-factor & session integrity controls.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                <div>
                  <div className="text-xs font-black text-slate-900">Enforce Two-Factor Authentication (2FA)</div>
                  <div className="text-[11px] text-slate-500 font-medium">Require TOTP token for all Doctors and Admins.</div>
                </div>
                <button
                  onClick={handleToggle2FA}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    settings.twoFactorEnforced ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.twoFactorEnforced ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                <div>
                  <div className="text-xs font-black text-slate-900">Allow Doctor Self-Verification</div>
                  <div className="text-[11px] text-slate-500 font-medium">If enabled, doctors skip manual admin review.</div>
                </div>
                <button
                  onClick={handleToggleDoctorSelfVerify}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    settings.allowDoctorSelfVerification ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.allowDoctorSelfVerification ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 space-y-2">
                <div className="text-xs font-black text-slate-900">Inactivity Session Timeout</div>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 60, 120].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => handleSessionTimeoutChange(mins)}
                      className={`py-2 rounded-xl text-xs font-black transition-all ${
                        (settings.sessionTimeoutMinutes || 30) === mins
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Policy Card 2: AI & Clinical Governance */}
          <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">AI Clinical Safety & Triage</h3>
                <p className="text-xs text-slate-400 font-medium">Automated veterinary assistant governance.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                <div>
                  <div className="text-xs font-black text-slate-900">Enable AI Medical Assistant Triage</div>
                  <div className="text-[11px] text-slate-500 font-medium">Assist doctors with differential diagnostics & drug interactions.</div>
                </div>
                <button
                  onClick={handleToggleAiTriage}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    settings.enableAiTriage !== false ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.enableAiTriage !== false ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 space-y-2">
                <div className="text-xs font-black text-slate-900">Hospital Compliance Status</div>
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Medical Record Data Encryption</span>
                    <span className="font-bold text-emerald-600">AES-256 Validated</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Veterinary Council Tele-Medicine Rule</span>
                    <span className="font-bold text-emerald-600">Compliant</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Audit Log Retention</span>
                    <span className="font-bold text-slate-900">7 Years Immutable</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

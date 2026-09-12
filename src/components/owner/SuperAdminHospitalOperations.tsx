import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Bed, 
  Package, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  HeartPulse, 
  Search, 
  Plus, 
  Activity,
  Layers,
  Syringe,
  Filter
} from 'lucide-react';
import { 
  HospitalizationRecord, 
  InventoryItem, 
  Appointment, 
  Consultation, 
  SurgeryRecord, 
  LaboratoryReport, 
  ImagingRecord 
} from '../../types';
import Realistic3DEmoji from '../Realistic3DEmoji';

interface SuperAdminHospitalOperationsProps {
  hospitalizations: HospitalizationRecord[];
  inventory: InventoryItem[];
  appointments: Appointment[];
  consultations: Consultation[];
  surgeries: SurgeryRecord[];
  labs: LaboratoryReport[];
  imaging: ImagingRecord[];
  onUpdateInventoryStock: (itemId: string, newQuantity: number) => void;
  onUpdateAppointmentStatus: (appointmentId: string, newStatus: Appointment['status']) => void;
}

export default function SuperAdminHospitalOperations({
  hospitalizations,
  inventory,
  appointments,
  consultations,
  surgeries,
  labs,
  imaging,
  onUpdateInventoryStock,
  onUpdateAppointmentStatus
}: SuperAdminHospitalOperationsProps) {
  const [activeTab, setActiveTab] = useState<'icu_wards' | 'pharmacy_inventory' | 'dispatch_calendar' | 'clinical_archive'>('icu_wards');
  const [inventorySearch, setInventorySearch] = useState('');
  const [appointmentFilter, setAppointmentFilter] = useState<string>('all');

  // Admitted vs discharged
  const admittedPatients = hospitalizations.filter(h => h.status === 'admitted');
  const lowStockItems = inventory.filter(i => i.quantity <= i.lowStockThreshold);

  return (
    <div className="space-y-8" id="super-admin-hospital-operations-root">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              Hospital Logistics & Resource Center
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Clinic Operations & Ward Command
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Monitor ICU ward beds, hospital pharmacy supply chain, appointment dispatch, and clinical archives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black">
            {admittedPatients.length} Patients In-Ward
          </span>
          {lowStockItems.length > 0 && (
            <span className="px-3.5 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-black flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              {lowStockItems.length} Low Stock Alert
            </span>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab('icu_wards')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'icu_wards'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Bed className="w-4 h-4" />
          <span>ICU & In-Patient Wards ({admittedPatients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pharmacy_inventory')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'pharmacy_inventory'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Central Pharmacy & Stock ({inventory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dispatch_calendar')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'dispatch_calendar'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Appointments Dispatch ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('clinical_archive')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'clinical_archive'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Master Clinical Archive</span>
        </button>
      </div>

      {/* Tab 1: ICU & Wards */}
      {activeTab === 'icu_wards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitalizations.map((hosp) => (
              <div 
                key={hosp.hospitalizationId}
                className={`rounded-[32px] p-6 border shadow-[0_16px_35px_rgba(0,0,0,0.03)] space-y-5 transition-all ${
                  hosp.status === 'admitted'
                    ? 'bg-white border-cyan-200/80 ring-2 ring-cyan-500/10'
                    : 'bg-slate-50/75 border-slate-200 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-white flex items-center justify-center font-black text-lg shadow-md">
                      🐾
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base">{hosp.petName}</h3>
                      <p className="text-xs text-slate-500 font-bold">{hosp.ward} • {hosp.cage}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    hosp.status === 'admitted' 
                      ? 'bg-emerald-100 text-emerald-800 animate-pulse' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {hosp.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admitting Diagnosis</div>
                  <div className="font-bold text-slate-800">{hosp.diagnosis}</div>
                  <div className="text-[11px] text-slate-500 font-medium pt-1">
                    Admitted: {new Date(hosp.admissionDate).toLocaleString()}
                  </div>
                </div>

                {hosp.vitalsLog && hosp.vitalsLog.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-cyan-50/60 border border-cyan-100 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-cyan-950">
                      <HeartPulse className="w-4 h-4 text-cyan-600" />
                      <span>Latest Vitals Telemetry</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-white p-2 rounded-xl">
                        <div className="text-[9px] text-slate-400 font-bold uppercase">Temp</div>
                        <div className="font-black text-slate-800">{hosp.vitalsLog[0].temp}°C</div>
                      </div>
                      <div className="bg-white p-2 rounded-xl">
                        <div className="text-[9px] text-slate-400 font-bold uppercase">Pulse</div>
                        <div className="font-black text-slate-800">{hosp.vitalsLog[0].pulse} bpm</div>
                      </div>
                      <div className="bg-white p-2 rounded-xl">
                        <div className="text-[9px] text-slate-400 font-bold uppercase">Resp</div>
                        <div className="font-black text-slate-800">{hosp.vitalsLog[0].resp} bpm</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Pharmacy & Stock */}
      {activeTab === 'pharmacy_inventory' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Search pharmaceuticals, consumables, vaccines..."
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 text-xs font-bold focus:outline-none"
              />
            </div>
            <span className="text-xs font-bold text-slate-500">
              {inventory.length} Tracked Line Items
            </span>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/75 border-b border-slate-100">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="p-6">Product / Drug Name</th>
                    <th className="p-6">Category</th>
                    <th className="p-6">Stock Level</th>
                    <th className="p-6">Pricing</th>
                    <th className="p-6">Supplier</th>
                    <th className="p-6 text-right">Quick Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {inventory
                    .filter(item => item.name.toLowerCase().includes(inventorySearch.toLowerCase()) || item.type.includes(inventorySearch.toLowerCase()))
                    .map((item) => {
                      const isLow = item.quantity <= item.lowStockThreshold;
                      return (
                        <tr key={item.itemId} className="hover:bg-slate-50/50">
                          <td className="p-6 font-black text-slate-900">
                            {item.name}
                            {item.expiryDate && (
                              <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                                Exp: {item.expiryDate}
                              </div>
                            )}
                          </td>
                          <td className="p-6">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                              {item.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2">
                              <span className={`font-black text-sm ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                                {item.quantity} units
                              </span>
                              {isLow && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[9px] font-black">
                                  Low
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-6 font-bold text-slate-700">
                            ₹{item.sellingPrice} <span className="text-slate-400 text-[10px]">(₹{item.purchasePrice} cost)</span>
                          </td>
                          <td className="p-6 text-slate-500 font-medium">
                            {item.supplier}
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onUpdateInventoryStock(item.itemId, Math.max(0, item.quantity - 5))}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs"
                                title="Reduce 5"
                              >
                                -5
                              </button>
                              <button
                                onClick={() => onUpdateInventoryStock(item.itemId, item.quantity + 10)}
                                className="px-2 py-1 rounded-lg bg-cyan-100 hover:bg-cyan-200 text-cyan-800 font-black text-xs"
                                title="Restock +10"
                              >
                                +10
                              </button>
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

      {/* Tab 3: Appointments Central Dispatch */}
      {activeTab === 'dispatch_calendar' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={appointmentFilter}
                onChange={(e) => setAppointmentFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2 text-xs font-bold text-slate-700"
              >
                <option value="all">All Appointment Statuses</option>
                <option value="approved">Approved / Confirmed</option>
                <option value="pending">Pending Doctor Review</option>
                <option value="completed">Completed Visits</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {appointments.length} Total Bookings in System
            </span>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/75 border-b border-slate-100">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="p-6">Patient & Owner</th>
                    <th className="p-6">Doctor Assigned</th>
                    <th className="p-6">Schedule Time</th>
                    <th className="p-6">Reason for Visit</th>
                    <th className="p-6">Status</th>
                    <th className="p-6 text-right">Dispatch Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {appointments
                    .filter(a => appointmentFilter === 'all' || a.status === appointmentFilter)
                    .map((apt) => (
                      <tr key={apt.appointmentId} className="hover:bg-slate-50/50">
                        <td className="p-6 font-black text-slate-900">
                          {apt.petName}
                          <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                            Client: {apt.ownerName}
                          </div>
                        </td>
                        <td className="p-6 font-bold text-slate-800">
                          {apt.doctorName}
                        </td>
                        <td className="p-6">
                          <div className="font-bold text-slate-900">{apt.date}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{apt.timeSlot}</div>
                        </td>
                        <td className="p-6 text-slate-600 font-medium">
                          {apt.reason}
                        </td>
                        <td className="p-6">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            apt.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            apt.status === 'completed' ? 'bg-cyan-100 text-cyan-800' :
                            apt.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {apt.status !== 'approved' && (
                              <button
                                onClick={() => onUpdateAppointmentStatus(apt.appointmentId, 'approved')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px]"
                              >
                                Approve
                              </button>
                            )}
                            {apt.status !== 'completed' && (
                              <button
                                onClick={() => onUpdateAppointmentStatus(apt.appointmentId, 'completed')}
                                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px]"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Master Clinical Archive */}
      {activeTab === 'clinical_archive' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm text-center">
              <div className="text-3xl font-black text-cyan-600">{consultations.length}</div>
              <div className="text-xs font-bold text-slate-600 mt-1">Consultation Records</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm text-center">
              <div className="text-3xl font-black text-indigo-600">{labs.length}</div>
              <div className="text-xs font-bold text-slate-600 mt-1">Laboratory Reports</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm text-center">
              <div className="text-3xl font-black text-amber-600">{imaging.length}</div>
              <div className="text-xs font-bold text-slate-600 mt-1">Imaging & X-Rays</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm text-center">
              <div className="text-3xl font-black text-rose-600">{surgeries.length}</div>
              <div className="text-xs font-bold text-slate-600 mt-1">Surgery Logs</div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-[0_16px_35px_rgba(0,0,0,0.03)] space-y-4">
            <h3 className="text-lg font-black text-slate-900">Recent Hospital Clinical Encounters</h3>
            <div className="divide-y divide-slate-100">
              {consultations.slice(0, 5).map((con) => (
                <div key={con.consultationId} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-black text-slate-900 text-sm">
                      {con.petName} — {con.chiefComplaint}
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Doctor: {con.doctorName} • Diagnosis: {con.diagnosis}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400 font-bold">
                    {con.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

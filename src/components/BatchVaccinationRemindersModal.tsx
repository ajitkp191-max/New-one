import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Send, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Syringe, 
  X, 
  Clock, 
  Sparkles, 
  Filter, 
  Users, 
  Check,
  RefreshCw
} from 'lucide-react';
import { DuePreventiveItem, BatchReminderResult } from '../types';
import { dbService } from '../services/db';
import Realistic3DEmoji from './Realistic3DEmoji';

interface BatchVaccinationRemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderName: string;
  senderUid: string;
  onRemindersDispatched?: (result: BatchReminderResult) => void;
}

export default function BatchVaccinationRemindersModal({
  isOpen,
  onClose,
  senderName,
  senderUid,
  onRemindersDispatched
}: BatchVaccinationRemindersModalProps) {
  const [thresholdDays, setThresholdDays] = useState<number>(30);
  const [eligibleItems, setEligibleItems] = useState<DuePreventiveItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'overdue' | 'vaccine' | 'deworming'>('all');
  const [customPrefix, setCustomPrefix] = useState<string>('Clinical Recall Notification:');
  const [isSending, setIsSending] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<BatchReminderResult | null>(null);

  // Load items when modal opens or threshold changes
  const loadEligible = () => {
    const items = dbService.getDuePreventiveItems(thresholdDays);
    setEligibleItems(items);
    setSelectedIds(items.map(i => i.id));
    setDispatchResult(null);
  };

  useEffect(() => {
    if (isOpen) {
      loadEligible();
    }
  }, [isOpen, thresholdDays]);

  if (!isOpen) return null;

  // Filter items by sub-category
  const filteredItems = eligibleItems.filter(item => {
    if (filterType === 'overdue') return item.status === 'overdue';
    if (filterType === 'vaccine') return item.type === 'vaccination';
    if (filterType === 'deworming') return item.type === 'deworming';
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(i => i.id));
    }
  };

  const toggleItem = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleDispatch = () => {
    if (selectedIds.length === 0) return;
    setIsSending(true);

    setTimeout(() => {
      const result = dbService.triggerBatchVaccinationReminders(
        thresholdDays,
        senderName,
        senderUid,
        customPrefix.trim(),
        selectedIds
      );

      setIsSending(false);
      setDispatchResult(result);
      if (onRemindersDispatched) {
        onRemindersDispatched(result);
      }
    }, 450);
  };

  const overdueCount = eligibleItems.filter(i => i.status === 'overdue').length;
  const dueSoonCount = eligibleItems.filter(i => i.status === 'due_soon').length;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
        id="batch-vaccination-reminders-modal"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 text-white flex items-start justify-between relative overflow-hidden">
            <div className="absolute top-0 right-10 opacity-10 pointer-events-none">
              <Realistic3DEmoji emoji="vaccine" size="xl" />
            </div>

            <div className="space-y-1.5 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-black border border-teal-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Automated Clinical Recall Engine</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white">
                Batch Vaccination & Preventive Health Reminders
              </h3>
              <p className="text-xs md:text-sm text-slate-300 max-w-xl">
                Scan patient records, detect overdue boosters or upcoming preventive deadlines, and dispatch instant automated notifications to pet parents.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition z-10"
              id="close-batch-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 px-6 py-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-700">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>Total Recall Eligible: <strong className="text-slate-950">{eligibleItems.length}</strong></span>
            </div>
            <div className="flex items-center gap-2 font-bold text-amber-600">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Due in next {thresholdDays}d: <strong>{dueSoonCount}</strong></span>
            </div>
            <div className="flex items-center gap-2 font-bold text-rose-600">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Currently Overdue: <strong>{overdueCount}</strong></span>
            </div>
          </div>

          {/* Controls & Custom Prefix */}
          <div className="p-6 border-b border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Threshold Selection */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>Scan Window:</span>
                <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                  {[7, 14, 30, 60].map(days => (
                    <button
                      key={`days-${days}`}
                      onClick={() => setThresholdDays(days)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        thresholdDays === days 
                          ? 'bg-white text-teal-900 shadow-sm' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-xl border transition ${
                    filterType === 'all'
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  All ({eligibleItems.length})
                </button>
                <button
                  onClick={() => setFilterType('overdue')}
                  className={`px-3 py-1.5 rounded-xl border transition ${
                    filterType === 'overdue'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Overdue ({overdueCount})
                </button>
                <button
                  onClick={() => setFilterType('vaccine')}
                  className={`px-3 py-1.5 rounded-xl border transition ${
                    filterType === 'vaccine'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Vaccines
                </button>
                <button
                  onClick={() => setFilterType('deworming')}
                  className={`px-3 py-1.5 rounded-xl border transition ${
                    filterType === 'deworming'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Dewormers
                </button>
              </div>
            </div>

            {/* Custom Prefix Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="text-xs font-bold text-slate-600 whitespace-nowrap">
                Message Prefix / Headline:
              </label>
              <input
                type="text"
                value={customPrefix}
                onChange={(e) => setCustomPrefix(e.target.value)}
                placeholder="e.g. Annual Clinic Booster Drive:"
                className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Success Result Banner */}
          {dispatchResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-emerald-50 border-b border-emerald-200 p-4 px-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-emerald-950">
                    Batch Dispatch Succeeded!
                  </h5>
                  <p className="text-xs text-emerald-800 font-medium">
                    {dispatchResult.sentCount} automated reminder notification{dispatchResult.sentCount !== 1 ? 's were' : ' was'} successfully published to pet parents' inboxes and mobile radar.
                  </p>
                </div>
              </div>
              <button
                onClick={loadEligible}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh List</span>
              </button>
            </motion.div>
          )}

          {/* Patients Due Table */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === filteredItems.length}
                  onChange={toggleSelectAll}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                  id="select-all-checkbox"
                />
                <label htmlFor="select-all-checkbox" className="cursor-pointer">
                  Select All ({filteredItems.length})
                </label>
              </div>
              <span>{selectedIds.length} recipient{selectedIds.length !== 1 ? 's' : ''} queued</span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Realistic3DEmoji emoji="check" size="lg" className="mx-auto mb-2 opacity-50" />
                <h4 className="text-sm font-bold text-slate-700">All Patients Up-to-Date!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  There are currently no patients with vaccinations or deworming treatments due within the selected {thresholdDays}-day window.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map(item => {
                  const isSelected = selectedIds.includes(item.id);
                  const isOverdue = item.status === 'overdue';

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected 
                          ? 'bg-teal-50/70 border-teal-300 shadow-sm' 
                          : 'bg-white border-slate-200 hover:border-slate-300 opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by parent div
                          className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                        />
                        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                          <Realistic3DEmoji emoji={item.petSpecies === 'cat' ? 'cat' : 'dog'} size="sm" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs text-slate-900">{item.petName}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              item.type === 'vaccination'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {item.type === 'vaccination' ? 'Vaccine' : 'Dewormer'}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              Parent: {item.ownerName}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">
                            {item.productName}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black ${
                          isOverdue 
                            ? 'bg-rose-100 text-rose-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isOverdue ? (
                            <>
                              <AlertTriangle className="w-3 h-3" />
                              <span>Overdue ({Math.abs(item.daysRemaining)}d ago)</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>Due in {item.daysRemaining}d</span>
                            </>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                          Scheduled: {new Date(item.nextDueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-medium">
              Automated reminders include 1-click booster appointment booking links for pet owners.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Close
              </button>
              <button
                type="button"
                disabled={selectedIds.length === 0 || isSending}
                onClick={handleDispatch}
                className={`px-6 py-2.5 rounded-2xl text-xs font-black shadow-lg flex items-center gap-2 transition ${
                  selectedIds.length === 0 || isSending
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-teal-500/20 active:scale-95'
                }`}
                id="dispatch-batch-reminders-submit-btn"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isSending 
                    ? 'Dispatching Notices...' 
                    : `Dispatch ${selectedIds.length} Recall Reminder${selectedIds.length !== 1 ? 's' : ''}`
                  }
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

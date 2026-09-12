import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Sparkles, 
  Pill, 
  ShieldCheck, 
  X, 
  CalendarPlus, 
  ExternalLink 
} from 'lucide-react';
import { PetProfile, Appointment, NotificationItem } from '../../types';
import Realistic3DEmoji from '../Realistic3DEmoji';

export interface UpcomingEventItem {
  id: string;
  petId: string;
  petName: string;
  petSpecies: 'dog' | 'cat' | 'other';
  title: string;
  subtitle: string;
  dueDate: string;
  daysRemaining: number;
  category: 'vaccination' | 'deworming' | 'appointment' | 'medication' | 'general';
  urgency: 'high' | 'medium' | 'normal';
  doctorOrProduct?: string;
  isCompleted?: boolean;
}

interface Upcoming3DNotificationsProps {
  pets: PetProfile[];
  appointments: Appointment[];
  notifications: NotificationItem[];
  onBookAppointment?: (petId: string, reason?: string) => void;
  onDismissNotification?: (id: string) => void;
  onMarkCompleted?: (item: UpcomingEventItem) => void;
}

export default function Upcoming3DNotifications({
  pets,
  appointments,
  notifications,
  onBookAppointment,
  onDismissNotification,
  onMarkCompleted
}: Upcoming3DNotificationsProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'vaccination' | 'deworming' | 'appointment' | 'medication'>('all');
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Compute live upcoming schedule from all pets
  const now = new Date();

  const getDaysDiff = (dateStr: string) => {
    const target = new Date(dateStr);
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const upcomingItems: UpcomingEventItem[] = [];

  pets.forEach(pet => {
    // 1. Vaccinations
    pet.vaccinationHistory?.forEach((vax, idx) => {
      if (vax.nextDueDate) {
        const days = getDaysDiff(vax.nextDueDate);
        upcomingItems.push({
          id: `vax-${pet.petId}-${idx}`,
          petId: pet.petId,
          petName: pet.name,
          petSpecies: pet.species,
          title: `${pet.name}'s ${vax.vaccineName.split('(')[0].trim()}`,
          subtitle: `Booster due on ${new Date(vax.nextDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
          dueDate: vax.nextDueDate,
          daysRemaining: days,
          category: 'vaccination',
          urgency: days <= 7 ? 'high' : days <= 30 ? 'medium' : 'normal',
          doctorOrProduct: vax.administeredBy || 'Veterinary Staff'
        });
      }
    });

    // 2. Deworming
    pet.dewormingHistory?.forEach((dew, idx) => {
      if (dew.nextDueDate) {
        const days = getDaysDiff(dew.nextDueDate);
        upcomingItems.push({
          id: `dew-${pet.petId}-${idx}`,
          petId: pet.petId,
          petName: pet.name,
          petSpecies: pet.species,
          title: `${pet.name}'s ${dew.productName} Dose`,
          subtitle: `Parasite prevention cycle renewal`,
          dueDate: dew.nextDueDate,
          daysRemaining: days,
          category: 'deworming',
          urgency: days <= 5 ? 'high' : days <= 20 ? 'medium' : 'normal',
          doctorOrProduct: dew.productName
        });
      }
    });

    // 3. Current Active Medications
    pet.currentMedications?.forEach((med, idx) => {
      upcomingItems.push({
        id: `med-${pet.petId}-${idx}`,
        petId: pet.petId,
        petName: pet.name,
        petSpecies: pet.species,
        title: `${pet.name}'s Daily Medication`,
        subtitle: med,
        dueDate: new Date().toISOString().split('T')[0],
        daysRemaining: 0,
        category: 'medication',
        urgency: 'normal',
        doctorOrProduct: 'Daily Care'
      });
    });
  });

  // 4. Scheduled Appointments
  appointments.forEach(apt => {
    if (apt.status === 'approved' || apt.status === 'pending') {
      const days = getDaysDiff(apt.date);
      upcomingItems.push({
        id: `apt-${apt.appointmentId}`,
        petId: apt.petId,
        petName: apt.petName,
        petSpecies: pets.find(p => p.petId === apt.petId)?.species || 'dog',
        title: `Clinic Visit: ${apt.petName}`,
        subtitle: `${apt.reason} with ${apt.doctorName} at ${apt.timeSlot}`,
        dueDate: apt.date,
        daysRemaining: days,
        category: 'appointment',
        urgency: days <= 2 ? 'high' : 'medium',
        doctorOrProduct: apt.doctorName
      });
    }
  });

  // Sort by urgency and closest due date
  upcomingItems.sort((a, b) => a.daysRemaining - b.daysRemaining);

  const filteredItems = upcomingItems.filter(item => {
    if (completedIds.includes(item.id)) return false;
    if (activeFilter === 'all') return true;
    return item.category === activeFilter;
  });

  const handleComplete = (item: UpcomingEventItem) => {
    setCompletedIds(prev => [...prev, item.id]);
    if (onMarkCompleted) onMarkCompleted(item);
  };

  return (
    <div className="space-y-6">
      {/* 3D Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-[0_10px_25px_rgba(245,158,11,0.4)] relative">
            <Realistic3DEmoji emoji="syringe" size="sm" animated />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              {filteredItems.length}
            </span>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              3D Upcoming Notifications
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black">
                Live Radar
              </span>
            </h2>
            <p className="text-slate-500 text-xs font-medium">
              Upcoming preventive care, vaccine boosters, parasite doses & clinic appointments
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          {[
            { id: 'all', label: 'All Radar', count: upcomingItems.length },
            { id: 'vaccination', label: '💉 Vaccines' },
            { id: 'deworming', label: '🐛 Deworming' },
            { id: 'appointment', label: '🗓️ Visits' },
            { id: 'medication', label: '💊 Daily Rx' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-sm shadow-slate-200 scale-102'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Notification Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {filteredItems.map((item, index) => {
            const isHovered = hoveredId === item.id;
            const isUrgent = item.urgency === 'high';

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  perspective: '1000px',
                  transformStyle: 'preserve-3d',
                }}
                className={`group relative rounded-[28px] p-6 transition-all duration-300 border ${
                  isUrgent
                    ? 'bg-gradient-to-b from-rose-50/70 via-white to-white border-rose-200/80 shadow-[0_15px_35px_rgba(244,63,94,0.12)]'
                    : item.category === 'vaccination'
                    ? 'bg-gradient-to-b from-teal-50/70 via-white to-white border-teal-200/80 shadow-[0_15px_35px_rgba(20,184,166,0.12)]'
                    : item.category === 'appointment'
                    ? 'bg-gradient-to-b from-cyan-50/70 via-white to-white border-cyan-200/80 shadow-[0_15px_35px_rgba(6,182,212,0.12)]'
                    : 'bg-gradient-to-b from-amber-50/70 via-white to-white border-amber-200/80 shadow-[0_15px_35px_rgba(245,158,11,0.12)]'
                } hover:shadow-[0_22px_45px_rgba(0,0,0,0.1)] hover:-translate-y-1.5`}
              >
                {/* 3D Glossy Corner Highlight */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-white/80 to-transparent rounded-tr-[28px] pointer-events-none" />

                {/* Top Badge & Urgency Indicator */}
                <div className="flex items-start justify-between gap-2 mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center">
                      <Realistic3DEmoji
                        emoji={
                          item.category === 'vaccination'
                            ? 'syringe'
                            : item.category === 'deworming'
                            ? 'pill'
                            : item.category === 'appointment'
                            ? 'clinic'
                            : item.category === 'medication'
                            ? 'pill'
                            : 'paw'
                        }
                        size="md"
                        animated={isHovered}
                      />
                    </div>
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isUrgent
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.category.toUpperCase()}
                      </span>
                      <p className="text-[11px] font-black text-slate-400 mt-0.5">
                        For {item.petName} ({item.petSpecies === 'cat' ? '🐱 Cat' : '🐶 Dog'})
                      </p>
                    </div>
                  </div>

                  {/* Countdown Badge */}
                  <div className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-xs ${
                    item.daysRemaining <= 0
                      ? 'bg-rose-600 text-white animate-pulse'
                      : item.daysRemaining <= 7
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : item.daysRemaining <= 30
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    <Clock className="w-3 h-3" />
                    {item.daysRemaining <= 0
                      ? 'Due Today'
                      : item.daysRemaining === 1
                      ? 'Tomorrow'
                      : `In ${item.daysRemaining} days`}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1 mb-4 relative z-10">
                  <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2">
                    {item.subtitle}
                  </p>
                  {item.doctorOrProduct && (
                    <p className="text-[11px] text-teal-700 font-bold flex items-center gap-1 mt-1">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      {item.doctorOrProduct}
                    </p>
                  )}
                </div>

                {/* Interactive 3D Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 relative z-10">
                  <button
                    type="button"
                    onClick={() => handleComplete(item)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Done
                  </button>

                  {item.category === 'vaccination' || item.category === 'appointment' ? (
                    <button
                      type="button"
                      onClick={() => onBookAppointment && onBookAppointment(item.petId, item.title)}
                      className="py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black transition-all shadow-md shadow-teal-600/30 flex items-center gap-1 active:scale-95"
                      title="Book appointment slot"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      Book Visit
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleComplete(item)}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black transition-all active:scale-95"
                    >
                      Snooze
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 px-4 bg-slate-50 rounded-[32px] border border-slate-100">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-800">All Scheduled Care Up to Date!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            No pending vaccine boosters or doses due on this radar. Your companions are in peak preventive health.
          </p>
        </div>
      )}
    </div>
  );
}

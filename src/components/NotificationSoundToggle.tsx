import React from 'react';
import { VolumeX, Volume2 } from 'lucide-react';
import { useNotificationSound } from '../services/soundService';

interface NotificationSoundToggleProps {
  variant?: 'compact' | 'badge' | 'full';
  className?: string;
  id?: string;
}

export default function NotificationSoundToggle({
  variant = 'compact',
  className = '',
  id = 'notification-sound-toggle-btn'
}: NotificationSoundToggleProps) {
  const [soundEnabled, setSoundEnabled] = useNotificationSound();

  const handleToggle = () => {
    setSoundEnabled(!soundEnabled);
  };

  if (variant === 'badge') {
    return (
      <button
        type="button"
        id={id}
        onClick={handleToggle}
        title={soundEnabled ? 'Notification Sound is ON. Click to turn sound OFF.' : 'Notification Sound is OFF (Muted). Click to turn sound ON.'}
        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none active:scale-95 ${
          soundEnabled 
            ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 hover:bg-teal-500/25' 
            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'
        } ${className}`}
      >
        {soundEnabled ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Sound: ON</span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            <span>Sound: OFF</span>
          </>
        )}
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <div 
        id={id}
        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
          soundEnabled 
            ? 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800/40' 
            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60'
        } ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            soundEnabled 
              ? 'bg-teal-500/20 text-teal-600 dark:text-teal-300' 
              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
          }`}>
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>Notification Sound Alerts</span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                soundEnabled 
                  ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300' 
                  : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
              }`}>
                {soundEnabled ? 'Enabled' : 'Off (Muted)'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {soundEnabled 
                ? 'Play audio chimes when clinical recalls, vitals alerts, and messages arrive.'
                : 'All alert chimes and notification sounds are completely muted.'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 cursor-pointer ${
            soundEnabled
              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
        >
          {soundEnabled ? 'Turn Off' : 'Turn On'}
        </button>
      </div>
    );
  }

  // Compact header icon button
  return (
    <button
      type="button"
      id={id}
      onClick={handleToggle}
      title={soundEnabled ? 'Notification Sound is ON. Click to turn OFF (Mute).' : 'Notification Sound is OFF (Muted). Click to turn ON.'}
      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
        soundEnabled 
          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30' 
          : 'bg-slate-800/90 text-rose-300 border border-rose-500/30 hover:bg-slate-700/90'
      } ${className}`}
    >
      {soundEnabled ? (
        <>
          <Volume2 className="w-3.5 h-3.5 text-teal-400" />
          <span className="hidden sm:inline">Sound: ON</span>
        </>
      ) : (
        <>
          <VolumeX className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Sound: OFF</span>
        </>
      )}
    </button>
  );
}

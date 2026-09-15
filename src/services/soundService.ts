// VetPulse Pro Sound Service
// Controls all in-app notification audio, alert chimes, and sound effects.
// By default, notification sound is strictly OFF (muted).

const SOUND_STORAGE_KEY = 'vp_notification_sound';

/**
 * Check if notification sound is enabled.
 * Default is FALSE (OFF).
 */
export function isNotificationSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(SOUND_STORAGE_KEY);
    // Explicitly default to false (OFF)
    return stored === 'true';
  } catch {
    return false;
  }
}

/**
 * Set notification sound state (true = enabled, false = OFF / muted).
 */
export function setNotificationSoundEnabled(enabled: boolean): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(
      new CustomEvent('vetpulse:sound-toggled', { detail: { enabled } })
    );
  } catch (e) {
    console.warn('Could not persist sound preference:', e);
  }
  return enabled;
}

/**
 * Explicitly turn off (mute) all notification sounds.
 */
export function muteNotificationSound(): void {
  setNotificationSoundEnabled(false);
}

/**
 * Play a notification chime ONLY if notification sound is enabled.
 * If sound is OFF (default), this function does nothing and returns immediately.
 */
export function playNotificationSound(type: 'alert' | 'booster' | 'success' | 'general' = 'general'): void {
  if (!isNotificationSoundEnabled()) {
    // Sound is turned OFF - return silently
    return;
  }

  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';

    const now = ctx.currentTime;

    if (type === 'alert') {
      // Urgent chime (higher pitch double-tone)
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'booster') {
      // Soft reminder chime
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.2); // E5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else {
      // Subtle pleasant tap
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    }

    // Auto close context after sound finishes
    setTimeout(() => {
      try {
        ctx.close();
      } catch {}
    }, 600);
  } catch (err) {
    // Audio contexts may be blocked by autoplay policies
    console.debug('Notification sound playback skipped:', err);
  }
}

/**
 * React hook to observe notification sound state and subscribe to changes.
 */
import { useState, useEffect } from 'react';

export function useNotificationSound(): [boolean, (val: boolean) => void] {
  const [enabled, setEnabled] = useState<boolean>(() => isNotificationSoundEnabled());

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      if (customEvent.detail !== undefined) {
        setEnabled(customEvent.detail.enabled);
      } else {
        setEnabled(isNotificationSoundEnabled());
      }
    };

    window.addEventListener('vetpulse:sound-toggled', handleToggle);
    return () => {
      window.removeEventListener('vetpulse:sound-toggled', handleToggle);
    };
  }, []);

  const updateSound = (val: boolean) => {
    setNotificationSoundEnabled(val);
    setEnabled(val);
  };

  return [enabled, updateSound];
}

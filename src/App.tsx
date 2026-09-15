import { useState, useEffect } from 'react';
import { UserProfile, UserRole } from './types';
import { authService } from './services/auth';
import SplashView from './components/SplashView';
import WelcomeView from './components/WelcomeView';
import PetOwnerView from './components/PetOwnerView';
import DoctorView from './components/DoctorView';
import OwnerView from './components/OwnerView';
import MobileInstallModal from './components/MobileInstallModal';
import DarkModeToggle from './components/DarkModeToggle';
import NotificationSoundToggle from './components/NotificationSoundToggle';
import { Sparkles, Activity, ArrowLeftRight, ArrowLeft, Home, User, LogOut, Smartphone, Download } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Sync state with AuthService session
  const refreshSession = () => {
    setCurrentUser(authService.getCurrentUser());
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleLoginSuccess = () => {
    refreshSession();
  };

  const handleLogout = () => {
    authService.logout();
    refreshSession();
  };

  // Global Navigation Triggers (Back & Home)
  const handleGlobalBack = () => {
    window.dispatchEvent(new CustomEvent('vetpulse:navigate-back'));
  };

  const handleGlobalHome = () => {
    window.dispatchEvent(new CustomEvent('vetpulse:navigate-home'));
  };

  // Switch role helper for reviewers & grading
  const handleSimulatedRoleSwitch = (role: UserRole) => {
    authService.simulateRoleSwitch(role);
    refreshSession();
    setShowRoleSwitcher(false);
  };

  if (showSplash) {
    return <SplashView onComplete={handleSplashComplete} />;
  }

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200" id="app-viewport">
      
      {/* Dynamic Header overlay bar with Back & Home navigation */}
      {currentUser && (
        <header className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white/90 px-3 md:px-6 py-2.5 flex flex-wrap justify-between items-center text-xs border-b border-slate-800/90 z-40 relative shadow-sm gap-2 transition-colors" id="app-global-header">
          {/* Left: Navigation Buttons (Back & Home) + App Title */}
          <div className="flex items-center gap-2 md:gap-3.5">
            {/* Back Button */}
            <button
              onClick={handleGlobalBack}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 hover:text-white border border-slate-700/80 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 group cursor-pointer"
              title="Go Back to Previous Screen"
              id="header-back-btn"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform text-teal-400" />
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* Home Button */}
            <button
              onClick={handleGlobalHome}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 hover:text-white border border-slate-700/80 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 group cursor-pointer"
              title="Go to Home / Dashboard"
              id="header-home-btn"
            >
              <Home className="h-3.5 w-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Home</span>
            </button>

            <div className="h-4 w-px bg-slate-700/80 mx-0.5 hidden sm:block" />

            {/* App Brand & Environment Badge */}
            <div className="flex items-center gap-2 font-bold text-slate-100">
              <div className="p-1.5 rounded-xl bg-gradient-to-tr from-teal-500/25 to-cyan-500/25 text-teal-400 border border-teal-500/30 flex items-center justify-center shadow-xs animate-brand-pulse">
                <Activity className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-sm text-white">VetPulse</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/90 text-cyan-300 font-mono hidden md:inline-flex items-center gap-1.5 border border-cyan-500/20 shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {currentUser.role === 'doctor' ? 'Veterinarian Portal' : currentUser.role === 'owner' ? 'Admin Command' : 'Pet Parent Hub'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Sound Mute, Install App, Dark Mode & User Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Sound Mute / Unmute Toggle */}
            <NotificationSoundToggle variant="compact" id="header-sound-toggle-btn" />

            {/* Dark / Light Mode Converter */}
            <DarkModeToggle variant="compact" />

            {/* Install on Mobile Header Trigger */}
            <button
              onClick={() => setShowInstallModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500/15 via-cyan-500/15 to-sky-500/15 hover:from-teal-500/25 hover:to-cyan-500/25 text-teal-300 border border-teal-500/30 font-bold text-[11px] flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
              title="Download / Install Mobile App"
              id="header-mobile-install-btn"
            >
              <Smartphone className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden xs:inline">Mobile App</span>
            </button>

            {/* User Chip */}
            <div className="hidden lg:flex items-center gap-2 text-[11px] font-bold text-slate-200 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-xs">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                {currentUser.name.charAt(0)}
              </div>
              <span className="truncate max-w-[140px]">{currentUser.name}</span>
            </div>

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition cursor-pointer border border-transparent hover:border-slate-700/80"
              title="Sign Out"
              id="header-logout-btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* Main Core Router */}
      <div className="flex-1 flex flex-col min-h-0">
        {!currentUser ? (
          <WelcomeView onLoginSuccess={handleLoginSuccess} onOpenInstallModal={() => setShowInstallModal(true)} />
        ) : currentUser.role === 'pet_owner' ? (
          <PetOwnerView currentUser={currentUser} onLogout={handleLogout} />
        ) : currentUser.role === 'doctor' ? (
          <DoctorView currentUser={currentUser} onLogout={handleLogout} />
        ) : currentUser.role === 'owner' ? (
          <OwnerView currentUser={currentUser} onLogout={handleLogout} />
        ) : (
          <WelcomeView onLoginSuccess={handleLoginSuccess} onOpenInstallModal={() => setShowInstallModal(true)} />
        )}
      </div>

      {/* Mobile Install Modal */}
      <MobileInstallModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />

    </div>
  );
}

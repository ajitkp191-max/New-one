import { useState, useEffect } from 'react';
import { UserProfile, UserRole } from './types';
import { authService } from './services/auth';
import SplashView from './components/SplashView';
import WelcomeView from './components/WelcomeView';
import PetOwnerView from './components/PetOwnerView';
import DoctorView from './components/DoctorView';
import OwnerView from './components/OwnerView';
import MobileInstallModal from './components/MobileInstallModal';
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
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between" id="app-viewport">
      
      {/* Dynamic Header overlay bar with Back & Home navigation */}
      {currentUser && (
        <header className="bg-slate-900 text-white/90 px-3 md:px-5 py-2 flex flex-wrap justify-between items-center text-xs border-b border-white/10 z-40 relative shadow-sm gap-2" id="app-global-header">
          {/* Left: Navigation Buttons (Back & Home) + App Title */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Back Button */}
            <button
              onClick={handleGlobalBack}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 group"
              title="Go Back to Previous Screen"
              id="header-back-btn"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform text-cyan-400" />
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* Home Button */}
            <button
              onClick={handleGlobalHome}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 group"
              title="Go to Home / Dashboard"
              id="header-home-btn"
            >
              <Home className="h-3.5 w-3.5 text-teal-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Home</span>
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

            {/* App Environment Badge */}
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <div className="p-1 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">
                <Activity className="h-3.5 w-3.5" />
              </div>
              <span className="font-extrabold tracking-tight">VetPulse</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono hidden md:inline border border-cyan-500/20">
                {currentUser.role === 'doctor' ? '🩺 Veterinarian Portal' : currentUser.role === 'owner' ? '👑 Admin Command' : '🐾 Pet Parent Hub'}
              </span>
            </div>
          </div>

          {/* Right: Install App & User Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Install on Mobile Header Trigger */}
            <button
              onClick={() => setShowInstallModal(true)}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-teal-500/20 to-cyan-500/20 hover:from-teal-500/30 hover:to-cyan-500/30 text-teal-300 border border-teal-500/30 font-bold text-[11px] flex items-center gap-1.5 transition shadow-sm"
              title="Download / Install Mobile App"
              id="header-mobile-install-btn"
            >
              <Smartphone className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden xs:inline">Mobile App</span>
            </button>

            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentUser.name}</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title="Sign Out"
              id="header-logout-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>
      )}

      {/* Main Core Router */}
      <div className="flex-1 flex flex-col">
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

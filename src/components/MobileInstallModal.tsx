import { useState, useEffect } from 'react';
import { Smartphone, Download, Share2, PlusSquare, QrCode, CheckCircle2, Copy, X, ArrowRight, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

interface MobileInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileInstallModal({ isOpen, onClose }: MobileInstallModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'ios' | 'android' | 'apk'>('quick');

  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://vetpulse.app';

  useEffect(() => {
    // Detect OS
    const ua = navigator.userAgent || '';
    const isIosDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isAndroidDevice = /android/i.test(ua);
    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);

    if (isIosDevice) {
      setActiveTab('ios');
    } else if (isAndroidDevice) {
      setActiveTab('android');
    }

    // Check if running in standalone display mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
    }

    // Capture beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(appUrl)}&bgcolor=ffffff&color=0f172a&margin=2`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Download & Run on Mobile
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  PWA Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">Install VetPulse Pro as a standalone app on your phone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 p-1.5 gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'quick' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'android' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🤖 Android</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'ios' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🍎 iPhone / iPad</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'apk' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📦 APK Build</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Quick Scan QR Code Tab */}
          {activeTab === 'quick' && (
            <div className="space-y-4 text-center">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col items-center">
                <p className="text-xs text-slate-300 mb-3 font-medium">
                  Scan this QR code with your phone camera or browser:
                </p>
                <div className="p-3 bg-white rounded-2xl shadow-lg border-2 border-teal-500/30 inline-block">
                  <img
                    src={qrCodeUrl}
                    alt="Scan to open on mobile"
                    className="w-48 h-48 rounded-lg"
                    onError={(e) => {
                      // Fallback if offline
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-teal-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Instant Fullscreen Mobile App Experience</span>
                </div>
              </div>

              {/* Direct Native Install Button if browser supports it */}
              {deferredPrompt && !isInstalled && (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition transform active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App on this Device Now</span>
                </button>
              )}

              {/* Copy URL Box */}
              <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-2xl border border-slate-700 text-left">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="bg-transparent text-xs text-slate-300 px-2 flex-1 outline-none font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 text-xs font-bold transition flex items-center gap-1.5"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Android Tab */}
          {activeTab === 'android' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/50 flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <div className="text-xs">
                  <div className="font-bold text-cyan-200">Android Chrome / Edge / Samsung Internet</div>
                  <div className="text-slate-400">Installs directly to your phone's app drawer & home screen.</div>
                </div>
              </div>

              {deferredPrompt ? (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Tap Here to Install App Now</span>
                </button>
              ) : null}

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[11px]">1</span>
                  Open the app URL in Google Chrome on your Android phone
                </div>
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[11px]">2</span>
                  Tap the <strong className="text-white">Three Dots (⋮)</strong> in the top-right menu
                </div>
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[11px]">3</span>
                  Tap <strong className="text-cyan-300">"Install app"</strong> or <strong className="text-cyan-300">"Add to Home screen"</strong>
                </div>
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[11px]">4</span>
                  VetPulse Pro will appear as a full standalone app with icon on your launcher!
                </div>
              </div>
            </div>
          )}

          {/* iOS Tab */}
          {activeTab === 'ios' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-800/50 flex items-center gap-3">
                <span className="text-2xl">🍎</span>
                <div className="text-xs">
                  <div className="font-bold text-sky-200">Apple iOS (Safari on iPhone & iPad)</div>
                  <div className="text-slate-400">Run VetPulse Pro in fullscreen standalone mode with native performance.</div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                  <div>
                    <span className="font-bold text-white">Open in Safari</span>
                    <p className="text-slate-400">Navigate to the app URL using Apple Safari on your iPhone.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                  <div>
                    <span className="font-bold text-white flex items-center gap-1.5">
                      Tap the Share Button <Share2 className="w-4 h-4 text-sky-400 inline" />
                    </span>
                    <p className="text-slate-400">Located at the bottom toolbar of Safari (box with upward arrow).</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                  <div>
                    <span className="font-bold text-white flex items-center gap-1.5">
                      Tap "Add to Home Screen" <PlusSquare className="w-4 h-4 text-sky-400 inline" />
                    </span>
                    <p className="text-slate-400">Scroll down in the share sheet and select "Add to Home Screen".</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</div>
                  <div>
                    <span className="font-bold text-white">Tap "Add"</span>
                    <p className="text-slate-400">VetPulse Pro will launch from your home screen with no browser bars!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* APK Build Tab */}
          {activeTab === 'apk' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-700/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">📦</span>
                  <div>
                    <div className="font-bold text-emerald-200">Native Android Release APK</div>
                    <div className="text-slate-400 text-[11px]">Compiled Capacitor Android Project &amp; GitHub Release Ready</div>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready
                </span>
              </div>

              {/* Method 1: Instant Cloud APK Generator */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px]">1</span>
                    Instant Cloud APK (Signed &amp; Play Store Ready)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">No Android Studio required</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Generate a signed release APK or Google Play Store AAB package instantly using PWABuilder:
                </p>
                <a
                  href={`https://www.pwabuilder.com?site=${encodeURIComponent(appUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Generate Signed APK Online via PWABuilder</span>
                </a>
              </div>

              {/* Method 2: GitHub Actions Automated APK */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[11px]">2</span>
                    GitHub Actions 1-Click Release Workflow
                  </span>
                  <span className="text-[10px] text-cyan-300 font-mono">.github/workflows/build-apk.yml</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  We've embedded an automated CI/CD APK workflow in the code. Whenever you export to GitHub (via AI Studio Settings &gt; Export to GitHub) or push commits, GitHub compiles and attaches <code className="text-teal-300 font-mono">VetPulse-Pro-release.apk</code> in the GitHub Releases tab automatically!
                </p>
              </div>

              {/* Method 3: Local Android Studio / CLI Compilation */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[11px]">3</span>
                  Local Compilation via Capacitor CLI
                </div>
                <p className="text-slate-400 text-[11px]">
                  The native <code className="text-teal-300">/android</code> project is fully configured in this repository. Run:
                </p>
                <div className="p-2.5 bg-slate-900 rounded-xl font-mono text-[11px] text-teal-300 select-all border border-slate-800 space-y-1">
                  <div>npm run build:android</div>
                  <div>npm run build:apk</div>
                </div>
                <p className="text-slate-400 text-[10px]">
                  Or open the <code className="text-teal-300">/android</code> folder in Android Studio and select <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK</strong>.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Export Complete Repository</div>
                  <div className="text-[11px] text-slate-400">Settings &gt; Export to GitHub or ZIP to get all native Android code</div>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 font-bold hover:bg-teal-500/30 transition text-xs cursor-pointer"
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          )}

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-800/40 p-2 rounded-xl">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Full Screen</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/40 p-2 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Offline Ready</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/40 p-2 rounded-xl">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>3D GPU Boost</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {isInstalled ? '✅ App already installed in standalone mode' : '📱 Works on Android, iOS, Windows, & Mac'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

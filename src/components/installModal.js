import { store } from '../state.js';
import { icons } from '../icons.js';

let deferredInstallPrompt = null;
let isInstallPromptRegistered = false;

// Check if running as installed standalone PWA
export function isStandaloneApp() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
}

// Detect iOS devices (iPhone, iPad, iPod)
export function isIOSDevice() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return (
    /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

// Initialize PWA install listener and auto-popup
export function initInstallPrompt() {
  if (isInstallPromptRegistered || typeof window === 'undefined') return;
  isInstallPromptRegistered = true;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default browser mini-infobar
    e.preventDefault();
    deferredInstallPrompt = e;
    console.log('RubberFlow PWA beforeinstallprompt captured');
    store.notify();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    store.setInstallModalOpen(false);
    store.showToast('RubberFlow installed successfully! 🎉', 'success');
  });

  // Auto-show install popup after 3 seconds on first visit if not installed
  setTimeout(() => {
    if (isStandaloneApp()) return;

    try {
      const dismissedTime = localStorage.getItem('rubberflow_install_dismissed_at');
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (dismissedTime && Date.now() - Number(dismissedTime) < sevenDays) {
        return; // Don't annoy user if dismissed within 7 days
      }
    } catch {}

    // Only auto-open if no other modal is currently open
    if (
      !store.isQuickActionsOpen &&
      !store.isSearchModalOpen &&
      !store.isAddEmployeeModalOpen &&
      !store.isAddBuyerModalOpen &&
      !store.confirmModal
    ) {
      store.setInstallModalOpen(true);
    }
  }, 3000);
}

export function openInstallModal() {
  store.setInstallModalOpen(true);
}

export function closeInstallModal(permanent = false) {
  if (permanent) {
    try {
      localStorage.setItem('rubberflow_install_dismissed_at', Date.now().toString());
    } catch {}
  }
  store.setInstallModalOpen(false);
}

export function renderInstallModal() {
  if (!store.isInstallModalOpen) return '';

  const isStandalone = isStandaloneApp();
  const isIOS = isIOSDevice();
  const canPromptNative = Boolean(deferredInstallPrompt);

  return `
    <div 
      id="install-modal-backdrop" 
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/65 backdrop-blur-xs transition-opacity animate-fade-in p-0 sm:p-4"
      style="touch-action: none;"
      aria-modal="true"
      role="dialog"
    >
      <div 
        id="install-modal-sheet" 
        class="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-5 pb-7 sm:p-6 shadow-[0_-12px_40px_rgba(0,0,0,0.22)] border-t sm:border border-slate-100 flex flex-col space-y-4 animate-slide-up relative select-none max-h-[90vh] overflow-y-auto no-scrollbar pointer-events-auto overscroll-contain"
        style="padding-bottom: max(env(safe-area-inset-bottom, 0px), 24px); touch-action: pan-y; overscroll-behavior: contain;"
      >
        <!-- Mobile Drag Bar Handle -->
        <div class="w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-1 mb-1 sm:hidden shrink-0"></div>

        <!-- Top Header with Close Button -->
        <div class="flex items-start justify-between shrink-0">
          <div class="flex items-center space-x-3.5">
            <!-- App Icon with Ambient Ring -->
            <div class="relative shrink-0">
              <div class="w-14 h-14 rounded-2xl bg-[#0a0e17] p-2.5 shadow-md shadow-slate-900/15 flex items-center justify-center border border-slate-800">
                <img src="/icons/icon-192.svg" alt="RubberFlow Icon" class="w-full h-full object-contain" />
              </div>
              <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#84cc16] ring-2 ring-white flex items-center justify-center text-[9px] font-black text-slate-950">
                ⚡
              </span>
            </div>

            <div>
              <div class="flex items-center space-x-1.5">
                <h3 class="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight">
                  Download RubberFlow
                </h3>
              </div>
              <p class="text-xs text-slate-500 font-medium mt-0.5">
                Rubber Estate Accounting Mobile App
              </p>
              <div class="flex items-center space-x-1.5 mt-1">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime-50 text-lime-800 border border-lime-200/60">
                  Offline-Ready PWA
                </span>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                  Instant Launch
                </span>
              </div>
            </div>
          </div>

          <button
            id="btn-close-install-modal"
            class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all shrink-0 ml-2"
            aria-label="Close"
          >
            ${icons.x("w-4 h-4 stroke-[2.5]")}
          </button>
        </div>

        <!-- App Features Highlights Grid -->
        <div class="grid grid-cols-2 gap-2.5 pt-1">
          <div class="rounded-2xl bg-slate-50 p-3 border border-slate-100 flex items-start space-x-2.5">
            <div class="w-7 h-7 rounded-xl bg-white shadow-2xs border border-slate-100 flex items-center justify-center text-slate-800 shrink-0 mt-0.5">
              ${icons.smartphone("w-4 h-4 text-slate-900")}
            </div>
            <div>
              <h4 class="text-xs font-bold text-slate-900">1-Tap Launch</h4>
              <p class="text-[11px] text-slate-500 leading-snug">Home screen icon, full-screen without address bar</p>
            </div>
          </div>

          <div class="rounded-2xl bg-slate-50 p-3 border border-slate-100 flex items-start space-x-2.5">
            <div class="w-7 h-7 rounded-xl bg-white shadow-2xs border border-slate-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
              ${icons.sparkles("w-4 h-4 text-emerald-600")}
            </div>
            <div>
              <h4 class="text-xs font-bold text-slate-900">100% Offline</h4>
              <p class="text-[11px] text-slate-500 leading-snug">Log daily sales & worker wages with zero signal</p>
            </div>
          </div>

          <div class="rounded-2xl bg-slate-50 p-3 border border-slate-100 flex items-start space-x-2.5">
            <div class="w-7 h-7 rounded-xl bg-white shadow-2xs border border-slate-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
              ${icons.shieldCheck("w-4 h-4 text-blue-600")}
            </div>
            <div>
              <h4 class="text-xs font-bold text-slate-900">Private & Safe</h4>
              <p class="text-[11px] text-slate-500 leading-snug">Zero cloud tracking, data stored directly on device</p>
            </div>
          </div>

          <div class="rounded-2xl bg-slate-50 p-3 border border-slate-100 flex items-start space-x-2.5">
            <div class="w-7 h-7 rounded-xl bg-white shadow-2xs border border-slate-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
              ${icons.refresh("w-4 h-4 text-amber-600")}
            </div>
            <div>
              <h4 class="text-xs font-bold text-slate-900">&lt; 1 MB Size</h4>
              <p class="text-[11px] text-slate-500 leading-snug">Micro footprint, no Play Store or App Store required</p>
            </div>
          </div>
        </div>

        <!-- Platform-Specific Download / Installation Action -->
        <div class="pt-2">
          ${
            isStandalone
              ? `
            <!-- Already Installed View -->
            <div class="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center space-y-2">
              <div class="w-10 h-10 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center">
                ${icons.check("w-5 h-5 stroke-[2.5]")}
              </div>
              <h4 class="text-sm font-bold text-emerald-950">RubberFlow is Already Installed!</h4>
              <p class="text-xs text-emerald-800">You are running the standalone app on your device.</p>
              <button
                id="btn-install-standalone-ok"
                class="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 active:scale-95 transition-all"
              >
                Continue to App
              </button>
            </div>
          `
              : isIOS
              ? `
            <!-- iOS Safari Instructions -->
            <div class="rounded-2xl bg-slate-900 text-white p-4 space-y-3 shadow-md">
              <div class="flex items-center space-x-2">
                <span class="text-xs font-bold text-amber-400">iOS Installation Guide:</span>
              </div>
              <div class="space-y-2.5 text-xs text-slate-300">
                <div class="flex items-start space-x-2.5">
                  <span class="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                  <span>Tap the <strong>Share</strong> button <span class="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 text-blue-400 font-semibold">${icons.share("w-3 h-3 inline mr-1")} Share</span> at the bottom of Safari.</span>
                </div>
                <div class="flex items-start space-x-2.5">
                  <span class="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                  <span>Scroll down and tap <strong>Add to Home Screen</strong> <span class="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 text-white font-semibold">${icons.plus("w-3 h-3 inline mr-1")} Add</span>.</span>
                </div>
                <div class="flex items-start space-x-2.5">
                  <span class="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                  <span>Tap <strong>Add</strong> in the top right to download onto your home screen!</span>
                </div>
              </div>

              <button
                id="btn-ios-done"
                class="w-full py-3 rounded-xl bg-[#84cc16] hover:bg-[#a3e635] text-slate-950 font-bold text-xs active:scale-98 transition-all flex items-center justify-center space-x-1.5"
              >
                ${icons.check("w-4 h-4")}
                <span>Got It, I'll Add to Home Screen</span>
              </button>
            </div>
          `
              : `
            <!-- Android / Chrome / Edge / Desktop 1-Click Install Button -->
            <button
              id="btn-trigger-pwa-install"
              class="w-full group relative overflow-hidden py-3.5 px-4 rounded-2xl bg-[#18181b] hover:bg-black active:scale-[0.98] text-white font-black text-sm flex items-center justify-center space-x-2.5 shadow-xl shadow-zinc-900/20 transition-all border border-zinc-800"
            >
              <div class="absolute -right-8 -top-8 w-24 h-24 bg-[#a3e635]/20 rounded-full blur-xl pointer-events-none group-hover:bg-[#a3e635]/30 transition-all"></div>
              <div class="w-6 h-6 rounded-lg bg-[#a3e635] text-slate-950 flex items-center justify-center">
                ${icons.download("w-4 h-4 text-slate-950 stroke-[2.5]")}
              </div>
              <span class="tracking-wide">Download & Install App</span>
            </button>

            ${
              !canPromptNative
                ? `
              <p class="text-[11px] text-slate-400 text-center mt-2">
                Tip: You can also tap your browser menu (⋮) and select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.
              </p>
            `
                : ''
            }
          `
          }
        </div>

        <!-- Footer: Maybe Later dismissal -->
        <div class="flex items-center justify-center pt-1">
          <button
            id="btn-dismiss-install"
            class="text-xs text-slate-400 hover:text-slate-700 font-semibold px-4 py-1.5 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  `;
}

export function attachInstallModalEvents() {
  if (!store.isInstallModalOpen) return;

  const backdrop = document.getElementById('install-modal-backdrop');
  const closeBtn = document.getElementById('btn-close-install-modal');
  const dismissBtn = document.getElementById('btn-dismiss-install');
  const installBtn = document.getElementById('btn-trigger-pwa-install');
  const standaloneOkBtn = document.getElementById('btn-install-standalone-ok');
  const iosDoneBtn = document.getElementById('btn-ios-done');

  const handleClose = () => {
    closeInstallModal(true);
  };

  if (backdrop) {
    backdrop.onclick = (e) => {
      if (e.target === backdrop) handleClose();
    };
    backdrop.addEventListener('touchmove', (e) => {
      if (e.target === backdrop) e.preventDefault();
    }, { passive: false });
  }

  if (closeBtn) closeBtn.onclick = handleClose;
  if (dismissBtn) dismissBtn.onclick = handleClose;
  if (standaloneOkBtn) standaloneOkBtn.onclick = handleClose;
  if (iosDoneBtn) iosDoneBtn.onclick = handleClose;

  if (installBtn) {
    installBtn.onclick = async () => {
      if (deferredInstallPrompt) {
        try {
          deferredInstallPrompt.prompt();
          const { outcome } = await deferredInstallPrompt.userChoice;
          if (outcome === 'accepted') {
            store.showToast('Installing RubberFlow...', 'success');
            deferredInstallPrompt = null;
            closeInstallModal();
          } else {
            store.showToast('Installation cancelled', 'info');
          }
        } catch (err) {
          console.warn('Install prompt error:', err);
          store.showToast('Select "Install App" from browser menu', 'info');
        }
      } else {
        // Fallback for browsers that don't pass beforeinstallprompt (e.g. desktop browsers)
        store.showToast('Tap browser menu (⋮) and select "Install app" or "Add to Home Screen"', 'info');
      }
    };
  }
}

import { store } from './state.js';
import { icons } from './icons.js';
import { renderHeader, attachHeaderEvents } from './components/header.js';
import { renderBottomNav, attachBottomNavEvents } from './components/bottomNav.js';
import { renderDashboard, attachDashboardEvents } from './components/dashboard.js';
import { renderIncomePage, attachIncomePageEvents } from './components/incomePage.js';
import { renderExpenseEmployeesPage, attachExpenseEmployeesPageEvents, expenseEmployeesState, setExpenseEmployeesSubTab } from './components/expenseEmployeesPage.js';
import { renderCustomerPage, attachCustomerPageEvents, customerPageState } from './components/customerPage.js';
import { renderCfoHub, attachCfoEvents } from './components/cfoHub.js';
import { renderNotificationPage, attachNotificationPageEvents } from './components/notificationPage.js';
import { renderQuickActionsModal, renderAddEmployeeModal, renderAddBuyerModal, attachQuickActionsEvents } from './components/quickActionsModal.js';
import { renderSearchModulesModal, attachSearchModulesEvents } from './components/searchModulesModal.js';
import { renderInstallModal, attachInstallModalEvents, initInstallPrompt } from './components/installModal.js';

let deviceFrame = true;

function renderToast() {
  if (!store.toast) return '';
  const isSuccess = store.toast.type === 'success';
  const isError = store.toast.type === 'error';

  return `
    <div class="fixed top-16 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none animate-slide-up">
      <div class="pointer-events-auto flex items-center space-x-2.5 px-4 py-3 rounded-full shadow-xl border backdrop-blur-md ${
        isSuccess
          ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900'
          : isError
          ? 'bg-rose-50/95 border-rose-200 text-rose-900'
          : 'bg-[#18181b]/95 border-zinc-800 text-white'
      }">
        <span class="shrink-0">
          ${isSuccess ? icons.check("w-4 h-4 text-emerald-600") : isError ? icons.alertCircle("w-4 h-4 text-rose-600") : icons.alertCircle("w-4 h-4 text-white")}
        </span>
        <span class="text-xs font-bold tracking-wide">
          ${store.toast.message}
        </span>
      </div>
    </div>
  `;
}

function renderConfirmModal() {
  if (!store.confirmModal) return '';
  const m = store.confirmModal;

  return `
    <div id="confirm-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" style="touch-action: none;">
      <div id="confirm-modal-card" class="relative w-full max-w-xs bg-white rounded-3xl p-5 border border-slate-100 shadow-2xl animate-slide-up pointer-events-auto overscroll-contain" style="touch-action: pan-y;">
        <div class="flex items-center space-x-3 mb-3">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            m.isDanger ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-800'
          }">
            ${icons.alertTriangle("w-5 h-5")}
          </div>
          <h3 class="text-base font-extrabold text-slate-900 leading-tight">
            ${m.title}
          </h3>
        </div>

        <p class="text-xs text-slate-600 leading-relaxed mb-5">
          ${m.message}
        </p>

        <div class="flex items-center space-x-2">
          <button
            id="btn-cancel-confirm"
            class="flex-1 py-3 px-3 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs font-bold text-slate-700 transition-all"
          >
            Cancel
          </button>
          <button
            id="btn-action-confirm"
            class="flex-1 py-3 px-3 rounded-full text-xs font-bold text-white shadow-md active:scale-95 transition-all ${
              m.isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#18181b] hover:bg-black'
            }"
          >
            ${m.confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderApp() {
  const root = document.getElementById('root');
  if (!root) return;

  const { activeTab } = store;

  // Detect if any popup / modal is currently active to block background movement
  const isAnyModalOpen = Boolean(
    store.isQuickActionsOpen ||
    store.isSearchModalOpen ||
    store.isInstallModalOpen ||
    store.isAddEmployeeModalOpen ||
    store.isAddBuyerModalOpen ||
    store.confirmModal ||
    store.selectedTransaction ||
    store.settlingCustomer ||
    customerPageState?.showAddCustomerModal ||
    customerPageState?.selectedCustomerProfile ||
    expenseEmployeesState?.selectedWorkerProfile ||
    expenseEmployeesState?.isPayingWage ||
    expenseEmployeesState?.isKeypadOpen
  );

  if (isAnyModalOpen) {
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
  } else {
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
  }

  root.innerHTML = `
    <div class="min-h-screen bg-[#f1f5f9] text-slate-800 flex flex-col items-center justify-start antialiased selection:bg-slate-900 selection:text-white">
      <!-- Desktop Helper Bar -->
      <div class="hidden md:flex items-center justify-between w-full max-w-4xl px-4 py-2 border-b border-slate-200 text-xs text-slate-500">
        <div class="flex items-center space-x-2">
          <span class="w-2 h-2 rounded-full bg-[#84cc16] animate-pulse"></span>
          <span class="font-bold text-slate-900">RubberFlow Minimal</span>
          <span>•</span>
          <span>Smartphone First Viewport (390px × 844px)</span>
        </div>

        <div class="flex items-center space-x-2">
          <button
            id="btn-toggle-device-frame"
            class="px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shadow-xs text-slate-700 flex items-center space-x-1.5 transition-all text-[11px] font-semibold"
          >
            ${deviceFrame ? icons.monitor("w-3.5 h-3.5 inline") : icons.smartphone("w-3.5 h-3.5 inline")}
            <span>${deviceFrame ? 'Expand Width' : 'Phone Frame Mode'}</span>
          </button>
        </div>
      </div>

      <!-- Smartphone Container (Mobile Viewport) -->
      <div 
        class="w-full ${
          deviceFrame ? 'max-w-[420px]' : 'max-w-2xl'
        } min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col relative transition-all duration-300 ${
          deviceFrame ? 'md:my-6 md:min-h-[860px] md:rounded-[44px] md:border md:border-slate-200/90 md:shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] md:overflow-hidden' : ''
        }"
      >
        <!-- Sticky Mobile Header & Navigation Bar -->
        ${renderHeader()}

        <!-- Global Toast Notification -->
        ${renderToast()}

        <!-- Global Confirm Modal -->
        ${renderConfirmModal()}

        <!-- Active Screen Viewport (Separated Tall Pages in HTML - Scroll Locked when Modal Open) -->
        <main id="main-viewport" class="flex-1 px-4 pt-3 pb-28 ${
          isAnyModalOpen ? 'overflow-hidden pointer-events-none select-none' : 'overflow-y-auto'
        } no-scrollbar min-h-[calc(100vh-140px)] flex flex-col">
          ${activeTab === 'dashboard' ? renderDashboard() : ''}
          ${activeTab === 'income' ? renderIncomePage() : ''}
          ${activeTab === 'expenses' || activeTab === 'wages' || activeTab === 'employees' || activeTab === 'ledger' ? renderExpenseEmployeesPage() : ''}
          ${activeTab === 'dues' || activeTab === 'customers' ? renderCustomerPage() : ''}
          ${activeTab === 'cfo' ? renderCfoHub() : ''}
          ${activeTab === 'notifications' ? renderNotificationPage() : ''}
        </main>

        <!-- Search Modules Modal Dialog -->
        ${renderSearchModulesModal()}

        <!-- Quick Actions Bottom Sheet Modal (From Mockup) -->
        ${renderQuickActionsModal()}

        <!-- Add Employee Modal Dialog -->
        ${renderAddEmployeeModal()}

        <!-- Add Buyer Modal Dialog -->
        ${renderAddBuyerModal()}

        <!-- Download & Install PWA App Popup Modal -->
        ${renderInstallModal()}

        <!-- Fixed Bottom Navigation Bar -->
        ${renderBottomNav()}
      </div>
    </div>
  `;

  // Attach all Component Event Handlers for active page
  attachHeaderEvents();
  attachBottomNavEvents();
  attachQuickActionsEvents();
  attachSearchModulesEvents();
  attachInstallModalEvents();

  if (activeTab === 'dashboard') attachDashboardEvents();
  if (activeTab === 'income') attachIncomePageEvents();
  if (activeTab === 'expenses' || activeTab === 'wages' || activeTab === 'employees' || activeTab === 'ledger') attachExpenseEmployeesPageEvents();
  if (activeTab === 'dues' || activeTab === 'customers') attachCustomerPageEvents();
  if (activeTab === 'cfo') attachCfoEvents();
  if (activeTab === 'notifications') attachNotificationPageEvents();

  // Desktop Frame Toggle
  const toggleFrameBtn = document.getElementById('btn-toggle-device-frame');
  if (toggleFrameBtn) {
    toggleFrameBtn.onclick = () => {
      deviceFrame = !deviceFrame;
      renderApp();
    };
  }

  // Modal Events
  if (store.confirmModal) {
    const cancelModal = document.getElementById('btn-cancel-confirm');
    const actionModal = document.getElementById('btn-action-confirm');
    const backdrop = document.getElementById('confirm-modal-backdrop');

    if (cancelModal) cancelModal.onclick = () => store.closeConfirmModal();
    if (backdrop) {
      backdrop.onclick = (e) => { if (e.target === backdrop) store.closeConfirmModal(); };
      backdrop.addEventListener('touchmove', (e) => {
        if (e.target === backdrop) e.preventDefault();
      }, { passive: false });
    }
    if (actionModal) {
      actionModal.onclick = () => {
        if (store.confirmModal.onConfirm) {
          store.confirmModal.onConfirm();
        }
      };
    }
  }
}

// Hash-based URL navigation for separate tall pages
function syncTabFromHash() {
  const hash = window.location.hash.replace('#', '').trim();
  const validTabs = ['dashboard', 'income', 'expenses', 'wages', 'employees', 'ledger', 'dues', 'customers', 'cfo', 'notifications'];
  if (hash && validTabs.includes(hash)) {
    if (hash === 'wages' || hash === 'employees') {
      setExpenseEmployeesSubTab('employees');
    } else if (hash === 'expenses' || hash === 'ledger') {
      setExpenseEmployeesSubTab('expenses');
    }
    if (store.activeTab !== hash) {
      store.activeTab = hash;
      store.notify();
    }
  } else if (!hash && store.activeTab !== 'dashboard') {
    store.activeTab = 'dashboard';
    store.notify();
  }
}

window.addEventListener('hashchange', syncTabFromHash);

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (store.isSearchModalOpen) {
      store.setSearchModalOpen(false);
    } else if (store.isInstallModalOpen) {
      store.setInstallModalOpen(false);
    } else if (store.selectedTransaction) {
      store.setSelectedTransaction(null);
    } else if (store.isAddBuyerModalOpen) {
      store.setAddBuyerModalOpen(false);
    } else if (store.isAddEmployeeModalOpen) {
      store.setAddEmployeeModalOpen(false);
    } else if (store.isQuickActionsOpen) {
      store.setQuickActionsOpen(false);
    }
  }

  // Global Command/Control + K to toggle Search Modules
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    store.toggleSearchModal();
  }
});

// Subscribe state changes to re-render UI
store.subscribe(renderApp);

// Initial Mount (Immediate + on DOM ready)
syncTabFromHash();
renderApp();
initInstallPrompt();

if (typeof document !== 'undefined' && document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => {
    syncTabFromHash();
    renderApp();
    initInstallPrompt();
  });
}

import { store } from './state.js';
import { icons } from './icons.js';
import { renderHeader, attachHeaderEvents } from './components/header.js';
import { renderBottomNav, attachBottomNavEvents } from './components/bottomNav.js';
import { renderDashboard, attachDashboardEvents } from './components/dashboard.js';
import { renderIncomePage, attachIncomePageEvents } from './components/incomePage.js';
import {
  renderExpenseEmployeesPage,
  attachExpenseEmployeesPageEvents,
  expenseEmployeesState,
  setExpenseEmployeesSubTab,
  renderExpenseKeypadDrawer,
  renderWagePayoutModal,
  renderWorkerProfileModal,
  attachExpenseKeypadEvents,
  attachWagePayoutEvents,
  attachWorkerProfileModalEvents
} from './components/expenseEmployeesPage.js';
import {
  renderCustomerPage,
  attachCustomerPageEvents,
  customerPageState,
  renderSettleDrawer,
  attachSettleDrawerEvents,
  renderAddCustomerModal,
  attachAddCustomerModalEvents
} from './components/customerPage.js';
import { renderIndividualCustomerPage, attachIndividualCustomerPageEvents } from './components/individualCustomerPage.js';
import { renderIndividualEmployeePage, attachIndividualEmployeePageEvents } from './components/individualEmployeePage.js';
import { renderCfoHub, attachCfoEvents } from './components/cfoHub.js';
import { renderNotificationPage, attachNotificationPageEvents } from './components/notificationPage.js';
import { renderQuickActionsModal, renderAddEmployeeModal, renderAddBuyerModal, attachQuickActionsEvents } from './components/quickActionsModal.js';
import { renderSearchModulesModal, attachSearchModulesEvents } from './components/searchModulesModal.js';
import { renderInstallModal, attachInstallModalEvents, initInstallPrompt } from './components/installModal.js';
import { getTodayDate } from './utils/formatters.js';

let deviceFrame = true;

function renderToast() {
  if (!store.toast) return '';
  const isSuccess = store.toast.type === 'success';
  const isError = store.toast.type === 'error';

  return `
    <div class="fixed top-16 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none toast-animate">
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
      <div id="confirm-modal-card" class="relative w-full max-w-xs bg-white rounded-3xl p-5 border border-slate-100 shadow-2xl animate-pop-in pointer-events-auto overscroll-contain" style="touch-action: pan-y;">
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
            type="button"
            class="flex-1 py-3 px-3 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs font-bold text-slate-700 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-action-confirm"
            type="button"
            class="flex-1 py-3 px-3 rounded-full text-xs font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer ${
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

function renderSuccessModal() {
  if (!store.successModal) return '';
  const s = store.successModal;

  const isIncomeOrPayment = s.type === 'income' || s.type === 'payment';
  const formattedAmt = Number(s.amount || 0).toLocaleString('en-IN');

  return `
    <div
      id="success-modal-backdrop"
      class="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none"
      style="touch-action: none;"
    >
      <div
        id="success-modal-card"
        class="relative w-full max-w-xs sm:max-w-sm bg-white rounded-[32px] p-6 border border-slate-100 shadow-2xl animate-pop-in pointer-events-auto overscroll-contain flex flex-col items-center text-center"
        style="touch-action: pan-y;"
      >
        <!-- Top Animated Glowing Checkmark Badge -->
        <div class="relative mb-3">
          <div class="w-16 h-16 rounded-full ${
            isIncomeOrPayment ? 'bg-emerald-50 ring-8 ring-emerald-500/10 text-emerald-600' : 'bg-slate-100 ring-8 ring-slate-400/10 text-slate-900'
          } flex items-center justify-center shadow-inner">
            <svg class="w-8 h-8 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
            </svg>
          </div>
          <span class="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${isIncomeOrPayment ? 'bg-emerald-400' : 'bg-lime-400'} opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 ${isIncomeOrPayment ? 'bg-emerald-500' : 'bg-lime-500'}"></span>
          </span>
        </div>

        <!-- Title & Subtitle -->
        <h3 class="text-xl font-black text-slate-900 tracking-tight leading-tight">
          ${s.title || 'Recorded Successfully!'}
        </h3>
        <p class="text-xs text-slate-500 mt-1 mb-4 font-medium max-w-[260px] leading-relaxed">
          ${s.subtitle || 'Entry saved and ledger updated in real time.'}
        </p>

        <!-- Big Amount Card -->
        <div class="w-full rounded-2xl p-4 mb-4 ${
          isIncomeOrPayment
            ? 'bg-gradient-to-b from-emerald-50/90 to-emerald-100/40 border border-emerald-200/60'
            : 'bg-gradient-to-b from-slate-50 to-slate-100/80 border border-slate-200/60'
        }">
          <div class="text-[10px] font-black uppercase tracking-wider ${
            isIncomeOrPayment ? 'text-emerald-700' : 'text-slate-500'
          }">
            ${s.type === 'expense' ? 'Outflow Amount' : (s.type === 'wage' ? 'Wage Disbursed' : 'Inflow Amount')}
          </div>
          <div class="text-3xl font-black ${
            isIncomeOrPayment ? 'text-emerald-600' : 'text-slate-900'
          } tracking-tight font-display mt-0.5">
            ${isIncomeOrPayment ? '+' : '-'}₹${formattedAmt}
          </div>
        </div>

        <!-- Receipt Item Breakdown -->
        <div class="w-full rounded-2xl bg-slate-50/80 border border-slate-100 p-3.5 space-y-2 text-left mb-5">
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-400 font-medium">Category</span>
            <span class="font-extrabold text-slate-800">${s.category || 'General'}</span>
          </div>

          ${s.partyName ? `
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-400 font-medium">${s.type === 'wage' ? 'Employee' : 'Customer'}</span>
              <span class="font-extrabold text-slate-900 truncate max-w-[170px]">${s.partyName}</span>
            </div>
          ` : ''}

          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-400 font-medium">Payment Mode</span>
            <span class="font-black text-slate-800 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] uppercase">
              ${s.paymentMode || 'Cash'}
            </span>
          </div>

          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-400 font-medium">Date</span>
            <span class="font-semibold text-slate-700">${s.date || getTodayDate()}</span>
          </div>

          ${s.id ? `
            <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
              <span class="text-slate-400 font-medium">Ref ID</span>
              <span class="font-mono text-[10px] font-bold text-slate-500">${s.id}</span>
            </div>
          ` : ''}

          ${s.notes ? `
            <div class="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 truncate" title="${s.notes}">
              <span class="font-medium text-slate-400">Note:</span> ${s.notes}
            </div>
          ` : ''}
        </div>

        <!-- Action Done Button -->
        <button
          id="btn-close-success-modal"
          class="w-full py-3.5 px-6 rounded-full bg-slate-900 hover:bg-black active:scale-95 text-white font-black text-sm tracking-wide shadow-lg shadow-slate-900/10 cursor-pointer transition-all flex items-center justify-center space-x-2"
        >
          <span>Done</span>
          <svg class="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </button>
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
    store.successModal ||
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

        <!-- Active Screen Viewport (Separated Tall Pages in HTML - Scroll Locked when Modal Open) -->
        <main id="main-viewport" class="flex-1 px-4 pt-3 pb-28 ${
          isAnyModalOpen ? 'overflow-hidden' : 'overflow-y-auto'
        } no-scrollbar min-h-[calc(100vh-140px)] flex flex-col">
          ${store.selectedCustomerId ? renderIndividualCustomerPage(store.selectedCustomerId) :
            store.selectedWorkerId ? renderIndividualEmployeePage(store.selectedWorkerId) : `
              ${activeTab === 'dashboard' ? renderDashboard() : ''}
              ${activeTab === 'income' ? renderIncomePage() : ''}
              ${activeTab === 'expenses' || activeTab === 'ledger' ? renderExpenseEmployeesPage() : ''}
              ${activeTab === 'wages' || activeTab === 'employees' ? renderExpenseEmployeesPage() : ''}
              ${activeTab === 'dues' || activeTab === 'customers' ? renderCustomerPage() : ''}
              ${activeTab === 'cfo' ? renderCfoHub() : ''}
              ${activeTab === 'notifications' ? renderNotificationPage() : ''}
          `}
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

        <!-- Record Payment Settlement Drawer -->
        ${store.settlingCustomer ? renderSettleDrawer(store.settlingCustomer) : ''}

        <!-- Expense Keypad Modal Drawer -->
        ${expenseEmployeesState.isKeypadOpen ? renderExpenseKeypadDrawer() : ''}

        <!-- Wage Payout Flow Modal -->
        ${expenseEmployeesState.isPayingWage ? renderWagePayoutModal() : ''}

        <!-- Worker Profile Modal -->
        ${expenseEmployeesState.selectedWorkerProfile ? renderWorkerProfileModal(expenseEmployeesState.selectedWorkerProfile) : ''}

        <!-- Add Customer Modal -->
        ${customerPageState.showAddCustomerModal ? renderAddCustomerModal() : ''}

        <!-- Confirmation Action Dialog -->
        ${renderConfirmModal()}

        <!-- Transaction Success Receipt Popup Modal -->
        ${renderSuccessModal()}

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

  // Root Record Payment Settlement Drawer
  if (store.settlingCustomer) {
    attachSettleDrawerEvents();
  }

  // Root Expense Keypad Drawer
  if (expenseEmployeesState.isKeypadOpen) {
    attachExpenseKeypadEvents();
  }

  // Root Wage Payout Modal
  if (expenseEmployeesState.isPayingWage) {
    attachWagePayoutEvents();
  }

  // Root Worker Profile Modal
  if (expenseEmployeesState.selectedWorkerProfile) {
    attachWorkerProfileModalEvents();
  }

  // Root Add Customer Modal
  if (customerPageState.showAddCustomerModal) {
    attachAddCustomerModalEvents();
  }

  if (store.selectedCustomerId) {
    attachIndividualCustomerPageEvents();
  } else if (store.selectedWorkerId) {
    attachIndividualEmployeePageEvents();
  } else {
    if (activeTab === 'dashboard') attachDashboardEvents();
    if (activeTab === 'income') attachIncomePageEvents();
    if (activeTab === 'expenses' || activeTab === 'wages' || activeTab === 'employees' || activeTab === 'ledger') attachExpenseEmployeesPageEvents();
    if (activeTab === 'dues' || activeTab === 'customers') attachCustomerPageEvents();
    if (activeTab === 'cfo') attachCfoEvents();
    if (activeTab === 'notifications') attachNotificationPageEvents();
  }

  // Desktop Frame Toggle
  const toggleFrameBtn = document.getElementById('btn-toggle-device-frame');
  if (toggleFrameBtn) {
    toggleFrameBtn.onclick = () => {
      deviceFrame = !deviceFrame;
      renderApp();
    };
  }

  // Success Receipt Modal Events
  if (store.successModal) {
    const closeBtn = document.getElementById('btn-close-success-modal');
    const backdrop = document.getElementById('success-modal-backdrop');

    if (closeBtn) closeBtn.onclick = () => store.closeSuccessModal();
    if (backdrop) {
      backdrop.onclick = (e) => {
        if (e.target === backdrop) store.closeSuccessModal();
      };
      backdrop.addEventListener('touchmove', (e) => {
        if (e.target === backdrop) e.preventDefault();
      }, { passive: false });
    }
  }

  // Modal Events
  if (store.confirmModal) {
    const cancelModal = document.getElementById('btn-cancel-confirm');
    const actionModal = document.getElementById('btn-action-confirm');
    const backdrop = document.getElementById('confirm-modal-backdrop');

    if (cancelModal) {
      cancelModal.onclick = (e) => {
        e.stopPropagation();
        store.closeConfirmModal();
      };
    }
    if (backdrop) {
      backdrop.onclick = (e) => {
        if (e.target === backdrop) {
          e.stopPropagation();
          store.closeConfirmModal();
        }
      };
      backdrop.addEventListener('touchmove', (e) => {
        if (e.target === backdrop) e.preventDefault();
      }, { passive: false });
    }
    if (actionModal) {
      actionModal.onclick = (e) => {
        e.stopPropagation();
        const conf = store.confirmModal;
        if (conf && typeof conf.onConfirm === 'function') {
          conf.onConfirm();
        }
        store.closeConfirmModal();
      };
    }
  }
}

// Hash-based URL navigation for separate tall pages
function syncTabFromHash() {
  const hash = window.location.hash.replace('#', '').trim();

  if (hash.startsWith('customer/')) {
    const custId = hash.replace('customer/', '').trim();
    store.selectedCustomerId = custId;
    store.selectedWorkerId = null;
    store.activeTab = 'customers';
    store.notify();
    return;
  }

  if (hash.startsWith('employee/')) {
    const workerId = hash.replace('employee/', '').trim();
    store.selectedWorkerId = workerId;
    store.selectedCustomerId = null;
    store.activeTab = 'employees';
    store.notify();
    return;
  }

  if (store.selectedCustomerId || store.selectedWorkerId) {
    store.selectedCustomerId = null;
    store.selectedWorkerId = null;
  }

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

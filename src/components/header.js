import { store } from '../state.js';
import { icons } from '../icons.js';
import { openInstallModal } from './installModal.js';

export function renderHeader() {
  const { estate, activeTab } = store;
  const totalReceivables = store.getTotalReceivables();

  const titles = {
    dashboard: 'Home',
    income: 'Customer Payments',
    expenses: 'Expenses',
    wages: 'Employees & Wages',
    employees: 'Employees & Wages',
    ledger: 'Expenses',
    dues: 'Customers',
    customers: 'Customers',
    cfo: 'Settings & AI CFO',
    notifications: 'Notifications',
  };

  let currentTitle = titles[activeTab] || 'Home';
  if (store.selectedCustomerId) {
    const cust = store.customers.find(c => c.id === store.selectedCustomerId);
    currentTitle = cust ? cust.name : 'Customer Statement';
  } else if (store.selectedWorkerId) {
    const wrk = store.workers.find(w => w.id === store.selectedWorkerId);
    currentTitle = wrk ? wrk.name : 'Employee Ledger';
  }

  const isHome = activeTab === 'dashboard' && !store.selectedCustomerId && !store.selectedWorkerId;
  const unreadNotifs = store.getUnreadNotificationCount ? store.getUnreadNotificationCount() : 0;

  // Completely hide header on focused wage entry page
  if (activeTab === 'wages' && store.wageSubView === 'add_wage') {
    return '';
  }

  return `
    <header 
      class="w-full px-5 py-3.5 sticky top-0 z-30 bg-[#f8fafc]/95 backdrop-blur-md flex items-center justify-between"
      style="padding-top: max(env(safe-area-inset-top, 0px), 16px)"
    >
      ${isHome ? `
        <!-- Home Header: Clean, Minimal Professional Avatar & Name -->
        <div 
          id="btn-header-profile" 
          class="flex items-center space-x-3 cursor-pointer group active:scale-95 transition-all select-none"
          title="Account Profile & Settings"
        >
          <!-- Minimal Circular Profile Avatar -->
          <div class="w-10 h-10 rounded-full bg-[#18181b] text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-black transition-colors">
            ${estate.owner ? estate.owner.charAt(0).toUpperCase() : 'A'}
          </div>

          <!-- Name & Subtle Clean Label -->
          <div class="min-w-0">
            <h1 class="text-base font-extrabold text-slate-900 tracking-tight leading-none">
              ${estate.owner}
            </h1>
            <span class="text-xs text-slate-400 font-medium block mt-1 leading-none">
              Estate Account
            </span>
          </div>
        </div>
      ` : `
        <!-- Inner Screen Header: Clean Circular Back Button + Section Title -->
        <div class="flex items-center space-x-3">
          <button 
            id="btn-header-back" 
            class="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
            aria-label="Back to Home"
          >
            ${icons.chevronLeft("w-4 h-4 text-slate-800")}
          </button>
          <h1 class="text-base font-bold text-slate-900 tracking-tight">
            ${currentTitle}
          </h1>
        </div>
      `}

      <!-- Right Actions: Download / Install App + Search Modules + Notifications Bell -->
      <div class="flex items-center space-x-2">
        <button
          id="btn-header-install"
          class="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all relative shrink-0 cursor-pointer"
          title="Download & Install App"
          aria-label="Download App"
        >
          ${icons.download("w-4 h-4 text-slate-700")}
          <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#84cc16] ring-1 ring-white pulse-ambient"></span>
        </button>

        <button
          id="btn-header-search"
          class="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shrink-0 cursor-pointer"
          title="Search modules (Ctrl+K)"
          aria-label="Search modules"
        >
          ${icons.search("w-4 h-4 text-slate-700")}
        </button>

        <button
          id="btn-header-bell"
          class="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all relative shrink-0 cursor-pointer ${
            activeTab === 'notifications' ? 'ring-2 ring-slate-900 bg-slate-50' : ''
          }"
          title="${unreadNotifs > 0 ? `${unreadNotifs} unread alerts` : 'Notifications'}"
          aria-label="Notifications"
        >
          ${icons.bell("w-4 h-4 text-slate-700")}
          ${unreadNotifs > 0 ? `
            <span class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-2xs pulse-ambient">
              ${unreadNotifs}
            </span>
          ` : ''}
        </button>
      </div>
    </header>
  `;
}

export function attachHeaderEvents() {
  const installBtn = document.getElementById('btn-header-install');
  if (installBtn) {
    installBtn.onclick = (e) => {
      e.stopPropagation();
      openInstallModal();
    };
  }

  const profileBtn = document.getElementById('btn-header-profile');
  if (profileBtn) {
    profileBtn.onclick = () => store.setActiveTab('cfo');
  }

  const searchBtn = document.getElementById('btn-header-search');
  if (searchBtn) {
    searchBtn.onclick = (e) => {
      e.stopPropagation();
      store.toggleSearchModal();
    };
  }

  const backBtn = document.getElementById('btn-header-back');
  if (backBtn) {
    backBtn.onclick = () => {
      if (store.selectedCustomerId) {
        store.clearSelectedCustomer();
      } else if (store.selectedWorkerId) {
        store.clearSelectedWorker();
      } else {
        store.setActiveTab('dashboard');
      }
    };
  }

  const bellBtn = document.getElementById('btn-header-bell');
  if (bellBtn) {
    bellBtn.onclick = () => store.setActiveTab('notifications');
  }
}

import { store } from '../state.js';
import { icons } from '../icons.js';

export function renderBottomNav() {
  const { activeTab, isQuickActionsOpen } = store;

  const isHome = activeTab === 'dashboard';
  const isExpensesEmployees = ['expenses', 'wages', 'employees', 'ledger'].includes(activeTab);
  const isCustomers = ['customers', 'dues'].includes(activeTab);
  const isSettings = activeTab === 'cfo';

  // Completely hide bottom nav on focused wage entry page if active
  if (activeTab === 'wages' && store.wageSubView === 'add_wage') {
    return '';
  }

  return `
    <div class="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto pointer-events-none pb-3 md:pb-4">
      <nav 
        class="pointer-events-auto mx-4 rounded-full minimal-dock px-3 py-2 flex items-center justify-between shadow-2xl border border-white/10"
        style="padding-bottom: max(env(safe-area-inset-bottom, 0px), 8px)"
        aria-label="Bottom Navigation"
      >
        <!-- Tab 1: Home -->
        <button
          data-tab="dashboard"
          class="nav-tab-btn flex flex-col items-center justify-center w-10 h-10 rounded-full transition-all duration-200 active:scale-95 cursor-pointer ${
            isHome ? 'text-white' : 'text-slate-400 hover:text-white'
          }"
          aria-label="Home"
          title="Home"
        >
          ${icons.home(isHome ? "w-5 h-5 stroke-[2.5]" : "w-5 h-5 stroke-[1.8]")}
          ${isHome ? '<span class="w-1 h-1 rounded-full bg-[#a3e635] mt-0.5"></span>' : ''}
        </button>

        <!-- Tab 2: Expense & Employees -->
        <button
          data-tab="expenses"
          class="nav-tab-btn flex flex-col items-center justify-center w-10 h-10 rounded-full transition-all duration-200 active:scale-95 cursor-pointer ${
            isExpensesEmployees ? 'text-white' : 'text-slate-400 hover:text-white'
          }"
          aria-label="Expense & Employees"
          title="Expense & Employees"
        >
          ${icons.banknote(isExpensesEmployees ? "w-5 h-5 stroke-[2.5]" : "w-5 h-5 stroke-[1.8]")}
          ${isExpensesEmployees ? '<span class="w-1 h-1 rounded-full bg-[#a3e635] mt-0.5"></span>' : ''}
        </button>

        <!-- Center Highlight Action: Lime Green Circular Plus Button (Toggles Quick Actions Popup) -->
        <button
          id="btn-bottom-center-action"
          class="w-11 h-11 rounded-full bg-[#a3e635] hover:bg-[#bef264] active:scale-90 text-slate-950 flex items-center justify-center shadow-lg shadow-lime-950/30 transition-all duration-200 cursor-pointer ${
            isQuickActionsOpen ? 'ring-4 ring-lime-400/40 bg-[#bef264]' : ''
          }"
          aria-label="Quick Actions"
          title="Quick Actions"
        >
          <span class="inline-flex items-center justify-center transition-transform duration-200 ${
            isQuickActionsOpen ? 'rotate-45' : 'rotate-0'
          }">
            ${icons.plus("w-5 h-5 text-slate-950 stroke-[3]")}
          </span>
        </button>

        <!-- Tab 4: Customers -->
        <button
          data-tab="customers"
          class="nav-tab-btn flex flex-col items-center justify-center w-10 h-10 rounded-full transition-all duration-200 active:scale-95 cursor-pointer ${
            isCustomers ? 'text-white' : 'text-slate-400 hover:text-white'
          }"
          aria-label="Customers"
          title="Customers"
        >
          ${icons.users(isCustomers ? "w-5 h-5 stroke-[2.5]" : "w-5 h-5 stroke-[1.8]")}
          ${isCustomers ? '<span class="w-1 h-1 rounded-full bg-[#a3e635] mt-0.5"></span>' : ''}
        </button>

        <!-- Tab 5: Settings / CFO -->
        <button
          data-tab="cfo"
          class="nav-tab-btn flex flex-col items-center justify-center w-10 h-10 rounded-full transition-all duration-200 active:scale-95 cursor-pointer ${
            isSettings ? 'text-white' : 'text-slate-400 hover:text-white'
          }"
          aria-label="Settings"
          title="Settings & Reports"
        >
          ${icons.settings(isSettings ? "w-5 h-5 stroke-[2.5]" : "w-5 h-5 stroke-[1.8]")}
          ${isSettings ? '<span class="w-1 h-1 rounded-full bg-[#a3e635] mt-0.5"></span>' : ''}
        </button>
      </nav>
    </div>
  `;
}

export function attachBottomNavEvents() {
  document.querySelectorAll('.nav-tab-btn').forEach((btn) => {
    btn.onclick = () => {
      const tab = btn.getAttribute('data-tab');
      if (tab) {
        if (store.isQuickActionsOpen) store.setQuickActionsOpen(false);
        store.setActiveTab(tab);
      }
    };
  });

  const centerBtn = document.getElementById('btn-bottom-center-action');
  if (centerBtn) {
    centerBtn.onclick = (e) => {
      e.stopPropagation();
      store.toggleQuickActions();
    };
  }
}

import { store } from '../state.js';
import { icons } from '../icons.js';
import { setSelectedExpenseCategory } from './expensesPage.js';
import { setSelectedWorkerId } from './wagesPage.js';

let newEmployeeRole = 'Rubber Tapper';

export function renderQuickActionsModal() {
  if (!store.isQuickActionsOpen) return '';

  return `
    <div 
      id="quick-actions-backdrop" 
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
      style="touch-action: none;"
      aria-modal="true"
      role="dialog"
    >
      <div 
        id="quick-actions-sheet" 
        class="w-full max-w-md bg-white rounded-t-[32px] p-5 pb-8 shadow-[0_-12px_40px_rgba(0,0,0,0.18)] border-t border-slate-100 flex flex-col space-y-4 animate-slide-up relative select-none max-h-[85vh] overflow-y-auto no-scrollbar pointer-events-auto overscroll-contain"
        style="padding-bottom: max(env(safe-area-inset-bottom, 0px), 28px); touch-action: pan-y; overscroll-behavior: contain;"
      >
        <!-- Drag Handle Indicator -->
        <div class="w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-1 mb-1 shrink-0"></div>

        <!-- Header: Title & Close Button -->
        <div class="flex items-center justify-between pt-0.5 shrink-0">
          <div>
            <h3 class="text-lg font-black tracking-tight text-slate-900">
              Quick Actions
            </h3>
            <p class="text-[11px] font-medium text-slate-400">
              Record transaction or open any estate page
            </p>
          </div>

          <button
            id="btn-close-quick-actions"
            class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all"
            aria-label="Close"
          >
            ${icons.x("w-4 h-4 stroke-[2.5]")}
          </button>
        </div>

        <!-- Top Featured Hero Card: Customer Payments (Centered with Lime Payment Wallet Icon) -->
        <button
          id="btn-quick-new-sale"
          class="w-full group relative overflow-hidden rounded-2xl bg-[#18181b] hover:bg-black text-white p-4 shadow-lg shadow-zinc-900/15 active:scale-[0.98] transition-all border border-zinc-800 flex flex-col items-center justify-center space-y-1.5 text-center shrink-0"
        >
          <!-- Subtle ambient glow in top right -->
          <div class="absolute -right-8 -top-8 w-28 h-28 bg-[#a3e635]/15 rounded-full blur-xl pointer-events-none group-hover:bg-[#a3e635]/25 transition-all"></div>

          <div class="w-12 h-12 rounded-2xl bg-[#a3e635] text-slate-950 flex items-center justify-center font-bold shadow-md shadow-lime-950/20 group-hover:scale-105 transition-transform">
            ${icons.wallet("w-6 h-6 stroke-[2.2]")}
          </div>

          <div>
            <div class="flex items-center justify-center space-x-1.5">
              <span class="text-base font-extrabold tracking-tight text-white">Customer Payments</span>
              <span class="px-2 py-0.5 rounded-full bg-[#a3e635]/20 text-[#bef264] text-[10px] font-bold uppercase tracking-wider">Service</span>
            </div>
            <p class="text-xs text-zinc-400 font-medium mt-0.5">Record service payment from customer</p>
          </div>
        </button>

        <!-- Section 1: Daily Operations & Workforce -->
        <div class="space-y-2">
          <div class="flex items-center justify-between px-0.5">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Operations & Workforce
            </span>
          </div>

          <div class="grid grid-cols-4 gap-2">
            <!-- 1: Add Employee -->
            <button
              id="btn-quick-add-employee"
              class="group flex flex-col items-center justify-between min-h-[92px] py-3 px-1.5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-200 hover:bg-indigo-50/40 active:scale-95 shadow-xs transition-all text-center"
              title="Register a new employee (No fixed salary)"
            >
              <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1 group-hover:scale-105 group-hover:bg-indigo-100 transition-all">
                ${icons.userPlus("w-5 h-5 stroke-[2.2]")}
              </div>
              <span class="text-[11px] font-extrabold text-slate-800 leading-tight">Add<br/>Employee</span>
            </button>

            <!-- 2: Employee Pay -->
            <button
              id="btn-quick-employee-pay"
              class="group flex flex-col items-center justify-between min-h-[92px] py-3 px-1.5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-200 hover:bg-emerald-50/40 active:scale-95 shadow-xs transition-all text-center"
              title="Record wages payout"
            >
              <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1 group-hover:scale-105 group-hover:bg-emerald-100 transition-all">
                ${icons.user("w-5 h-5 stroke-[2.2]")}
              </div>
              <span class="text-[11px] font-extrabold text-slate-800 leading-tight">Employee<br/>Pay</span>
            </button>

            <!-- 3: Travel Expense -->
            <button
              id="btn-quick-travel-expense"
              class="group flex flex-col items-center justify-between min-h-[92px] py-3 px-1.5 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-200 hover:bg-sky-50/40 active:scale-95 shadow-xs transition-all text-center"
              title="Diesel & transport expense"
            >
              <div class="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-1 group-hover:scale-105 group-hover:bg-sky-100 transition-all">
                ${icons.car("w-5 h-5 stroke-[2.2]")}
              </div>
              <span class="text-[11px] font-extrabold text-slate-800 leading-tight">Travel<br/>Expense</span>
            </button>

            <!-- 4: Other Expense -->
            <button
              id="btn-quick-other-expense"
              class="group flex flex-col items-center justify-between min-h-[92px] py-3 px-1.5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-200 hover:bg-amber-50/40 active:scale-95 shadow-xs transition-all text-center"
              title="Estate supplies, canteen & misc"
            >
              <div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1 group-hover:scale-105 group-hover:bg-amber-100 transition-all">
                ${icons.alertCircle("w-5 h-5 stroke-[2.2]")}
              </div>
              <span class="text-[11px] font-extrabold text-slate-800 leading-tight">Other<br/>Expense</span>
            </button>
          </div>
        </div>

        <!-- Section 2: Customer Management (Customer Dues & Add Customer) -->
        <div class="space-y-2 pt-1">
          <div class="flex items-center justify-between px-0.5">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Customer Management
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <!-- 5: Customer Dues -->
            <button
              id="btn-quick-customer-dues"
              class="group flex items-center space-x-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-violet-200 hover:bg-violet-50/40 active:scale-95 shadow-xs transition-all text-left select-none"
              title="Customer Dues & Outstanding Balances"
            >
              <div class="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-violet-100 transition-all">
                ${icons.creditCard("w-5 h-5 stroke-[2.2]")}
              </div>
              <div class="min-w-0">
                <span class="text-xs font-extrabold text-slate-800 block truncate">Customers</span>
                <span class="text-[10px] text-slate-400 font-medium block truncate">Directory & Dues</span>
              </div>
            </button>

            <!-- 6: Add Customer -->
            <button
              id="btn-quick-add-buyer"
              class="group flex items-center space-x-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-rose-200 hover:bg-rose-50/40 active:scale-95 shadow-xs transition-all text-left select-none"
              title="Register new client / customer"
            >
              <div class="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-rose-100 transition-all">
                ${icons.dues("w-5 h-5 stroke-[2.2]")}
              </div>
              <div class="min-w-0">
                <span class="text-xs font-extrabold text-slate-800 block truncate">Add Customer</span>
                <span class="text-[10px] text-slate-400 font-medium block truncate">Register new client</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderAddEmployeeModal() {
  if (!store.isAddEmployeeModalOpen) return '';

  const ROLES = [
    'Rubber Tapper',
    'Latex Collector',
    'Field Staff',
    'Smokehouse Curing',
    'Weeding & Spray'
  ];

  return `
    <div 
      id="add-employee-backdrop" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
      style="touch-action: none;"
      aria-modal="true"
      role="dialog"
    >
      <div 
        id="add-employee-card" 
        class="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col space-y-4 animate-slide-up relative pointer-events-auto overscroll-contain"
        style="touch-action: pan-y; overscroll-behavior: contain;"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              ${icons.userPlus("w-5 h-5 stroke-[2.2]")}
            </div>
            <div>
              <h3 class="text-base font-extrabold text-slate-900 leading-tight">
                Add Employee
              </h3>
              <p class="text-xs text-slate-400">
                Register new estate worker
              </p>
            </div>
          </div>

          <button
            id="btn-close-add-employee"
            class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all"
            aria-label="Close"
          >
            ${icons.x("w-4 h-4 stroke-[2.5]")}
          </button>
        </div>

        <!-- Form Fields (No Fixed Salary) -->
        <form id="form-add-employee" class="space-y-4 pt-1" onsubmit="return false;">
          <!-- Field 1: Worker Name -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" for="input-employee-name">
              Employee Full Name
            </label>
            <input
              id="input-employee-name"
              type="text"
              placeholder="e.g. Ramesh Kumar"
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              required
              autofocus
            />
          </div>

          <!-- Field 2: Role Selection Chips -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Assigned Role
            </label>
            <div class="flex flex-wrap gap-1.5">
              ${ROLES.map((role) => {
                const isSelected = newEmployeeRole === role;
                return `
                  <button
                    type="button"
                    data-role="${role}"
                    class="btn-select-new-role px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }"
                  >
                    ${role}
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Field 3: Phone / Mobile (Optional) -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" for="input-employee-phone">
              Mobile Number (Optional)
            </label>
            <input
              id="input-employee-phone"
              type="tel"
              placeholder="e.g. +91 98470 12345"
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <!-- Variable Wage Explanatory Note -->
          <div class="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/60 flex items-center space-x-2.5 text-emerald-900">
            <span class="shrink-0 text-emerald-600 font-bold">✓</span>
            <p class="text-[11px] font-semibold leading-snug">
              No fixed salary required. Daily wage is entered dynamically on the wages payout keypad.
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-2 pt-1">
            <button
              type="button"
              id="btn-cancel-add-employee"
              class="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs font-bold text-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-add-employee"
              class="flex-1 py-3 px-4 rounded-2xl bg-[#18181b] hover:bg-black active:scale-95 text-xs font-bold text-white shadow-md shadow-zinc-900/20 transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Save Employee</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function renderAddBuyerModal() {
  if (!store.isAddBuyerModalOpen) return '';

  return `
    <div 
      id="add-buyer-backdrop" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
      style="touch-action: none;"
      aria-modal="true"
      role="dialog"
    >
      <div 
        id="add-buyer-card" 
        class="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col space-y-4 animate-slide-up relative pointer-events-auto overscroll-contain"
        style="touch-action: pan-y; overscroll-behavior: contain;"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              ${icons.dues("w-5 h-5 stroke-[2.2]")}
            </div>
            <div>
              <h3 class="text-base font-extrabold text-slate-900 leading-tight">
                Add New Customer
              </h3>
              <p class="text-xs text-slate-400">
                Register service client
              </p>
            </div>
          </div>

          <button
            id="btn-close-add-buyer"
            class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all"
            aria-label="Close"
          >
            ${icons.x("w-4 h-4 stroke-[2.5]")}
          </button>
        </div>

        <!-- Form Fields -->
        <form id="form-add-buyer" class="space-y-4 pt-1" onsubmit="return false;">
          <!-- Field 1: Customer Name -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" for="input-buyer-name">
              Customer / Client Name
            </label>
            <input
              id="input-buyer-name"
              type="text"
              placeholder="e.g. Apex Enterprises or John Mathew"
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
              required
              autofocus
            />
          </div>

          <!-- Field 2: Town / Location -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" for="input-buyer-city">
              Town / Location
            </label>
            <input
              id="input-buyer-city"
              type="text"
              placeholder="e.g. Kottayam, Kerala"
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
          </div>

          <!-- Field 3: Phone Number -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" for="input-buyer-phone">
              Mobile / WhatsApp Number
            </label>
            <input
              id="input-buyer-phone"
              type="tel"
              placeholder="e.g. +91 98471 23456"
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-2 pt-1">
            <button
              type="button"
              id="btn-cancel-add-buyer"
              class="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs font-bold text-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-add-buyer"
              class="flex-1 py-3 px-4 rounded-2xl bg-[#18181b] hover:bg-black active:scale-95 text-xs font-bold text-white shadow-md shadow-zinc-900/20 transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Save Customer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function attachQuickActionsEvents() {
  if (store.isQuickActionsOpen) {
    const backdrop = document.getElementById('quick-actions-backdrop');
    const closeBtn = document.getElementById('btn-close-quick-actions');
    const newSaleBtn = document.getElementById('btn-quick-new-sale');
    const addEmpBtn = document.getElementById('btn-quick-add-employee');
    const empPayBtn = document.getElementById('btn-quick-employee-pay');
    const travelBtn = document.getElementById('btn-quick-travel-expense');
    const otherBtn = document.getElementById('btn-quick-other-expense');
    const duesBtn = document.getElementById('btn-quick-customer-dues');
    const addBuyerBtn = document.getElementById('btn-quick-add-buyer');

    const closeActions = () => store.setQuickActionsOpen(false);

    if (backdrop) {
      backdrop.onclick = (e) => {
        if (e.target === backdrop) closeActions();
      };
      backdrop.addEventListener('touchmove', (e) => {
        if (e.target === backdrop) e.preventDefault();
      }, { passive: false });
    }

    if (closeBtn) closeBtn.onclick = closeActions;

    // 1: New Sale -> Closes popup & navigates to income (Fast Keypad / New Sale)
    if (newSaleBtn) {
      newSaleBtn.onclick = () => {
        closeActions();
        store.setActiveTab('income');
      };
    }

    // 2: Add Employee -> Closes popup & opens Add Employee Modal
    if (addEmpBtn) {
      addEmpBtn.onclick = () => {
        closeActions();
        store.setAddEmployeeModalOpen(true);
      };
    }

    // 3: Employee Pay -> Closes popup & navigates to Wages
    if (empPayBtn) {
      empPayBtn.onclick = () => {
        closeActions();
        store.setActiveTab('wages');
      };
    }

    // 4: Travel Expense -> Sets category to Travel & Diesel, navigates to expenses
    if (travelBtn) {
      travelBtn.onclick = () => {
        closeActions();
        setSelectedExpenseCategory('Travel & Diesel');
        store.setActiveTab('expenses');
      };
    }

    // 5: Other Expense -> Sets category to Misc, navigates to expenses
    if (otherBtn) {
      otherBtn.onclick = () => {
        closeActions();
        setSelectedExpenseCategory('Misc');
        store.setActiveTab('expenses');
      };
    }

    // 6: Customers -> Navigates to Customers Page
    if (duesBtn) {
      duesBtn.onclick = () => {
        closeActions();
        store.setActiveTab('customers');
      };
    }

    // 7: Add Customer -> Closes popup & opens Add Customer Modal
    if (addBuyerBtn) {
      addBuyerBtn.onclick = () => {
        closeActions();
        store.setAddBuyerModalOpen(true);
      };
    }
  }

  // Add Employee Modal Event Handlers (No Fixed Salary)
  if (store.isAddEmployeeModalOpen) {
    const backdrop = document.getElementById('add-employee-backdrop');
    const closeBtn = document.getElementById('btn-close-add-employee');
    const cancelBtn = document.getElementById('btn-cancel-add-employee');
    const form = document.getElementById('form-add-employee');

    const closeModal = () => store.setAddEmployeeModalOpen(false);

    if (backdrop) {
      backdrop.onclick = (e) => {
        if (e.target === backdrop) closeModal();
      };
      backdrop.addEventListener('touchmove', (e) => {
        if (e.target === backdrop) e.preventDefault();
      }, { passive: false });
    }

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;

    // Role selection chips
    document.querySelectorAll('.btn-select-new-role').forEach((btn) => {
      btn.onclick = () => {
        newEmployeeRole = btn.getAttribute('data-role') || 'Rubber Tapper';
        store.notify();
      };
    });

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('input-employee-name');
        const phoneInput = document.getElementById('input-employee-phone');
        const name = nameInput ? nameInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';

        if (!name) {
          store.showToast('Please enter employee name', 'error');
          return;
        }

        const newWorker = store.addWorker({
          name,
          role: newEmployeeRole,
          phone
        });

        closeModal();
        setSelectedWorkerId(newWorker.id);
        store.showToast(`Added ${newWorker.name} (${newEmployeeRole})`);
        store.setActiveTab('wages');
      };
    }
  }

  // Add Buyer Modal Event Handlers
  if (store.isAddBuyerModalOpen) {
    const backdrop = document.getElementById('add-buyer-backdrop');
    const closeBtn = document.getElementById('btn-close-add-buyer');
    const cancelBtn = document.getElementById('btn-cancel-add-buyer');
    const form = document.getElementById('form-add-buyer');

    const closeModal = () => store.setAddBuyerModalOpen(false);

    if (backdrop) {
      backdrop.onclick = (e) => {
        if (e.target === backdrop) closeModal();
      };
      backdrop.addEventListener('touchmove', (e) => {
        if (e.target === backdrop) e.preventDefault();
      }, { passive: false });
    }

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('input-buyer-name');
        const cityInput = document.getElementById('input-buyer-city');
        const phoneInput = document.getElementById('input-buyer-phone');

        const name = nameInput ? nameInput.value.trim() : '';
        const city = cityInput ? cityInput.value.trim() : 'Kerala';
        const phone = phoneInput ? phoneInput.value.trim() : '';

        if (!name) {
          store.showToast('Please enter buyer / merchant name', 'error');
          return;
        }

        const newCust = store.addCustomer({ name, phone, city });
        closeModal();
        store.showToast(`Added buyer: ${newCust.name}`);
        store.setActiveTab('income');
      };
    }
  }
}

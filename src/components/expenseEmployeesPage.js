import { store } from '../state.js';
import { icons } from '../icons.js';
import { formatRupee, formatDate, getTodayDate, generateTxnId } from '../utils/formatters.js';

// Subtab state: 'expenses' | 'employees'
export let expenseEmployeesState = {
  currentSubTab: 'expenses', // 'expenses' | 'employees'
  
  // Expense Hub & Filter State
  expenseFilter: 'all', // 'all', 'Travel & Diesel', 'Canteen / Food', 'Maintenance', 'Misc'
  expenseSearchQuery: '',
  isKeypadOpen: false, // Whether the numeric logging drawer/sheet is open

  // Expense Form State
  expenseAmount: '0',
  expenseCategory: 'Travel & Diesel',
  expenseNote: '',
  expensePaymentMode: 'Cash', // 'Cash', 'UPI', 'Bank Transfer'

  // Workforce & Wages State
  wageActiveTab: 'employees', // 'employees' | 'history'
  workerSearchQuery: '',
  selectedWorkerProfile: null, // Worker object for detail drawer
  isPayingWage: false, // Whether the wage payout sub-sheet is active
  wageStep: 1, // 1 = select_worker, 2 = enter_wage
  selectedWorkerId: '',
  wageAmount: '750',
  selectedTask: 'Morning Tapping',
  wagePaymentMode: 'Cash'
};

const EXPENSE_CATEGORIES = [
  { 
    id: 'Goods Expense', 
    label: 'Goods Expense', 
    desc: 'Acid, Barrels & Supplies',
    icon: (cls) => icons.leaf(cls),
    tileClass: 'card-tile-lime',
    textColor: 'text-lime-950',
    iconBg: 'bg-white/80 text-lime-900',
    matches: (t) => t.category === 'Goods Expense' || t.category === 'Goods Purchases' || t.category.includes('Acid') || (t.subCategory && t.subCategory.includes('Acid')) || (t.notes && (t.notes.includes('Acid') || t.notes.includes('Barrel')))
  },
  { 
    id: 'Travel & Diesel', 
    label: 'Travel Expense', 
    desc: 'Diesel, Pickup & Freight',
    icon: (cls) => icons.truck(cls),
    tileClass: 'card-tile-coral',
    textColor: 'text-rose-950',
    iconBg: 'bg-white/80 text-rose-900',
    matches: (t) => t.category === 'Travel & Diesel' || t.category === 'Travel' || (t.category && t.category.includes('Diesel')) || (t.subCategory && t.subCategory.includes('Pickup'))
  },
  { 
    id: 'Canteen / Food', 
    label: 'Food & Canteen', 
    desc: 'Staff Tea, Meals & Snacks',
    icon: (cls) => icons.coffee(cls),
    tileClass: 'card-tile-blue',
    textColor: 'text-sky-950',
    iconBg: 'bg-white/80 text-sky-900',
    matches: (t) => t.category === 'Canteen / Food' || (t.category && (t.category.includes('Food') || t.category.includes('Tea') || t.category.includes('Canteen')))
  },
  { 
    id: 'Maintenance', 
    label: 'Other Expense', 
    desc: 'Smokehouse, Power & Misc',
    icon: (cls) => icons.wrench(cls),
    tileClass: 'card-tile-purple',
    textColor: 'text-purple-950',
    iconBg: 'bg-white/80 text-purple-900',
    matches: (t) => t.category === 'Maintenance' || t.category === 'LED/Maintenance' || t.category === 'Misc' || (!['Acid', 'Travel', 'Food', 'Tea', 'Canteen'].some(k => (t.category || '').includes(k)) && !(t.category || '').includes('Wages'))
  }
];

const WAGE_TASKS = [
  'Morning Tapping',
  'Latex Collection',
  'Weeding & Spray',
  'Smokehouse Curing',
  'Field Clearing'
];

export function setExpenseEmployeesSubTab(tab) {
  if (tab === 'expenses' || tab === 'employees') {
    expenseEmployeesState.currentSubTab = tab;
    store.notify();
  }
}

export function openExpenseKeypadForCategory(catId) {
  expenseEmployeesState.expenseCategory = catId;
  expenseEmployeesState.expenseAmount = '0';
  expenseEmployeesState.expenseNote = '';
  expenseEmployeesState.isKeypadOpen = true;
  store.notify();
}

export function closeExpenseKeypad() {
  expenseEmployeesState.isKeypadOpen = false;
  store.notify();
}

export function setExpenseCategoryFilter(catId) {
  expenseEmployeesState.expenseFilter = catId;
  store.notify();
}

export function setSelectedExpenseCategory(cat) {
  if (EXPENSE_CATEGORIES.some(c => c.id === cat)) {
    expenseEmployeesState.expenseCategory = cat;
    expenseEmployeesState.currentSubTab = 'expenses';
    store.notify();
  }
}

export function openAddWageForWorker(workerId) {
  expenseEmployeesState.currentSubTab = 'employees';
  expenseEmployeesState.selectedWorkerId = workerId;
  const worker = store.workers.find(w => w.id === workerId);
  if (worker && worker.defaultDailyWage) {
    expenseEmployeesState.wageAmount = String(worker.defaultDailyWage);
  }
  expenseEmployeesState.wageStep = 2;
  expenseEmployeesState.isPayingWage = true;
  store.notify();
}

export function openWagePayoutModal() {
  expenseEmployeesState.currentSubTab = 'employees';
  expenseEmployeesState.wageStep = 1;
  expenseEmployeesState.isPayingWage = true;
  store.notify();
}

export function closeWagePayoutModal() {
  expenseEmployeesState.isPayingWage = false;
  store.notify();
}

export function renderExpenseEmployeesPage() {
  const { currentSubTab } = expenseEmployeesState;

  return `
    <div class="space-y-4 pb-8 pt-1 animate-fade-in">
      <!-- 1. Top Unified Segmented Switcher (Expenses vs Employees) -->
      <div class="flex items-center justify-center p-1 rounded-full bg-slate-200/80 max-w-[340px] mx-auto shadow-inner">
        <button
          id="btn-subtab-expenses"
          class="flex-1 py-2 px-3 rounded-full text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            currentSubTab === 'expenses'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }"
        >
          ${icons.banknote("w-3.5 h-3.5")}
          <span>Expenses</span>
        </button>

        <button
          id="btn-subtab-employees"
          class="flex-1 py-2 px-3 rounded-full text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            currentSubTab === 'employees'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }"
        >
          ${icons.users("w-3.5 h-3.5")}
          <span>Employees (${store.workers.length})</span>
        </button>
      </div>

      <!-- 2. Conditional Section View -->
      ${currentSubTab === 'expenses' ? renderExpensesSection() : renderEmployeesSection()}

      <!-- Log Expense Modal Drawer -->
      ${expenseEmployeesState.isKeypadOpen ? renderExpenseKeypadDrawer() : ''}

      <!-- Worker Profile Drawer -->
      ${expenseEmployeesState.selectedWorkerProfile ? renderWorkerProfileModal(expenseEmployeesState.selectedWorkerProfile) : ''}

      <!-- Wage Payout Flow Modal -->
      ${expenseEmployeesState.isPayingWage ? renderWagePayoutModal() : ''}
    </div>
  `;
}

/* ==========================================================================
   SECTION 1: EXPENSES VIEW (HOME-LIKE CATEGORY NAVIGATION HUB)
   ========================================================================== */
function renderExpensesSection() {
  const expenseTxns = store.transactions.filter((t) => t.type === 'expense');
  const totalExpenseSpend = expenseTxns.reduce((sum, t) => sum + (t.amount || 0), 0);

  // Filter transactions
  const filteredTxns = expenseTxns.filter((t) => {
    // Search query
    const q = expenseEmployeesState.expenseSearchQuery.toLowerCase().trim();
    if (q) {
      const match = (t.category && t.category.toLowerCase().includes(q)) ||
                    (t.notes && t.notes.toLowerCase().includes(q)) ||
                    (t.vendorName && t.vendorName.toLowerCase().includes(q)) ||
                    (t.workerName && t.workerName.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Category filter
    if (expenseEmployeesState.expenseFilter === 'all') return true;
    const activeCat = EXPENSE_CATEGORIES.find(c => c.id === expenseEmployeesState.expenseFilter);
    if (activeCat && activeCat.matches) {
      return activeCat.matches(t);
    }
    return t.category === expenseEmployeesState.expenseFilter;
  });

  return `
    <div class="space-y-4">
      <!-- 1. Soft Sunrise / Peach-Coral Mesh Hero Card (Phone 2 Aesthetic) -->
      <div class="rounded-[28px] card-mesh-peach p-5 relative overflow-hidden select-none transition-all duration-300">
        <!-- Top Row: Label + Outflows Pill Badge -->
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-700/80">
            Total Balance / Expenses
          </span>
          <span class="px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-xs font-black text-slate-800 shadow-2xs">
            ${expenseTxns.length} Outflows
          </span>
        </div>

        <!-- Center: Big Crisp Expense Spend -->
        <div class="my-3">
          <div class="text-3xl md:text-4xl font-black text-slate-900 tracking-tight font-display leading-none">
            ${formatRupee(totalExpenseSpend)}
          </div>
          <span class="text-[11px] text-slate-600/80 mt-1.5 block font-medium">
            Recorded operating spend across all categories
          </span>
        </div>

        <!-- Bottom Action Row -->
        <div class="pt-2.5 flex items-center justify-between border-t border-slate-900/10">
          <span class="text-xs font-bold text-slate-700">Quick Outflow</span>
          <button
            id="btn-open-log-expense-modal"
            class="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            ${icons.plus("w-3.5 h-3.5 text-white stroke-[2.5]")}
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      <!-- 2. Soft 4-Color Category Navigation Hub (Phone 3 Aesthetic) -->
      <div>
        <div class="flex items-center justify-between px-1 mb-2">
          <span class="text-[11px] font-black text-slate-400 uppercase tracking-wider">
            Expense Navigation Hub
          </span>
          ${expenseEmployeesState.expenseFilter !== 'all' ? `
            <button id="btn-reset-exp-filter" class="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer">
              Show All
            </button>
          ` : ''}
        </div>

        <div class="grid grid-cols-2 gap-3">
          ${EXPENSE_CATEGORIES.map((cat) => {
            const catTxns = expenseTxns.filter((t) => cat.matches ? cat.matches(t) : t.category === cat.id);
            const catTotal = catTxns.reduce((s, t) => s + (t.amount || 0), 0);
            const isFilterActive = expenseEmployeesState.expenseFilter === cat.id;

            return `
              <div
                data-navcat="${cat.id}"
                class="btn-nav-expcat p-4 rounded-3xl transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[110px] ${cat.tileClass} ${
                  isFilterActive ? 'ring-2 ring-slate-900 shadow-md scale-[1.02]' : 'hover:scale-[1.01]'
                }"
              >
                <div class="flex items-start justify-between">
                  <div class="w-10 h-10 rounded-2xl ${cat.iconBg} flex items-center justify-center font-bold shadow-2xs shrink-0">
                    ${cat.icon("w-5 h-5")}
                  </div>
                  <button
                    data-quickaddcat="${cat.id}"
                    class="btn-quick-add-to-cat w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-2xs active:scale-90 transition-all cursor-pointer"
                    title="Quick log ₹ to ${cat.label}"
                  >
                    ${icons.plus("w-3.5 h-3.5 stroke-[2.5]")}
                  </button>
                </div>

                <div class="mt-3">
                  <span class="text-xs font-black tracking-tight block ${cat.textColor}">${cat.label}</span>
                  <div class="flex items-baseline justify-between mt-0.5">
                    <span class="text-base font-black font-display tracking-tight ${cat.textColor}">${formatRupee(catTotal)}</span>
                    <span class="text-[10px] ${cat.textColor} opacity-75 font-semibold">${catTxns.length} txns</span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 3. Search Bar & Category Filter Pills -->
      <div class="space-y-2 pt-1">
        <div class="relative">
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            ${icons.search("w-4 h-4")}
          </div>
          <input
            id="input-expense-search"
            type="text"
            placeholder="Search vendor, note, or category..."
            value="${expenseEmployeesState.expenseSearchQuery}"
            class="w-full pl-11 pr-10 py-2.5 rounded-full bg-white border border-slate-200/90 text-xs text-slate-900 placeholder:text-slate-400 shadow-xs focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium"
          />
          ${expenseEmployeesState.expenseSearchQuery ? `
            <button id="btn-clear-expense-search" class="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 text-xs cursor-pointer">
              ${icons.x("w-3 h-3")}
            </button>
          ` : ''}
        </div>

        <!-- Filter Pills -->
        <div class="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            data-pillfilter="all"
            class="btn-exp-filter-pill px-3.5 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition-all cursor-pointer ${
              expenseEmployeesState.expenseFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }"
          >
            All Outflows (${expenseTxns.length})
          </button>

          ${EXPENSE_CATEGORIES.map(c => `
            <button
              data-pillfilter="${c.id}"
              class="btn-exp-filter-pill px-3.5 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition-all cursor-pointer ${
                expenseEmployeesState.expenseFilter === c.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }"
            >
              ${c.label}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- 4. Expense Outflow Feed -->
      <div class="space-y-2 pt-1">
        <div class="flex items-center justify-between px-1">
          <span class="text-xs font-black text-slate-400 uppercase tracking-wider block">
            Recorded Spend Feed (${filteredTxns.length})
          </span>
        </div>

        ${filteredTxns.length === 0 ? `
          <div class="py-10 text-center rounded-2xl bg-white border border-slate-100 p-6 shadow-xs">
            <div class="mx-auto mb-2 text-slate-400">${icons.shoppingCart("w-8 h-8 mx-auto stroke-[1.5]")}</div>
            <h4 class="text-xs font-bold text-slate-900">No Expenses Recorded</h4>
            <p class="text-[11px] text-slate-400 mt-1">Tap "+ Log Expense" or any category card above to add an outflow.</p>
          </div>
        ` : filteredTxns.map((txn) => {
          let catIcon = icons.arrowUp("w-4 h-4 text-slate-700 stroke-[2.5]");
          let iconClass = 'bg-slate-100 text-slate-700 border-slate-200/70';

          if (txn.category && txn.category.includes('Wages')) {
            catIcon = icons.users("w-4 h-4 text-amber-800");
            iconClass = 'bg-amber-50 text-amber-800 border-amber-200/80';
          } else if (txn.category === 'Travel & Diesel' || txn.category === 'Travel') {
            catIcon = icons.truck("w-4 h-4 text-sky-700");
            iconClass = 'bg-sky-50 text-sky-800 border-sky-200/80';
          } else if (txn.category === 'Goods Purchases') {
            catIcon = icons.shoppingCart("w-4 h-4 text-emerald-800");
            iconClass = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
          } else if (txn.category.includes('Tea') || txn.category.includes('Food') || txn.category.includes('Canteen')) {
            catIcon = icons.coffee("w-4 h-4 text-orange-800");
            iconClass = 'bg-orange-50 text-orange-800 border-orange-200/80';
          } else if (txn.category.includes('LED') || txn.category.includes('Maintenance')) {
            catIcon = icons.wrench("w-4 h-4 text-indigo-800");
            iconClass = 'bg-indigo-50 text-indigo-800 border-indigo-200/80';
          }

          return `
            <div class="p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 flex items-center justify-between shadow-2xs transition-all">
              <div class="flex items-center space-x-3.5 min-w-0">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${iconClass}">
                  ${catIcon}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center space-x-1.5">
                    <h4 class="text-xs font-black text-slate-900 truncate tracking-tight">${txn.category}</h4>
                    ${txn.paymentMode ? `<span class="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">${txn.paymentMode}</span>` : ''}
                  </div>
                  <span class="text-[11px] text-slate-400 truncate block mt-0.5">${txn.notes || 'Operating spend'} • ${formatDate(txn.date)}</span>
                </div>
              </div>

              <div class="flex items-center space-x-2 shrink-0 ml-2">
                <div class="text-right">
                  <span class="text-sm font-black text-slate-900 font-display block leading-tight">-${formatRupee(txn.amount)}</span>
                  <span class="text-[9px] font-bold text-rose-600 block">Outflow</span>
                </div>
                <button
                  data-del-txnid="${txn.id}"
                  class="btn-del-expense-txn w-7 h-7 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer"
                  title="Delete expense"
                >
                  ${icons.trash("w-3.5 h-3.5")}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/* ==========================================================================
   LOG EXPENSE DRAWER / MODAL (WITH TOUCH KEYPAD)
   ========================================================================== */
function renderExpenseKeypadDrawer() {
  const fastAmounts = ['200', '500', '1000', '2500', '5000'];
  const keypadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'backspace']
  ];

  return `
    <div id="expense-keypad-backdrop" class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in" style="touch-action: none;">
      <div id="expense-keypad-sheet" class="relative w-full max-w-md max-h-[90vh] bg-white rounded-t-[36px] overflow-hidden flex flex-col z-10 animate-slide-up shadow-2xl pointer-events-auto overscroll-contain" style="padding-bottom: max(env(safe-area-inset-bottom, 0px), 20px); touch-action: pan-y; overscroll-behavior: contain;">
        <!-- Drag Handle Indicator -->
        <div class="pt-3 pb-1 flex justify-center items-center cursor-grab">
          <div class="w-12 h-1.5 rounded-full bg-slate-200"></div>
        </div>

        <!-- Header -->
        <div class="px-6 py-2.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 class="text-base font-black text-slate-900 tracking-tight">Record Expense Outflow</h2>
            <p class="text-xs text-slate-500 mt-0.5">Select category and enter spend amount</p>
          </div>
          <button id="btn-close-expense-keypad" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 active:scale-95 transition-all cursor-pointer">
            ${icons.x("w-4 h-4")}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-3.5 no-scrollbar space-y-3.5">
          <!-- 1. Category Selector Pills inside Modal -->
          <div>
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
              Category
            </span>
            <div class="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
              ${EXPENSE_CATEGORIES.map((cat) => {
                const isSelected = expenseEmployeesState.expenseCategory === cat.id;
                return `
                  <button
                    data-modal-expcat="${cat.id}"
                    class="btn-select-modal-expcat px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }"
                  >
                    ${cat.icon("w-3.5 h-3.5")}
                    <span>${cat.label}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 2. Clean Amount Card with Cursor -->
          <div class="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80 text-center space-y-1.5">
            <div class="text-4xl font-black text-slate-900 font-display tracking-tight flex items-center justify-center">
              <span>₹</span>
              <span id="display-expense-amount">${expenseEmployeesState.expenseAmount === '0' ? '0' : expenseEmployeesState.expenseAmount}</span>
              <span class="w-0.5 h-7 bg-rose-500 animate-pulse ml-1 inline-block rounded-full"></span>
            </div>

            <!-- Fast Amount Pills -->
            <div class="flex items-center justify-center space-x-1.5 pt-0.5 overflow-x-auto no-scrollbar">
              ${fastAmounts.map((amt) => {
                const isMatch = expenseEmployeesState.expenseAmount === amt;
                return `
                  <button
                    data-fastexp="${amt}"
                    class="btn-fast-exp px-3 py-1 rounded-full text-[11px] font-bold font-sans transition-all active:scale-95 cursor-pointer ${
                      isMatch
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                    }"
                  >
                    ₹${Number(amt).toLocaleString('en-IN')}
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 3. Clean Touch Numeric Keypad -->
          <div class="rounded-2xl bg-white p-2 border border-slate-100 shadow-2xs">
            <div class="grid grid-cols-3 gap-1.5">
              ${keypadKeys.map((row) => row.map((key) => {
                const isDel = key === 'backspace';
                return `
                  <button
                    data-expkey="${key}"
                    class="exp-keypad-btn h-11 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 active:bg-slate-200 text-lg font-bold text-slate-900 flex items-center justify-center transition-all select-none font-display border border-slate-100/60 cursor-pointer"
                  >
                    ${isDel ? icons.backspace("w-4 h-4 text-slate-700") : key}
                  </button>
                `;
              }).join('')).join('')}
            </div>
          </div>

          <!-- 4. Payment Mode & Note -->
          <div class="space-y-2">
            <div class="flex items-center justify-center space-x-2">
              <span class="text-xs font-bold text-slate-400 mr-1">Paid via:</span>
              ${[
                { id: 'Cash', label: 'Cash' },
                { id: 'UPI', label: 'UPI / GPay' },
                { id: 'Bank Transfer', label: 'Bank' }
              ].map(m => `
                <button
                  data-mode="${m.id}"
                  class="btn-exp-mode px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    expenseEmployeesState.expensePaymentMode === m.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }"
                >
                  ${m.label}
                </button>
              `).join('')}
            </div>

            <input
              id="input-exp-notes"
              type="text"
              placeholder="Vendor / Note (e.g. Formic Acid, HP Petrol Pump, Canteen)"
              value="${expenseEmployeesState.expenseNote}"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 font-medium"
            />
          </div>

          <!-- 5. CTA Button -->
          <div class="pt-1">
            <button
              id="btn-confirm-expense"
              class="w-full py-3.5 rounded-full bg-slate-900 hover:bg-black active:scale-98 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Record Expense of ₹${expenseEmployeesState.expenseAmount === '0' ? '0' : Number(expenseEmployeesState.expenseAmount).toLocaleString('en-IN')}</span>
              ${icons.arrowRight("w-4 h-4 text-white")}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   SECTION 2: EMPLOYEES & WAGES VIEW
   ========================================================================== */
function renderEmployeesSection() {
  const { workers, transactions } = store;
  const totalWagesPaid = store.getTotalWagesPaid();
  const totalPendingWages = store.getTotalPendingWages();
  const wageTxns = transactions.filter((t) => t.category === 'Staff Wages');

  const filteredWorkers = workers.filter((w) => {
    const q = expenseEmployeesState.workerSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return w.name.toLowerCase().includes(q) || (w.role && w.role.toLowerCase().includes(q)) || (w.phone && w.phone.includes(q));
  });

  return `
    <div class="space-y-4">
      <!-- 1. Workforce Banner Card (Phone 2 Minimal Sunrise Card) -->
      <div class="rounded-[28px] card-mesh-peach p-5 relative overflow-hidden select-none transition-all duration-300">
        <!-- Top Row: Label + Pill Badge -->
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-700/80">
            Total Wages Disbursed
          </span>
          <span class="px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-xs font-black text-slate-800 shadow-2xs">
            ${workers.length} Workers
          </span>
        </div>

        <!-- Center: Crisp Balance -->
        <div class="my-3">
          <div class="text-3xl md:text-4xl font-black text-slate-900 tracking-tight font-display leading-none">
            ${formatRupee(totalWagesPaid)}
          </div>
          <div class="inline-flex items-center space-x-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-white/80 border border-slate-200/60 text-slate-700 text-xs font-bold">
            ${icons.clock("w-3 h-3 text-amber-700")}
            <span>Pending Payouts: <strong class="text-slate-900 font-bold">${formatRupee(totalPendingWages)}</strong></span>
          </div>
        </div>

        <!-- Bottom Row: Estate Info & Quick Pay Action -->
        <div class="pt-2.5 flex items-center justify-between border-t border-slate-900/10">
          <span class="text-xs font-bold text-slate-700">${store.estate.name}</span>
          <button
            id="btn-goto-record-wage"
            class="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            ${icons.plus("w-3.5 h-3.5 text-white stroke-[2.5]")}
            <span>Pay Worker</span>
          </button>
        </div>
      </div>

      <!-- 2. Primary Actions Row -->
      <div class="flex items-center justify-between pt-0.5">
        <button
          id="btn-open-add-employee-from-page"
          class="w-full py-2.5 px-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 font-bold text-xs shadow-2xs flex items-center justify-center space-x-1.5 active:scale-98 transition-all cursor-pointer"
        >
          ${icons.userPlus("w-4 h-4 text-slate-700 stroke-[2.2]")}
          <span>Register New Employee</span>
        </button>
      </div>

      <!-- 3. Sub-Navigation Tabs: Employees vs Payout History -->
      <div class="flex items-center justify-between pt-1">
        <div class="flex items-center space-x-1.5 p-1 rounded-full bg-slate-100 max-w-[280px]">
          <button
            id="tab-btn-wage-employees"
            class="px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              expenseEmployeesState.wageActiveTab === 'employees'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }"
          >
            ${icons.users("w-3.5 h-3.5")}
            <span>Employees (${workers.length})</span>
          </button>

          <button
            id="tab-btn-wage-history"
            class="px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              expenseEmployeesState.wageActiveTab === 'history'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }"
          >
            ${icons.rotateCcw("w-3.5 h-3.5")}
            <span>Payout History (${wageTxns.length})</span>
          </button>
        </div>
      </div>

      <!-- 4. Content by Active Sub-Tab -->
      ${expenseEmployeesState.wageActiveTab === 'employees' ? renderWorkerRosterList(filteredWorkers) : renderWageHistoryList(wageTxns)}
    </div>
  `;
}

function renderWorkerRosterList(workers) {
  return `
    <div class="space-y-3">
      <!-- Search Worker Input -->
      <div class="relative">
        <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          ${icons.search("w-4 h-4")}
        </div>
        <input
          id="input-worker-search"
          type="text"
          placeholder="Search worker by name, role or phone..."
          value="${expenseEmployeesState.workerSearchQuery}"
          class="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-200/90 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-medium"
        />
      </div>

      <!-- Worker Cards Feed -->
      <div class="space-y-2.5">
        ${workers.map((w) => {
          const totalPaid = store.getWorkerTotalPaid(w.id, w.name);
          const initials = w.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
          const cleanPhone = w.phone ? w.phone.replace(/[^0-9]/g, '') : '';

          return `
            <div class="p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 shadow-2xs space-y-3 transition-all">
              <div class="flex items-center justify-between cursor-pointer card-worker-header" data-workerid="${w.id}">
                <div class="flex items-center space-x-3 min-w-0">
                  <div class="w-11 h-11 rounded-2xl bg-amber-100/70 border border-amber-200 text-amber-950 flex items-center justify-center font-black text-xs shrink-0">
                    ${initials}
                  </div>
                  <div class="min-w-0">
                    <h4 class="text-xs font-black text-slate-900 truncate tracking-tight">${w.name}</h4>
                    <span class="text-[11px] font-bold text-amber-800 block">${w.role}</span>
                    ${w.phone ? `<span class="text-[10px] text-slate-400 block mt-0.5">${w.phone}</span>` : ''}
                  </div>
                </div>

                <div class="text-right shrink-0">
                  <span class="text-[9px] uppercase font-bold text-slate-400 block">Daily Rate</span>
                  <span class="text-xs font-black text-slate-900 font-display">₹${w.defaultDailyWage || 750}</span>
                </div>
              </div>

              <!-- Wages Status Row -->
              <div class="grid grid-cols-2 gap-2 text-center text-xs">
                <div class="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span class="text-[9px] font-bold text-slate-400 block uppercase">Total Paid</span>
                  <span class="text-xs font-black text-emerald-700 font-display">${formatRupee(totalPaid)}</span>
                </div>
                <div class="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span class="text-[9px] font-bold text-slate-400 block uppercase">Pending Wages</span>
                  <span class="text-xs font-black text-amber-800 font-display">${formatRupee(w.pendingWages || 0)}</span>
                </div>
              </div>

              <!-- Actions Row -->
              <div class="flex items-center space-x-2 pt-0.5">
                ${w.phone ? `
                  <a
                    href="tel:${cleanPhone}"
                    class="py-2 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center space-x-1 active:scale-95 transition-all text-center"
                    title="Call ${w.name}"
                  >
                    ${icons.phone("w-3.5 h-3.5")}
                    <span>Call</span>
                  </a>
                ` : ''}

                <button
                  data-workerid="${w.id}"
                  class="btn-open-worker-profile flex-1 py-2 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all active:scale-95 cursor-pointer text-center"
                >
                  Profile & History
                </button>

                <button
                  data-workerid="${w.id}"
                  class="btn-quick-pay-worker flex-1 py-2 px-3 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-1"
                >
                  ${icons.plus("w-3 h-3 text-white")}
                  <span>Pay Wage</span>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderWageHistoryList(wageTxns) {
  return `
    <div class="space-y-2">
      ${wageTxns.length === 0 ? `
        <div class="p-8 text-center rounded-2xl bg-white border border-slate-100 text-slate-400 text-xs">
          No wage payouts recorded yet.
        </div>
      ` : wageTxns.map((txn) => `
        <div class="p-3.5 rounded-2xl bg-white border border-slate-100 flex items-center justify-between shadow-2xs">
          <div class="min-w-0 pr-2">
            <h4 class="text-xs font-black text-slate-900 truncate">${txn.workerName || txn.worker || txn.notes || 'Estate Worker'}</h4>
            <span class="text-[11px] text-slate-400 block mt-0.5">${formatDate(txn.date)} • ${txn.notes || txn.subCategory || 'Daily Wage'}</span>
            <span class="text-[9px] font-extrabold uppercase text-slate-500">${txn.paymentMode || 'Cash'}</span>
          </div>

          <div class="flex items-center space-x-2 shrink-0">
            <div class="text-right">
              <span class="text-xs font-black text-slate-900 font-display block">-${formatRupee(txn.amount)}</span>
              <span class="text-[9px] font-bold text-emerald-700 block">Disbursed</span>
            </div>
            <button
              data-del-wageid="${txn.id}"
              class="btn-del-wage-txn w-7 h-7 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer"
              title="Delete wage entry"
            >
              ${icons.trash("w-3.5 h-3.5")}
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderWorkerProfileModal(w) {
  const workerTxns = store.transactions.filter(
    (t) => t.category === 'Staff Wages' && (t.workerId === w.id || t.worker === w.name || t.notes?.includes(w.name))
  );
  const totalPaid = store.getWorkerTotalPaid(w.id, w.name);

  return `
    <div id="worker-profile-backdrop" class="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs animate-fade-in" style="touch-action: none;">
      <div class="relative w-full max-w-sm bg-white rounded-t-[32px] md:rounded-[32px] p-6 border border-slate-100 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto no-scrollbar pointer-events-auto overscroll-contain" style="touch-action: pan-y; overscroll-behavior: contain;">
        <!-- Drag Handle for Mobile -->
        <div class="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 md:hidden"></div>

        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Employee Profile</span>
            <h3 class="text-xs font-mono font-bold text-slate-600 mt-0.5">${w.id}</h3>
          </div>
          <button id="btn-close-worker-profile" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 active:scale-95 transition-all cursor-pointer">
            ${icons.x("w-4 h-4")}
          </button>
        </div>

        <!-- Worker Card Top Info -->
        <div class="my-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
          <div class="flex items-center space-x-3.5">
            <div class="w-12 h-12 rounded-2xl bg-amber-200/70 text-amber-950 flex items-center justify-center font-black text-sm border border-amber-300">
              ${w.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 class="text-sm font-black text-slate-900 tracking-tight">${w.name}</h4>
              <span class="text-xs font-bold text-amber-800">${w.role}</span>
              <div class="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
                ${icons.phone("w-3 h-3 text-slate-400")}
                <span>${w.phone || 'No phone recorded'}</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <span class="text-[10px] font-bold text-slate-400 block uppercase">Daily Wage</span>
            <span class="text-sm font-black text-slate-900 font-display">₹${w.defaultDailyWage || 750}</span>
          </div>
        </div>

        <!-- Financial Breakdown -->
        <div class="grid grid-cols-2 gap-2 mb-4">
          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span class="text-[10px] font-bold text-slate-400 block uppercase">Total Paid</span>
            <span class="text-base font-black text-emerald-700 font-display">${formatRupee(totalPaid)}</span>
          </div>
          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span class="text-[10px] font-bold text-slate-400 block uppercase">Pending Wages</span>
            <span class="text-base font-black text-amber-800 font-display">${formatRupee(w.pendingWages || 0)}</span>
          </div>
        </div>

        <!-- Recent Slips for this Worker -->
        <div class="space-y-2 mb-5">
          <span class="text-[11px] font-black uppercase tracking-wider text-slate-400 block px-1">
            Recent Wage Payouts (${workerTxns.length})
          </span>

          <div class="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            ${workerTxns.length === 0 ? `
              <div class="p-4 text-center rounded-xl bg-slate-50 text-slate-400 text-xs">
                No wage payout history yet.
              </div>
            ` : workerTxns.map((txn) => `
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span class="text-xs font-bold text-slate-900 block">${txn.notes || txn.subCategory || 'Daily Wage'}</span>
                  <span class="text-[10px] text-slate-400">${formatDate(txn.date)} • ${txn.paymentMode || 'Cash'}</span>
                </div>
                <div class="text-right">
                  <span class="text-xs font-black text-slate-900 font-display">-${formatRupee(txn.amount)}</span>
                  <span class="text-[9px] font-bold text-emerald-700 block">Paid</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Footer Action -->
        <div class="flex items-center space-x-2">
          ${w.phone ? `
            <a
              href="tel:${w.phone.replace(/[^0-9]/g, '')}"
              class="py-3 px-4 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs font-bold text-slate-700 flex items-center justify-center space-x-1.5 transition-all"
            >
              ${icons.phone("w-3.5 h-3.5")}
              <span>Call</span>
            </a>
          ` : ''}
          <button
            id="btn-modal-pay-worker"
            data-workerid="${w.id}"
            class="flex-1 py-3 px-4 rounded-full bg-slate-900 hover:bg-black active:scale-95 text-xs font-bold text-white transition-all text-center shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            ${icons.plus("w-3.5 h-3.5 text-white")}
            <span>Pay This Worker</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderWagePayoutModal() {
  const { wageStep, selectedWorkerId, wageAmount, selectedTask, wagePaymentMode } = expenseEmployeesState;
  const worker = store.workers.find(w => w.id === selectedWorkerId);

  return `
    <div id="wage-payout-backdrop" class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in" style="touch-action: none;">
      <div id="wage-payout-sheet" class="relative w-full max-w-md max-h-[85vh] bg-white rounded-t-[36px] overflow-hidden flex flex-col z-10 animate-slide-up shadow-2xl pointer-events-auto overscroll-contain" style="padding-bottom: max(env(safe-area-inset-bottom, 0px), 20px); touch-action: pan-y; overscroll-behavior: contain;">
        <div class="pt-3 pb-1 flex justify-center items-center cursor-grab">
          <div class="w-12 h-1.5 rounded-full bg-slate-200"></div>
        </div>

        <!-- Header -->
        <div class="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 class="text-base font-black text-slate-900 tracking-tight">Record Wage Payout</h2>
            <p class="text-xs text-slate-500 mt-0.5">${wageStep === 1 ? 'Step 1: Select Employee' : `Step 2: Enter Wage for ${worker ? worker.name : 'Worker'}`}</p>
          </div>
          <button id="btn-close-wage-payout" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 active:scale-95 transition-all cursor-pointer">
            ${icons.x("w-4 h-4")}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-4 no-scrollbar space-y-4">
          ${wageStep === 1 ? `
            <!-- Step 1: Select Worker -->
            <div class="space-y-2">
              <span class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Choose Worker</span>
              <div class="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
                ${store.workers.map(w => `
                  <button
                    data-selectworkerid="${w.id}"
                    class="btn-pick-worker-for-wage w-full p-3 rounded-2xl border border-slate-200/90 hover:border-slate-900 flex items-center justify-between text-left transition-all active:scale-98 cursor-pointer"
                  >
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-950 flex items-center justify-center font-bold text-xs">
                        ${w.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span class="text-xs font-bold text-slate-900 block">${w.name}</span>
                        <span class="text-[10px] text-slate-400">${w.role}</span>
                      </div>
                    </div>
                    <div class="text-right">
                      <span class="text-xs font-black text-slate-900 font-display">₹${w.defaultDailyWage || 750}</span>
                      <span class="text-[9px] text-slate-400 block">daily rate</span>
                    </div>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : `
            <!-- Step 2: Amount & Task Entry -->
            <div class="space-y-4">
              <!-- Selected Worker Pill -->
              <div class="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div class="flex items-center space-x-2.5">
                  <div class="w-8 h-8 rounded-xl bg-amber-200 text-amber-950 flex items-center justify-center font-black text-xs">
                    ${worker ? worker.name.slice(0, 2).toUpperCase() : 'W'}
                  </div>
                  <div>
                    <span class="text-xs font-black text-slate-900 block">${worker ? worker.name : 'Selected Worker'}</span>
                    <span class="text-[10px] text-amber-800 font-bold">${worker ? worker.role : ''}</span>
                  </div>
                </div>
                <button id="btn-change-wage-worker" class="text-[11px] font-bold text-slate-500 hover:text-slate-900 underline cursor-pointer">
                  Change
                </button>
              </div>

              <!-- Task Chips -->
              <div class="space-y-1.5">
                <span class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Assigned Task</span>
                <div class="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
                  ${WAGE_TASKS.map(task => `
                    <button
                      data-taskname="${task}"
                      class="btn-pick-wage-task px-3 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
                        selectedTask === task
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }"
                    >
                      ${task}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Amount Input -->
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider" for="input-wage-amount-val">
                  Wage Amount (₹)
                </label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-400">₹</span>
                  <input
                    id="input-wage-amount-val"
                    type="number"
                    value="${wageAmount}"
                    class="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white font-display"
                  />
                </div>
                <div class="flex items-center space-x-1.5 pt-1">
                  ${['600', '750', '800', '1000', '1200'].map(v => `
                    <button
                      data-fastwage="${v}"
                      class="btn-fast-wage-pill px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      ₹${v}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Payment Mode -->
              <div class="space-y-1.5">
                <span class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Payment Mode</span>
                <div class="grid grid-cols-3 gap-2">
                  ${['Cash', 'UPI', 'Bank Transfer'].map(mode => `
                    <button
                      data-wagemode="${mode}"
                      class="btn-pick-wage-mode py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                        wagePaymentMode === mode
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }"
                    >
                      ${mode}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Confirm Payout Button -->
              <div class="pt-2">
                <button
                  id="btn-confirm-wage-disbursement"
                  class="w-full py-4 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-black shadow-lg shadow-zinc-900/20 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  ${icons.checkCircle("w-4 h-4 text-emerald-400")}
                  <span>Confirm Wage Payout of ₹${Number(wageAmount || 0).toLocaleString('en-IN')}</span>
                </button>
              </div>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

export function attachExpenseEmployeesPageEvents() {
  // Sub-Tab Switcher (Expenses vs Employees)
  const expensesTabBtn = document.getElementById('btn-subtab-expenses');
  const employeesTabBtn = document.getElementById('btn-subtab-employees');

  if (expensesTabBtn) {
    expensesTabBtn.onclick = () => setExpenseEmployeesSubTab('expenses');
  }
  if (employeesTabBtn) {
    employeesTabBtn.onclick = () => setExpenseEmployeesSubTab('employees');
  }

  /* -------------------------------------------------------------------------
     EXPENSES SECTION EVENT HANDLERS
     ------------------------------------------------------------------------- */
  if (expenseEmployeesState.currentSubTab === 'expenses') {
    // Open Log Expense Drawer
    const openLogBtn = document.getElementById('btn-open-log-expense-modal');
    if (openLogBtn) {
      openLogBtn.onclick = () => openExpenseKeypadForCategory(expenseEmployeesState.expenseCategory || 'Travel & Diesel');
    }

    // Category Navigation Tiles Click (Sets filter & selects category)
    document.querySelectorAll('.btn-nav-expcat').forEach((card) => {
      card.onclick = () => {
        const cat = card.getAttribute('data-navcat');
        if (cat) {
          // If already filtered by this category, toggle open keypad
          if (expenseEmployeesState.expenseFilter === cat) {
            openExpenseKeypadForCategory(cat);
          } else {
            setExpenseCategoryFilter(cat);
          }
        }
      };
    });

    // Quick Add '+' Button inside Category Tile (Opens Keypad for this Category directly)
    document.querySelectorAll('.btn-quick-add-to-cat').forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const cat = btn.getAttribute('data-quickaddcat');
        if (cat) openExpenseKeypadForCategory(cat);
      };
    });

    // Reset filter
    const resetFilterBtn = document.getElementById('btn-reset-exp-filter');
    if (resetFilterBtn) {
      resetFilterBtn.onclick = () => setExpenseCategoryFilter('all');
    }

    // Filter Pills
    document.querySelectorAll('.btn-exp-filter-pill').forEach((pill) => {
      pill.onclick = () => {
        const cat = pill.getAttribute('data-pillfilter');
        if (cat) setExpenseCategoryFilter(cat);
      };
    });

    // Search input
    const searchInput = document.getElementById('input-expense-search');
    if (searchInput) {
      searchInput.oninput = (e) => {
        expenseEmployeesState.expenseSearchQuery = e.target.value;
        store.notify();
      };
    }

    const clearSearchBtn = document.getElementById('btn-clear-expense-search');
    if (clearSearchBtn) {
      clearSearchBtn.onclick = () => {
        expenseEmployeesState.expenseSearchQuery = '';
        store.notify();
      };
    }

    // Delete Expense Entry
    document.querySelectorAll('.btn-del-expense-txn').forEach((btn) => {
      btn.onclick = () => {
        const tid = btn.getAttribute('data-del-txnid');
        if (tid) {
          store.openConfirmModal({
            title: 'Delete Expense?',
            message: 'This expense entry will be permanently removed from estate accounts.',
            confirmText: 'Delete',
            isDanger: true,
            onConfirm: () => {
              store.transactions = store.transactions.filter(t => t.id !== tid);
              store.closeConfirmModal();
              store.showToast('Expense entry deleted');
            }
          });
        }
      };
    });
  }

  /* -------------------------------------------------------------------------
     LOG EXPENSE KEYPAD DRAWER EVENT HANDLERS
     ------------------------------------------------------------------------- */
  if (expenseEmployeesState.isKeypadOpen) {
    const backdrop = document.getElementById('expense-keypad-backdrop');
    const closeBtn = document.getElementById('btn-close-expense-keypad');
    const noteInput = document.getElementById('input-exp-notes');
    const confirmBtn = document.getElementById('btn-confirm-expense');

    if (backdrop) {
      backdrop.onclick = (e) => {
        if (e.target === backdrop) closeExpenseKeypad();
      };
      backdrop.addEventListener('touchmove', (e) => {
        if (e.target === backdrop) e.preventDefault();
      }, { passive: false });
    }

    if (closeBtn) closeBtn.onclick = () => closeExpenseKeypad();

    function updateExpenseModalUI() {
      const displayEl = document.getElementById('display-expense-amount');
      if (displayEl) {
        displayEl.textContent = expenseEmployeesState.expenseAmount === '0' ? '0' : expenseEmployeesState.expenseAmount;
      }

      const confirmBtnSpan = document.querySelector('#btn-confirm-expense span');
      if (confirmBtnSpan) {
        const amtNum = parseFloat(expenseEmployeesState.expenseAmount);
        const formatted = (!amtNum || amtNum <= 0)
          ? '0'
          : Math.floor(amtNum).toLocaleString('en-IN');
        confirmBtnSpan.textContent = `Record Expense of ₹${formatted}`;
      }

      // Update Category Selector in Modal
      document.querySelectorAll('.btn-select-modal-expcat').forEach((b) => {
        const isSelected = b.getAttribute('data-modal-expcat') === expenseEmployeesState.expenseCategory;
        if (isSelected) {
          b.className = 'btn-select-modal-expcat px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer bg-slate-900 text-white shadow-xs';
        } else {
          b.className = 'btn-select-modal-expcat px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer bg-slate-100 text-slate-700 hover:bg-slate-200';
        }
      });

      // Update Fast Amount Pills
      document.querySelectorAll('.btn-fast-exp').forEach((b) => {
        const isMatch = b.getAttribute('data-fastexp') === expenseEmployeesState.expenseAmount;
        if (isMatch) {
          b.className = 'btn-fast-exp px-3 py-1 rounded-full text-[11px] font-bold font-sans transition-all active:scale-95 cursor-pointer bg-slate-900 text-white shadow-xs';
        } else {
          b.className = 'btn-fast-exp px-3 py-1 rounded-full text-[11px] font-bold font-sans transition-all active:scale-95 cursor-pointer bg-white border border-slate-200 hover:bg-slate-100 text-slate-700';
        }
      });

      // Update Payment Mode
      document.querySelectorAll('.btn-exp-mode').forEach((b) => {
        const isMatch = b.getAttribute('data-mode') === expenseEmployeesState.expensePaymentMode;
        if (isMatch) {
          b.className = 'btn-exp-mode px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer bg-slate-900 text-white shadow-xs';
        } else {
          b.className = 'btn-exp-mode px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer bg-slate-100 text-slate-700 hover:bg-slate-200';
        }
      });
    }

    // Category Selector in Modal
    document.querySelectorAll('.btn-select-modal-expcat').forEach((btn) => {
      btn.onclick = () => {
        const cat = btn.getAttribute('data-modal-expcat');
        if (cat) {
          expenseEmployeesState.expenseCategory = cat;
          updateExpenseModalUI();
        }
      };
    });

    // Fast Amount Pills
    document.querySelectorAll('.btn-fast-exp').forEach((btn) => {
      btn.onclick = () => {
        const amt = btn.getAttribute('data-fastexp');
        if (amt) {
          expenseEmployeesState.expenseAmount = amt;
          updateExpenseModalUI();
        }
      };
    });

    // Numeric Keypad
    document.querySelectorAll('.exp-keypad-btn').forEach((btn) => {
      btn.onclick = () => {
        const key = btn.getAttribute('data-expkey');
        let cur = expenseEmployeesState.expenseAmount;

        if (key === 'backspace') {
          if (cur.length <= 1) {
            cur = '0';
          } else {
            cur = cur.slice(0, -1);
          }
        } else if (key === '.') {
          if (!cur.includes('.')) {
            cur = cur + '.';
          }
        } else {
          if (cur === '0') {
            cur = key;
          } else {
            cur = cur + key;
          }
        }

        expenseEmployeesState.expenseAmount = cur;
        updateExpenseModalUI();
      };
    });

    // Mode Toggle
    document.querySelectorAll('.btn-exp-mode').forEach((btn) => {
      btn.onclick = () => {
        const mode = btn.getAttribute('data-mode');
        if (mode) {
          expenseEmployeesState.expensePaymentMode = mode;
          updateExpenseModalUI();
        }
      };
    });

    if (noteInput) {
      noteInput.oninput = (e) => {
        expenseEmployeesState.expenseNote = e.target.value;
      };
    }

    // Confirm Expense Button
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        const amt = parseFloat(expenseEmployeesState.expenseAmount);
        if (!amt || amt <= 0) {
          store.showToast('Please enter an expense amount', 'error');
          return;
        }

        const newTxn = {
          id: generateTxnId('TXN-EXP'),
          date: getTodayDate(),
          type: 'expense',
          category: expenseEmployeesState.expenseCategory,
          amount: amt,
          paymentMode: expenseEmployeesState.expensePaymentMode,
          notes: expenseEmployeesState.expenseNote || `${expenseEmployeesState.expenseCategory} spend`,
          createdAt: new Date().toISOString()
        };

        store.transactions.unshift(newTxn);
        const recordedCat = expenseEmployeesState.expenseCategory;
        expenseEmployeesState.expenseAmount = '0';
        expenseEmployeesState.expenseNote = '';
        closeExpenseKeypad();
        store.showToast(`Recorded ₹${amt.toLocaleString('en-IN')} for ${recordedCat}`);
      };
    }
  }

  /* -------------------------------------------------------------------------
     EMPLOYEES SECTION EVENT HANDLERS
     ------------------------------------------------------------------------- */
  if (expenseEmployeesState.currentSubTab === 'employees') {
    // Search worker input
    const workerSearch = document.getElementById('input-worker-search');
    if (workerSearch) {
      workerSearch.oninput = (e) => {
        expenseEmployeesState.workerSearchQuery = e.target.value;
        store.notify();
      };
    }

    // Top Action: Record Wage
    const gotoRecordWage = document.getElementById('btn-goto-record-wage');
    if (gotoRecordWage) {
      gotoRecordWage.onclick = () => openWagePayoutModal();
    }

    // Top Action: Add Employee
    const openAddEmployee = document.getElementById('btn-open-add-employee-from-page');
    if (openAddEmployee) {
      openAddEmployee.onclick = () => store.setAddEmployeeModalOpen(true);
    }

    // Sub-Nav Tabs: Employees vs History
    const wageEmployeesTab = document.getElementById('tab-btn-wage-employees');
    const wageHistoryTab = document.getElementById('tab-btn-wage-history');

    if (wageEmployeesTab) {
      wageEmployeesTab.onclick = () => {
        expenseEmployeesState.wageActiveTab = 'employees';
        store.notify();
      };
    }
    if (wageHistoryTab) {
      wageHistoryTab.onclick = () => {
        expenseEmployeesState.wageActiveTab = 'history';
        store.notify();
      };
    }

    // Pay Worker Quick Button on worker card
    document.querySelectorAll('.btn-quick-pay-worker').forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const wid = btn.getAttribute('data-workerid');
        if (wid) openAddWageForWorker(wid);
      };
    });

    // Worker Profile Modal Open
    document.querySelectorAll('.btn-open-worker-profile, .card-worker-header').forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const wid = btn.getAttribute('data-workerid');
        const worker = store.workers.find(w => w.id === wid);
        if (worker) {
          expenseEmployeesState.selectedWorkerProfile = worker;
          store.notify();
        }
      };
    });

    // Delete Wage Entry
    document.querySelectorAll('.btn-del-wage-txn').forEach((btn) => {
      btn.onclick = () => {
        const tid = btn.getAttribute('data-del-wageid');
        if (tid) {
          store.openConfirmModal({
            title: 'Delete Wage Entry?',
            message: 'This wage payment entry will be removed from estate payout history.',
            confirmText: 'Delete',
            isDanger: true,
            onConfirm: () => {
              store.transactions = store.transactions.filter(t => t.id !== tid);
              store.closeConfirmModal();
              store.showToast('Wage payout entry deleted');
            }
          });
        }
      };
    });
  }

  // Worker Profile Modal Events
  if (expenseEmployeesState.selectedWorkerProfile) {
    const backdrop = document.getElementById('worker-profile-backdrop');
    const closeBtn = document.getElementById('btn-close-worker-profile');
    const payBtn = document.getElementById('btn-modal-pay-worker');

    if (backdrop) {
      backdrop.onclick = (e) => {
        if (e.target === backdrop) {
          expenseEmployeesState.selectedWorkerProfile = null;
          store.notify();
        }
      };
      backdrop.addEventListener('touchmove', (e) => {
        if (e.target === backdrop) e.preventDefault();
      }, { passive: false });
    }

    if (closeBtn) {
      closeBtn.onclick = () => {
        expenseEmployeesState.selectedWorkerProfile = null;
        store.notify();
      };
    }

    if (payBtn) {
      payBtn.onclick = () => {
        const wid = payBtn.getAttribute('data-workerid');
        expenseEmployeesState.selectedWorkerProfile = null;
        if (wid) openAddWageForWorker(wid);
      };
    }
  }

  // Wage Payout Modal Events
  if (expenseEmployeesState.isPayingWage) {
    const backdrop = document.getElementById('wage-payout-backdrop');
    const closeBtn = document.getElementById('btn-close-wage-payout');
    const changeWorkerBtn = document.getElementById('btn-change-wage-worker');
    const amtInput = document.getElementById('input-wage-amount-val');
    const confirmDisburseBtn = document.getElementById('btn-confirm-wage-disbursement');

    if (backdrop) {
      backdrop.onclick = (e) => {
        if (e.target === backdrop) closeWagePayoutModal();
      };
      backdrop.addEventListener('touchmove', (e) => {
        if (e.target === backdrop) e.preventDefault();
      }, { passive: false });
    }

    if (closeBtn) closeBtn.onclick = () => closeWagePayoutModal();

    if (changeWorkerBtn) {
      changeWorkerBtn.onclick = () => {
        expenseEmployeesState.wageStep = 1;
        store.notify();
      };
    }

    // Pick Worker in Step 1
    document.querySelectorAll('.btn-pick-worker-for-wage').forEach((btn) => {
      btn.onclick = () => {
        const wid = btn.getAttribute('data-selectworkerid');
        if (wid) {
          openAddWageForWorker(wid);
        }
      };
    });

    function updateWageModalUI() {
      // Update Task Chips
      document.querySelectorAll('.btn-pick-wage-task').forEach((b) => {
        const isSelected = b.getAttribute('data-taskname') === expenseEmployeesState.selectedTask;
        if (isSelected) {
          b.className = 'btn-pick-wage-task px-3 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap cursor-pointer bg-slate-900 text-white border-slate-900 shadow-xs';
        } else {
          b.className = 'btn-pick-wage-task px-3 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap cursor-pointer bg-white text-slate-600 border-slate-200 hover:bg-slate-50';
        }
      });

      // Update Fast Wage Pills
      document.querySelectorAll('.btn-fast-wage-pill').forEach((b) => {
        const isMatch = b.getAttribute('data-fastwage') === expenseEmployeesState.wageAmount;
        if (isMatch) {
          b.className = 'btn-fast-wage-pill px-3 py-1 rounded-full text-[11px] font-bold font-sans transition-all cursor-pointer bg-slate-900 text-white border border-slate-900 shadow-xs';
        } else {
          b.className = 'btn-fast-wage-pill px-3 py-1 rounded-full text-[11px] font-bold font-sans transition-all cursor-pointer bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100';
        }
      });

      // Update Wage Payment Mode
      document.querySelectorAll('.btn-pick-wage-mode').forEach((b) => {
        const isMatch = b.getAttribute('data-wagemode') === expenseEmployeesState.wagePaymentMode;
        if (isMatch) {
          b.className = 'btn-pick-wage-mode px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer bg-slate-900 text-white shadow-xs';
        } else {
          b.className = 'btn-pick-wage-mode px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer bg-slate-100 text-slate-700 hover:bg-slate-200';
        }
      });

      if (amtInput && amtInput.value !== expenseEmployeesState.wageAmount) {
        amtInput.value = expenseEmployeesState.wageAmount;
      }
    }

    // Pick Task in Step 2
    document.querySelectorAll('.btn-pick-wage-task').forEach((btn) => {
      btn.onclick = () => {
        const task = btn.getAttribute('data-taskname');
        if (task) {
          expenseEmployeesState.selectedTask = task;
          updateWageModalUI();
        }
      };
    });

    // Fast Wage Pills
    document.querySelectorAll('.btn-fast-wage-pill').forEach((btn) => {
      btn.onclick = () => {
        const val = btn.getAttribute('data-fastwage');
        if (val) {
          expenseEmployeesState.wageAmount = val;
          updateWageModalUI();
        }
      };
    });

    // Wage Amount Input
    if (amtInput) {
      amtInput.oninput = (e) => {
        expenseEmployeesState.wageAmount = e.target.value;
      };
    }

    // Pick Mode
    document.querySelectorAll('.btn-pick-wage-mode').forEach((btn) => {
      btn.onclick = () => {
        const mode = btn.getAttribute('data-wagemode');
        if (mode) {
          expenseEmployeesState.wagePaymentMode = mode;
          updateWageModalUI();
        }
      };
    });

    // Confirm Wage Disbursement
    if (confirmDisburseBtn) {
      confirmDisburseBtn.onclick = () => {
        const amt = parseFloat(expenseEmployeesState.wageAmount);
        if (!amt || amt <= 0) {
          store.showToast('Please enter a valid wage amount', 'error');
          return;
        }

        const worker = store.workers.find(w => w.id === expenseEmployeesState.selectedWorkerId);
        const workerName = worker ? worker.name : 'Estate Worker';

        // Add wage expense transaction
        const newTxn = {
          id: generateTxnId('TXN-WAGE'),
          date: getTodayDate(),
          type: 'expense',
          category: 'Staff Wages',
          subCategory: expenseEmployeesState.selectedTask,
          workerId: worker ? worker.id : null,
          worker: workerName,
          workerName: workerName,
          amount: amt,
          paymentMode: expenseEmployeesState.wagePaymentMode,
          notes: `${expenseEmployeesState.selectedTask} - ${workerName}`,
          createdAt: new Date().toISOString()
        };

        store.transactions.unshift(newTxn);

        // Update worker pending wage balance
        if (worker) {
          store.workers = store.workers.map(w => {
            if (w.id === worker.id) {
              const currentPending = w.pendingWages || 0;
              return {
                ...w,
                pendingWages: Math.max(0, currentPending - amt),
                lastPaidDate: getTodayDate()
              };
            }
            return w;
          });
        }

        closeWagePayoutModal();
        store.showToast(`Paid ₹${amt.toLocaleString('en-IN')} wage to ${workerName}`);
      };
    }
  }
}

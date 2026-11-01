import { store } from '../state.js';
import { icons } from '../icons.js';
import { formatRupee, formatDate, formatDateTime } from '../utils/formatters.js';
import { setExpenseCategoryFilter, setSelectedExpenseCategory } from './expenseEmployeesPage.js';
import { openInstallModal, isStandaloneApp } from './installModal.js';

function renderTransactionModal() {
  if (!store.selectedTransaction) return '';
  const txn = store.selectedTransaction;
  const isInc = txn.type === 'income';
  const customer = store.customers.find((c) => c.id === txn.customerId);
  const partyName = customer ? customer.name : txn.workerName || txn.worker || txn.vendorName || txn.vendor || 'Estate Operational';
  const isUnpaid = txn.paymentStatus === 'unpaid';
  const isPartial = txn.paymentStatus === 'partial';

  return `
    <div id="txn-detail-backdrop" class="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-xs animate-fade-in" style="touch-action: none;">
      <div class="relative w-full max-w-sm bg-white rounded-t-[32px] md:rounded-[32px] p-6 border border-slate-100 shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto pointer-events-auto overscroll-contain" style="touch-action: pan-y; overscroll-behavior: contain;">
        <!-- Drag Handle for Mobile -->
        <div class="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 md:hidden"></div>

        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Transaction Details</span>
            <h3 class="text-xs font-mono font-bold text-slate-600 mt-0.5">${txn.id}</h3>
          </div>
          <button id="btn-close-txn-detail" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 active:scale-95 transition-all">
            ${icons.x("w-4 h-4")}
          </button>
        </div>

        <!-- Big Amount Card -->
        <div class="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
          <div class="text-3xl font-black ${isInc ? 'text-emerald-600' : 'text-slate-900'} tracking-tight font-display">
            ${isInc ? '+' : '-'}${formatRupee(txn.amount)}
          </div>
          <div class="flex items-center justify-center space-x-2 mt-2">
            <span class="text-xs font-bold text-slate-600">${txn.category}</span>
            <span class="w-1 h-1 rounded-full bg-slate-300"></span>
            ${isUnpaid ? `
              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200/80">Payment Due</span>
            ` : isPartial ? `
              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200/80">Partially Paid</span>
            ` : `
              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80">Completed</span>
            `}
          </div>
        </div>

        <!-- Breakdown Details -->
        <div class="space-y-2.5 text-xs mb-5">
          <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-400 font-medium">Party / Counterparty</span>
            <span class="font-bold text-slate-900 text-right">${partyName}</span>
          </div>
          ${txn.subCategory ? `
            <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-400 font-medium">Specification</span>
              <span class="font-bold text-slate-900">${txn.subCategory}</span>
            </div>
          ` : ''}
          ${txn.weightKg ? `
            <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-400 font-medium">Volume / Weight</span>
              <span class="font-bold text-slate-900">${txn.weightKg} kg ${txn.ratePerKg ? `@ ₹${txn.ratePerKg}/kg` : ''}</span>
            </div>
          ` : ''}
          ${txn.dryRubberContent ? `
            <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-400 font-medium">Dry Rubber Content (DRC)</span>
              <span class="font-bold text-emerald-700">${txn.dryRubberContent}%</span>
            </div>
          ` : ''}
          ${txn.paidAmount !== undefined && isInc ? `
            <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-400 font-medium">Collected Amount</span>
              <span class="font-bold text-emerald-600">${formatRupee(txn.paidAmount)}</span>
            </div>
          ` : ''}
          ${txn.dueAmount > 0 && isInc ? `
            <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-400 font-medium">Outstanding Due</span>
              <span class="font-bold text-rose-600">${formatRupee(txn.dueAmount)}</span>
            </div>
          ` : ''}
          <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-400 font-medium">Logged Date</span>
            <span class="font-bold text-slate-900">${formatDateTime(txn.createdAt || txn.date)}</span>
          </div>
          ${txn.paymentMode ? `
            <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-400 font-medium">Payment Mode</span>
              <span class="font-bold text-slate-900">${txn.paymentMode}</span>
            </div>
          ` : ''}
          ${txn.notes ? `
            <div class="py-1.5 border-b border-slate-100">
              <span class="text-slate-400 font-medium block mb-1">Remarks</span>
              <p class="text-slate-700 bg-slate-50 p-2.5 rounded-xl text-[11px] leading-relaxed">${txn.notes}</p>
            </div>
          ` : ''}
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center space-x-2">
          <button
            id="btn-delete-selected-txn"
            data-id="${txn.id}"
            class="py-3 px-4 rounded-full bg-rose-50 hover:bg-rose-100 active:scale-95 text-xs font-bold text-rose-700 flex items-center justify-center space-x-1.5 transition-all"
          >
            ${icons.trash("w-3.5 h-3.5")}
            <span>Delete</span>
          </button>
          <button
            id="btn-close-txn-detail-bottom"
            class="flex-1 py-3 px-4 rounded-full bg-slate-900 hover:bg-black active:scale-95 text-xs font-bold text-white transition-all text-center shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderDashboard() {
  const { estate } = store;
  const metrics = store.getMetrics();
  const totalReceivables = store.getTotalReceivables();
  const customersWithDues = store.customers.filter((c) => (Number(c.outstandingDue) || 0) > 0);
  const pendingCount = customersWithDues.length;

  const currentFilter = store.dashboardTxnFilter || 'all';

  const filteredTxns = store.transactions.filter((txn) => {
    if (currentFilter === 'income') return txn.type === 'income';
    if (currentFilter === 'expense') return txn.type === 'expense';
    if (currentFilter === 'dues') return txn.paymentStatus === 'unpaid' || txn.paymentStatus === 'partial';
    return true;
  }).slice(0, 6);

  return `
    <div class="space-y-6 pb-8 pt-1 page-view-enter">
      <!-- 1. Soft Sunrise / Peach-Coral Mesh Hero Card (Phone 2 Minimal Aesthetic) -->
      <div 
        id="card-estate-pass"
        class="w-full rounded-[28px] card-mesh-peach hero-mesh-animate p-5 flex flex-col justify-between min-h-[196px] cursor-pointer select-none relative overflow-hidden transition-all duration-300 active:scale-[0.99] card-hover-lift"
      >
        <!-- Top Row: Total Balance + Privacy Eye Toggle + Monthly Inflow Pill Badge -->
        <div class="flex items-center justify-between relative z-10">
          <div class="flex items-center space-x-2">
            <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-700/80">
              Total Balance
            </span>
            <button
              id="btn-toggle-balance-privacy"
              class="p-1 rounded-full text-slate-600/70 hover:text-slate-900 hover:bg-white/40 active:scale-90 transition-all flex items-center space-x-1"
              title="${store.isBalanceHidden ? 'Show Balance' : 'Hide Balance'}"
              aria-label="Toggle balance privacy"
            >
              ${store.isBalanceHidden ? icons.eye("w-3.5 h-3.5") : icons.eyeOff("w-3.5 h-3.5")}
            </button>
          </div>

          <div class="px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-xs font-black text-slate-800 shadow-2xs flex items-center space-x-1">
            <span class="text-emerald-600 text-[10px]">▲</span>
            <span>${store.isBalanceHidden ? '+ ••••••' : `+${formatRupee(metrics.totalIncome)}`}</span>
          </div>
        </div>

        <!-- Center: Balance & Inflow -->
        <div class="my-2 relative z-10">
          <div class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none font-display">
            ${store.isBalanceHidden ? '₹ • • • • •' : formatRupee(metrics.netCashflow)}
          </div>
          <span class="text-[11px] text-slate-600/80 mt-1.5 block font-medium">
            Estate net cashflow • ${estate.name}
          </span>
        </div>

        <!-- Bottom Row: Cardholder Name & Location -->
        <div class="flex items-center justify-between relative z-10 pt-2.5 border-t border-slate-900/10 text-xs">
          <div>
            <span class="text-xs font-black text-slate-900 tracking-tight block leading-tight">
              ${estate.owner}
            </span>
            <span class="text-[10px] font-bold text-slate-600">
              ${estate.location || 'Alanallur, Palakkad'}
            </span>
          </div>
          <span class="text-[10px] font-black text-slate-800 uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/80 border border-slate-200/60 shadow-2xs">
            Rubber Pass
          </span>
        </div>
      </div>

      <!-- Download App Quick Banner (When not in standalone app mode) -->
      ${!isStandaloneApp() ? `
        <div 
          id="banner-install-app" 
          class="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs cursor-pointer hover:border-slate-300 active:scale-[0.99] transition-all"
        >
          <div class="flex items-center space-x-3 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-[#18181b] text-white flex items-center justify-center shrink-0 shadow-xs">
              ${icons.download("w-4 h-4 stroke-[2.5]")}
            </div>
            <div class="min-w-0">
              <div class="text-xs font-black text-slate-900 truncate">Download RubberFlow</div>
              <p class="text-[11px] text-slate-500 truncate mt-0.5">Install on home screen for 100% offline estate access</p>
            </div>
          </div>
          <button
            type="button"
            class="px-3 py-1.5 rounded-full bg-[#18181b] text-white text-[10px] font-extrabold shrink-0 hover:bg-black transition-colors shadow-xs ml-2"
          >
            Install
          </button>
        </div>
      ` : ''}

      <!-- Quick Operations Navigation Hub (Phone 3 Soft 4-Color Category Tiles) -->
      <div class="space-y-2 pt-1">
        <div class="flex items-center justify-between px-1">
          <span class="text-[11px] font-black text-slate-400 uppercase tracking-wider">
            Operations Navigation Hub
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <!-- 1: Goods & Acid (Lime Gradient) -->
          <div
            id="btn-home-nav-goods"
            class="p-4 rounded-3xl card-tile-lime text-left active:scale-98 hover:scale-[1.01] transition-all flex flex-col justify-between min-h-[110px] cursor-pointer"
          >
            <div class="flex items-start justify-between">
              <div class="w-10 h-10 rounded-2xl bg-white/80 text-lime-900 flex items-center justify-center font-bold shadow-2xs shrink-0">
                ${icons.leaf("w-5 h-5")}
              </div>
              <span class="text-[10px] font-black text-lime-900/70 uppercase">Supplies</span>
            </div>
            <div class="mt-3">
              <span class="text-xs font-black tracking-tight block text-lime-950">Goods & Acid</span>
              <span class="text-[10px] text-lime-900/75 font-semibold block mt-0.5">Latex supplies</span>
            </div>
          </div>

          <!-- 2: Travel & Diesel (Coral Gradient) -->
          <div
            id="btn-home-nav-travel"
            class="p-4 rounded-3xl card-tile-coral text-left active:scale-98 hover:scale-[1.01] transition-all flex flex-col justify-between min-h-[110px] cursor-pointer"
          >
            <div class="flex items-start justify-between">
              <div class="w-10 h-10 rounded-2xl bg-white/80 text-rose-900 flex items-center justify-center font-bold shadow-2xs shrink-0">
                ${icons.truck("w-5 h-5")}
              </div>
              <span class="text-[10px] font-black text-rose-900/70 uppercase">Transit</span>
            </div>
            <div class="mt-3">
              <span class="text-xs font-black tracking-tight block text-rose-950">Travel Expense</span>
              <span class="text-[10px] text-rose-900/75 font-semibold block mt-0.5">Diesel & pickup</span>
            </div>
          </div>

          <!-- 3: Food & Canteen (Blue Gradient) -->
          <div
            id="btn-home-nav-canteen"
            class="p-4 rounded-3xl card-tile-blue text-left active:scale-98 hover:scale-[1.01] transition-all flex flex-col justify-between min-h-[110px] cursor-pointer"
          >
            <div class="flex items-start justify-between">
              <div class="w-10 h-10 rounded-2xl bg-white/80 text-sky-900 flex items-center justify-center font-bold shadow-2xs shrink-0">
                ${icons.coffee("w-5 h-5")}
              </div>
              <span class="text-[10px] font-black text-sky-900/70 uppercase">Canteen</span>
            </div>
            <div class="mt-3">
              <span class="text-xs font-black tracking-tight block text-sky-950">Food & Canteen</span>
              <span class="text-[10px] text-sky-900/75 font-semibold block mt-0.5">Staff tea & meals</span>
            </div>
          </div>

          <!-- 4: Customer Directory & Dues (Purple Gradient) -->
          <div
            id="btn-home-nav-customers"
            class="p-4 rounded-3xl card-tile-purple text-left active:scale-98 hover:scale-[1.01] transition-all flex flex-col justify-between min-h-[110px] cursor-pointer"
          >
            <div class="flex items-start justify-between">
              <div class="w-10 h-10 rounded-2xl bg-white/80 text-purple-900 flex items-center justify-center font-bold shadow-2xs shrink-0">
                ${icons.users("w-5 h-5")}
              </div>
              <span class="text-[10px] font-black text-purple-900/70 uppercase">Buyers</span>
            </div>
            <div class="mt-3">
              <span class="text-xs font-black tracking-tight block text-purple-950">Customer Dues</span>
              <span class="text-[10px] text-purple-900/75 font-semibold block mt-0.5">${store.customers.length} buyers</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Customer Dues Alert Banner (Elevated & Actionable) -->
      ${totalReceivables > 0 ? `
        <div
          id="banner-receivables"
          class="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 shadow-xs flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all hover:border-amber-400 group"
        >
          <div class="flex items-center space-x-3.5 min-w-0">
            <div class="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/20 text-amber-800 flex items-center justify-center font-black text-sm shrink-0">
              ₹
            </div>
            <div class="min-w-0">
              <div class="flex items-center space-x-2">
                <span class="text-xs font-black text-slate-900 tracking-tight">Pending Receivables</span>
                <span class="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold shrink-0">
                  ${pendingCount} ${pendingCount === 1 ? 'buyer' : 'buyers'}
                </span>
              </div>
              <span class="text-[11px] text-slate-500 font-medium truncate block">Uncollected buyer consignments</span>
            </div>
          </div>
          <div class="flex items-center space-x-2 shrink-0 ml-3">
            <span class="text-sm font-black text-amber-800 font-sans tracking-tight">
              ${formatRupee(totalReceivables)}
            </span>
            ${icons.chevronRight("w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform")}
          </div>
        </div>
      ` : ''}

      <!-- 4. Recent Transfers Feed with Category Filter Pills -->
      <div class="space-y-3 pt-1">
        <div class="flex items-center justify-between px-1">
          <h2 class="text-sm font-black text-slate-900 tracking-tight">
            Recent Transfers
          </h2>
          <button
            id="btn-view-all-transfers"
            class="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center space-x-0.5"
          >
            <span>View All</span>
            ${icons.chevronRight("w-3.5 h-3.5 text-slate-400")}
          </button>
        </div>

        <!-- Filter Pill Chips -->
        <div class="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-0.5 px-0.5">
          ${[
            { id: 'all', label: 'All' },
            { id: 'income', label: 'Income' },
            { id: 'expense', label: 'Expenses' },
            { id: 'dues', label: 'Pending Dues' }
          ].map(f => `
            <button
              data-filter="${f.id}"
              class="dashboard-filter-chip px-3 py-1 rounded-full text-[11px] font-bold tracking-tight transition-all shrink-0 ${
                currentFilter === f.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
              }"
            >
              ${f.label}
            </button>
          `).join('')}
        </div>

        <!-- Transaction Cards -->
        <div class="space-y-2">
          ${filteredTxns.length === 0 ? `
            <div class="p-8 text-center rounded-2xl bg-white border border-slate-100 text-slate-400 text-xs">
              No transactions found for this filter.
            </div>
          ` : filteredTxns.map((txn) => {
            const isInc = txn.type === 'income';
            const isUnpaid = txn.paymentStatus === 'unpaid';
            const isPartial = txn.paymentStatus === 'partial';

            const customer = store.customers.find((c) => c.id === txn.customerId);
            const title = customer ? customer.name : txn.workerName || txn.worker || txn.vendorName || txn.vendor || txn.category;
            const subtitle = txn.subCategory || txn.category;

            // Compute icon style
            let iconBg = 'bg-slate-100 text-slate-700 border-slate-200/60';
            let iconSvg = icons.arrowUp("w-4 h-4 text-slate-700 stroke-[2.5]");

            if (isInc) {
              if (isUnpaid) {
                iconBg = 'bg-rose-50 text-rose-700 border-rose-200/80';
                iconSvg = icons.clock("w-4 h-4 text-rose-600");
              } else if (isPartial) {
                iconBg = 'bg-amber-50 text-amber-700 border-amber-200/80';
                iconSvg = icons.arrowDown("w-4 h-4 text-amber-700 stroke-[2.5]");
              } else {
                iconBg = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
                iconSvg = icons.arrowDown("w-4 h-4 text-emerald-700 stroke-[2.5]");
              }
            } else {
              if (txn.category && txn.category.includes('Wages')) {
                iconBg = 'bg-amber-50 text-amber-800 border-amber-200/80';
                iconSvg = icons.users("w-4 h-4 text-amber-800");
              } else if (txn.category === 'Travel') {
                iconBg = 'bg-sky-50 text-sky-800 border-sky-200/80';
                iconSvg = icons.truck("w-4 h-4 text-sky-700");
              }
            }

            return `
              <div 
                data-txnid="${txn.id}"
                class="txn-row-card p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 shadow-2xs flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all group stagger-item card-hover-lift"
              >
                <div class="flex items-center space-x-3.5 min-w-0">
                  <div class="w-11 h-11 rounded-full flex items-center justify-center shrink-0 border ${iconBg} group-hover:scale-105 transition-transform">
                    ${iconSvg}
                  </div>

                  <div class="min-w-0">
                    <h3 class="text-xs font-black text-slate-900 truncate tracking-tight">
                      ${title}
                    </h3>
                    <p class="text-[11px] text-slate-400 font-medium truncate">
                      ${subtitle} • ${formatDate(txn.date)}
                    </p>
                  </div>
                </div>

                <div class="text-right shrink-0 ml-3 flex flex-col items-end">
                  <div class="text-sm font-black tracking-tight leading-tight font-display ${isInc ? 'text-emerald-600' : 'text-slate-900'}">
                    ${isInc ? '+' : '-'}${formatRupee(txn.amount)}
                  </div>
                  <div class="mt-0.5">
                    ${isUnpaid ? `
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200/80">
                        Due
                      </span>
                    ` : isPartial ? `
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200/80">
                        Partial
                      </span>
                    ` : `
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        Completed
                      </span>
                    `}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Transaction Receipt / Detail Sheet Modal -->
      ${renderTransactionModal()}
    </div>
  `;
}

export function attachDashboardEvents() {
  const installBanner = document.getElementById('banner-install-app');
  if (installBanner) {
    installBanner.onclick = () => openInstallModal();
  }

  const homeGoodsBtn = document.getElementById('btn-home-nav-goods');
  if (homeGoodsBtn) {
    homeGoodsBtn.onclick = () => {
      setSelectedExpenseCategory('Goods Expense');
      setExpenseCategoryFilter('Goods Expense');
      store.setActiveTab('expenses');
    };
  }

  const homeCanteenBtn = document.getElementById('btn-home-nav-canteen');
  if (homeCanteenBtn) {
    homeCanteenBtn.onclick = () => {
      setSelectedExpenseCategory('Canteen / Food');
      setExpenseCategoryFilter('Canteen / Food');
      store.setActiveTab('expenses');
    };
  }

  const homeTravelBtn = document.getElementById('btn-home-nav-travel');
  if (homeTravelBtn) {
    homeTravelBtn.onclick = () => {
      setSelectedExpenseCategory('Travel & Diesel');
      setExpenseCategoryFilter('Travel & Diesel');
      store.setActiveTab('expenses');
    };
  }

  const homeCustBtn = document.getElementById('btn-home-nav-customers');
  if (homeCustBtn) {
    homeCustBtn.onclick = () => store.setActiveTab('customers');
  }

  const viewAllBtn = document.getElementById('btn-view-all-transfers');
  if (viewAllBtn) {
    viewAllBtn.onclick = () => store.setActiveTab('ledger');
  }

  const banner = document.getElementById('banner-receivables');
  if (banner) {
    banner.onclick = () => store.setActiveTab('dues');
  }

  const eyeBtn = document.getElementById('btn-toggle-balance-privacy');
  if (eyeBtn) {
    eyeBtn.onclick = (e) => {
      e.stopPropagation();
      store.toggleBalanceVisibility();
    };
  }

  // Dashboard filter chips
  document.querySelectorAll('.dashboard-filter-chip').forEach((chip) => {
    chip.onclick = () => {
      const filter = chip.getAttribute('data-filter');
      if (filter) store.setDashboardTxnFilter(filter);
    };
  });

  // Transaction row clicks to open detail modal
  document.querySelectorAll('.txn-row-card').forEach((row) => {
    row.onclick = () => {
      const id = row.getAttribute('data-txnid');
      const found = store.transactions.find((t) => t.id === id);
      if (found) store.setSelectedTransaction(found);
    };
  });

  // Transaction Detail Modal events
  const closeDetailBtn = document.getElementById('btn-close-txn-detail');
  if (closeDetailBtn) {
    closeDetailBtn.onclick = () => store.setSelectedTransaction(null);
  }

  const closeDetailBottomBtn = document.getElementById('btn-close-txn-detail-bottom');
  if (closeDetailBottomBtn) {
    closeDetailBottomBtn.onclick = () => store.setSelectedTransaction(null);
  }

  const detailBackdrop = document.getElementById('txn-detail-backdrop');
  if (detailBackdrop) {
    detailBackdrop.onclick = (e) => {
      if (e.target === detailBackdrop) store.setSelectedTransaction(null);
    };
    detailBackdrop.addEventListener('touchmove', (e) => {
      if (e.target === detailBackdrop) e.preventDefault();
    }, { passive: false });
  }

  const deleteTxnBtn = document.getElementById('btn-delete-selected-txn');
  if (deleteTxnBtn) {
    deleteTxnBtn.onclick = () => {
      const id = deleteTxnBtn.getAttribute('data-id');
      if (id) {
        store.setConfirmModal({
          title: 'Delete Transaction?',
          message: `Are you sure you want to delete ${id}? This cannot be undone.`,
          isDanger: true,
          confirmText: 'Delete',
          onConfirm: () => {
            store.deleteTransaction(id);
            store.setSelectedTransaction(null);
            store.closeConfirmModal();
          }
        });
      }
    };
  }
}

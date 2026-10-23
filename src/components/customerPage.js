import { store } from '../state.js';
import { icons } from '../icons.js';
import { formatRupee, formatDate, formatDateTime, getTodayDate, generateTxnId } from '../utils/formatters.js';

export let customerPageState = {
  searchTerm: '',
  filterMode: 'all', // 'all', 'with_dues', 'cleared'
  showAddCustomerModal: false,
  selectedCustomerProfile: null, // Customer object for full ledger view
  newCustName: '',
  newCustPhone: '',
  newCustCity: '',
  newCustOpeningBalance: '',

  settlementAmount: '',
  settlementMode: 'UPI',
  settlementNotes: '',
  settlementDate: getTodayDate()
};

export function setCustomerFilter(mode) {
  customerPageState.filterMode = mode;
  store.notify();
}

export function openCustomerProfile(customerId) {
  const cust = store.customers.find(c => c.id === customerId);
  if (cust) {
    customerPageState.selectedCustomerProfile = cust;
    store.notify();
  }
}

export function closeCustomerProfile() {
  customerPageState.selectedCustomerProfile = null;
  store.notify();
}

export function openAddCustomerModal() {
  customerPageState.showAddCustomerModal = true;
  customerPageState.newCustName = '';
  customerPageState.newCustPhone = '';
  customerPageState.newCustCity = '';
  customerPageState.newCustOpeningBalance = '';
  store.notify();
}

export function closeAddCustomerModal() {
  customerPageState.showAddCustomerModal = false;
  store.notify();
}

export function openSettlePaymentForCustomer(customerId) {
  const cust = store.customers.find(c => c.id === customerId);
  if (cust) {
    store.settlingCustomer = cust;
    customerPageState.settlementAmount = String(cust.outstandingDue || 0);
    customerPageState.settlementMode = 'UPI';
    customerPageState.settlementNotes = 'Payment received against dues';
    customerPageState.settlementDate = getTodayDate();
    store.notify();
  }
}

export function closeSettleDrawer() {
  store.settlingCustomer = null;
  store.notify();
}

export function renderCustomerPage() {
  const { customers, estate, settlingCustomer } = store;
  const totalReceivables = store.getTotalReceivables();
  const overdueCount = customers.filter(c => (c.outstandingDue || 0) > 0).length;
  const clearedCount = customers.filter(c => (c.outstandingDue || 0) === 0).length;
  const totalBilledAll = customers.reduce((sum, c) => sum + (c.totalBilled || 0), 0);

  const filtered = customers.filter((c) => {
    const q = customerPageState.searchTerm.toLowerCase().trim();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q));

    if (!matchSearch) return false;

    if (customerPageState.filterMode === 'with_dues') return (c.outstandingDue || 0) > 0;
    if (customerPageState.filterMode === 'cleared') return (c.outstandingDue || 0) === 0;
    return true;
  });

  return `
    <div class="space-y-4 pb-8 pt-1 animate-fade-in">
      <!-- 1. Soft Sunrise / Peach-Coral Mesh Hero Card (Phone 2 Aesthetic) -->
      <div class="rounded-[28px] card-mesh-peach p-5 relative overflow-hidden select-none transition-all duration-300">
        <!-- Top Row: Label + Overdue Status Pill -->
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-700/80">
            Total Balance / Receivables
          </span>
          <span class="px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-xs font-black text-slate-800 shadow-2xs">
            ${overdueCount > 0 ? `${overdueCount} Overdue` : 'All Cleared'}
          </span>
        </div>

        <!-- Center: Big Crisp Balance -->
        <div class="my-3">
          <div class="text-3xl md:text-4xl font-black ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-900'} tracking-tight font-display leading-none">
            ${formatRupee(totalReceivables)}
          </div>
          <span class="text-[11px] text-slate-600/80 mt-1.5 block font-medium">
            Total billed: <strong class="text-slate-800 font-bold">${formatRupee(totalBilledAll)}</strong> across ${customers.length} buyers
          </span>
        </div>

        <!-- Bottom Action Row -->
        <div class="pt-2.5 flex items-center justify-between border-t border-slate-900/10">
          <span class="text-xs font-bold text-slate-700">Buyer Directory</span>
          <button
            id="btn-customer-open-add"
            class="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            ${icons.plus("w-3.5 h-3.5 text-white stroke-[2.5]")}
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      <!-- 2. Horizontal Buyer Avatars Row (Phone 1 Aesthetic) -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between px-1">
          <span class="text-[11px] font-black text-slate-400 uppercase tracking-wider">
            Quick Buyer Select
          </span>
          <span class="text-[10px] font-bold text-slate-400">${customers.length} registered</span>
        </div>

        <div class="flex items-center space-x-3 overflow-x-auto no-scrollbar py-1.5 px-1">
          <!-- [+ Add] Button (Phone 1 style) -->
          <button
            id="btn-customer-avatar-add"
            class="flex flex-col items-center space-y-1 shrink-0 cursor-pointer group active:scale-95 transition-all"
            title="Add New Customer"
          >
            <div class="w-13 h-13 rounded-full border-2 border-dashed border-slate-300 group-hover:border-slate-800 bg-white flex items-center justify-center text-slate-600 group-hover:text-slate-900 shadow-2xs transition-all">
              ${icons.plus("w-5 h-5 stroke-[2.5]")}
            </div>
            <span class="text-[10px] font-bold text-slate-600 truncate max-w-[56px] text-center">Add</span>
          </button>

          <!-- Buyer Avatar Circles -->
          ${customers.map((c, i) => {
            const initials = c.name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
            const hasDues = (c.outstandingDue || 0) > 0;
            const avatarColors = [
              'bg-lime-100 text-lime-900 border-lime-300',
              'bg-rose-100 text-rose-900 border-rose-300',
              'bg-sky-100 text-sky-900 border-sky-300',
              'bg-purple-100 text-purple-900 border-purple-300',
              'bg-amber-100 text-amber-900 border-amber-300'
            ];
            const colorCls = avatarColors[i % avatarColors.length];
            const shortName = c.name.split(' ')[0];

            return `
              <button
                data-avatar-custid="${c.id}"
                class="btn-buyer-avatar flex flex-col items-center space-y-1 shrink-0 cursor-pointer group active:scale-95 transition-all relative"
                title="${c.name} - ${hasDues ? 'Dues: ' + formatRupee(c.outstandingDue) : 'Cleared'}"
              >
                <div class="w-13 h-13 rounded-full ${colorCls} border flex items-center justify-center font-black text-xs shadow-2xs relative">
                  <span>${initials}</span>
                  ${hasDues ? `
                    <span class="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white ring-1 ring-rose-200" title="Has pending dues"></span>
                  ` : ''}
                </div>
                <span class="text-[10px] font-bold text-slate-700 truncate max-w-[62px] text-center">${shortName}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 2. Search & Filter Bar -->
      <div class="space-y-2.5">
        <div class="relative">
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            ${icons.search("w-4 h-4")}
          </div>
          <input
            id="input-customer-search"
            type="text"
            placeholder="Search customer name, phone, or town..."
            value="${customerPageState.searchTerm}"
            class="w-full pl-11 pr-10 py-3 rounded-full bg-white border border-slate-200/90 text-xs text-slate-900 placeholder:text-slate-400 shadow-xs focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium"
          />
          ${customerPageState.searchTerm ? `
            <button id="btn-clear-customer-search" class="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 text-xs">
              ${icons.x("w-3 h-3")}
            </button>
          ` : ''}
        </div>

        <!-- Filter Pills -->
        <div class="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            data-custfilter="all"
            class="btn-cust-filter px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              customerPageState.filterMode === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
            }"
          >
            ${icons.users("w-3.5 h-3.5")}
            <span>All Customers (${customers.length})</span>
          </button>

          <button
            data-custfilter="with_dues"
            class="btn-cust-filter px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              customerPageState.filterMode === 'with_dues'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
            }"
          >
            ${icons.clock("w-3.5 h-3.5")}
            <span>With Dues (${overdueCount})</span>
          </button>

          <button
            data-custfilter="cleared"
            class="btn-cust-filter px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              customerPageState.filterMode === 'cleared'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
            }"
          >
            ${icons.checkCircle("w-3.5 h-3.5")}
            <span>Cleared (${clearedCount})</span>
          </button>
        </div>
      </div>

      <!-- 3. Customers Feed -->
      <div class="space-y-3">
        ${filtered.length === 0 ? `
          <div class="py-12 text-center rounded-3xl bg-white border border-slate-100 p-6 shadow-xs">
            <div class="mx-auto mb-2 text-slate-400">${icons.users("w-10 h-10 mx-auto stroke-[1.5]")}</div>
            <h4 class="text-sm font-bold text-slate-900">No Customers Found</h4>
            <p class="text-xs text-slate-400 mt-1">No customer matched "${customerPageState.searchTerm}". Tap "Add Customer" to add one.</p>
          </div>
        ` : filtered.map((cust) => {
          const hasDue = (cust.outstandingDue || 0) > 0;
          const pct = cust.totalBilled > 0 ? Math.min(100, Math.round((cust.amountReceived / cust.totalBilled) * 100)) : 100;
          const initials = cust.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
          const cleanPhone = cust.phone ? cust.phone.replace(/[^0-9]/g, '') : '';

          return `
            <div class="rounded-[26px] bg-white p-4.5 border border-slate-100 hover:border-slate-200 shadow-2xs space-y-3 transition-all">
              <!-- Top Row: Customer Info & Balance Due -->
              <div class="flex items-start justify-between cursor-pointer card-customer-header" data-custid="${cust.id}">
                <div class="flex items-center space-x-3 min-w-0">
                  <div class="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200/80 text-slate-800 flex items-center justify-center font-black text-xs shrink-0">
                    ${initials}
                  </div>
                  <div class="min-w-0">
                    <h3 class="text-sm font-black text-slate-900 tracking-tight truncate">${cust.name}</h3>
                    <div class="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5 truncate font-medium">
                      ${cust.city ? `<span class="inline-flex items-center space-x-1">${icons.mapPin("w-3 h-3 text-slate-400 inline")} <span>${cust.city}</span></span>` : ''}
                      ${cust.phone ? `<span>•</span><span class="inline-flex items-center space-x-1">${icons.phone("w-3 h-3 text-slate-400 inline")} <span>${cust.phone}</span></span>` : ''}
                    </div>
                  </div>
                </div>

                <div class="text-right shrink-0 ml-2">
                  <span class="text-[9px] uppercase font-black tracking-wider text-slate-400 block">Balance Due</span>
                  <div class="text-base font-black font-display leading-tight ${hasDue ? 'text-rose-600' : 'text-emerald-600'}">
                    ${hasDue ? formatRupee(cust.outstandingDue) : '₹0 (Cleared)'}
                  </div>
                </div>
              </div>

              <!-- Financial Progress Bar -->
              <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div class="flex items-center justify-between text-[11px] mb-1.5 font-sans">
                  <span class="text-slate-600 font-medium">Total Billed: <strong class="text-slate-900 font-bold">${formatRupee(cust.totalBilled)}</strong></span>
                  <span class="text-emerald-700 font-bold">Collected: ${formatRupee(cust.amountReceived)} (${pct}%)</span>
                </div>
                <div class="w-full h-2 rounded-full bg-slate-200/90 overflow-hidden flex">
                  <div class="bg-emerald-500 h-full rounded-full transition-all duration-300" style="width: ${pct}%"></div>
                </div>
              </div>

              <!-- Action Buttons Row -->
              <div class="grid grid-cols-3 gap-2 pt-1">
                <!-- 1: WhatsApp Notice -->
                <button
                  data-whatsapp-id="${cust.id}"
                  class="btn-cust-whatsapp py-2.5 px-2 rounded-full text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
                    hasDue
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 active:scale-95 cursor-pointer'
                      : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
                  }"
                  ${!hasDue ? 'disabled' : ''}
                  title="${hasDue ? 'Send WhatsApp payment reminder' : 'No dues pending'}"
                >
                  ${icons.messageSquare("w-3.5 h-3.5 text-emerald-700")}
                  <span class="truncate">WhatsApp</span>
                </button>

                <!-- 2: Direct Call -->
                ${cust.phone ? `
                  <a
                    href="tel:${cleanPhone}"
                    class="py-2.5 px-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center space-x-1 active:scale-95 transition-all text-center"
                    title="Call ${cust.name}"
                  >
                    ${icons.phone("w-3.5 h-3.5 text-slate-600")}
                    <span>Call</span>
                  </a>
                ` : `
                  <button
                    disabled
                    class="py-2.5 px-2 rounded-full bg-slate-50 text-slate-400 border border-slate-200 text-xs font-bold flex items-center justify-center space-x-1 cursor-not-allowed"
                  >
                    ${icons.phone("w-3.5 h-3.5 text-slate-400")}
                    <span>Call</span>
                  </button>
                `}

                <!-- 3: Record Payment -->
                <button
                  data-custid="${cust.id}"
                  class="btn-cust-record-payment py-2.5 px-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center space-x-1 shadow-sm active:scale-95 transition-all cursor-pointer"
                  title="Receive payment from ${cust.name}"
                >
                  ${icons.creditCard("w-3.5 h-3.5 text-white")}
                  <span class="truncate">Payment</span>
                </button>
              </div>

              <!-- Quick Ledger View Pill -->
              <button
                data-custid="${cust.id}"
                class="btn-view-customer-ledger w-full py-1.5 text-center text-[11px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1"
              >
                <span>View Transaction History & Ledger</span>
                ${icons.chevronRight("w-3 h-3 text-slate-400")}
              </button>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Modals & Drawers -->
      ${settlingCustomer ? renderSettleDrawer(settlingCustomer) : ''}
      ${customerPageState.selectedCustomerProfile ? renderCustomerLedgerModal(customerPageState.selectedCustomerProfile) : ''}
      ${customerPageState.showAddCustomerModal ? renderAddCustomerModal() : ''}
    </div>
  `;
}

function renderSettleDrawer(cust) {
  const currentOutstanding = cust.outstandingDue || 0;
  const payAmt = parseFloat(customerPageState.settlementAmount) || 0;
  const remainingDueAfter = Math.max(0, currentOutstanding - payAmt);

  return `
    <div id="customer-settle-backdrop" class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in" style="touch-action: none;">
      <div id="customer-settle-sheet" class="relative w-full max-w-md max-h-[85vh] bg-white rounded-t-[36px] overflow-hidden flex flex-col z-10 animate-slide-up shadow-2xl pointer-events-auto overscroll-contain" style="padding-bottom: max(env(safe-area-inset-bottom, 0px), 20px); touch-action: pan-y; overscroll-behavior: contain;">
        <div class="pt-3 pb-1 flex justify-center items-center cursor-grab">
          <div class="w-12 h-1.5 rounded-full bg-slate-200"></div>
        </div>

        <div class="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 class="text-base font-black text-slate-900 tracking-tight">Record Payment Settlement</h2>
            <p class="text-xs text-slate-500 mt-0.5">Receive dues from ${cust.name}</p>
          </div>
          <button id="btn-close-customer-settle" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 active:scale-95 transition-all cursor-pointer">
            ${icons.x("w-4 h-4")}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-4 no-scrollbar space-y-4">
          <!-- Balance Summary Card -->
          <div class="p-4 rounded-3xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-black text-amber-800 uppercase tracking-wider block">Current Outstanding</span>
              <div class="text-xl font-black text-slate-900 font-display mt-0.5">${formatRupee(cust.outstandingDue)}</div>
              <span class="text-[11px] text-slate-500 font-medium">Total Billed: ${formatRupee(cust.totalBilled)}</span>
            </div>
            <div class="flex flex-col space-y-1.5">
              <button id="btn-cust-pay-full" class="px-3 py-1 rounded-full bg-white text-slate-900 border border-slate-200 text-[10px] font-bold shadow-xs active:scale-95 cursor-pointer">Pay Full (100%)</button>
              <button id="btn-cust-pay-half" class="px-3 py-1 rounded-full bg-white text-slate-900 border border-slate-200 text-[10px] font-bold shadow-xs active:scale-95 cursor-pointer">Pay 50%</button>
            </div>
          </div>

          <!-- Amount Input Field -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider" for="input-cust-settle-amount">
              Settlement Amount (₹)
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">₹</span>
              <input
                id="input-cust-settle-amount"
                type="number"
                step="any"
                min="1"
                placeholder="0"
                value="${customerPageState.settlementAmount}"
                class="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-display"
              />
            </div>
            <div class="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-0.5 font-medium">
              <span>Remaining balance after:</span>
              <span class="font-bold font-display ${remainingDueAfter === 0 ? 'text-emerald-600' : 'text-slate-900'}">${formatRupee(remainingDueAfter)}</span>
            </div>
          </div>

          <!-- Payment Mode -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Payment Mode
            </label>
            <div class="grid grid-cols-3 gap-2">
              ${['UPI', 'Cash', 'Bank Transfer'].map((mode) => `
                <button
                  type="button"
                  data-settlemode="${mode}"
                  class="btn-cust-settle-mode py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                    customerPageState.settlementMode === mode
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }"
                >
                  ${mode}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Settlement Date -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider" for="input-cust-settle-date">
              Receipt Date
            </label>
            <input
              id="input-cust-settle-date"
              type="date"
              value="${customerPageState.settlementDate}"
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          <!-- Notes -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider" for="input-cust-settle-notes">
              Receipt Remarks / Ref
            </label>
            <input
              id="input-cust-settle-notes"
              type="text"
              placeholder="e.g. GPay ref #92837, RTGS / Cash received"
              value="${customerPageState.settlementNotes}"
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white font-medium"
            />
          </div>

          <!-- Action Button -->
          <div class="pt-2">
            <button
              id="btn-cust-confirm-settlement"
              class="w-full py-4 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-black shadow-lg shadow-zinc-900/20 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              ${icons.checkCircle("w-4 h-4 text-emerald-400")}
              <span>Record ₹${payAmt.toLocaleString('en-IN')} Received</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCustomerLedgerModal(cust) {
  const customerTxns = store.transactions.filter(
    (t) => t.customerId === cust.id || (t.customer && t.customer.toLowerCase() === cust.name.toLowerCase())
  ).sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  const hasDue = (cust.outstandingDue || 0) > 0;

  return `
    <div id="customer-ledger-backdrop" class="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs animate-fade-in" style="touch-action: none;">
      <div class="relative w-full max-w-md bg-white rounded-t-[32px] md:rounded-[32px] p-6 border border-slate-100 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto no-scrollbar pointer-events-auto overscroll-contain" style="touch-action: pan-y; overscroll-behavior: contain;">
        <!-- Drag Handle for Mobile -->
        <div class="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 md:hidden"></div>

        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Customer Statement</span>
            <h3 class="text-base font-black text-slate-900 mt-0.5">${cust.name}</h3>
          </div>
          <button id="btn-close-customer-ledger" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 active:scale-95 transition-all cursor-pointer">
            ${icons.x("w-4 h-4")}
          </button>
        </div>

        <!-- Customer Summary Card -->
        <div class="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <div class="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
              ${cust.city ? `<span>${cust.city}</span>` : ''}
              ${cust.phone ? `<span>•</span><span>${cust.phone}</span>` : ''}
            </div>
            <div class="text-xs font-bold text-slate-700 mt-1">
              Billed: ${formatRupee(cust.totalBilled)} | Paid: ${formatRupee(cust.amountReceived)}
            </div>
          </div>
          <div class="text-right">
            <span class="text-[10px] font-bold text-slate-400 uppercase block">Balance Due</span>
            <span class="text-base font-black font-display ${hasDue ? 'text-rose-600' : 'text-emerald-600'}">
              ${hasDue ? formatRupee(cust.outstandingDue) : '₹0 (Settled)'}
            </span>
          </div>
        </div>

        <!-- Action Row in Modal -->
        <div class="flex items-center space-x-2 mb-4">
          ${hasDue ? `
            <button
              id="btn-ledger-settle-action"
              data-custid="${cust.id}"
              class="flex-1 py-2.5 px-3 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              ${icons.creditCard("w-3.5 h-3.5")}
              <span>Record Payment</span>
            </button>
          ` : ''}
          ${cust.phone ? `
            <a
              href="tel:${cust.phone.replace(/[^0-9]/g, '')}"
              class="py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
            >
              ${icons.phone("w-3.5 h-3.5")}
              <span>Call</span>
            </a>
          ` : ''}
        </div>

        <!-- Transaction History List -->
        <div class="space-y-2 mb-2">
          <span class="text-[11px] font-black uppercase tracking-wider text-slate-400 block px-1">
            Transaction History (${customerTxns.length})
          </span>

          <div class="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
            ${customerTxns.length === 0 ? `
              <div class="p-6 text-center rounded-2xl bg-slate-50 text-slate-400 text-xs">
                No recorded transaction history for this customer yet.
              </div>
            ` : customerTxns.map((txn) => {
              const isInc = txn.type === 'income';
              const isDueRecord = txn.paymentStatus === 'unpaid' || txn.paymentStatus === 'partial';

              return `
                <div class="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-center justify-between">
                  <div class="min-w-0 pr-2">
                    <div class="flex items-center space-x-1.5">
                      <span class="text-xs font-black text-slate-900 truncate">${txn.category || (isInc ? 'Rubber Lot Sale' : 'Outflow')}</span>
                      ${txn.paymentMode ? `<span class="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-slate-200 text-slate-700">${txn.paymentMode}</span>` : ''}
                    </div>
                    <span class="text-[11px] text-slate-400 block mt-0.5">
                      ${formatDate(txn.date || txn.createdAt)}
                      ${txn.weightKg ? ` • ${txn.weightKg} kg` : ''}
                      ${txn.dryRubberContent ? ` • ${txn.dryRubberContent}% DRC` : ''}
                    </span>
                    ${txn.notes ? `<p class="text-[10px] text-slate-500 mt-0.5 truncate">${txn.notes}</p>` : ''}
                  </div>
                  <div class="text-right shrink-0">
                    <span class="text-sm font-black font-display ${isInc ? 'text-emerald-700' : 'text-slate-900'}">
                      +${formatRupee(txn.amount)}
                    </span>
                    ${isDueRecord && txn.dueAmount > 0 ? `
                      <span class="text-[9px] font-bold text-rose-600 block">Due: ${formatRupee(txn.dueAmount)}</span>
                    ` : `
                      <span class="text-[9px] font-bold text-emerald-600 block">Settled</span>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAddCustomerModal() {
  return `
    <div id="add-customer-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in" style="touch-action: none;">
      <div class="relative w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl animate-slide-up pointer-events-auto overscroll-contain" style="touch-action: pan-y; overscroll-behavior: contain;">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center font-bold">
              ${icons.userPlus("w-5 h-5 stroke-[2.2]")}
            </div>
            <div>
              <h3 class="text-base font-extrabold text-slate-900 leading-tight">Add New Customer</h3>
              <p class="text-xs text-slate-400">Register rubber dealer or buyer</p>
            </div>
          </div>
          <button id="btn-close-add-customer-modal" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 active:scale-95 transition-all cursor-pointer">
            ${icons.x("w-4 h-4")}
          </button>
        </div>

        <form id="form-customer-add" class="space-y-3.5 pt-3" onsubmit="return false;">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" for="input-new-cust-name">
              Customer / Buyer Name *
            </label>
            <input
              id="input-new-cust-name"
              type="text"
              placeholder="e.g. Kottayam Rubber Traders"
              value="${customerPageState.newCustName}"
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" for="input-new-cust-phone">
              Mobile / WhatsApp Number
            </label>
            <input
              id="input-new-cust-phone"
              type="tel"
              placeholder="e.g. 98470 12345"
              value="${customerPageState.newCustPhone}"
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" for="input-new-cust-city">
              Town / Location
            </label>
            <input
              id="input-new-cust-city"
              type="text"
              placeholder="e.g. Kottayam, Pala, Kanjirappally"
              value="${customerPageState.newCustCity}"
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" for="input-new-cust-opening-bal">
              Opening Balance / Outstanding Due (₹)
            </label>
            <input
              id="input-new-cust-opening-bal"
              type="number"
              placeholder="0 (Optional)"
              value="${customerPageState.newCustOpeningBalance}"
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          <div class="flex items-center space-x-2 pt-2">
            <button
              type="button"
              id="btn-cancel-add-customer"
              class="flex-1 py-3 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-add-customer"
              class="flex-1 py-3 px-4 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function attachCustomerPageEvents() {
  // Search input
  const searchInput = document.getElementById('input-customer-search');
  if (searchInput) {
    searchInput.oninput = (e) => {
      customerPageState.searchTerm = e.target.value;
      store.notify();
    };
  }

  const clearSearchBtn = document.getElementById('btn-clear-customer-search');
  if (clearSearchBtn) {
    clearSearchBtn.onclick = () => {
      customerPageState.searchTerm = '';
      store.notify();
    };
  }

  // Filter pills
  document.querySelectorAll('.btn-cust-filter').forEach((btn) => {
    btn.onclick = () => {
      const mode = btn.getAttribute('data-custfilter');
      if (mode) {
        setCustomerFilter(mode);
      }
    };
  });

  // Horizontal Buyer Avatar row actions
  const avatarAddBtn = document.getElementById('btn-customer-avatar-add');
  if (avatarAddBtn) {
    avatarAddBtn.onclick = () => openAddCustomerModal();
  }

  document.querySelectorAll('.btn-buyer-avatar').forEach((btn) => {
    btn.onclick = () => {
      const cid = btn.getAttribute('data-avatar-custid');
      if (cid) openCustomerProfile(cid);
    };
  });

  // Open Add Customer
  const openAddBtn = document.getElementById('btn-customer-open-add');
  if (openAddBtn) {
    openAddBtn.onclick = () => openAddCustomerModal();
  }

  // Record Payment buttons on cards
  document.querySelectorAll('.btn-cust-record-payment').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const cid = btn.getAttribute('data-custid');
      if (cid) openSettlePaymentForCustomer(cid);
    };
  });

  // View Customer Ledger / statement
  document.querySelectorAll('.btn-view-customer-ledger').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const cid = btn.getAttribute('data-custid');
      if (cid) openCustomerProfile(cid);
    };
  });

  // Tap Customer Card Header
  document.querySelectorAll('.card-customer-header').forEach((card) => {
    card.onclick = () => {
      const cid = card.getAttribute('data-custid');
      if (cid) openCustomerProfile(cid);
    };
  });

  // WhatsApp reminder
  document.querySelectorAll('.btn-cust-whatsapp').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const cid = btn.getAttribute('data-whatsapp-id');
      const cust = store.customers.find((c) => c.id === cid);
      if (!cust) return;

      const rawPhone = cust.phone ? cust.phone.replace(/[^0-9]/g, '') : '';
      if (!rawPhone) {
        store.showToast('No phone number recorded for this customer', 'error');
        return;
      }

      const intlPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
      const text = encodeURIComponent(
        `Hello ${cust.name}, greetings from ${store.estate.owner} (${store.estate.name}). This is a friendly statement reminder regarding your current balance due of ₹${(cust.outstandingDue || 0).toLocaleString('en-IN')}. Kindly arrange the settlement at your earliest convenience. Thank you!`
      );
      window.open(`https://wa.me/${intlPhone}?text=${text}`, '_blank');
    };
  });

  // Settle Drawer Events
  if (store.settlingCustomer) {
    const backdrop = document.getElementById('customer-settle-backdrop');
    const closeBtn = document.getElementById('btn-close-customer-settle');
    const payFullBtn = document.getElementById('btn-cust-pay-full');
    const payHalfBtn = document.getElementById('btn-cust-pay-half');
    const amtInput = document.getElementById('input-cust-settle-amount');
    const dateInput = document.getElementById('input-cust-settle-date');
    const notesInput = document.getElementById('input-cust-settle-notes');
    const confirmBtn = document.getElementById('btn-cust-confirm-settlement');

    if (backdrop) {
      backdrop.onclick = (e) => {
        if (e.target === backdrop) closeSettleDrawer();
      };
      backdrop.addEventListener('touchmove', (e) => {
        if (e.target === backdrop) e.preventDefault();
      }, { passive: false });
    }

    if (closeBtn) closeBtn.onclick = () => closeSettleDrawer();

    if (payFullBtn) {
      payFullBtn.onclick = () => {
        customerPageState.settlementAmount = String(store.settlingCustomer.outstandingDue || 0);
        store.notify();
      };
    }

    if (payHalfBtn) {
      payHalfBtn.onclick = () => {
        const half = Math.round((store.settlingCustomer.outstandingDue || 0) / 2);
        customerPageState.settlementAmount = String(half);
        store.notify();
      };
    }

    if (amtInput) {
      amtInput.oninput = (e) => {
        customerPageState.settlementAmount = e.target.value;
      };
    }

    if (dateInput) {
      dateInput.onchange = (e) => {
        customerPageState.settlementDate = e.target.value;
      };
    }

    if (notesInput) {
      notesInput.oninput = (e) => {
        customerPageState.settlementNotes = e.target.value;
      };
    }

    document.querySelectorAll('.btn-cust-settle-mode').forEach((btn) => {
      btn.onclick = () => {
        const mode = btn.getAttribute('data-settlemode');
        if (mode) {
          customerPageState.settlementMode = mode;
          store.notify();
        }
      };
    });

    if (confirmBtn) {
      confirmBtn.onclick = () => {
        const amt = parseFloat(customerPageState.settlementAmount);
        if (!amt || amt <= 0) {
          store.showToast('Please enter a valid settlement amount', 'error');
          return;
        }

        const cust = store.settlingCustomer;
        const currentDue = cust.outstandingDue || 0;
        const newDue = Math.max(0, currentDue - amt);
        const newReceived = (cust.amountReceived || 0) + amt;

        // Update customer in store
        store.customers = store.customers.map((c) => {
          if (c.id === cust.id) {
            return {
              ...c,
              outstandingDue: newDue,
              amountReceived: newReceived,
              lastSettledDate: customerPageState.settlementDate
            };
          }
          return c;
        });

        // Add receipt settlement transaction to history
        store.transactions.unshift({
          id: generateTxnId('TXN-SETTLE'),
          date: customerPageState.settlementDate,
          type: 'income',
          category: 'Customer Payment',
          subCategory: 'Due Settlement',
          amount: amt,
          paidAmount: amt,
          dueAmount: newDue,
          paymentMode: customerPageState.settlementMode,
          paymentStatus: newDue === 0 ? 'paid' : 'partial',
          customerId: cust.id,
          customer: cust.name,
          notes: customerPageState.settlementNotes || `Settlement from ${cust.name}`,
          createdAt: new Date().toISOString()
        });

        const settledCustName = cust.name;
        closeSettleDrawer();
        store.showToast(`Received ₹${amt.toLocaleString('en-IN')} payment from ${settledCustName}`);
      };
    }
  }

  // Customer Ledger Modal Events
  if (customerPageState.selectedCustomerProfile) {
    const backdrop = document.getElementById('customer-ledger-backdrop');
    const closeBtn = document.getElementById('btn-close-customer-ledger');
    const settleActionBtn = document.getElementById('btn-ledger-settle-action');

    if (backdrop) {
      backdrop.onclick = (e) => {
        if (e.target === backdrop) closeCustomerProfile();
      };
      backdrop.addEventListener('touchmove', (e) => {
        if (e.target === backdrop) e.preventDefault();
      }, { passive: false });
    }

    if (closeBtn) closeBtn.onclick = () => closeCustomerProfile();

    if (settleActionBtn) {
      settleActionBtn.onclick = () => {
        const cid = settleActionBtn.getAttribute('data-custid');
        closeCustomerProfile();
        if (cid) openSettlePaymentForCustomer(cid);
      };
    }
  }

  // Add Customer Modal Events
  if (customerPageState.showAddCustomerModal) {
    const backdrop = document.getElementById('add-customer-backdrop');
    const closeBtn = document.getElementById('btn-close-add-customer-modal');
    const cancelBtn = document.getElementById('btn-cancel-add-customer');
    const form = document.getElementById('form-customer-add');

    if (backdrop) {
      backdrop.onclick = (e) => {
        if (e.target === backdrop) closeAddCustomerModal();
      };
      backdrop.addEventListener('touchmove', (e) => {
        if (e.target === backdrop) e.preventDefault();
      }, { passive: false });
    }

    if (closeBtn) closeBtn.onclick = () => closeAddCustomerModal();
    if (cancelBtn) cancelBtn.onclick = () => closeAddCustomerModal();

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('input-new-cust-name');
        const phoneInput = document.getElementById('input-new-cust-phone');
        const cityInput = document.getElementById('input-new-cust-city');
        const openBalInput = document.getElementById('input-new-cust-opening-bal');

        const name = nameInput ? nameInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const city = cityInput ? cityInput.value.trim() : '';
        const openingBal = openBalInput ? parseFloat(openBalInput.value) || 0 : 0;

        if (!name) {
          store.showToast('Please enter customer name', 'error');
          return;
        }

        const newCustId = generateTxnId('CUST');
        const newCustomer = {
          id: newCustId,
          name,
          phone: phone || '',
          city: city || 'Kottayam',
          totalBilled: openingBal,
          amountReceived: 0,
          outstandingDue: openingBal,
          createdAt: new Date().toISOString()
        };

        store.customers.push(newCustomer);
        closeAddCustomerModal();
        store.showToast(`Customer "${name}" added successfully`);
      };
    }
  }
}

import { store } from '../state.js';
import { icons } from '../icons.js';
import { formatRupee, formatDate, formatDateTime, getTodayDate, generateTxnId } from '../utils/formatters.js';

let indCustState = {
  activeTxnFilter: 'all', // 'all', 'sales', 'payments'
  isPaymentDrawerOpen: false,
  paymentAmount: '',
  paymentMode: 'UPI',
  paymentDate: getTodayDate(),
  paymentNotes: 'Payment received against dues'
};

export function openIndividualCustomerPayment(defaultAmount = '') {
  indCustState.isPaymentDrawerOpen = true;
  indCustState.paymentAmount = String(defaultAmount || '');
  indCustState.paymentMode = 'UPI';
  indCustState.paymentDate = getTodayDate();
  indCustState.paymentNotes = 'Payment received against dues';
  store.notify();
}

export function closeIndividualCustomerPayment() {
  indCustState.isPaymentDrawerOpen = false;
  store.notify();
}

export function renderIndividualCustomerPage(customerId) {
  const cust = store.customers.find((c) => c.id === customerId);

  if (!cust) {
    return `
      <div class="py-16 text-center space-y-4 animate-fade-in">
        <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          ${icons.alertCircle("w-8 h-8")}
        </div>
        <h2 class="text-base font-black text-slate-800">Customer Not Found</h2>
        <p class="text-xs text-slate-500 max-w-xs mx-auto">This customer record may have been deleted or the link is expired.</p>
        <button
          id="btn-ind-back-notfound"
          class="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold active:scale-95 transition-all shadow-sm"
        >
          Back to Customers
        </button>
      </div>
    `;
  }

  const allCustomerTxns = store.transactions.filter(
    (t) => t.customerId === cust.id || (t.customer && t.customer.toLowerCase() === cust.name.toLowerCase())
  ).sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  const salesTxns = allCustomerTxns.filter((t) => t.category !== 'Customer Payments' && t.category !== 'Customer Payment' && t.subCategory !== 'Due Settlement');
  const paymentTxns = allCustomerTxns.filter((t) => t.category === 'Customer Payments' || t.category === 'Customer Payment' || t.subCategory === 'Due Settlement');

  const filteredTxns = indCustState.activeTxnFilter === 'sales'
    ? salesTxns
    : indCustState.activeTxnFilter === 'payments'
    ? paymentTxns
    : allCustomerTxns;

  const hasDue = (cust.outstandingDue || 0) > 0;
  const pctCollected = cust.totalBilled > 0
    ? Math.min(100, Math.round(((cust.amountReceived || 0) / cust.totalBilled) * 100))
    : 100;

  const initials = cust.name.split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const cleanPhone = cust.phone ? cust.phone.replace(/[^0-9]/g, '') : '';

  // WhatsApp reminder message template
  const waMsg = encodeURIComponent(
    `Hello ${cust.name},\n\nThis is a friendly statement from ${store.estate?.name || 'our Rubber Estate'}.\n\n` +
    `• Outstanding Balance Due: ₹${(cust.outstandingDue || 0).toLocaleString('en-IN')}\n` +
    `• Total Billed: ₹${(cust.totalBilled || 0).toLocaleString('en-IN')}\n` +
    `• Total Paid: ₹${(cust.amountReceived || 0).toLocaleString('en-IN')}\n\n` +
    `Kindly arrange the settlement at your convenience via UPI or Bank Transfer. Thank you!`
  );

  return `
    <div class="space-y-4 pb-12 pt-1 animate-fade-in">
      <!-- 1. Top Navigation Bar: Back Button & Customer Header -->
      <div class="flex items-center justify-between">
        <button
          id="btn-ind-back-to-customers"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 text-xs font-bold active:scale-95 transition-all shadow-2xs cursor-pointer"
        >
          ${icons.chevronLeft("w-4 h-4 text-slate-800")}
          <span>All Customers</span>
        </button>

        <div class="flex items-center space-x-1.5">
          <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono font-bold tracking-tight">
            ${cust.id}
          </span>
          <button
            id="btn-ind-delete-customer"
            data-custid="${cust.id}"
            class="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            title="Delete this customer"
          >
            ${icons.trash("w-3.5 h-3.5")}
          </button>
        </div>
      </div>

      <!-- 2. Customer Hero Card (Peach Mesh Theme) -->
      <div class="rounded-[30px] card-mesh-peach p-5.5 relative overflow-hidden shadow-xs select-none">
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3.5 min-w-0">
            <div class="w-13 h-13 rounded-2xl bg-white/95 text-slate-900 border border-slate-200/80 flex items-center justify-center font-black text-sm shadow-2xs shrink-0">
              ${initials}
            </div>
            <div class="min-w-0">
              <h2 class="text-lg font-black text-slate-900 tracking-tight leading-tight truncate">
                ${cust.name}
              </h2>
              <div class="flex items-center space-x-2 text-xs text-slate-600 font-medium mt-0.5 truncate">
                ${cust.city ? `<span class="inline-flex items-center space-x-1">${icons.mapPin("w-3 h-3 text-slate-500 inline")} <span>${cust.city}</span></span>` : ''}
                ${cust.phone ? `<span>•</span><span>${cust.phone}</span>` : ''}
              </div>
            </div>
          </div>

          <span class="px-3 py-1 rounded-full text-xs font-black shadow-2xs shrink-0 ${
            hasDue ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
          }">
            ${hasDue ? 'Payment Due' : 'All Settled'}
          </span>
        </div>

        <!-- Big Outstanding Balance Display -->
        <div class="my-4 pt-2">
          <span class="text-[10px] font-black uppercase tracking-wider text-slate-600/90 block">
            Current Outstanding Balance
          </span>
          <div class="text-3xl md:text-4xl font-black font-display tracking-tight leading-tight mt-0.5 ${
            hasDue ? 'text-rose-600' : 'text-emerald-700'
          }">
            ${hasDue ? formatRupee(cust.outstandingDue) : '₹0.00'}
          </div>
        </div>

        <!-- Financial Progress Bar -->
        <div class="p-3.5 rounded-2xl bg-white/80 backdrop-blur-xs border border-white/60 space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-600 font-medium">
              Billed: <strong class="text-slate-900 font-bold">${formatRupee(cust.totalBilled)}</strong>
            </span>
            <span class="text-emerald-800 font-bold">
              Paid: ${formatRupee(cust.amountReceived)} (${pctCollected}%)
            </span>
          </div>
          <div class="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden flex">
            <div class="bg-emerald-500 h-full rounded-full transition-all duration-300" style="width: ${pctCollected}%"></div>
          </div>
        </div>
      </div>

      <!-- 3. Primary Quick Action Buttons Grid -->
      <div class="grid grid-cols-3 gap-2 pt-0.5">
        <!-- 1: Record Payment Button -->
        <button
          id="btn-ind-record-payment"
          class="py-3 px-2 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex flex-col items-center justify-center space-y-1 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          ${icons.creditCard("w-4 h-4 text-emerald-400")}
          <span class="truncate">Record Payment</span>
        </button>

        <!-- 2: Direct Call Button -->
        ${cleanPhone ? `
          <a
            href="tel:${cleanPhone}"
            class="py-3 px-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-xs font-bold flex flex-col items-center justify-center space-y-1 active:scale-95 transition-all shadow-2xs text-center"
          >
            ${icons.phone("w-4 h-4 text-slate-700")}
            <span>Call Buyer</span>
          </a>
        ` : `
          <button
            disabled
            class="py-3 px-2 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 text-xs font-bold flex flex-col items-center justify-center space-y-1 cursor-not-allowed opacity-60"
          >
            ${icons.phone("w-4 h-4 text-slate-400")}
            <span>Call Buyer</span>
          </button>
        `}

        <!-- 3: WhatsApp Statement Button -->
        ${cleanPhone ? `
          <a
            href="https://wa.me/91${cleanPhone}?text=${waMsg}"
            target="_blank"
            rel="noopener noreferrer"
            class="py-3 px-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 text-emerald-900 text-xs font-bold flex flex-col items-center justify-center space-y-1 active:scale-95 transition-all shadow-2xs text-center"
          >
            ${icons.messageSquare("w-4 h-4 text-emerald-600")}
            <span class="truncate">WhatsApp</span>
          </a>
        ` : `
          <button
            disabled
            class="py-3 px-2 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 text-xs font-bold flex flex-col items-center justify-center space-y-1 cursor-not-allowed opacity-60"
          >
            ${icons.messageSquare("w-4 h-4 text-slate-400")}
            <span>WhatsApp</span>
          </button>
        `}
      </div>

      <!-- 4. Detailed Customer Information Card -->
      <div class="rounded-3xl bg-white p-4.5 border border-slate-100 shadow-2xs space-y-2.5">
        <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-0.5">
          Buyer Account Details
        </span>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span class="text-[10px] text-slate-400 font-bold block uppercase">Town / District</span>
            <span class="font-bold text-slate-800 text-xs mt-0.5 block truncate">${cust.city || 'Kerala, India'}</span>
          </div>

          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span class="text-[10px] text-slate-400 font-bold block uppercase">Phone Number</span>
            <span class="font-bold text-slate-800 text-xs mt-0.5 block truncate">${cust.phone || 'Not recorded'}</span>
          </div>

          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span class="text-[10px] text-slate-400 font-bold block uppercase">Account Created</span>
            <span class="font-bold text-slate-800 text-xs mt-0.5 block truncate">${formatDate(cust.lastPurchaseDate) || 'Active Buyer'}</span>
          </div>

          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span class="text-[10px] text-slate-400 font-bold block uppercase">Ledger Entries</span>
            <span class="font-bold text-slate-800 text-xs mt-0.5 block truncate">${allCustomerTxns.length} records</span>
          </div>
        </div>
      </div>

      <!-- 5. Statement & Ledger History Section -->
      <div class="space-y-3 pt-1">
        <div class="flex items-center justify-between px-1">
          <div>
            <h3 class="text-xs font-black text-slate-900 tracking-tight uppercase">
              Transaction History & Statements
            </h3>
            <span class="text-[11px] text-slate-400 font-medium">All sales and payment settlements</span>
          </div>
          <span class="text-xs font-bold text-slate-500">${filteredTxns.length} records</span>
        </div>

        <!-- Filter Sub-Tabs -->
        <div class="flex items-center space-x-1.5 p-1 rounded-full bg-slate-100 max-w-sm">
          <button
            data-indfilter="all"
            class="btn-ind-txn-filter flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all text-center cursor-pointer ${
              indCustState.activeTxnFilter === 'all'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }"
          >
            All (${allCustomerTxns.length})
          </button>
          <button
            data-indfilter="sales"
            class="btn-ind-txn-filter flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all text-center cursor-pointer ${
              indCustState.activeTxnFilter === 'sales'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }"
          >
            Rubber Sales (${salesTxns.length})
          </button>
          <button
            data-indfilter="payments"
            class="btn-ind-txn-filter flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all text-center cursor-pointer ${
              indCustState.activeTxnFilter === 'payments'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }"
          >
            Payments (${paymentTxns.length})
          </button>
        </div>

        <!-- Transaction Feed -->
        <div class="space-y-2.5">
          ${filteredTxns.length === 0 ? `
            <div class="p-8 text-center rounded-3xl bg-white border border-slate-100 shadow-2xs space-y-2">
              <div class="text-slate-400 mx-auto">${icons.fileText("w-8 h-8 mx-auto stroke-[1.5]")}</div>
              <h4 class="text-xs font-bold text-slate-800">No Transactions Found</h4>
              <p class="text-[11px] text-slate-400">No entries recorded under "${indCustState.activeTxnFilter}" for this buyer.</p>
            </div>
          ` : filteredTxns.map((txn) => {
            const isSettlement = txn.category === 'Customer Payments' || txn.category === 'Customer Payment' || txn.subCategory === 'Due Settlement';
            const isDuePending = txn.dueAmount && Number(txn.dueAmount) > 0;

            return `
              <div class="p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 shadow-2xs flex items-center justify-between transition-all">
                <div class="flex items-start space-x-3 min-w-0 pr-2">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                    isSettlement
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-lime-50 text-lime-800 border-lime-200'
                  }">
                    ${isSettlement ? icons.creditCard("w-5 h-5") : icons.truck("w-5 h-5")}
                  </div>

                  <div class="min-w-0">
                    <div class="flex items-center space-x-1.5">
                      <h4 class="text-xs font-black text-slate-900 truncate tracking-tight">
                        ${txn.category || (isSettlement ? 'Payment Settlement' : 'Rubber Sales')}
                      </h4>
                      ${txn.paymentMode ? `
                        <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                          ${txn.paymentMode}
                        </span>
                      ` : ''}
                    </div>

                    <span class="text-[11px] text-slate-400 block mt-0.5">
                      ${formatDate(txn.date || txn.createdAt)}
                      ${txn.weightKg ? ` • ${txn.weightKg} kg` : ''}
                      ${txn.dryRubberContent ? ` • ${txn.dryRubberContent}% DRC` : ''}
                    </span>

                    ${txn.notes ? `
                      <p class="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                        ${txn.notes}
                      </p>
                    ` : ''}
                  </div>
                </div>

                <div class="flex items-center space-x-2 shrink-0 ml-2">
                  <div class="text-right">
                    <span class="text-sm font-black font-display block leading-tight ${
                      isSettlement ? 'text-emerald-700' : 'text-slate-900'
                    }">
                      ${isSettlement ? '+' : '+'}${formatRupee(txn.amount)}
                    </span>
                    ${isDuePending ? `
                      <span class="text-[9px] font-bold text-rose-600 block">Due: ${formatRupee(txn.dueAmount)}</span>
                    ` : `
                      <span class="text-[9px] font-bold ${isSettlement ? 'text-emerald-600' : 'text-slate-400'} block">
                        ${isSettlement ? 'Receipt' : 'Settled'}
                      </span>
                    `}
                  </div>

                  <!-- Working Delete Button for Customer Transaction -->
                  <button
                    data-del-txnid="${txn.id}"
                    class="btn-ind-del-txn w-7 h-7 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer"
                    title="Delete transaction entry"
                  >
                    ${icons.trash("w-3.5 h-3.5")}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 6. Payment Settlement Bottom Sheet Modal (when open) -->
      ${indCustState.isPaymentDrawerOpen ? renderPaymentSettlementDrawer(cust) : ''}
    </div>
  `;
}

function renderPaymentSettlementDrawer(cust) {
  const remainingDue = Math.max(0, (cust.outstandingDue || 0) - (Number(indCustState.paymentAmount) || 0));

  return `
    <div id="ind-payment-backdrop" class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in" style="touch-action: none;">
      <div id="ind-payment-sheet" class="relative w-full max-w-md bg-white rounded-t-[36px] overflow-hidden flex flex-col z-10 animate-slide-up shadow-2xl pointer-events-auto max-h-[85vh] overflow-y-auto" style="padding-bottom: max(env(safe-area-inset-bottom, 0px), 24px); touch-action: pan-y;">
        <div class="pt-3 pb-1 flex justify-center items-center cursor-grab">
          <div class="w-12 h-1.5 rounded-full bg-slate-200"></div>
        </div>

        <div class="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-base font-black text-slate-900 tracking-tight">Record Payment Settlement</h3>
            <p class="text-xs text-slate-500 mt-0.5">Receive dues from ${cust.name}</p>
          </div>
          <button id="btn-close-ind-payment" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 active:scale-95 transition-all cursor-pointer">
            ${icons.x("w-4 h-4")}
          </button>
        </div>

        <div class="p-6 space-y-4">
          <!-- Balance Summary Banner -->
          <div class="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-black text-amber-800 uppercase tracking-wider block">Outstanding Due</span>
              <div class="text-xl font-black text-slate-900 font-display mt-0.5">${formatRupee(cust.outstandingDue)}</div>
            </div>
            <div class="flex items-center space-x-1.5">
              <button id="btn-ind-pay-full" class="px-3 py-1.5 rounded-full bg-white text-slate-900 border border-slate-200 text-xs font-bold shadow-xs active:scale-95 cursor-pointer">Pay Full</button>
              <button id="btn-ind-pay-half" class="px-3 py-1.5 rounded-full bg-white text-slate-900 border border-slate-200 text-xs font-bold shadow-xs active:scale-95 cursor-pointer">50%</button>
            </div>
          </div>

          <!-- Amount Input Field -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider" for="input-ind-payment-amount">
              Settlement Amount (₹)
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">₹</span>
              <input
                id="input-ind-payment-amount"
                type="number"
                step="any"
                min="1"
                placeholder="0"
                value="${indCustState.paymentAmount}"
                class="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white font-display"
              />
            </div>
            <div class="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-0.5 font-medium">
              <span>Remaining balance after:</span>
              <span class="font-bold font-display ${remainingDue === 0 ? 'text-emerald-600' : 'text-slate-900'}">
                ${formatRupee(remainingDue)}
              </span>
            </div>
          </div>

          <!-- Payment Mode -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Payment Mode</label>
            <div class="grid grid-cols-3 gap-2">
              ${['UPI', 'Cash', 'Bank Transfer'].map((m) => `
                <button
                  type="button"
                  data-mode="${m}"
                  class="btn-ind-pay-mode py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                    indCustState.paymentMode === m
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }"
                >
                  ${m}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Date Input -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider" for="input-ind-payment-date">Date</label>
            <input
              id="input-ind-payment-date"
              type="date"
              value="${indCustState.paymentDate}"
              class="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <!-- Remarks Input -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider" for="input-ind-payment-notes">Remarks</label>
            <input
              id="input-ind-payment-notes"
              type="text"
              placeholder="e.g. GPay ref #92837, RTGS / Cash received"
              value="${indCustState.paymentNotes}"
              class="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <!-- Confirm Button -->
          <div class="pt-2">
            <button
              id="btn-ind-confirm-settlement"
              class="w-full py-3.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-black shadow-lg shadow-zinc-900/20 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              ${icons.checkCircle("w-4 h-4 text-emerald-400")}
              <span>Record Settlement</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function attachIndividualCustomerPageEvents() {
  const backBtn = document.getElementById('btn-ind-back-to-customers') || document.getElementById('btn-ind-back-notfound');
  if (backBtn) {
    backBtn.onclick = () => store.clearSelectedCustomer();
  }

  // Delete Customer Button
  const delCustBtn = document.getElementById('btn-ind-delete-customer');
  if (delCustBtn) {
    delCustBtn.onclick = () => {
      const cid = delCustBtn.getAttribute('data-custid');
      const cust = store.customers.find(c => c.id === cid);
      if (cust) {
        store.openConfirmModal({
          title: 'Delete Customer?',
          message: `Are you sure you want to permanently delete "${cust.name}"? All profile information will be removed.`,
          confirmText: 'Delete',
          isDanger: true,
          onConfirm: () => {
            store.deleteCustomer(cid);
            store.closeConfirmModal();
          }
        });
      }
    };
  }

  // Filter Sub-Tabs
  document.querySelectorAll('.btn-ind-txn-filter').forEach((btn) => {
    btn.onclick = () => {
      const f = btn.getAttribute('data-indfilter');
      if (f) {
        indCustState.activeTxnFilter = f;
        store.notify();
      }
    };
  });

  // Open Record Payment Drawer
  const openPayBtn = document.getElementById('btn-ind-record-payment');
  if (openPayBtn) {
    openPayBtn.onclick = () => {
      const cust = store.customers.find(c => c.id === store.selectedCustomerId);
      openIndividualCustomerPayment(cust?.outstandingDue || '');
    };
  }

  // Working Delete Button on Individual Customer Transactions
  document.querySelectorAll('.btn-ind-del-txn').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const tid = btn.getAttribute('data-del-txnid');
      if (tid) {
        store.openConfirmModal({
          title: 'Delete Transaction?',
          message: 'Are you sure you want to permanently delete this transaction? The customer ledger and balances will be automatically recalculated.',
          confirmText: 'Delete',
          isDanger: true,
          onConfirm: () => {
            store.deleteTransaction(tid);
            store.closeConfirmModal();
          }
        });
      }
    };
  });

  // Payment Drawer Events
  if (indCustState.isPaymentDrawerOpen) {
    const backdrop = document.getElementById('ind-payment-backdrop');
    const closeBtn = document.getElementById('btn-close-ind-payment');
    const payFullBtn = document.getElementById('btn-ind-pay-full');
    const payHalfBtn = document.getElementById('btn-ind-pay-half');
    const amtInput = document.getElementById('input-ind-payment-amount');
    const dateInput = document.getElementById('input-ind-payment-date');
    const notesInput = document.getElementById('input-ind-payment-notes');
    const confirmBtn = document.getElementById('btn-ind-confirm-settlement');

    if (backdrop) backdrop.onclick = (e) => { if (e.target === backdrop) closeIndividualCustomerPayment(); };
    if (closeBtn) closeBtn.onclick = () => closeIndividualCustomerPayment();

    const cust = store.customers.find(c => c.id === store.selectedCustomerId);

    if (payFullBtn && cust) {
      payFullBtn.onclick = () => {
        indCustState.paymentAmount = String(cust.outstandingDue || 0);
        store.notify();
      };
    }

    if (payHalfBtn && cust) {
      payHalfBtn.onclick = () => {
        const half = Math.round((cust.outstandingDue || 0) / 2);
        indCustState.paymentAmount = String(half);
        store.notify();
      };
    }

    if (amtInput) {
      amtInput.oninput = (e) => {
        indCustState.paymentAmount = e.target.value;
      };
    }

    if (dateInput) {
      dateInput.onchange = (e) => {
        indCustState.paymentDate = e.target.value;
      };
    }

    if (notesInput) {
      notesInput.oninput = (e) => {
        indCustState.paymentNotes = e.target.value;
      };
    }

    document.querySelectorAll('.btn-ind-pay-mode').forEach((btn) => {
      btn.onclick = () => {
        const m = btn.getAttribute('data-mode');
        if (m) {
          indCustState.paymentMode = m;
          store.notify();
        }
      };
    });

    if (confirmBtn && cust) {
      confirmBtn.onclick = () => {
        const numAmt = parseFloat(indCustState.paymentAmount);
        if (!numAmt || numAmt <= 0) {
          store.showToast('Please enter a valid amount', 'error');
          return;
        }

        store.recordCustomerSettlement({
          customerId: cust.id,
          amount: numAmt,
          paymentMode: indCustState.paymentMode,
          notes: indCustState.paymentNotes,
          date: indCustState.paymentDate
        });

        closeIndividualCustomerPayment();
      };
    }
  }
}

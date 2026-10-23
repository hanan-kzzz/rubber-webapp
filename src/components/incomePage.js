import { store } from '../state.js';
import { icons } from '../icons.js';
import { formatRupee, formatDate, getTodayDate } from '../utils/formatters.js';

let keypadAmount = '0';
let selectedCustomerId = '';
let selectedCategory = 'Customer Payments';
let selectedService = 'Tapping Service';

const SERVICES = ['Tapping Service', 'Estate Maintenance', 'Field Clearing', 'Processing Service', 'General Service'];

export function renderIncomePage() {
  const { customers, transactions } = store;

  if (!selectedCustomerId && customers.length > 0) {
    selectedCustomerId = customers[0].id;
  }

  const selectedCust = customers.find((c) => c.id === selectedCustomerId);
  const incomeTxns = transactions.filter((t) => t.type === 'income');
  const fastAmounts = ['5000', '10000', '25000', '50000', '100000'];

  const keypadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'backspace']
  ];

  return `
    <div class="space-y-4 pb-8 pt-1">
      <!-- 1. Horizontal Contact Avatar Carousel -->
      <div>
        <div class="flex items-center justify-between px-1 mb-2">
          <span class="text-[11px] font-black text-slate-400 uppercase tracking-wider">
            Select Customer / Client
          </span>
          <span class="text-[11px] font-bold text-lime-700 bg-lime-50 px-2 py-0.5 rounded-full border border-lime-200/60">
            ${customers.length} Clients
          </span>
        </div>

        <div class="flex items-center space-x-3 overflow-x-auto no-scrollbar py-1 px-0.5">
          <!-- + Add New Button -->
          <button
            id="btn-keypad-add-customer"
            class="flex flex-col items-center space-y-1.5 shrink-0 group active:scale-95 transition-transform"
          >
            <div class="w-13 h-13 w-[52px] h-[52px] rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-600 group-hover:bg-slate-200 transition-colors shadow-2xs">
              ${icons.plus("w-5 h-5")}
            </div>
            <span class="text-[11px] font-bold text-slate-600">Add</span>
          </button>

          <!-- Contact Avatar Pills -->
          ${customers.map((c) => {
            const isSelected = selectedCustomerId === c.id;
            const initials = c.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
            return `
              <button
                data-custid="${c.id}"
                class="btn-select-contact flex flex-col items-center space-y-1.5 shrink-0 group active:scale-95 transition-transform"
              >
                <div class="w-[52px] h-[52px] rounded-full flex items-center justify-center font-black text-xs transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md ring-2 ring-lime-400 ring-offset-2'
                    : 'bg-white border border-slate-200/90 text-slate-800 hover:bg-slate-50 shadow-2xs'
                }">
                  ${initials}
                </div>
                <div class="text-center">
                  <span class="text-[11px] font-bold truncate max-w-[64px] block leading-tight ${
                    isSelected ? 'text-slate-900' : 'text-slate-500'
                  }">
                    ${c.name.split(' ')[0]}
                  </span>
                  <span class="text-[9px] text-slate-400 font-semibold block leading-tight truncate max-w-[64px]">${c.city || 'Kerala'}</span>
                </div>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 2. Clean Amount Card with Blinking Cursor -->
      <div class="rounded-[28px] bg-white p-5 border border-slate-100 shadow-xs text-center space-y-2">
        <div class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-lime-50 text-lime-900 text-xs font-bold border border-lime-200/70">
          <span class="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></span>
          <span>Service Payment</span>
          <span>•</span>
          <span class="truncate max-w-[140px]">${selectedCust ? selectedCust.name : 'Direct Customer'}</span>
        </div>

        <div class="py-1">
          <div class="text-5xl font-black text-slate-900 font-display tracking-tight flex items-center justify-center">
            <span>₹</span>
            <span id="display-keypad-amount">${keypadAmount === '0' ? '0' : keypadAmount}</span>
            <span class="w-0.5 h-9 bg-lime-500 animate-pulse ml-1 inline-block rounded-full"></span>
          </div>
          <p class="text-xs text-slate-400 mt-1 font-medium">Tap numbers or quick pills to enter payment amount</p>
        </div>

        <!-- Fast Amount Pills -->
        <div class="flex items-center justify-center space-x-2 pt-1 overflow-x-auto no-scrollbar">
          ${fastAmounts.map((amt) => {
            const isMatch = keypadAmount === amt;
            return `
              <button
                data-fastamt="${amt}"
                class="btn-fast-amt px-3.5 py-1.5 rounded-full text-xs font-bold font-sans transition-all active:scale-95 ${
                  isMatch
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }"
              >
                ₹${Number(amt).toLocaleString('en-IN')}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 3. Service Type Chips -->
      <div class="flex items-center space-x-1.5 overflow-x-auto no-scrollbar px-0.5">
        ${SERVICES.map((s) => {
          const isSelected = selectedService === s;
          return `
            <button
              data-grade="${s}"
              class="btn-select-grade px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 active:scale-95 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
              }"
            >
              ${s}
            </button>
          `;
        }).join('')}
      </div>

      <!-- 4. Clean Touch Numeric Keypad -->
      <div class="rounded-[28px] bg-white p-3.5 border border-slate-100 shadow-xs">
        <div class="grid grid-cols-3 gap-2">
          ${keypadKeys.map((row) => row.map((key) => {
            const isDel = key === 'backspace';
            return `
              <button
                data-key="${key}"
                class="keypad-btn h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 active:bg-slate-200 text-xl font-bold text-slate-900 flex items-center justify-center transition-all select-none font-display border border-slate-100/60"
              >
                ${isDel ? icons.backspace("w-5 h-5 text-slate-700") : key}
              </button>
            `;
          }).join('')).join('')}
        </div>
      </div>

      <!-- 5. Full-Width Confirm Action Button -->
      <div class="pt-0.5">
        <button
          id="btn-confirm-transfer"
          class="w-full py-4 rounded-full bg-slate-900 hover:bg-black active:scale-98 text-white font-black text-sm shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>Record Customer Payment (₹${keypadAmount === '0' ? '0' : keypadAmount})</span>
          ${icons.arrowRight("w-4 h-4 text-white")}
        </button>
      </div>

      <!-- 6. Recent Customer Payments Feed -->
      <div class="space-y-3 pt-2">
        <span class="text-xs font-black text-slate-400 uppercase tracking-wider px-1 block">
          Recent Customer Payments
        </span>

        <div class="space-y-2">
          ${incomeTxns.slice(0, 5).map((txn) => {
            const cust = customers.find(c => c.id === txn.customerId);
            return `
              <div class="p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 flex items-center justify-between shadow-2xs transition-all">
                <div class="flex items-center space-x-3.5 min-w-0">
                  <div class="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                    ${icons.arrowDown("w-4 h-4 text-emerald-700 stroke-[2.5]")}
                  </div>
                  <div class="min-w-0">
                    <h4 class="text-xs font-black text-slate-900 truncate tracking-tight">${cust ? cust.name : txn.category}</h4>
                    <span class="text-[11px] text-slate-400 truncate block">${txn.subCategory || 'Consignment'} • ${formatDate(txn.date)}</span>
                  </div>
                </div>
                <div class="text-right shrink-0 ml-3 flex flex-col items-end">
                  <span class="text-sm font-black font-display text-emerald-600">+${formatRupee(txn.amount)}</span>
                  <span class="inline-flex items-center px-1.5 py-0.2 mt-0.5 rounded-full text-[9px] font-extrabold ${
                    txn.paymentStatus === 'unpaid' ? 'bg-rose-50 text-rose-700 border border-rose-200/80' : txn.paymentStatus === 'partial' ? 'bg-amber-50 text-amber-800 border border-amber-200/80' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                  }">${txn.paymentStatus === 'unpaid' ? 'Due' : txn.paymentStatus === 'partial' ? 'Partial' : 'Completed'}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

export function attachIncomePageEvents() {
  // Contact Selection
  document.querySelectorAll('.btn-select-contact').forEach((btn) => {
    btn.onclick = () => {
      selectedCustomerId = btn.getAttribute('data-custid');
      store.notify();
    };
  });

  // Service Selection
  document.querySelectorAll('.btn-select-grade').forEach((btn) => {
    btn.onclick = () => {
      selectedService = btn.getAttribute('data-grade');
      store.notify();
    };
  });

  // Fast Amount Chips
  document.querySelectorAll('.btn-fast-amt').forEach((btn) => {
    btn.onclick = () => {
      keypadAmount = btn.getAttribute('data-fastamt');
      store.notify();
    };
  });

  // Keypad clicks
  document.querySelectorAll('.keypad-btn').forEach((btn) => {
    btn.onclick = () => {
      const key = btn.getAttribute('data-key');
      if (key === 'backspace') {
        if (keypadAmount.length > 1) {
          keypadAmount = keypadAmount.slice(0, -1);
        } else {
          keypadAmount = '0';
        }
      } else if (key === '.') {
        if (!keypadAmount.includes('.')) {
          keypadAmount += '.';
        }
      } else {
        if (keypadAmount === '0') {
          keypadAmount = key;
        } else if (keypadAmount.length < 9) {
          keypadAmount += key;
        }
      }

      const display = document.getElementById('display-keypad-amount');
      if (display) display.textContent = keypadAmount;
      const confirmBtn = document.getElementById('btn-confirm-transfer');
      if (confirmBtn) {
        confirmBtn.querySelector('span').textContent = `Record Customer Payment (₹${keypadAmount === '0' ? '0' : keypadAmount})`;
      }
    };
  });

  // Add customer
  const addCustBtn = document.getElementById('btn-keypad-add-customer');
  if (addCustBtn) {
    addCustBtn.onclick = () => {
      store.setAddBuyerModalOpen(true);
    };
  }

  // Confirm Transfer
  const confirmBtn = document.getElementById('btn-confirm-transfer');
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      const numAmt = parseFloat(keypadAmount) || 0;
      if (numAmt <= 0) {
        store.showToast('Please enter an amount', 'error');
        return;
      }

      const customer = store.customers.find((c) => c.id === selectedCustomerId);
      const customerName = customer ? customer.name : 'Customer';

      store.addTransaction({
        type: 'income',
        category: 'Customer Payments',
        subCategory: selectedService,
        amount: numAmt,
        customerId: selectedCustomerId,
        customerName,
        paymentStatus: 'paid',
        date: getTodayDate(),
        notes: `Service fee payment from ${customerName} (${selectedService})`,
      });

      keypadAmount = '0';
      store.showToast(`Recorded ₹${numAmt.toLocaleString('en-IN')} from ${customerName}`);
      store.setActiveTab('dashboard');
    };
  }
}

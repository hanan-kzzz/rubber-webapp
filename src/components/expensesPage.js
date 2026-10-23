import { store } from '../state.js';
import { icons } from '../icons.js';
import { formatRupee, formatDate, getTodayDate } from '../utils/formatters.js';

let expenseKeypadAmount = '0';
let selectedCategory = 'Travel & Diesel';
let expenseNote = '';
let expensePaymentMode = 'Cash'; // Cash, UPI, Bank Transfer

const CATEGORIES = [
  { id: 'Travel & Diesel', label: 'Travel & Diesel', icon: (cls) => icons.truck(cls) },
  { id: 'Canteen / Food', label: 'Canteen / Food', icon: (cls) => icons.coffee(cls) },
  { id: 'Maintenance', label: 'Maintenance', icon: (cls) => icons.wrench(cls) },
  { id: 'Misc', label: 'Misc', icon: (cls) => icons.wallet(cls) }
];

export function setSelectedExpenseCategory(cat) {
  if (CATEGORIES.some(c => c.id === cat)) {
    selectedCategory = cat;
  }
}

export function renderExpensesPage() {
  const expenseTxns = store.transactions.filter((t) => t.type === 'expense');
  const fastAmounts = ['200', '500', '1000', '2500', '5000'];

  const keypadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'backspace']
  ];

  return `
    <div class="space-y-4 pb-8 pt-1">
      <!-- 1. Category Selector Pills -->
      <div>
        <span class="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-2 px-1">
          Select Expense Category
        </span>

        <div class="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 px-0.5">
          ${CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return `
              <button
                data-expcat="${cat.id}"
                class="btn-select-expcat px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 active:scale-95 shrink-0 flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
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
      <div class="rounded-[28px] bg-white p-5 border border-slate-100 shadow-xs text-center space-y-2">
        <div class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/70">
          <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span>Outflow</span>
          <span>•</span>
          <span class="font-bold">${selectedCategory}</span>
        </div>

        <div class="py-1">
          <div class="text-5xl font-black text-slate-900 font-display tracking-tight flex items-center justify-center">
            <span>₹</span>
            <span id="display-expense-amount">${expenseKeypadAmount === '0' ? '0' : expenseKeypadAmount}</span>
            <span class="w-0.5 h-9 bg-rose-500 animate-pulse ml-1 inline-block rounded-full"></span>
          </div>
          <p class="text-xs text-slate-400 mt-1 font-medium">Tap numbers or quick pills to enter amount</p>
        </div>

        <!-- Fast Amount Pills -->
        <div class="flex items-center justify-center space-x-2 pt-1 overflow-x-auto no-scrollbar">
          ${fastAmounts.map((amt) => {
            const isMatch = expenseKeypadAmount === amt;
            return `
              <button
                data-fastexp="${amt}"
                class="btn-fast-exp px-3.5 py-1.5 rounded-full text-xs font-bold font-sans transition-all active:scale-95 ${
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

      <!-- 3. Clean Touch Numeric Keypad -->
      <div class="rounded-[28px] bg-white p-3.5 border border-slate-100 shadow-xs">
        <div class="grid grid-cols-3 gap-2">
          ${keypadKeys.map((row) => row.map((key) => {
            const isDel = key === 'backspace';
            return `
              <button
                data-expkey="${key}"
                class="exp-keypad-btn h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 active:bg-slate-200 text-xl font-bold text-slate-900 flex items-center justify-center transition-all select-none font-display border border-slate-100/60"
              >
                ${isDel ? icons.backspace("w-5 h-5 text-slate-700") : key}
              </button>
            `;
          }).join('')).join('')}
        </div>
      </div>

      <!-- 4. Payment Mode & Payee / Vendor Note Input -->
      <div class="space-y-2 px-0.5">
        <!-- Payment Mode Toggle -->
        <div class="flex items-center justify-center space-x-2">
          <span class="text-xs font-bold text-slate-400 mr-1">Paid via:</span>
          ${[
            { id: 'Cash', label: 'Cash' },
            { id: 'UPI', label: 'UPI / GPay' },
            { id: 'Bank Transfer', label: 'Bank' }
          ].map(m => `
            <button
              data-mode="${m.id}"
              class="btn-exp-mode px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                expensePaymentMode === m.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
              }"
            >
              ${m.label}
            </button>
          `).join('')}
        </div>

        <div class="relative">
          <input
            id="input-exp-notes"
            type="text"
            placeholder="Vendor / Note (e.g. Formic Acid, HP Petrol Pump, Canteen)"
            value="${expenseNote}"
            class="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 font-medium shadow-2xs"
          />
        </div>
      </div>

      <!-- 5. Full-Width Confirm Action Button -->
      <div class="pt-0.5">
        <button
          id="btn-confirm-expense"
          class="w-full py-4 rounded-full bg-slate-900 hover:bg-black active:scale-98 text-white font-black text-sm shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>Record Expense Outflow (₹${expenseKeypadAmount === '0' ? '0' : expenseKeypadAmount})</span>
          ${icons.arrowRight("w-4 h-4 text-white")}
        </button>
      </div>

      <!-- 6. Recent Operational Expenses Feed -->
      <div class="space-y-3 pt-2">
        <span class="text-xs font-black text-slate-400 uppercase tracking-wider px-1 block">
          Recent Operational Spend
        </span>

        <div class="space-y-2">
          ${expenseTxns.slice(0, 5).map((txn) => {
            let catIcon = icons.arrowUp("w-4 h-4 text-slate-700 stroke-[2.5]");
            let iconClass = 'bg-slate-100 text-slate-700 border-slate-200/70';

            if (txn.category && txn.category.includes('Wages')) {
              catIcon = icons.users("w-4 h-4 text-amber-800");
              iconClass = 'bg-amber-50 text-amber-800 border-amber-200/80';
            } else if (txn.category === 'Travel') {
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
                  <div class="w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${iconClass}">
                    ${catIcon}
                  </div>
                  <div class="min-w-0">
                    <h4 class="text-xs font-black text-slate-900 truncate tracking-tight">${txn.category}</h4>
                    <span class="text-[11px] text-slate-400 truncate block">${txn.notes || 'Operating spend'} • ${formatDate(txn.date)}</span>
                  </div>
                </div>
                <div class="text-right shrink-0 ml-3 flex flex-col items-end">
                  <span class="text-sm font-black font-display text-slate-900">-${formatRupee(txn.amount)}</span>
                  <span class="text-[9px] text-slate-400 font-bold block mt-0.5">${txn.paymentMode || 'Cash'}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

export function attachExpensesPageEvents() {
  document.querySelectorAll('.btn-select-expcat').forEach((btn) => {
    btn.onclick = () => {
      selectedCategory = btn.getAttribute('data-expcat');
      store.notify();
    };
  });

  document.querySelectorAll('.btn-fast-exp').forEach((btn) => {
    btn.onclick = () => {
      expenseKeypadAmount = btn.getAttribute('data-fastexp');
      store.notify();
    };
  });

  document.querySelectorAll('.btn-exp-mode').forEach((btn) => {
    btn.onclick = () => {
      expensePaymentMode = btn.getAttribute('data-mode');
      store.notify();
    };
  });

  document.querySelectorAll('.exp-keypad-btn').forEach((btn) => {
    btn.onclick = () => {
      const key = btn.getAttribute('data-expkey');
      if (key === 'backspace') {
        if (expenseKeypadAmount.length > 1) {
          expenseKeypadAmount = expenseKeypadAmount.slice(0, -1);
        } else {
          expenseKeypadAmount = '0';
        }
      } else if (key === '.') {
        if (!expenseKeypadAmount.includes('.')) expenseKeypadAmount += '.';
      } else {
        if (expenseKeypadAmount === '0') expenseKeypadAmount = key;
        else if (expenseKeypadAmount.length < 9) expenseKeypadAmount += key;
      }

      const d = document.getElementById('display-expense-amount');
      if (d) d.textContent = expenseKeypadAmount;
      const confirmBtn = document.getElementById('btn-confirm-expense');
      if (confirmBtn) {
        confirmBtn.querySelector('span').textContent = `Record Expense Outflow (₹${expenseKeypadAmount === '0' ? '0' : expenseKeypadAmount})`;
      }
    };
  });

  const notesInput = document.getElementById('input-exp-notes');
  if (notesInput) {
    notesInput.oninput = (e) => {
      expenseNote = e.target.value;
    };
  }

  const confirmBtn = document.getElementById('btn-confirm-expense');
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      const num = parseFloat(expenseKeypadAmount) || 0;
      if (num <= 0) {
        store.showToast('Please enter an amount', 'error');
        return;
      }

      store.addTransaction({
        type: 'expense',
        category: selectedCategory,
        subCategory: selectedCategory,
        amount: num,
        notes: expenseNote || selectedCategory,
        paymentMode: expensePaymentMode,
        date: getTodayDate(),
      });

      expenseKeypadAmount = '0';
      expenseNote = '';
      store.showToast(`Recorded ₹${num.toLocaleString('en-IN')} expense via ${expensePaymentMode}`);
      store.setActiveTab('dashboard');
    };
  }
}

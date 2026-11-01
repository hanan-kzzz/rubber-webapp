import { store } from '../state.js';
import { icons } from '../icons.js';
import { formatRupee, formatDate, getTodayDate, generateTxnId } from '../utils/formatters.js';

let indEmpState = {
  isWageDrawerOpen: false,
  wageAmount: '750',
  wageTask: 'Morning Tapping',
  wagePaymentMode: 'Cash',
  wageDate: getTodayDate(),
  wageNotes: ''
};

const WAGE_TASKS = [
  'Morning Tapping',
  'Latex Collection',
  'Weeding & Spray',
  'Smokehouse Curing',
  'Field Clearing'
];

export function openIndividualEmployeeWagePayout(defaultWage = '750') {
  indEmpState.isWageDrawerOpen = true;
  indEmpState.wageAmount = String(defaultWage || '750');
  indEmpState.wageTask = 'Morning Tapping';
  indEmpState.wagePaymentMode = 'Cash';
  indEmpState.wageDate = getTodayDate();
  indEmpState.wageNotes = '';
  store.notify();
}

export function closeIndividualEmployeeWagePayout() {
  indEmpState.isWageDrawerOpen = false;
  store.notify();
}

export function renderIndividualEmployeePage(workerId) {
  const worker = store.workers.find((w) => w.id === workerId);

  if (!worker) {
    return `
      <div class="py-16 text-center space-y-4 animate-fade-in">
        <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          ${icons.alertCircle("w-8 h-8")}
        </div>
        <h2 class="text-base font-black text-slate-800">Employee Not Found</h2>
        <p class="text-xs text-slate-500 max-w-xs mx-auto">This employee record may have been removed or the link is expired.</p>
        <button
          id="btn-ind-back-emp-notfound"
          class="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold active:scale-95 transition-all shadow-sm"
        >
          Back to Employees
        </button>
      </div>
    `;
  }

  const workerTxns = store.transactions.filter(
    (t) => t.category === 'Staff Wages' && (t.workerId === worker.id || t.worker === worker.name || t.notes?.includes(worker.name))
  ).sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  const totalPaid = store.getWorkerTotalPaid(worker.id, worker.name);
  const initials = worker.name.split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const cleanPhone = worker.phone ? worker.phone.replace(/[^0-9]/g, '') : '';
  const hasPendingWages = (worker.pendingWages || 0) > 0;

  return `
    <div class="space-y-4 pb-12 pt-1 animate-fade-in">
      <!-- 1. Top Navigation Bar: Back Button & Actions -->
      <div class="flex items-center justify-between">
        <button
          id="btn-ind-back-to-employees"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 text-xs font-bold active:scale-95 transition-all shadow-2xs cursor-pointer"
        >
          ${icons.chevronLeft("w-4 h-4 text-slate-800")}
          <span>All Employees</span>
        </button>

        <div class="flex items-center space-x-1.5">
          <span class="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-bold tracking-tight">
            ${worker.id}
          </span>
          <button
            id="btn-ind-delete-worker"
            data-workerid="${worker.id}"
            class="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            title="Delete this employee"
          >
            ${icons.trash("w-3.5 h-3.5")}
          </button>
        </div>
      </div>

      <!-- 2. Employee Hero Card (Amber/Sand Mesh Theme) -->
      <div class="rounded-[30px] card-mesh-sand p-5.5 relative overflow-hidden shadow-xs select-none">
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3.5 min-w-0">
            <div class="w-13 h-13 rounded-2xl bg-amber-200/80 text-amber-950 border border-amber-300 flex items-center justify-center font-black text-sm shadow-2xs shrink-0">
              ${initials}
            </div>
            <div class="min-w-0">
              <h2 class="text-lg font-black text-slate-900 tracking-tight leading-tight truncate">
                ${worker.name}
              </h2>
              <span class="text-xs font-extrabold text-amber-900 block mt-0.5">${worker.role}</span>
              ${worker.phone ? `
                <div class="flex items-center space-x-1 text-xs text-slate-600 font-medium mt-0.5 truncate">
                  ${icons.phone("w-3 h-3 text-slate-500 inline")}
                  <span>${worker.phone}</span>
                </div>
              ` : ''}
            </div>
          </div>

          <span class="px-3 py-1 rounded-full text-xs font-black shadow-2xs shrink-0 ${
            worker.active !== false ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'
          }">
            ${worker.active !== false ? 'Active' : 'Inactive'}
          </span>
        </div>

        <!-- Wages Summary Metric Grid -->
        <div class="grid grid-cols-3 gap-2 mt-5">
          <div class="p-3 rounded-2xl bg-white/80 backdrop-blur-xs border border-white/60 text-center">
            <span class="text-[9px] uppercase font-bold text-slate-500 block">Daily Rate</span>
            <span class="text-sm font-black text-slate-900 font-display mt-0.5 block">
              ₹${worker.defaultDailyWage || 750}
            </span>
          </div>

          <div class="p-3 rounded-2xl bg-white/80 backdrop-blur-xs border border-white/60 text-center">
            <span class="text-[9px] uppercase font-bold text-slate-500 block">Total Paid</span>
            <span class="text-sm font-black text-emerald-800 font-display mt-0.5 block">
              ${formatRupee(totalPaid)}
            </span>
          </div>

          <div class="p-3 rounded-2xl bg-white/80 backdrop-blur-xs border border-white/60 text-center">
            <span class="text-[9px] uppercase font-bold text-slate-500 block">Pending Due</span>
            <span class="text-sm font-black font-display mt-0.5 block ${
              hasPendingWages ? 'text-amber-900' : 'text-emerald-700'
            }">
              ${formatRupee(worker.pendingWages || 0)}
            </span>
          </div>
        </div>
      </div>

      <!-- 3. Primary Quick Actions -->
      <div class="grid grid-cols-2 gap-2 pt-0.5">
        <!-- 1: Pay Wage Button -->
        <button
          id="btn-ind-pay-wages"
          class="py-3 px-3 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          ${icons.banknote("w-4 h-4 text-amber-400")}
          <span>Pay Daily Wage</span>
        </button>

        <!-- 2: Direct Call Button -->
        ${cleanPhone ? `
          <a
            href="tel:${cleanPhone}"
            class="py-3 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-xs font-bold flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-2xs text-center"
          >
            ${icons.phone("w-4 h-4 text-slate-700")}
            <span>Call Worker</span>
          </a>
        ` : `
          <button
            disabled
            class="py-3 px-3 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 text-xs font-bold flex items-center justify-center space-x-2 cursor-not-allowed opacity-60"
          >
            ${icons.phone("w-4 h-4 text-slate-400")}
            <span>Call Worker</span>
          </button>
        `}
      </div>

      <!-- 4. Employee Profile Info Card -->
      <div class="rounded-3xl bg-white p-4.5 border border-slate-100 shadow-2xs space-y-2.5">
        <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-0.5">
          Workforce Profile Details
        </span>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span class="text-[10px] text-slate-400 font-bold block uppercase">Primary Task</span>
            <span class="font-bold text-slate-800 text-xs mt-0.5 block truncate">${worker.role || 'Rubber Tapper'}</span>
          </div>

          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span class="text-[10px] text-slate-400 font-bold block uppercase">Registered Phone</span>
            <span class="font-bold text-slate-800 text-xs mt-0.5 block truncate">${worker.phone || 'None'}</span>
          </div>

          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span class="text-[10px] text-slate-400 font-bold block uppercase">Standard Daily Rate</span>
            <span class="font-bold text-slate-800 text-xs mt-0.5 block truncate">₹${worker.defaultDailyWage || 750} / Shift</span>
          </div>

          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span class="text-[10px] text-slate-400 font-bold block uppercase">Recorded Payouts</span>
            <span class="font-bold text-slate-800 text-xs mt-0.5 block truncate">${workerTxns.length} payment slips</span>
          </div>
        </div>
      </div>

      <!-- 5. Wage Payout History & Shifts Section -->
      <div class="space-y-3 pt-1">
        <div class="flex items-center justify-between px-1">
          <div>
            <h3 class="text-xs font-black text-slate-900 tracking-tight uppercase">
              Wage Payouts & Shifts
            </h3>
            <span class="text-[11px] text-slate-400 font-medium">Recorded payment slips for ${worker.name}</span>
          </div>
          <span class="text-xs font-bold text-slate-500">${workerTxns.length} slips</span>
        </div>

        <!-- Wage Payout Feed -->
        <div class="space-y-2.5">
          ${workerTxns.length === 0 ? `
            <div class="p-8 text-center rounded-3xl bg-white border border-slate-100 shadow-2xs space-y-2">
              <div class="text-slate-400 mx-auto">${icons.banknote("w-8 h-8 mx-auto stroke-[1.5]")}</div>
              <h4 class="text-xs font-bold text-slate-800">No Wage Slips Recorded</h4>
              <p class="text-[11px] text-slate-400">Tap "Pay Daily Wage" above to record a wage payment for ${worker.name}.</p>
            </div>
          ` : workerTxns.map((txn) => `
            <div class="p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 shadow-2xs flex items-center justify-between transition-all">
              <div class="flex items-start space-x-3 min-w-0 pr-2">
                <div class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0">
                  ${icons.banknote("w-5 h-5")}
                </div>

                <div class="min-w-0">
                  <div class="flex items-center space-x-1.5">
                    <h4 class="text-xs font-black text-slate-900 truncate tracking-tight">
                      ${txn.subCategory || txn.notes || 'Daily Wage Payout'}
                    </h4>
                    ${txn.paymentMode ? `
                      <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                        ${txn.paymentMode}
                      </span>
                    ` : ''}
                  </div>

                  <span class="text-[11px] text-slate-400 block mt-0.5">
                    ${formatDate(txn.date || txn.createdAt)} • Shift recorded
                  </span>

                  ${txn.notes && txn.notes !== txn.subCategory ? `
                    <p class="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                      ${txn.notes}
                    </p>
                  ` : ''}
                </div>
              </div>

              <div class="flex items-center space-x-2 shrink-0 ml-2">
                <div class="text-right">
                  <span class="text-sm font-black font-display text-slate-900 block leading-tight">
                    -${formatRupee(txn.amount)}
                  </span>
                  <span class="text-[9px] font-bold text-emerald-700 block">Paid</span>
                </div>

                <!-- Working Delete Button for Wage Entry -->
                <button
                  data-del-wageid="${txn.id}"
                  class="btn-ind-del-wage w-7 h-7 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer"
                  title="Delete wage payout slip"
                >
                  ${icons.trash("w-3.5 h-3.5")}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 6. Pay Wage Bottom Sheet Drawer (when open) -->
      ${indEmpState.isWageDrawerOpen ? renderPayWageDrawer(worker) : ''}
    </div>
  `;
}

function renderPayWageDrawer(worker) {
  const fastAmounts = ['500', '750', '900', '1200', '1500'];

  return `
    <div id="ind-wage-backdrop" class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in" style="touch-action: none;">
      <div id="ind-wage-sheet" class="relative w-full max-w-md bg-white rounded-t-[36px] overflow-hidden flex flex-col z-10 animate-slide-up shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto" style="padding-bottom: max(env(safe-area-inset-bottom, 0px), 24px); touch-action: pan-y;">
        <div class="pt-3 pb-1 flex justify-center items-center cursor-grab">
          <div class="w-12 h-1.5 rounded-full bg-slate-200"></div>
        </div>

        <div class="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-base font-black text-slate-900 tracking-tight">Pay Daily Wage</h3>
            <p class="text-xs text-slate-500 mt-0.5">Disburse payment to ${worker.name}</p>
          </div>
          <button id="btn-close-ind-wage" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 active:scale-95 transition-all cursor-pointer">
            ${icons.x("w-4 h-4")}
          </button>
        </div>

        <div class="p-6 space-y-4">
          <!-- Amount Input Field -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider" for="input-ind-wage-amount">
              Wage Payout Amount (₹)
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">₹</span>
              <input
                id="input-ind-wage-amount"
                type="number"
                step="any"
                min="1"
                placeholder="750"
                value="${indEmpState.wageAmount}"
                class="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white font-display"
              />
            </div>

            <!-- Fast Amount Shortcuts -->
            <div class="flex items-center space-x-1.5 pt-1 overflow-x-auto no-scrollbar">
              ${fastAmounts.map((amt) => `
                <button
                  type="button"
                  data-fastamt="${amt}"
                  class="btn-ind-fast-wage px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                    indEmpState.wageAmount === amt
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }"
                >
                  ₹${amt}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Payment Mode -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Payment Mode</label>
            <div class="grid grid-cols-3 gap-2">
              ${['Cash', 'UPI', 'Bank Transfer'].map((m) => `
                <button
                  type="button"
                  data-mode="${m}"
                  class="btn-ind-wage-mode py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                    indEmpState.wagePaymentMode === m
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
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider" for="input-ind-wage-date">Shift Date</label>
            <input
              id="input-ind-wage-date"
              type="date"
              value="${indEmpState.wageDate}"
              class="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <!-- Notes -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider" for="input-ind-wage-notes">Remarks</label>
            <input
              id="input-ind-wage-notes"
              type="text"
              placeholder="e.g. Block A early shift, overtime, bonus"
              value="${indEmpState.wageNotes}"
              class="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <!-- Confirm Button -->
          <div class="pt-2">
            <button
              id="btn-ind-confirm-wage"
              class="w-full py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-black shadow-lg shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              ${icons.checkCircle("w-4 h-4 text-white")}
              <span>Record Wage Payout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function attachIndividualEmployeePageEvents() {
  const backBtn = document.getElementById('btn-ind-back-to-employees') || document.getElementById('btn-ind-back-emp-notfound');
  if (backBtn) {
    backBtn.onclick = () => store.clearSelectedWorker();
  }

  // Delete Employee Button
  const delWorkerBtn = document.getElementById('btn-ind-delete-worker');
  if (delWorkerBtn) {
    delWorkerBtn.onclick = () => {
      const wid = delWorkerBtn.getAttribute('data-workerid');
      const worker = store.workers.find(w => w.id === wid);
      if (worker) {
        store.openConfirmModal({
          title: 'Delete Employee?',
          message: `Are you sure you want to permanently delete "${worker.name}" from your employee roster?`,
          confirmText: 'Delete',
          isDanger: true,
          onConfirm: () => {
            store.deleteWorker(wid);
            store.closeConfirmModal();
          }
        });
      }
    };
  }

  // Open Pay Wage Drawer
  const openWageBtn = document.getElementById('btn-ind-pay-wages');
  if (openWageBtn) {
    openWageBtn.onclick = () => {
      const worker = store.workers.find(w => w.id === store.selectedWorkerId);
      openIndividualEmployeeWagePayout(worker?.defaultDailyWage || '750');
    };
  }

  // Working Delete Button on Wage Entry
  document.querySelectorAll('.btn-ind-del-wage').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const tid = btn.getAttribute('data-del-wageid');
      if (tid) {
        store.openConfirmModal({
          title: 'Delete Wage Entry?',
          message: 'Are you sure you want to permanently delete this wage payout entry? The employee pending balance will be restored.',
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

  // Wage Payout Drawer Events
  if (indEmpState.isWageDrawerOpen) {
    const backdrop = document.getElementById('ind-wage-backdrop');
    const closeBtn = document.getElementById('btn-close-ind-wage');
    const amtInput = document.getElementById('input-ind-wage-amount');
    const dateInput = document.getElementById('input-ind-wage-date');
    const notesInput = document.getElementById('input-ind-wage-notes');
    const confirmBtn = document.getElementById('btn-ind-confirm-wage');

    if (backdrop) backdrop.onclick = (e) => { if (e.target === backdrop) closeIndividualEmployeeWagePayout(); };
    if (closeBtn) closeBtn.onclick = () => closeIndividualEmployeeWagePayout();

    const worker = store.workers.find(w => w.id === store.selectedWorkerId);

    if (amtInput) {
      amtInput.oninput = (e) => {
        indEmpState.wageAmount = e.target.value;
      };
    }

    if (dateInput) {
      dateInput.onchange = (e) => {
        indEmpState.wageDate = e.target.value;
      };
    }

    if (notesInput) {
      notesInput.oninput = (e) => {
        indEmpState.wageNotes = e.target.value;
      };
    }

    function updateIndWageModalUI() {
      if (amtInput && amtInput.value !== indEmpState.wageAmount) {
        amtInput.value = indEmpState.wageAmount;
      }

      document.querySelectorAll('.btn-ind-fast-wage').forEach((b) => {
        const isMatch = b.getAttribute('data-fastamt') === indEmpState.wageAmount;
        if (isMatch) {
          b.className = 'btn-ind-fast-wage px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 bg-slate-900 text-white shadow-xs cursor-pointer';
        } else {
          b.className = 'btn-ind-fast-wage px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer';
        }
      });

      document.querySelectorAll('.btn-ind-wage-mode').forEach((b) => {
        const isMatch = b.getAttribute('data-mode') === indEmpState.wagePaymentMode;
        if (isMatch) {
          b.className = 'btn-ind-wage-mode py-2.5 rounded-2xl text-xs font-bold border transition-all bg-slate-900 text-white border-slate-900 shadow-xs cursor-pointer';
        } else {
          b.className = 'btn-ind-wage-mode py-2.5 rounded-2xl text-xs font-bold border transition-all bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer';
        }
      });
    }

    if (amtInput) {
      amtInput.oninput = (e) => {
        indEmpState.wageAmount = e.target.value;
        document.querySelectorAll('.btn-ind-fast-wage').forEach((b) => {
          const isMatch = b.getAttribute('data-fastamt') === indEmpState.wageAmount;
          if (isMatch) {
            b.className = 'btn-ind-fast-wage px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 bg-slate-900 text-white shadow-xs cursor-pointer';
          } else {
            b.className = 'btn-ind-fast-wage px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer';
          }
        });
      };
    }

    document.querySelectorAll('.btn-ind-fast-wage').forEach((btn) => {
      btn.onclick = () => {
        const amt = btn.getAttribute('data-fastamt');
        if (amt) {
          indEmpState.wageAmount = amt;
          updateIndWageModalUI();
        }
      };
    });

    document.querySelectorAll('.btn-ind-wage-mode').forEach((btn) => {
      btn.onclick = () => {
        const mode = btn.getAttribute('data-mode');
        if (mode) {
          indEmpState.wagePaymentMode = mode;
          updateIndWageModalUI();
        }
      };
    });

    if (confirmBtn && worker) {
      confirmBtn.onclick = () => {
        const numAmt = parseFloat(indEmpState.wageAmount);
        if (!numAmt || numAmt <= 0) {
          store.showToast('Please enter a valid wage amount', 'error');
          return;
        }

        const txnId = generateTxnId('WAG');
        const payoutTxn = {
          id: txnId,
          type: 'expense',
          category: 'Staff Wages',
          subCategory: 'Daily Wage',
          date: indEmpState.wageDate || getTodayDate(),
          amount: numAmt,
          workerId: worker.id,
          worker: worker.name,
          paymentMode: indEmpState.wagePaymentMode || 'Cash',
          notes: indEmpState.wageNotes || `Daily wage payout for ${worker.name}`,
          createdAt: new Date().toISOString()
        };

        store.addTransaction(payoutTxn);
        closeIndividualEmployeeWagePayout();
      };
    }
  }
}

import { store } from '../state.js';
import { icons } from '../icons.js';
import { formatRupee, formatDate, getTodayDate } from '../utils/formatters.js';

let wageStep = 1; // 1 = select_worker, 2 = enter_wage
let workerSearchQuery = '';
let wageActiveTab = 'employees'; // 'employees' | 'history'
let selectedWorkerProfile = null; // Worker object for detail drawer

let wageKeypadAmount = '750';
let selectedWorkerId = '';
let selectedTask = 'Morning Tapping';
let wagePaymentMode = 'Cash';

const TASKS = [
  'Morning Tapping',
  'Latex Collection',
  'Weeding & Spray',
  'Smokehouse Curing',
  'Field Clearing'
];

export function setSelectedWorkerId(id) {
  selectedWorkerId = id;
}

export function openAddWageForWorker(workerId) {
  selectedWorkerId = workerId;
  const worker = store.workers.find(w => w.id === workerId);
  if (worker && worker.defaultDailyWage) {
    wageKeypadAmount = String(worker.defaultDailyWage);
  }
  wageStep = 2; // Jump straight to enter wage when worker is pre-selected
  store.setWageSubView('add_wage');
}

function renderWorkerProfileModal() {
  if (!selectedWorkerProfile) return '';
  const w = selectedWorkerProfile;
  const workerTxns = store.transactions.filter(
    (t) => t.category === 'Staff Wages' && (t.workerId === w.id || t.worker === w.name || t.notes?.includes(w.name))
  );
  const totalPaid = store.getWorkerTotalPaid(w.id, w.name);

  return `
    <div id="worker-profile-backdrop" class="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs animate-fade-in" style="touch-action: none;">
      <div class="relative w-full max-w-sm bg-white rounded-t-[32px] md:rounded-[32px] p-6 border border-slate-100 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <!-- Drag Handle for Mobile -->
        <div class="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 md:hidden"></div>

        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Employee Profile</span>
            <h3 class="text-xs font-mono font-bold text-slate-600 mt-0.5">${w.id}</h3>
          </div>
          <button id="btn-close-worker-profile" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 active:scale-95 transition-all">
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
            class="flex-1 py-3 px-4 rounded-full bg-slate-900 hover:bg-black active:scale-95 text-xs font-bold text-white transition-all text-center shadow-md flex items-center justify-center space-x-1.5"
          >
            ${icons.plus("w-3.5 h-3.5 text-white")}
            <span>Pay This Worker</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderOverviewView() {
  const { workers, transactions } = store;
  const totalWagesPaid = store.getTotalWagesPaid();
  const totalPendingWages = store.getTotalPendingWages();
  const wageTxns = transactions.filter((t) => t.category === 'Staff Wages');

  return `
    <div class="space-y-4 pb-8 pt-1">
      <!-- 1. Hero Total Wages Card (Amber Satin Fintech Aesthetic) -->
      <div 
        class="w-full rounded-[30px] amber-card-gradient p-6 flex flex-col justify-between min-h-[195px] select-none relative overflow-hidden transition-all duration-300 shadow-md"
      >
        <!-- Ambient Glass Light Highlights & Users Emblem -->
        <div class="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/40 blur-2xl pointer-events-none"></div>
        <div class="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-amber-600/20 blur-2xl pointer-events-none"></div>
        <div class="absolute right-4 bottom-2 opacity-15 pointer-events-none">
          ${icons.users("w-28 h-28 text-amber-950")}
        </div>

        <!-- Top Row: Active Crew Status + NFC Staff Pass Badge -->
        <div class="flex items-center justify-between relative z-10">
          <div class="flex items-center space-x-2">
            <span class="w-2 h-2 rounded-full bg-amber-950 animate-pulse"></span>
            <span class="text-xs font-black uppercase tracking-wider text-amber-950">
              Estate Workforce Wages
            </span>
          </div>

          <div class="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-amber-950/10 border border-amber-950/15 text-amber-950 backdrop-blur-xs">
            <span class="text-[9px] font-black uppercase tracking-wider">Staff Pass</span>
            ${icons.nfc("w-3.5 h-3.5 text-amber-950")}
          </div>
        </div>

        <!-- Center: Big Wages Total -->
        <div class="my-3 relative z-10">
          <span class="text-[11px] font-extrabold uppercase tracking-wider text-amber-950/80 block">
            Total Wages Disbursed
          </span>
          <div class="text-4xl md:text-5xl font-black text-amber-950 tracking-tight mt-1 leading-none font-display">
            ${formatRupee(totalWagesPaid)}
          </div>

          <!-- Pending Dues Pill -->
          <div class="inline-flex items-center space-x-2 mt-2.5 px-3 py-1 rounded-full bg-amber-950/12 border border-amber-950/10 text-amber-950 text-xs font-bold backdrop-blur-xs">
            ${icons.clock("w-3 h-3 text-amber-950")}
            <span>Pending Payouts: ${formatRupee(totalPendingWages)}</span>
          </div>
        </div>

        <!-- Bottom Row: Estate Name & Workforce Count -->
        <div class="flex items-center justify-between relative z-10 pt-3 border-t border-amber-950/15 text-xs">
          <div>
            <span class="text-sm font-black text-amber-950 tracking-tight block leading-tight">
              ${store.estate.owner}
            </span>
            <span class="text-[10px] font-bold text-amber-950/70">
              ${store.estate.name}
            </span>
          </div>
          <span class="text-[11px] font-black text-amber-950/85 uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-950/10">
            ${workers.length} Registered Crew
          </span>
        </div>
      </div>

      <!-- 2. Primary Action Button: Record New Wage Payout (Starts Step 1: Select Worker) -->
      <div>
        <button
          id="btn-goto-add-wage"
          class="w-full py-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-sm shadow-md flex items-center justify-center space-x-2 active:scale-98 transition-all cursor-pointer"
        >
          <div class="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
            ${icons.plus("w-4 h-4 text-white stroke-[3]")}
          </div>
          <span>Record New Wage Payout</span>
          ${icons.arrowRight("w-4 h-4 text-white/70")}
        </button>
      </div>

      <!-- 3. Section Navigation Tabs: Employees vs Payout History -->
      <div class="flex items-center justify-between pt-1">
        <div class="flex items-center space-x-1.5 p-1 rounded-full bg-slate-100 max-w-[280px]">
          <button
            id="tab-btn-employees"
            class="px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
              wageActiveTab === 'employees'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }"
          >
            ${icons.users("w-3.5 h-3.5")}
            <span>Employees (${workers.length})</span>
          </button>
          <button
            id="tab-btn-history"
            class="px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
              wageActiveTab === 'history'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }"
          >
            ${icons.clock("w-3.5 h-3.5")}
            <span>History (${wageTxns.length})</span>
          </button>
        </div>

        ${wageActiveTab === 'employees' ? `
          <button
            id="btn-overview-add-worker"
            class="px-3 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center space-x-1 shadow-2xs active:scale-95 transition-all"
          >
            ${icons.userPlus("w-3.5 h-3.5 text-slate-700")}
            <span>New Worker</span>
          </button>
        ` : ''}
      </div>

      <!-- 4. Tab Content: Employees View -->
      ${wageActiveTab === 'employees' ? `
        <div class="space-y-3">
          ${workers.map((w) => {
            const initials = w.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
            const totalPaid = store.getWorkerTotalPaid(w.id, w.name);
            const pending = w.pendingWages || 0;

            return `
              <div 
                data-workerid="${w.id}"
                class="worker-card rounded-2xl bg-white p-4 border border-slate-100 hover:border-slate-200 shadow-2xs transition-all space-y-3"
              >
                <!-- Worker Header -->
                <div class="flex items-start justify-between">
                  <div class="flex items-center space-x-3 min-w-0">
                    <div class="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-950 flex items-center justify-center font-black text-xs shrink-0">
                      ${initials}
                    </div>
                    <div class="min-w-0">
                      <div class="flex items-center space-x-2">
                        <h4 class="text-sm font-black text-slate-900 tracking-tight truncate">${w.name}</h4>
                        <span class="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">${w.id}</span>
                      </div>
                      <div class="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                        <span class="font-bold text-amber-800">${w.role}</span>
                        ${w.phone ? `<span>•</span><span class="inline-flex items-center space-x-1">${icons.phone("w-3 h-3 text-slate-400")} <span>${w.phone}</span></span>` : ''}
                      </div>
                    </div>
                  </div>

                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${w.active !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-slate-100 text-slate-500'}">
                    ${w.active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <!-- 3-Column Rate & Balance Breakdown -->
                <div class="grid grid-cols-3 gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <div>
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Daily Rate</span>
                    <span class="text-xs font-black text-slate-900 font-display">₹${w.defaultDailyWage || 750}</span>
                  </div>
                  <div class="border-x border-slate-200/70">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Paid</span>
                    <span class="text-xs font-black text-emerald-700 font-display">${formatRupee(totalPaid)}</span>
                  </div>
                  <div>
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Pending</span>
                    <span class="text-xs font-black font-display ${pending > 0 ? 'text-amber-800' : 'text-slate-400'}">
                      ${pending > 0 ? formatRupee(pending) : 'Nil'}
                    </span>
                  </div>
                </div>

                <!-- Actions: Pay Wage & Profile Details -->
                <div class="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    data-inspect-worker="${w.id}"
                    class="btn-inspect-worker py-2 px-3 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs font-bold text-slate-700 flex items-center justify-center space-x-1.5 transition-all"
                  >
                    ${icons.user("w-3.5 h-3.5 text-slate-600")}
                    <span>Profile & History</span>
                  </button>

                  <button
                    data-pay-worker="${w.id}"
                    class="btn-quick-pay-worker py-2 px-3 rounded-full bg-slate-900 hover:bg-black text-white active:scale-95 text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                  >
                    ${icons.plus("w-3.5 h-3.5 text-white")}
                    <span>Pay ₹${w.defaultDailyWage || 750}</span>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <!-- 5. Tab Content: Wage Payout History View -->
        <div class="space-y-2">
          ${wageTxns.length === 0 ? `
            <div class="p-8 text-center rounded-2xl bg-white border border-slate-100 text-slate-400 text-xs">
              No wage payouts recorded yet.
            </div>
          ` : wageTxns.map((txn) => `
            <div 
              data-txnid="${txn.id}"
              class="wage-history-card p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 flex items-center justify-between shadow-2xs transition-all cursor-pointer active:scale-[0.99]"
            >
              <div class="flex items-center space-x-3.5 min-w-0">
                <div class="w-11 h-11 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                  ${icons.users("w-4 h-4 text-amber-800")}
                </div>
                <div class="min-w-0">
                  <h4 class="text-xs font-black text-slate-900 truncate tracking-tight">${txn.worker || txn.notes || 'Worker Wage'}</h4>
                  <span class="text-[11px] text-slate-400 truncate block">${txn.notes || 'Daily tapping wage'} • ${formatDate(txn.date)}</span>
                </div>
              </div>
              <div class="text-right shrink-0 ml-3 flex flex-col items-end">
                <span class="text-sm font-black font-display text-slate-900">-${formatRupee(txn.amount)}</span>
                <div class="flex items-center space-x-1 mt-0.5">
                  <span class="text-[9px] text-slate-400 font-bold">${txn.paymentMode || 'Cash'}</span>
                  <span class="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80">Paid</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}

      <!-- Worker Profile Drawer Modal -->
      ${renderWorkerProfileModal()}
    </div>
  `;
}

// STEP 1: Select Employee Page
function renderStep1SelectWorker() {
  const { workers } = store;
  const q = workerSearchQuery.toLowerCase().trim();
  const filtered = workers.filter(w =>
    w.name.toLowerCase().includes(q) ||
    w.role.toLowerCase().includes(q) ||
    w.id.toLowerCase().includes(q)
  );

  return `
    <div class="space-y-4 pb-8 pt-1 animate-fade-in">
      <!-- Top Bar: Back to Overview & Step Title -->
      <div class="flex items-center justify-between py-2.5 mb-1 sticky top-0 bg-[#f8fafc]/95 backdrop-blur-md z-20 border-b border-slate-100" style="padding-top: max(env(safe-area-inset-top, 0px), 12px)">
        <button
          id="btn-step1-back-to-overview"
          class="flex items-center space-x-1.5 py-2 px-3.5 rounded-full bg-white border border-slate-200/90 text-xs font-bold text-slate-800 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
        >
          ${icons.chevronLeft("w-4 h-4 text-slate-800")}
          <span>Back</span>
        </button>

        <div class="text-center">
          <h2 class="text-sm font-black text-slate-900 tracking-tight leading-tight">
            Select Employee
          </h2>
          <span class="text-[10px] font-bold text-amber-700 tracking-wider uppercase">Step 1 of 2</span>
        </div>

        <button
          id="btn-step1-add-new-worker"
          class="flex items-center space-x-1 py-1.5 px-3 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black active:scale-95 transition-all shadow-xs"
        >
          ${icons.plus("w-3.5 h-3.5 text-white")}
          <span>New</span>
        </button>
      </div>

      <!-- Search Input -->
      <div class="relative px-0.5">
        <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          ${icons.search("w-4 h-4")}
        </div>
        <input
          id="input-worker-search"
          type="text"
          placeholder="Search employee by name, role or ID..."
          value="${workerSearchQuery}"
          class="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 shadow-xs focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-medium"
        />
      </div>

      <!-- Employee List -->
      <div class="space-y-2.5 pt-1">
        <div class="flex items-center justify-between px-1">
          <span class="text-[11px] font-black text-slate-400 uppercase tracking-wider">
            Choose Employee (${filtered.length})
          </span>
          <span class="text-[11px] text-slate-400 font-semibold">Tap to enter wage</span>
        </div>

        ${filtered.length === 0 ? `
          <div class="p-8 text-center rounded-2xl bg-white border border-slate-100 text-slate-400 text-xs">
            No employees found matching "${workerSearchQuery}".
          </div>
        ` : filtered.map((w) => {
          const isSelected = selectedWorkerId === w.id;
          const initials = w.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
          const pending = w.pendingWages || 0;

          return `
            <div
              data-choose-worker="${w.id}"
              class="choose-worker-row p-4 rounded-2xl bg-white border ${
                isSelected ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-sm' : 'border-slate-100 hover:border-slate-200'
              } shadow-2xs flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all group"
            >
              <div class="flex items-center space-x-3.5 min-w-0">
                <div class="w-12 h-12 rounded-2xl ${
                  isSelected ? 'bg-slate-900 text-white' : 'bg-amber-50 text-amber-950 border border-amber-200/70'
                } flex items-center justify-center font-black text-xs shrink-0 transition-all">
                  ${initials}
                </div>

                <div class="min-w-0">
                  <div class="flex items-center space-x-2">
                    <h4 class="text-sm font-black text-slate-900 tracking-tight truncate">${w.name}</h4>
                    <span class="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">${w.id}</span>
                  </div>
                  <div class="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                    <span class="font-bold text-amber-800">${w.role}</span>
                    <span>•</span>
                    <span class="font-bold text-slate-700">₹${w.defaultDailyWage || 750}/day</span>
                  </div>
                </div>
              </div>

              <div class="text-right shrink-0 ml-3 flex items-center space-x-2.5">
                <div>
                  <span class="text-[9px] font-bold text-slate-400 uppercase block">Pending</span>
                  <span class="text-xs font-black ${pending > 0 ? 'text-amber-800' : 'text-slate-400'} font-display">
                    ${pending > 0 ? formatRupee(pending) : 'Nil'}
                  </span>
                </div>
                <div class="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center text-slate-600 transition-colors">
                  ${icons.chevronRight("w-4 h-4")}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// STEP 2: Enter Wage & Details Page (Clean, uncluttered, ergonomic layout)
function renderStep2EnterWage() {
  const { workers } = store;
  const selectedWorker = workers.find((w) => w.id === selectedWorkerId) || workers[0];
  const fastAmounts = ['650', '700', '750', '800', '1000'];

  const keypadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'backspace']
  ];

  return `
    <div class="space-y-3 pb-6 pt-1 animate-fade-in">
      <!-- 1. Streamlined Top Navigation Bar -->
      <div class="flex items-center justify-between py-2 mb-0.5 sticky top-0 bg-[#f8fafc]/95 backdrop-blur-md z-20 border-b border-slate-100" style="padding-top: max(env(safe-area-inset-top, 0px), 10px)">
        <button
          id="btn-step2-back-to-step1"
          class="w-9 h-9 rounded-full bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 flex items-center justify-center shadow-2xs active:scale-95 transition-all"
          title="Back to Worker Selection"
          aria-label="Back"
        >
          ${icons.chevronLeft("w-4 h-4 text-slate-800")}
        </button>

        <div class="text-center">
          <h2 class="text-sm font-black text-slate-900 tracking-tight leading-tight">
            Record Wage Payout
          </h2>
          <span class="text-[10px] font-bold text-amber-700 tracking-wider uppercase">Step 2 of 2</span>
        </div>

        <span class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/70 text-[10px] font-bold">
          ${selectedWorker ? selectedWorker.role.split(' ')[0] : 'Tapper'}
        </span>
      </div>

      <!-- 2. Selected Worker Compact Card -->
      <div class="p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between">
        <div class="flex items-center space-x-3 min-w-0">
          <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-950 border border-amber-200/80 flex items-center justify-center font-black text-xs shrink-0">
            ${selectedWorker ? selectedWorker.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'W'}
          </div>
          <div class="min-w-0">
            <div class="flex items-center space-x-1.5">
              <h4 class="text-xs font-black text-slate-900 truncate tracking-tight">${selectedWorker ? selectedWorker.name : 'Tapper'}</h4>
              <span class="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 text-[9px] font-mono font-bold">${selectedWorker ? selectedWorker.id : ''}</span>
            </div>
            <span class="text-[10px] text-slate-400 font-medium block truncate">${selectedWorker ? selectedWorker.role : 'Field Staff'} • Default: ₹${selectedWorker ? selectedWorker.defaultDailyWage : 750}/day</span>
          </div>
        </div>
        <button
          id="btn-change-worker-pill"
          class="px-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[11px] font-bold text-slate-700 active:scale-95 transition-all shrink-0 ml-2"
        >
          Change
        </button>
      </div>

      <!-- 3. Clean Amount Card with Fast Preset Buttons (Grid fits without clipping!) -->
      <div class="rounded-2xl bg-white p-4 border border-slate-100 shadow-2xs text-center space-y-2">
        <!-- Big Amount Display -->
        <div class="py-0.5">
          <div class="text-5xl font-black text-slate-900 font-display tracking-tight flex items-center justify-center leading-none">
            <span class="text-3xl font-extrabold text-slate-400 mr-0.5">₹</span>
            <span id="display-wage-amount">${wageKeypadAmount === '0' ? '0' : wageKeypadAmount}</span>
            <span class="w-0.5 h-8 bg-amber-500 animate-pulse ml-1 inline-block rounded-full"></span>
          </div>
        </div>

        <!-- Fast Preset Rate Buttons (Clean 5-column grid: 100% visible, ZERO clipping!) -->
        <div class="grid grid-cols-5 gap-1.5 pt-1">
          ${fastAmounts.map((amt) => {
            const isMatch = wageKeypadAmount === amt;
            return `
              <button
                data-fastwage="${amt}"
                class="btn-fast-wage py-1.5 rounded-xl text-xs font-bold font-sans transition-all active:scale-95 text-center ${
                  isMatch
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }"
              >
                ₹${amt}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 4. Task Category Chips -->
      <div class="flex items-center space-x-1.5 overflow-x-auto no-scrollbar px-0.5 py-0.5">
        ${TASKS.map((t) => {
          const isSelected = selectedTask === t;
          return `
            <button
              data-task="${t}"
              class="btn-select-task px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 active:scale-95 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
              }"
            >
              ${t}
            </button>
          `;
        }).join('')}
      </div>

      <!-- 5. Numeric Keypad (h-12 buttons for optimal ergonomic spacing) -->
      <div class="rounded-2xl bg-white p-3 border border-slate-100 shadow-2xs">
        <div class="grid grid-cols-3 gap-2">
          ${keypadKeys.map((row) => row.map((key) => {
            const isDel = key === 'backspace';
            return `
              <button
                data-wagekey="${key}"
                class="wage-keypad-btn h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 active:bg-slate-200 text-lg font-bold text-slate-900 flex items-center justify-center transition-all select-none font-display border border-slate-100/60"
              >
                ${isDel ? icons.backspace("w-5 h-5 text-slate-700") : key}
              </button>
            `;
          }).join('')).join('')}
        </div>
      </div>

      <!-- 6. Payment Mode Selector -->
      <div class="flex items-center justify-between px-1 pt-0.5">
        <span class="text-xs font-bold text-slate-400">Payout via:</span>
        <div class="flex items-center space-x-2">
          <button
            id="btn-wage-mode-cash"
            class="btn-wage-mode px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
              wagePaymentMode === 'Cash'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }"
          >
            ${icons.banknote("w-3.5 h-3.5")}
            <span>Cash Handover</span>
          </button>
          <button
            id="btn-wage-mode-upi"
            class="btn-wage-mode px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
              wagePaymentMode === 'UPI'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }"
          >
            ${icons.creditCard("w-3.5 h-3.5")}
            <span>UPI / GPay</span>
          </button>
        </div>
      </div>

      <!-- 7. Confirm Action Button -->
      <div class="pt-1">
        <button
          id="btn-confirm-wage"
          class="w-full py-3.5 rounded-full bg-slate-900 hover:bg-black active:scale-98 text-white font-black text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>Record Worker Wage Payout (₹${wageKeypadAmount === '0' ? '0' : wageKeypadAmount})</span>
          ${icons.arrowRight("w-4 h-4 text-white")}
        </button>
      </div>
    </div>
  `;
}

export function renderWagesPage() {
  if (store.wageSubView === 'add_wage') {
    if (wageStep === 1) {
      return renderStep1SelectWorker();
    }
    return renderStep2EnterWage();
  }
  return renderOverviewView();
}

export function attachWagesPageEvents() {
  // If in Add Wage flow:
  if (store.wageSubView === 'add_wage') {
    if (wageStep === 1) {
      // Step 1: Back to overview
      const step1BackBtn = document.getElementById('btn-step1-back-to-overview');
      if (step1BackBtn) {
        step1BackBtn.onclick = () => {
          store.setWageSubView('overview');
        };
      }

      // Step 1: Add new worker button
      const step1AddWorkerBtn = document.getElementById('btn-step1-add-new-worker');
      if (step1AddWorkerBtn) {
        step1AddWorkerBtn.onclick = () => {
          store.setAddEmployeeModalOpen(true);
        };
      }

      // Step 1: Search input
      const searchInput = document.getElementById('input-worker-search');
      if (searchInput) {
        searchInput.oninput = (e) => {
          workerSearchQuery = e.target.value;
          store.notify();
        };
      }

      // Step 1: Choose worker row click -> moves to Step 2!
      document.querySelectorAll('.choose-worker-row').forEach((row) => {
        row.onclick = () => {
          const id = row.getAttribute('data-choose-worker');
          if (id) {
            selectedWorkerId = id;
            const worker = store.workers.find(w => w.id === id);
            if (worker && worker.defaultDailyWage) {
              wageKeypadAmount = String(worker.defaultDailyWage);
            }
            wageStep = 2; // Advance to Step 2
            store.notify();
          }
        };
      });
      return;
    }

    if (wageStep === 2) {
      // Step 2: Back to Step 1
      const step2BackBtn = document.getElementById('btn-step2-back-to-step1');
      if (step2BackBtn) {
        step2BackBtn.onclick = () => {
          wageStep = 1;
          store.notify();
        };
      }

      // Step 2: Change worker pill
      const changeWorkerPill = document.getElementById('btn-change-worker-pill');
      if (changeWorkerPill) {
        changeWorkerPill.onclick = () => {
          wageStep = 1;
          store.notify();
        };
      }

      // Step 2: Select Task Chip
      document.querySelectorAll('.btn-select-task').forEach((btn) => {
        btn.onclick = () => {
          selectedTask = btn.getAttribute('data-task');
          store.notify();
        };
      });

      // Step 2: Fast Wage Chips
      document.querySelectorAll('.btn-fast-wage').forEach((btn) => {
        btn.onclick = () => {
          wageKeypadAmount = btn.getAttribute('data-fastwage');
          store.notify();
        };
      });

      // Step 2: Keypad Buttons
      document.querySelectorAll('.wage-keypad-btn').forEach((btn) => {
        btn.onclick = () => {
          const key = btn.getAttribute('data-wagekey');
          if (key === 'backspace') {
            if (wageKeypadAmount.length > 1) {
              wageKeypadAmount = wageKeypadAmount.slice(0, -1);
            } else {
              wageKeypadAmount = '0';
            }
          } else if (key === '.') {
            if (!wageKeypadAmount.includes('.')) wageKeypadAmount += '.';
          } else {
            if (wageKeypadAmount === '0') wageKeypadAmount = key;
            else if (wageKeypadAmount.length < 9) wageKeypadAmount += key;
          }

          const d = document.getElementById('display-wage-amount');
          if (d) d.textContent = wageKeypadAmount;
          const confirmBtn = document.getElementById('btn-confirm-wage');
          if (confirmBtn) {
            confirmBtn.querySelector('span').textContent = `Record Worker Wage Payout (₹${wageKeypadAmount === '0' ? '0' : wageKeypadAmount})`;
          }
        };
      });

      // Step 2: Mode Cash vs UPI
      const cashBtn = document.getElementById('btn-wage-mode-cash');
      if (cashBtn) {
        cashBtn.onclick = () => {
          wagePaymentMode = 'Cash';
          store.notify();
        };
      }

      const upiBtn = document.getElementById('btn-wage-mode-upi');
      if (upiBtn) {
        upiBtn.onclick = () => {
          wagePaymentMode = 'UPI';
          store.notify();
        };
      }

      // Step 2: Confirm Wage
      const confirmBtn = document.getElementById('btn-confirm-wage');
      if (confirmBtn) {
        confirmBtn.onclick = () => {
          const num = parseFloat(wageKeypadAmount) || 0;
          if (num <= 0) {
            store.showToast('Please enter an amount', 'error');
            return;
          }

          const worker = store.workers.find((w) => w.id === selectedWorkerId);
          const workerName = worker ? worker.name : 'Tapper';

          store.addTransaction({
            type: 'expense',
            category: 'Staff Wages',
            subCategory: `${selectedTask}`,
            amount: num,
            worker: workerName,
            workerId: selectedWorkerId,
            paymentMode: wagePaymentMode,
            date: getTodayDate(),
            notes: `${workerName} • ${selectedTask}`,
          });

          store.showToast(`Recorded wage ₹${num.toLocaleString('en-IN')} for ${workerName} via ${wagePaymentMode}`);
          wageStep = 1;
          store.setWageSubView('overview');
        };
      }
      return;
    }
  }

  // --- Overview Events ---
  // Overview: Go to Add Wage view (starts at Step 1: Select Employee)
  const gotoAddBtn = document.getElementById('btn-goto-add-wage');
  if (gotoAddBtn) {
    gotoAddBtn.onclick = () => {
      wageStep = 1;
      workerSearchQuery = '';
      store.setWageSubView('add_wage');
    };
  }

  // Tab switching: Employees vs History
  const tabEmployees = document.getElementById('tab-btn-employees');
  if (tabEmployees) {
    tabEmployees.onclick = () => {
      wageActiveTab = 'employees';
      store.notify();
    };
  }

  const tabHistory = document.getElementById('tab-btn-history');
  if (tabHistory) {
    tabHistory.onclick = () => {
      wageActiveTab = 'history';
      store.notify();
    };
  }

  // Overview: Add new worker button
  const addWorkerOverviewBtn = document.getElementById('btn-overview-add-worker');
  if (addWorkerOverviewBtn) {
    addWorkerOverviewBtn.onclick = () => {
      store.setAddEmployeeModalOpen(true);
    };
  }

  // Quick Pay button on employee card -> Jumps straight to Step 2 for this worker!
  document.querySelectorAll('.btn-quick-pay-worker').forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-pay-worker');
      if (id) openAddWageForWorker(id);
    };
  });

  // Inspect Worker Profile button
  document.querySelectorAll('.btn-inspect-worker').forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-inspect-worker');
      const found = store.workers.find(w => w.id === id);
      if (found) {
        selectedWorkerProfile = found;
        store.notify();
      }
    };
  });

  // Modal: Close worker profile
  const closeProfileBtn = document.getElementById('btn-close-worker-profile');
  if (closeProfileBtn) {
    closeProfileBtn.onclick = () => {
      selectedWorkerProfile = null;
      store.notify();
    };
  }

  const profileBackdrop = document.getElementById('worker-profile-backdrop');
  if (profileBackdrop) {
    profileBackdrop.onclick = (e) => {
      if (e.target === profileBackdrop) {
        selectedWorkerProfile = null;
        store.notify();
      }
    };
  }

  // Modal: Pay this worker from profile drawer
  const modalPayBtn = document.getElementById('btn-modal-pay-worker');
  if (modalPayBtn) {
    modalPayBtn.onclick = () => {
      const id = modalPayBtn.getAttribute('data-workerid');
      selectedWorkerProfile = null;
      if (id) openAddWageForWorker(id);
    };
  }

  // Wage History Card Click: open transaction modal
  document.querySelectorAll('.wage-history-card').forEach((card) => {
    card.onclick = () => {
      const id = card.getAttribute('data-txnid');
      const found = store.transactions.find((t) => t.id === id);
      if (found) store.setSelectedTransaction(found);
    };
  });
}

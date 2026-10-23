import { store } from '../state.js';
import { icons } from '../icons.js';
import { formatRupee, formatDate } from '../utils/formatters.js';
import { openCustomerProfile } from './customerPage.js';
import { openAddWageForWorker, setExpenseEmployeesSubTab } from './expenseEmployeesPage.js';

export let notificationPageState = {
  activeFilter: 'all' // 'all', 'unread', 'dues', 'wages', 'system'
};

export function setNotificationFilter(filter) {
  notificationPageState.activeFilter = filter;
  store.notify();
}

export function renderNotificationPage() {
  const notifications = store.notifications || [];
  const unreadCount = notifications.filter(n => n.unread).length;
  const duesCount = notifications.filter(n => n.type === 'dues').length;
  const wagesCount = notifications.filter(n => n.type === 'wages').length;
  const systemCount = notifications.filter(n => n.type === 'system').length;

  const filteredNotifs = notifications.filter(n => {
    if (notificationPageState.activeFilter === 'all') return true;
    if (notificationPageState.activeFilter === 'unread') return n.unread;
    if (notificationPageState.activeFilter === 'dues') return n.type === 'dues';
    if (notificationPageState.activeFilter === 'wages') return n.type === 'wages';
    if (notificationPageState.activeFilter === 'system') return n.type === 'system' || n.type === 'expenses';
    return true;
  });

  return `
    <div class="space-y-4 pb-8 pt-1 animate-fade-in">
      <!-- 1. Soft Sunrise / Peach-Coral Mesh Hero Card (Phone 2 Aesthetic) -->
      <div class="rounded-[28px] card-mesh-peach p-5 relative overflow-hidden select-none transition-all duration-300">
        <!-- Top Row: Label + Unread Status Pill -->
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-700/80">
            Notification Center
          </span>
          <span class="px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-xs font-black text-slate-800 shadow-2xs">
            ${unreadCount > 0 ? `${unreadCount} Unread Alerts` : 'All Caught Up'}
          </span>
        </div>

        <!-- Center: Headline & Subtitle -->
        <div class="my-3">
          <div class="text-3xl md:text-4xl font-black text-slate-900 tracking-tight font-display leading-none">
            ${unreadCount > 0 ? `${unreadCount} Actionable Alerts` : 'Zero Pending Alerts'}
          </div>
          <span class="text-[11px] text-slate-600/80 mt-1.5 block font-medium">
            Live estate updates on buyer dues, tapping shift wages & lab DRC quality
          </span>
        </div>

        <!-- Bottom Row: Mark All Read & Clear Actions -->
        <div class="pt-2.5 flex items-center justify-between border-t border-slate-900/10">
          <span class="text-xs font-bold text-slate-700">${notifications.length} Total Notices</span>
          <div class="flex items-center space-x-2">
            ${unreadCount > 0 ? `
              <button
                id="btn-notif-mark-all-read"
                class="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-900 text-xs font-bold shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                ${icons.check("w-3.5 h-3.5 text-emerald-600 stroke-[2.5]")}
                <span>Mark All Read</span>
              </button>
            ` : ''}
            ${notifications.length > 0 ? `
              <button
                id="btn-notif-clear-all"
                class="px-3 py-1.5 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-800 text-xs font-bold active:scale-95 transition-all cursor-pointer"
                title="Clear all alerts"
              >
                Clear
              </button>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- 2. Soft 4-Color Category Tiles (Phone 3 Aesthetic) -->
      <div>
        <div class="flex items-center justify-between px-1 mb-2">
          <span class="text-[11px] font-black text-slate-400 uppercase tracking-wider">
            Alert Categories
          </span>
          ${notificationPageState.activeFilter !== 'all' ? `
            <button id="btn-reset-notif-filter" class="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer">
              Show All
            </button>
          ` : ''}
        </div>

        <div class="grid grid-cols-2 gap-3">
          <!-- Tile 1: All Alerts (Lime Gradient) -->
          <div
            data-notiffilter="all"
            class="btn-nav-notif p-4 rounded-3xl transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[105px] card-tile-lime ${
              notificationPageState.activeFilter === 'all' ? 'ring-2 ring-slate-900 shadow-md scale-[1.02]' : 'hover:scale-[1.01]'
            }"
          >
            <div class="flex items-start justify-between">
              <div class="w-10 h-10 rounded-2xl bg-white/80 text-lime-900 flex items-center justify-center font-bold shadow-2xs shrink-0">
                ${icons.bell("w-5 h-5")}
              </div>
              <span class="text-[10px] font-black text-lime-900/70 uppercase">Overview</span>
            </div>
            <div class="mt-2.5">
              <span class="text-xs font-black tracking-tight block text-lime-950">All Alerts</span>
              <div class="flex items-baseline justify-between mt-0.5">
                <span class="text-base font-black font-display tracking-tight text-lime-950">${notifications.length}</span>
                <span class="text-[10px] text-lime-900/75 font-semibold">${unreadCount} unread</span>
              </div>
            </div>
          </div>

          <!-- Tile 2: Buyer Dues (Coral Gradient) -->
          <div
            data-notiffilter="dues"
            class="btn-nav-notif p-4 rounded-3xl transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[105px] card-tile-coral ${
              notificationPageState.activeFilter === 'dues' ? 'ring-2 ring-slate-900 shadow-md scale-[1.02]' : 'hover:scale-[1.01]'
            }"
          >
            <div class="flex items-start justify-between">
              <div class="w-10 h-10 rounded-2xl bg-white/80 text-rose-900 flex items-center justify-center font-bold shadow-2xs shrink-0">
                ${icons.alertCircle("w-5 h-5")}
              </div>
              <span class="text-[10px] font-black text-rose-900/70 uppercase">Overdue</span>
            </div>
            <div class="mt-2.5">
              <span class="text-xs font-black tracking-tight block text-rose-950">Buyer Dues</span>
              <div class="flex items-baseline justify-between mt-0.5">
                <span class="text-base font-black font-display tracking-tight text-rose-950">${duesCount}</span>
                <span class="text-[10px] text-rose-900/75 font-semibold">Payment</span>
              </div>
            </div>
          </div>

          <!-- Tile 3: Workforce Wages (Sky/Blue Gradient) -->
          <div
            data-notiffilter="wages"
            class="btn-nav-notif p-4 rounded-3xl transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[105px] card-tile-blue ${
              notificationPageState.activeFilter === 'wages' ? 'ring-2 ring-slate-900 shadow-md scale-[1.02]' : 'hover:scale-[1.01]'
            }"
          >
            <div class="flex items-start justify-between">
              <div class="w-10 h-10 rounded-2xl bg-white/80 text-sky-900 flex items-center justify-center font-bold shadow-2xs shrink-0">
                ${icons.users("w-5 h-5")}
              </div>
              <span class="text-[10px] font-black text-sky-900/70 uppercase">Crew</span>
            </div>
            <div class="mt-2.5">
              <span class="text-xs font-black tracking-tight block text-sky-950">Wage Payouts</span>
              <div class="flex items-baseline justify-between mt-0.5">
                <span class="text-base font-black font-display tracking-tight text-sky-950">${wagesCount}</span>
                <span class="text-[10px] text-sky-900/75 font-semibold">Disbursals</span>
              </div>
            </div>
          </div>

          <!-- Tile 4: System & Quality (Purple Gradient) -->
          <div
            data-notiffilter="system"
            class="btn-nav-notif p-4 rounded-3xl transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[105px] card-tile-purple ${
              notificationPageState.activeFilter === 'system' ? 'ring-2 ring-slate-900 shadow-md scale-[1.02]' : 'hover:scale-[1.01]'
            }"
          >
            <div class="flex items-start justify-between">
              <div class="w-10 h-10 rounded-2xl bg-white/80 text-purple-900 flex items-center justify-center font-bold shadow-2xs shrink-0">
                ${icons.leaf("w-5 h-5")}
              </div>
              <span class="text-[10px] font-black text-purple-900/70 uppercase">DRC & Tech</span>
            </div>
            <div class="mt-2.5">
              <span class="text-xs font-black tracking-tight block text-purple-950">Quality & System</span>
              <div class="flex items-baseline justify-between mt-0.5">
                <span class="text-base font-black font-display tracking-tight text-purple-950">${systemCount}</span>
                <span class="text-[10px] text-purple-900/75 font-semibold">Advisories</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Filter Navigation Quick Pills -->
      <div class="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
        ${[
          { id: 'all', label: `All (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'dues', label: `Dues (${duesCount})` },
          { id: 'wages', label: `Wages (${wagesCount})` },
          { id: 'system', label: `System (${systemCount})` }
        ].map((f) => `
          <button
            data-filterpill="${f.id}"
            class="btn-notif-filter-pill px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              notificationPageState.activeFilter === f.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
            }"
          >
            ${f.label}
          </button>
        `).join('')}
      </div>

      <!-- 4. Notification Items Feed -->
      <div class="space-y-3 pt-1">
        ${filteredNotifs.length === 0 ? `
          <div class="rounded-3xl bg-white p-8 border border-slate-100 text-center space-y-3 shadow-2xs">
            <div class="w-14 h-14 rounded-full bg-slate-50 text-slate-400 mx-auto flex items-center justify-center">
              ${icons.bell("w-7 h-7")}
            </div>
            <div>
              <h3 class="text-sm font-black text-slate-800">No Notifications</h3>
              <p class="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                You're completely up to date. New estate alerts, dues reminders and wage logs will appear here.
              </p>
            </div>
            ${notificationPageState.activeFilter !== 'all' ? `
              <button
                id="btn-empty-reset-notif"
                class="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer inline-block"
              >
                View All Alerts
              </button>
            ` : ''}
          </div>
        ` : filteredNotifs.map((n) => {
          const isDues = n.type === 'dues';
          const isWage = n.type === 'wages';
          const isExpense = n.type === 'expenses';

          const iconNode = isDues
            ? icons.alertCircle("w-5 h-5 text-rose-600")
            : isWage
            ? icons.users("w-5 h-5 text-amber-700")
            : isExpense
            ? icons.truck("w-5 h-5 text-sky-700")
            : icons.leaf("w-5 h-5 text-emerald-700");

          const iconBg = isDues
            ? 'bg-rose-50 border-rose-100'
            : isWage
            ? 'bg-amber-50 border-amber-100'
            : isExpense
            ? 'bg-sky-50 border-sky-100'
            : 'bg-emerald-50 border-emerald-100';

          return `
            <div 
              data-notifid="${n.id}"
              class="item-notification rounded-3xl p-4.5 transition-all duration-200 relative select-none border ${
                n.unread
                  ? 'bg-white border-slate-200/90 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200/50 opacity-90'
              }"
            >
              <div class="flex items-start space-x-3.5">
                <!-- Squircle Icon -->
                <div class="w-11 h-11 rounded-2xl ${iconBg} border flex items-center justify-center shrink-0 shadow-2xs">
                  ${iconNode}
                </div>

                <!-- Main Content -->
                <div class="min-w-0 flex-1">
                  <!-- Header Row: Title & Unread Indicator -->
                  <div class="flex items-start justify-between">
                    <div class="flex items-center space-x-2">
                      <h4 class="text-xs font-black text-slate-900 tracking-tight leading-snug">
                        ${n.title}
                      </h4>
                      ${n.unread ? `
                        <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" title="Unread"></span>
                      ` : ''}
                    </div>

                    <span class="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
                      ${n.time}
                    </span>
                  </div>

                  <!-- Body Message -->
                  <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                    ${n.message}
                  </p>

                  <!-- Badge & Action Row -->
                  <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                    <div>
                      ${n.badge ? `
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          n.badgeColor === 'rose'
                            ? 'bg-rose-50 text-rose-700 border border-rose-100'
                            : n.badgeColor === 'amber'
                            ? 'bg-amber-50 text-amber-800 border border-amber-100'
                            : n.badgeColor === 'sky'
                            ? 'bg-sky-50 text-sky-800 border border-sky-100'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                        }">
                          ${n.badge}
                        </span>
                      ` : ''}
                    </div>

                    <div class="flex items-center space-x-1.5">
                      ${n.unread ? `
                        <button
                          data-notif-markid="${n.id}"
                          class="btn-notif-mark-single px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                          title="Mark as read"
                        >
                          Mark Read
                        </button>
                      ` : ''}

                      ${n.actionLabel && n.actionType !== 'none' ? `
                        <button
                          data-notif-acttype="${n.actionType}"
                          data-notif-actid="${n.actionId || ''}"
                          data-notif-id="${n.id}"
                          class="btn-notif-action px-3 py-1 rounded-full bg-slate-900 hover:bg-black text-white text-[10px] font-black shadow-2xs active:scale-95 transition-all flex items-center space-x-1 cursor-pointer"
                        >
                          <span>${n.actionLabel}</span>
                          ${icons.arrowRight("w-3 h-3 text-white")}
                        </button>
                      ` : ''}

                      <button
                        data-notif-deleteid="${n.id}"
                        class="btn-notif-delete w-7 h-7 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                        title="Delete notification"
                      >
                        ${icons.trash("w-3.5 h-3.5")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

export function attachNotificationPageEvents() {
  // Tile filters
  document.querySelectorAll('.btn-nav-notif').forEach((tile) => {
    tile.onclick = () => {
      const f = tile.getAttribute('data-notiffilter');
      if (f) setNotificationFilter(f);
    };
  });

  // Filter pills
  document.querySelectorAll('.btn-notif-filter-pill').forEach((pill) => {
    pill.onclick = () => {
      const f = pill.getAttribute('data-filterpill');
      if (f) setNotificationFilter(f);
    };
  });

  const resetBtn = document.getElementById('btn-reset-notif-filter');
  if (resetBtn) {
    resetBtn.onclick = () => setNotificationFilter('all');
  }

  const emptyResetBtn = document.getElementById('btn-empty-reset-notif');
  if (emptyResetBtn) {
    emptyResetBtn.onclick = () => setNotificationFilter('all');
  }

  // Mark all read
  const markAllBtn = document.getElementById('btn-notif-mark-all-read');
  if (markAllBtn) {
    markAllBtn.onclick = () => store.markAllNotificationsRead();
  }

  // Clear all
  const clearAllBtn = document.getElementById('btn-notif-clear-all');
  if (clearAllBtn) {
    clearAllBtn.onclick = () => {
      store.showConfirmModal({
        title: 'Clear Notifications',
        message: 'Are you sure you want to remove all alerts from your notification center?',
        confirmText: 'Clear All',
        isDanger: true,
        onConfirm: () => store.clearAllNotifications()
      });
    };
  }

  // Mark single read
  document.querySelectorAll('.btn-notif-mark-single').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-notif-markid');
      if (id) store.markNotificationRead(id);
    };
  });

  // Delete notification
  document.querySelectorAll('.btn-notif-delete').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-notif-deleteid');
      if (id) store.deleteNotification(id);
    };
  });

  // Action buttons
  document.querySelectorAll('.btn-notif-action').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const notifId = btn.getAttribute('data-notif-id');
      const actType = btn.getAttribute('data-notif-acttype');
      const actId = btn.getAttribute('data-notif-actid');

      if (notifId) store.markNotificationRead(notifId);

      if (actType === 'navigate_customer') {
        store.setActiveTab('customers');
        if (actId) {
          setTimeout(() => openCustomerProfile(actId), 50);
        }
      } else if (actType === 'navigate_wages') {
        setExpenseEmployeesSubTab('employees');
        store.setActiveTab('expenses');
        if (actId) {
          setTimeout(() => openAddWageForWorker(actId), 50);
        }
      } else if (actType === 'navigate_expenses') {
        setExpenseEmployeesSubTab('expenses');
        store.setActiveTab('expenses');
      } else if (actType === 'view_transaction') {
        const txn = store.transactions.find(t => t.id === actId);
        if (txn) {
          store.setSelectedTransaction(txn);
        } else {
          store.setActiveTab('dashboard');
        }
      }
    };
  });
}

import {
  INITIAL_ESTATE,
  INITIAL_CUSTOMERS,
  INITIAL_WORKERS,
  INITIAL_DRIVERS,
  INITIAL_TRANSACTIONS
} from './data/initialData.js';
import { generateTxnId, getTodayDate, getYesterdayDate } from './utils/formatters.js';

const STORAGE_KEYS = {
  ESTATE: 'rubberflow_estate_v1',
  TRANSACTIONS: 'rubberflow_transactions_v1',
  CUSTOMERS: 'rubberflow_customers_v1',
  WORKERS: 'rubberflow_workers_v1',
  DRIVERS: 'rubberflow_drivers_v1',
  NOTIFICATIONS: 'rubberflow_notifications_v1',
  BALANCE_HIDDEN: 'rubberflow_balance_hidden_v1',
};

export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    type: "dues",
    title: "Overdue Dues: Kottayam Rubber Traders",
    message: "Outstanding due of ₹50,000 pending past settlement schedule. 1-tap WhatsApp statement reminder available.",
    time: "12 mins ago",
    unread: true,
    actionType: "navigate_customer",
    actionId: "CUST-101",
    actionLabel: "View Buyer",
    badge: "₹50,000 Due",
    badgeColor: "rose"
  },
  {
    id: "notif-2",
    type: "wages",
    title: "Tapping Crew Payout Pending",
    message: "Morning tapping wages due for Sasi Kumar & Murugan (₹2,800 total). Shift logs recorded.",
    time: "1 hour ago",
    unread: true,
    actionType: "navigate_wages",
    actionId: "WRK-201",
    actionLabel: "Pay Wages",
    badge: "₹2,800 Crew",
    badgeColor: "amber"
  },
  {
    id: "notif-3",
    type: "system",
    title: "DRC Lab Test Certified: 58%",
    message: "Latex collection TXN-9078 verified at 58% DRC with premium dry rubber yield recorded.",
    time: "Today, 10:30 AM",
    unread: true,
    actionType: "view_transaction",
    actionId: "TXN-9078",
    actionLabel: "View Receipt",
    badge: "58% DRC Grade",
    badgeColor: "lime"
  },
  {
    id: "notif-4",
    type: "expenses",
    title: "Formic Acid Delivery Logged",
    message: "2 Barrels 85% Formic Acid (₹8,800) delivered from Travancore Chemicals Co.",
    time: "Yesterday, 2:20 PM",
    unread: false,
    actionType: "navigate_expenses",
    actionLabel: "View Outflow",
    badge: "₹8,800 Supplies",
    badgeColor: "sky"
  },
  {
    id: "notif-5",
    type: "system",
    title: "Smokehouse Curing Stabilized",
    message: "Trolley #2 inspection complete. Temperature maintained at 54°C for ribbed smoked sheets.",
    time: "Yesterday, 9:00 AM",
    unread: false,
    actionType: "none",
    actionLabel: "View Estate",
    badge: "54°C Smokehouse",
    badgeColor: "purple"
  }
];

class StateStore {
  constructor() {
    this.listeners = new Set();
    this.init();
  }

  init() {
    try {
      const e = localStorage.getItem(STORAGE_KEYS.ESTATE);
      this.estate = e ? JSON.parse(e) : { ...INITIAL_ESTATE };
      if (this.estate.name === "GreenValley Rubber Estate") {
        this.estate.name = "Green Valley Rubber Estate";
      }
      if (!this.estate.owner || this.estate.owner === "Thomas Matthew") {
        this.estate.owner = "Ashraf";
      }
    } catch {
      this.estate = { ...INITIAL_ESTATE };
    }

    try {
      const t = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const parsed = t ? JSON.parse(t) : [...INITIAL_TRANSACTIONS];
      this.transactions = parsed.map((txn) => {
        if (txn.category === 'Goods Purchases') {
          return { ...txn, category: 'Maintenance' };
        }
        return txn;
      });
    } catch {
      this.transactions = [...INITIAL_TRANSACTIONS];
    }

    try {
      const c = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      this.customers = c ? JSON.parse(c) : [...INITIAL_CUSTOMERS];
    } catch {
      this.customers = [...INITIAL_CUSTOMERS];
    }

    try {
      const w = localStorage.getItem(STORAGE_KEYS.WORKERS);
      const parsed = w ? JSON.parse(w) : [...INITIAL_WORKERS];
      this.workers = parsed.map((wrk, idx) => {
        const init = INITIAL_WORKERS[idx] || {};
        return {
          ...init,
          ...wrk,
          phone: wrk.phone || init.phone || `98471 2300${idx + 1}`,
          pendingWages: wrk.pendingWages !== undefined ? wrk.pendingWages : (init.pendingWages !== undefined ? init.pendingWages : 1400)
        };
      });
    } catch {
      this.workers = [...INITIAL_WORKERS];
    }

    try {
      const d = localStorage.getItem(STORAGE_KEYS.DRIVERS);
      this.drivers = d ? JSON.parse(d) : [...INITIAL_DRIVERS];
    } catch {
      this.drivers = [...INITIAL_DRIVERS];
    }

    try {
      const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      this.notifications = n ? JSON.parse(n) : [...INITIAL_NOTIFICATIONS];
    } catch {
      this.notifications = [...INITIAL_NOTIFICATIONS];
    }

    this.activeTab = 'dashboard';
    this.timeframe = 'month';
    this.dashboardTxnFilter = 'all';
    this.wageSubView = 'overview'; // 'overview' | 'add_wage'
    try {
      this.isBalanceHidden = localStorage.getItem(STORAGE_KEYS.BALANCE_HIDDEN) === 'true';
    } catch {
      this.isBalanceHidden = false;
    }
    this.isQuickActionsOpen = false;
    this.isSearchModalOpen = false;
    this.searchModalQuery = '';
    this.isAddEmployeeModalOpen = false;
    this.isAddBuyerModalOpen = false;
    this.isQuickEntryOpen = false;
    this.quickEntryTab = 'income';
    this.settlingCustomer = null;
    this.selectedTransaction = null;
    this.toast = null;
    this.toastTimer = null;
    this.confirmModal = null;
    this.isInstallModalOpen = false;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.save();
    for (const listener of this.listeners) {
      try {
        listener(this);
      } catch (err) {
        console.error("Store listener error:", err);
      }
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEYS.ESTATE, JSON.stringify(this.estate));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(this.customers));
      localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(this.workers));
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(this.drivers));
    } catch (e) {
      console.warn("LocalStorage save warning:", e);
    }
  }

  showToast(message, type = 'success') {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast = { message, type, id: Date.now() };
    this.notify();

    this.toastTimer = setTimeout(() => {
      this.toast = null;
      this.notify();
    }, 3200);
  }

  setActiveTab(tab) {
    this.activeTab = tab;
    if (tab !== 'wages') {
      this.wageSubView = 'overview';
    }
    if (window.location.hash !== `#${tab}`) {
      try {
        window.history.pushState(null, '', `#${tab}`);
      } catch {
        window.location.hash = `#${tab}`;
      }
    }
    this.notify();
  }

  setWageSubView(view) {
    this.wageSubView = view;
    this.notify();
  }

  setTimeframe(tf) {
    this.timeframe = tf;
    this.notify();
  }

  toggleBalanceVisibility() {
    this.isBalanceHidden = !this.isBalanceHidden;
    try {
      localStorage.setItem(STORAGE_KEYS.BALANCE_HIDDEN, String(this.isBalanceHidden));
    } catch {}
    this.notify();
  }

  setDashboardTxnFilter(filter) {
    this.dashboardTxnFilter = filter;
    this.notify();
  }

  setQuickActionsOpen(isOpen) {
    this.isQuickActionsOpen = Boolean(isOpen);
    this.notify();
  }

  toggleQuickActions() {
    this.isQuickActionsOpen = !this.isQuickActionsOpen;
    this.notify();
  }

  setSearchModalOpen(isOpen) {
    this.isSearchModalOpen = Boolean(isOpen);
    if (!isOpen) {
      this.searchModalQuery = '';
    }
    this.notify();
  }

  toggleSearchModal() {
    this.setSearchModalOpen(!this.isSearchModalOpen);
  }

  setSearchModalQuery(query) {
    this.searchModalQuery = query;
    this.notify();
  }

  setAddEmployeeModalOpen(isOpen) {
    this.isAddEmployeeModalOpen = Boolean(isOpen);
    this.notify();
  }

  setAddBuyerModalOpen(isOpen) {
    this.isAddBuyerModalOpen = Boolean(isOpen);
    this.notify();
  }

  setInstallModalOpen(isOpen) {
    this.isInstallModalOpen = Boolean(isOpen);
    this.notify();
  }

  setIsQuickEntryOpen(isOpen, tab = 'income') {
    this.isQuickEntryOpen = isOpen;
    if (tab) this.quickEntryTab = tab;
    this.notify();
  }

  setQuickEntryTab(tab) {
    this.quickEntryTab = tab;
    this.notify();
  }

  setSettlingCustomer(cust) {
    this.settlingCustomer = cust;
    this.notify();
  }

  setSelectedTransaction(txn) {
    this.selectedTransaction = txn;
    this.notify();
  }

  setConfirmModal(modalConfig) {
    this.confirmModal = modalConfig;
    this.notify();
  }

  closeConfirmModal() {
    this.confirmModal = null;
    this.notify();
  }

  addTransaction(txnData) {
    const id = txnData.id || generateTxnId(txnData.type === 'income' ? 'INC' : 'EXP');
    const newTxn = {
      ...txnData,
      id,
      amount: Number(txnData.amount) || 0,
      createdAt: txnData.createdAt || new Date().toISOString()
    };

    this.transactions.unshift(newTxn);

    // Update customer figures if income
    if (newTxn.customerId) {
      this.customers = this.customers.map((cust) => {
        if (cust.id !== newTxn.customerId) return cust;

        const billedAmount = Number(newTxn.amount) || 0;
        const paidAmount = Number(newTxn.paidAmount !== undefined ? newTxn.paidAmount : (newTxn.paymentStatus === 'paid' ? billedAmount : 0));
        const dueAmount = Number(newTxn.dueAmount !== undefined ? newTxn.dueAmount : Math.max(0, billedAmount - paidAmount));

        return {
          ...cust,
          totalBilled: (cust.totalBilled || 0) + billedAmount,
          amountReceived: (cust.amountReceived || 0) + paidAmount,
          outstandingDue: (cust.outstandingDue || 0) + dueAmount,
          lastPurchaseDate: newTxn.date || cust.lastPurchaseDate
        };
      });
    }

    // Update worker pending wages if wage payout
    if (newTxn.category === 'Staff Wages' && (newTxn.worker || newTxn.workerId)) {
      this.workers = this.workers.map((w) => {
        if (w.name === newTxn.worker || w.id === newTxn.workerId) {
          const amt = Number(newTxn.amount) || 0;
          return {
            ...w,
            pendingWages: Math.max(0, (w.pendingWages || 0) - amt),
            totalPaid: (w.totalPaid || 0) + amt
          };
        }
        return w;
      });
    }

    this.showToast(`Saved ${newTxn.category} (₹${newTxn.amount.toLocaleString('en-IN')})`);
    this.notify();
    return newTxn;
  }

  recordCustomerSettlement({ customerId, amount, paymentMode = 'Cash', notes = '', date }) {
    const cust = this.customers.find((c) => c.id === customerId);
    if (!cust) return;

    const numAmount = Number(amount) || 0;
    if (numAmount <= 0) return;

    const txnDate = date || getTodayDate();
    const txnId = generateTxnId('PAY');

    const paymentTxn = {
      id: txnId,
      type: 'income',
      category: 'Customer Payments',
      subCategory: 'Due Settlement',
      date: txnDate,
      amount: numAmount,
      customerId: cust.id,
      customerName: cust.name,
      paymentStatus: 'paid',
      paidAmount: numAmount,
      dueAmount: 0,
      paymentMode,
      notes: notes || `Settlement of ₹${numAmount.toLocaleString('en-IN')} via ${paymentMode}`,
      createdAt: new Date().toISOString()
    };

    this.transactions.unshift(paymentTxn);

    this.customers = this.customers.map((c) => {
      if (c.id !== customerId) return c;
      return {
        ...c,
        outstandingDue: Math.max(0, (c.outstandingDue || 0) - numAmount),
        amountReceived: (c.amountReceived || 0) + numAmount,
        lastPurchaseDate: txnDate
      };
    });

    this.settlingCustomer = null;
    this.showToast(`Recorded ₹${numAmount.toLocaleString('en-IN')} from ${cust.name}`);
    this.notify();
  }

  deleteTransaction(txnId) {
    const txn = this.transactions.find((t) => t.id === txnId);
    if (!txn) return;

    // Rollback customer figures
    if (txn.customerId) {
      this.customers = this.customers.map((c) => {
        if (c.id !== txn.customerId) return c;

        if (txn.category === 'Customer Payments') {
          return {
            ...c,
            amountReceived: Math.max(0, (c.amountReceived || 0) - (Number(txn.amount) || 0)),
            outstandingDue: (c.outstandingDue || 0) + (Number(txn.amount) || 0)
          };
        } else {
          const billedAmount = Number(txn.amount) || 0;
          const paidAmount = Number(txn.paidAmount || (txn.paymentStatus === 'paid' ? billedAmount : 0));
          const dueAmount = Number(txn.dueAmount || 0);

          return {
            ...c,
            totalBilled: Math.max(0, (c.totalBilled || 0) - billedAmount),
            amountReceived: Math.max(0, (c.amountReceived || 0) - paidAmount),
            outstandingDue: Math.max(0, (c.outstandingDue || 0) - dueAmount)
          };
        }
      });
    }

    this.transactions = this.transactions.filter((t) => t.id !== txnId);
    if (this.selectedTransaction?.id === txnId) {
      this.selectedTransaction = null;
    }
    this.showToast(`Deleted ${txn.id}`, 'info');
    this.notify();
  }

  addCustomer({ name, phone, city }) {
    const id = `CUST-${Math.floor(100 + Math.random() * 900)}`;
    const newCust = {
      id,
      name: name.trim(),
      phone: phone.trim(),
      city: city ? city.trim() : 'Kerala',
      totalBilled: 0,
      amountReceived: 0,
      outstandingDue: 0,
      lastPurchaseDate: null
    };

    this.customers.push(newCust);
    this.showToast(`Added customer: ${newCust.name}`);
    this.notify();
    return newCust;
  }

  addWorker({ name, role, phone, defaultDailyWage = 0 }) {
    const id = `WRK-${Math.floor(10 + Math.random() * 90)}`;
    const newWorker = {
      id,
      name: name.trim(),
      role: role ? role.trim() : 'Rubber Tapper',
      phone: phone ? phone.trim() : '',
      defaultDailyWage: Number(defaultDailyWage) || 0,
      active: true
    };

    this.workers.push(newWorker);
    this.showToast(`Added worker: ${newWorker.name}`);
    this.notify();
    return newWorker;
  }

  resetToSampleData() {
    this.estate = { ...INITIAL_ESTATE };
    this.transactions = [...INITIAL_TRANSACTIONS];
    this.customers = [...INITIAL_CUSTOMERS];
    this.workers = [...INITIAL_WORKERS];
    this.drivers = [...INITIAL_DRIVERS];
    this.save();
    this.showToast('Reset to demo estate records successfully');
    this.notify();
  }

  clearAllData() {
    this.transactions = [];
    this.customers = this.customers.map((c) => ({ ...c, totalBilled: 0, amountReceived: 0, outstandingDue: 0 }));
    this.save();
    this.showToast('Cleared all transaction ledger records', 'info');
    this.notify();
  }

  getFilteredTransactions() {
    if (this.timeframe === 'all') return this.transactions;

    const todayStr = getTodayDate();
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);
    const firstDayOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    return this.transactions.filter((t) => {
      const txDate = t.date;
      if (!txDate) return true;

      if (this.timeframe === 'today') return txDate === todayStr;
      if (this.timeframe === '7days') return txDate >= sevenDaysAgoStr;
      if (this.timeframe === 'month') return txDate >= firstDayOfMonthStr;
      return true;
    });
  }

  getMetrics() {
    const list = this.getFilteredTransactions();
    let totalIncome = 0;
    let totalExpenses = 0;
    let goodsIncome = 0;
    let wagesAndTravel = 0;

    list.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        totalIncome += amt;
        if (t.category === 'Goods Income') goodsIncome += amt;
      } else if (t.type === 'expense') {
        totalExpenses += amt;
        if (t.category === 'Staff Wages' || t.category === 'Travel') wagesAndTravel += amt;
      }
    });

    const netCashflow = totalIncome - totalExpenses;
    const isSurplus = netCashflow >= 0;

    return {
      totalIncome,
      totalExpenses,
      netCashflow,
      isSurplus,
      goodsIncome,
      wagesAndTravel
    };
  }

  getTotalReceivables() {
    return this.customers.reduce((sum, c) => sum + (Number(c.outstandingDue) || 0), 0);
  }

  getTotalWagesPaid() {
    return this.transactions
      .filter((t) => t.category === 'Staff Wages' || t.subCategory?.includes('Wage') || t.subCategory?.includes('Tapping'))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }

  getTotalPendingWages() {
    return this.workers.reduce((sum, w) => sum + (Number(w.pendingWages) || 0), 0);
  }

  getWorkerTotalPaid(workerId, workerName) {
    return this.transactions
      .filter((t) => (t.category === 'Staff Wages') && (t.workerId === workerId || (workerName && (t.worker === workerName || t.notes?.includes(workerName)))))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }
}

export const store = new StateStore();

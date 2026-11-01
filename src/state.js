import {
  INITIAL_ESTATE,
  INITIAL_CUSTOMERS,
  INITIAL_WORKERS,
  INITIAL_DRIVERS,
  INITIAL_TRANSACTIONS
} from './data/initialData.js';
import { generateTxnId, getTodayDate, getYesterdayDate } from './utils/formatters.js';

const STORAGE_KEYS = {
  ESTATE: 'rubberflow_estate_v2',
  TRANSACTIONS: 'rubberflow_transactions_v2',
  CUSTOMERS: 'rubberflow_customers_v2',
  WORKERS: 'rubberflow_workers_v2',
  DRIVERS: 'rubberflow_drivers_v2',
  NOTIFICATIONS: 'rubberflow_notifications_v2',
  BALANCE_HIDDEN: 'rubberflow_balance_hidden_v2',
};

export const INITIAL_NOTIFICATIONS = [];

class StateStore {
  constructor() {
    this.listeners = new Set();
    this.init();
  }

  init() {
    // Purge legacy mock data from v1 keys
    try {
      const legacyKeys = [
        'rubberflow_estate_v1',
        'rubberflow_transactions_v1',
        'rubberflow_customers_v1',
        'rubberflow_workers_v1',
        'rubberflow_drivers_v1',
        'rubberflow_notifications_v1',
        'rubberflow_balance_hidden_v1'
      ];
      legacyKeys.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }

    try {
      const e = localStorage.getItem(STORAGE_KEYS.ESTATE);
      const parsed = e ? JSON.parse(e) : null;
      this.estate = {
        ...INITIAL_ESTATE,
        ...(parsed || {})
      };
      if (!this.estate.owner) this.estate.owner = INITIAL_ESTATE.owner;
      if (!this.estate.location || this.estate.location.includes("Pala, Kottayam")) this.estate.location = INITIAL_ESTATE.location;
      if (!this.estate.name || this.estate.name === "My Rubber Estate") this.estate.name = INITIAL_ESTATE.name;
    } catch {
      this.estate = { ...INITIAL_ESTATE };
    }

    try {
      const t = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const parsed = t ? JSON.parse(t) : [...INITIAL_TRANSACTIONS];
      this.transactions = (Array.isArray(parsed) ? parsed : [])
        .filter((txn) => !txn.id?.startsWith('TXN-907') && !txn.id?.startsWith('TXN-908'))
        .map((txn) => {
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
      const parsed = c ? JSON.parse(c) : [...INITIAL_CUSTOMERS];
      this.customers = (Array.isArray(parsed) ? parsed : [])
        .filter((cust) => !cust.id?.startsWith('CUST-10'));
    } catch {
      this.customers = [...INITIAL_CUSTOMERS];
    }

    try {
      const w = localStorage.getItem(STORAGE_KEYS.WORKERS);
      const parsed = w ? JSON.parse(w) : [...INITIAL_WORKERS];
      this.workers = (Array.isArray(parsed) ? parsed : [])
        .filter((wrk) => !wrk.id?.startsWith('WRK-0'));
    } catch {
      this.workers = [...INITIAL_WORKERS];
    }

    try {
      const d = localStorage.getItem(STORAGE_KEYS.DRIVERS);
      const parsed = d ? JSON.parse(d) : [...INITIAL_DRIVERS];
      this.drivers = (Array.isArray(parsed) ? parsed : [])
        .filter((drv) => !drv.id?.startsWith('DRV-0'));
    } catch {
      this.drivers = [...INITIAL_DRIVERS];
    }

    try {
      const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const parsed = n ? JSON.parse(n) : [...INITIAL_NOTIFICATIONS];
      this.notifications = (Array.isArray(parsed) ? parsed : [])
        .filter((notif) => !notif.id?.startsWith('notif-'));
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
    this.successModal = null;
    this.isInstallModalOpen = false;
    this.selectedCustomerId = null;
    this.selectedWorkerId = null;
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
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
    } catch (e) {
      console.warn("LocalStorage save warning:", e);
    }
  }

  getUnreadNotificationCount() {
    if (!this.notifications) return 0;
    return this.notifications.filter(n => n.unread).length;
  }

  markNotificationRead(id) {
    if (!this.notifications) return;
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, unread: false } : n);
    this.notify();
  }

  markAllNotificationsRead() {
    if (!this.notifications) return;
    this.notifications = this.notifications.map(n => ({ ...n, unread: false }));
    this.showToast('All notifications marked as read', 'success');
    this.notify();
  }

  deleteNotification(id) {
    if (!this.notifications) return;
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.showToast('Notification removed', 'info');
    this.notify();
  }

  clearAllNotifications() {
    this.notifications = [];
    this.showToast('All notifications cleared', 'info');
    this.notify();
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
    this.selectedCustomerId = null;
    this.selectedWorkerId = null;
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

  openConfirmModal(modalConfig) {
    this.setConfirmModal(modalConfig);
  }

  showConfirmModal(modalConfig) {
    this.setConfirmModal(modalConfig);
  }

  closeConfirmModal() {
    if (!this.confirmModal) return;
    this.confirmModal = null;
    this.notify();
  }

  showSuccessModal(config) {
    this.successModal = config;
    this.notify();
  }

  closeSuccessModal() {
    this.successModal = null;
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
    if (newTxn.category === 'Staff Wages' && (newTxn.worker || newTxn.workerId || newTxn.workerName)) {
      this.workers = this.workers.map((w) => {
        if (w.name === newTxn.worker || w.id === newTxn.workerId || w.name === newTxn.workerName) {
          const amt = Number(newTxn.amount) || 0;
          return {
            ...w,
            pendingWages: Math.max(0, (w.pendingWages || 0) - amt),
            totalPaid: (w.totalPaid || 0) + amt,
            lastPaidDate: newTxn.date || getTodayDate()
          };
        }
        return w;
      });
    }

    // Determine success popup configuration
    const isIncome = newTxn.type === 'income';
    const isWage = newTxn.category === 'Staff Wages';
    const isCustomerPayment = newTxn.category === 'Customer Payments' || newTxn.subCategory === 'Due Settlement';

    let title = 'Expense Recorded!';
    let modalType = 'expense';
    let subtitle = 'Operating expense successfully logged to ledger';

    if (isWage) {
      title = 'Wage Payout Recorded!';
      modalType = 'wage';
      subtitle = 'Staff compensation disbursed and logged';
    } else if (isCustomerPayment) {
      title = 'Payment Received!';
      modalType = 'payment';
      subtitle = 'Customer settlement successfully recorded';
    } else if (isIncome) {
      title = 'Sale Recorded!';
      modalType = 'income';
      subtitle = 'Rubber sale entry saved to ledger';
    }

    const partyName = newTxn.customerName || newTxn.worker || newTxn.workerName || (newTxn.customerId ? this.customers.find(c => c.id === newTxn.customerId)?.name : null);

    this.showToast(`Saved ${newTxn.category} (₹${newTxn.amount.toLocaleString('en-IN')})`);

    this.showSuccessModal({
      type: modalType,
      title,
      subtitle,
      amount: newTxn.amount,
      category: newTxn.category || 'General',
      partyName: partyName || null,
      paymentMode: newTxn.paymentMode || 'Cash',
      date: newTxn.date || getTodayDate(),
      id: newTxn.id,
      notes: newTxn.notes || ''
    });

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

    this.showSuccessModal({
      type: 'payment',
      title: 'Payment Received!',
      subtitle: `Settlement from ${cust.name} recorded`,
      amount: numAmount,
      category: 'Customer Due Settlement',
      partyName: cust.name,
      paymentMode,
      date: txnDate,
      id: txnId,
      notes: notes || `Settlement via ${paymentMode}`
    });
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

    // Rollback worker figures if wage payout
    if (txn.category === 'Staff Wages' && (txn.worker || txn.workerId)) {
      this.workers = this.workers.map((w) => {
        if (w.name === txn.worker || w.id === txn.workerId) {
          const amt = Number(txn.amount) || 0;
          return {
            ...w,
            pendingWages: (w.pendingWages || 0) + amt,
            totalPaid: Math.max(0, (w.totalPaid || 0) - amt)
          };
        }
        return w;
      });
    }

    this.transactions = this.transactions.filter((t) => t.id !== txnId);
    if (this.selectedTransaction?.id === txnId) {
      this.selectedTransaction = null;
    }
    this.showToast(`Deleted ${txn.category || txn.id}`, 'info');
    this.notify();
  }

  deleteCustomer(customerId) {
    const cust = this.customers.find(c => c.id === customerId);
    if (!cust) return;
    this.customers = this.customers.filter(c => c.id !== customerId);
    if (this.selectedCustomerId === customerId) {
      this.selectedCustomerId = null;
      this.activeTab = 'customers';
    }
    this.showToast(`Deleted customer: ${cust.name}`, 'info');
    this.notify();
  }

  deleteWorker(workerId) {
    const worker = this.workers.find(w => w.id === workerId);
    if (!worker) return;
    this.workers = this.workers.filter(w => w.id !== workerId);
    if (this.selectedWorkerId === workerId) {
      this.selectedWorkerId = null;
      this.activeTab = 'employees';
    }
    this.showToast(`Deleted employee: ${worker.name}`, 'info');
    this.notify();
  }

  viewCustomer(customerId) {
    this.selectedCustomerId = customerId;
    this.selectedWorkerId = null;
    this.activeTab = 'customers';
    if (window.location.hash !== `#customer/${customerId}`) {
      try {
        window.history.pushState(null, '', `#customer/${customerId}`);
      } catch {
        window.location.hash = `#customer/${customerId}`;
      }
    }
    this.notify();
  }

  viewWorker(workerId) {
    this.selectedWorkerId = workerId;
    this.selectedCustomerId = null;
    this.activeTab = 'employees';
    if (window.location.hash !== `#employee/${workerId}`) {
      try {
        window.history.pushState(null, '', `#employee/${workerId}`);
      } catch {
        window.location.hash = `#employee/${workerId}`;
      }
    }
    this.notify();
  }

  clearSelectedCustomer() {
    this.selectedCustomerId = null;
    this.activeTab = 'customers';
    try {
      window.history.pushState(null, '', '#customers');
    } catch {
      window.location.hash = '#customers';
    }
    this.notify();
  }

  clearSelectedWorker() {
    this.selectedWorkerId = null;
    this.activeTab = 'employees';
    try {
      window.history.pushState(null, '', '#employees');
    } catch {
      window.location.hash = '#employees';
    }
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
    this.transactions = [];
    this.customers = [];
    this.workers = [];
    this.drivers = [];
    this.notifications = [];
    this.save();
    this.showToast('Reset estate to clean state');
    this.notify();
  }

  clearAllData() {
    this.transactions = [];
    this.customers = [];
    this.workers = [];
    this.drivers = [];
    this.notifications = [];
    this.save();
    this.showToast('Cleared all records permanently', 'info');
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

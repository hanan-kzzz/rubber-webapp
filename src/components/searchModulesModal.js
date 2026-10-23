import { store } from '../state.js';
import { icons } from '../icons.js';
import { setSelectedExpenseCategory } from './expensesPage.js';
import { setSelectedWorkerId } from './wagesPage.js';
import { exportRubberLedgerToExcel } from '../utils/excelExport.js';
import { openInstallModal } from './installModal.js';

let activeFilter = 'all'; // 'all', 'pages', 'actions', 'directory'
let activeSelectedIndex = 0;

// Static catalog of searchable modules and quick operations
const BASE_MODULES = [
  // 1. Core Modules / Pages
  {
    id: 'module-dashboard',
    type: 'pages',
    title: 'Home Dashboard',
    subtitle: 'Estate balance overview, cash flow summary & recent activity',
    category: 'Core Page',
    badge: 'PAGE',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    iconBg: 'bg-slate-900 text-white',
    icon: (cls) => icons.home(cls),
    keywords: ['home', 'dashboard', 'overview', 'summary', 'net balance', 'cash flow', 'transactions', 'stats', 'recent'],
    action: () => {
      store.setActiveTab('dashboard');
    }
  },
  {
    id: 'module-income',
    type: 'pages',
    title: 'Customer Payments & Sales',
    subtitle: 'Latex yield logging, rubber sheets, scrap sales & DRC calculation',
    category: 'Core Page',
    badge: 'PAGE',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-600 text-white',
    icon: (cls) => icons.wallet(cls),
    keywords: ['income', 'sales', 'latex', 'sheet', 'scrap', 'rubber', 'drc', 'customer', 'buyer', 'revenue', 'payment', 'billing'],
    action: () => {
      store.setActiveTab('income');
    }
  },
  {
    id: 'module-expenses',
    type: 'pages',
    title: 'Expense & Employees Page',
    subtitle: 'Operational spend, farm inputs, employee roster & daily wage payouts',
    category: 'Core Page',
    badge: 'PAGE',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    iconBg: 'bg-rose-600 text-white',
    icon: (cls) => icons.banknote(cls),
    keywords: ['expense', 'employees', 'spend', 'costs', 'fertilizer', 'acid', 'fuel', 'diesel', 'wages', 'workers', 'payroll'],
    action: () => {
      store.setActiveTab('expenses');
    }
  },
  {
    id: 'module-wages',
    type: 'pages',
    title: 'Worker Wages & Payroll',
    subtitle: 'Rubber tapper daily wages, labor advances, attendance & pay logs',
    category: 'Core Page',
    badge: 'PAGE',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconBg: 'bg-indigo-600 text-white',
    icon: (cls) => icons.users(cls),
    keywords: ['wages', 'worker', 'payroll', 'salary', 'tapping', 'labor', 'advance', 'payout', 'tapper', 'attendance', 'daily wage'],
    action: () => {
      store.setActiveTab('wages');
    }
  },
  {
    id: 'module-dues',
    type: 'pages',
    title: 'Customers & Receivables',
    subtitle: 'Buyer balances, customer directory, outstanding dues & WhatsApp notices',
    category: 'Core Page',
    badge: 'PAGE',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    iconBg: 'bg-amber-500 text-white',
    icon: (cls) => icons.users(cls),
    keywords: ['customers', 'buyers', 'dealers', 'dues', 'receivables', 'debt', 'pending', 'balance', 'credit', 'settle', 'whatsapp'],
    action: () => {
      store.setActiveTab('customers');
    }
  },
  {
    id: 'module-ledger',
    type: 'pages',
    title: 'Analytics & Financial Ledger',
    subtitle: 'Complete cash flow history, monthly profit & loss, charts & report export',
    category: 'Core Page',
    badge: 'PAGE',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
    iconBg: 'bg-violet-600 text-white',
    icon: (cls) => icons.barChart(cls),
    keywords: ['ledger', 'analytics', 'reports', 'charts', 'profit', 'loss', 'p&l', 'statement', 'cashflow', 'history', 'trends'],
    action: () => {
      store.setActiveTab('ledger');
    }
  },
  {
    id: 'module-cfo',
    type: 'pages',
    title: 'Settings & AI CFO Hub',
    subtitle: 'Estate rates, plantation acreage, AI financial advice & data management',
    category: 'Core Page',
    badge: 'PAGE',
    badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    iconBg: 'bg-[#18181b] text-[#a3e635]',
    icon: (cls) => icons.cfo(cls),
    keywords: ['settings', 'cfo', 'ai', 'advisor', 'estate config', 'profile', 'tapping rate', 'acreage', 'backup', 'reset', 'intelligence'],
    action: () => {
      store.setActiveTab('cfo');
    }
  },
  {
    id: 'module-notifications',
    type: 'pages',
    title: 'Notification Center',
    subtitle: 'Real-time alerts, buyer overdue dues, crew wages & lab DRC grade certifications',
    category: 'Core Page',
    badge: 'PAGE',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    iconBg: 'bg-rose-600 text-white',
    icon: (cls) => icons.bell(cls),
    keywords: ['notifications', 'alerts', 'notices', 'bell', 'unread', 'updates', 'reminders', 'dues alerts', 'wage notices'],
    action: () => {
      store.setActiveTab('notifications');
    }
  },

  // 2. Direct Actions & Tools
  {
    id: 'action-download-app',
    type: 'actions',
    title: 'Download & Install App (PWA)',
    subtitle: 'Install RubberFlow on your phone or PC for 1-tap offline estate accounting',
    category: 'Application',
    badge: 'INSTALL',
    badgeClass: 'bg-lime-50 text-lime-800 border-lime-300',
    iconBg: 'bg-[#18181b] text-[#a3e635]',
    icon: (cls) => icons.download(cls),
    keywords: ['download app', 'install app', 'pwa', 'offline', 'add to home screen', 'install rubberflow', 'mobile app', 'downloadable'],
    action: () => {
      openInstallModal();
    }
  },
  {
    id: 'action-add-employee',
    type: 'actions',
    title: 'Add New Employee / Worker',
    subtitle: 'Register a new rubber tapper, daily worker, or driver',
    category: 'Quick Action',
    badge: 'ACTION',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconBg: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    icon: (cls) => icons.userPlus(cls),
    keywords: ['add employee', 'new worker', 'hire', 'tapper', 'laborer', 'driver', 'register employee', 'staff'],
    action: () => {
      store.setAddEmployeeModalOpen(true);
    }
  },
  {
    id: 'action-add-buyer',
    type: 'actions',
    title: 'Add New Customer / Buyer',
    subtitle: 'Register rubber dealer, merchant, or wholesale buyer with credit limit',
    category: 'Quick Action',
    badge: 'ACTION',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    icon: (cls) => icons.users(cls),
    keywords: ['add customer', 'new buyer', 'add buyer', 'dealer', 'merchant', 'trader', 'register customer', 'client'],
    action: () => {
      store.setAddBuyerModalOpen(true);
    }
  },
  {
    id: 'action-export-excel',
    type: 'actions',
    title: 'Export Estate Ledger (.xlsx)',
    subtitle: 'Instantly download complete estate data to an Excel spreadsheet',
    category: 'Quick Action',
    badge: 'EXPORT',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-600 text-white',
    icon: (cls) => icons.fileSpreadsheet(cls),
    keywords: ['export excel', 'download excel', 'xlsx', 'spreadsheet', 'download ledger', 'backup data', 'report download', 'sheetjs'],
    action: () => {
      exportRubberLedgerToExcel({
        transactions: store.transactions,
        customers: store.customers,
        workers: store.workers,
        estate: store.estate
      });
      store.showToast('Ledger workbook exported successfully (.xlsx)', 'success');
    }
  },
  {
    id: 'action-drc-calculator',
    type: 'actions',
    title: 'Dry Rubber Content (DRC) Tool',
    subtitle: 'Calculate dry rubber weight and total value based on field latex DRC %',
    category: 'Tool',
    badge: 'TOOL',
    badgeClass: 'bg-lime-50 text-lime-800 border-lime-300',
    iconBg: 'bg-[#a3e635] text-slate-950',
    icon: (cls) => icons.scale(cls),
    keywords: ['drc', 'calculator', 'dry rubber content', 'percentage', 'latex calculation', 'sample test', 'metrolac'],
    action: () => {
      store.setActiveTab('income');
    }
  },
  {
    id: 'action-diesel-expense',
    type: 'actions',
    title: 'Log Diesel & Fuel Expense',
    subtitle: 'Quick log for estate vehicle diesel, tractor, or generator fuel',
    category: 'Quick Action',
    badge: 'EXPENSE',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    iconBg: 'bg-amber-50 text-amber-700 border border-amber-100',
    icon: (cls) => icons.truck(cls),
    keywords: ['diesel', 'fuel', 'petrol', 'tractor', 'travel', 'vehicle', 'generator', 'expense'],
    action: () => {
      setSelectedExpenseCategory('Travel & Diesel');
      store.setActiveTab('expenses');
    }
  },
  {
    id: 'action-tools-expense',
    type: 'actions',
    title: 'Log Maintenance & Tools Expense',
    subtitle: 'Tapping knives, sharpeners, latex collection cups, spouts & repairs',
    category: 'Quick Action',
    badge: 'EXPENSE',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    iconBg: 'bg-slate-100 text-slate-800 border border-slate-200',
    icon: (cls) => icons.wrench(cls),
    keywords: ['maintenance', 'tools', 'knives', 'cups', 'spouts', 'repairs', 'hardware', 'equipment'],
    action: () => {
      setSelectedExpenseCategory('Maintenance');
      store.setActiveTab('expenses');
    }
  },
  {
    id: 'action-toggle-privacy',
    type: 'actions',
    title: 'Toggle Balance Privacy',
    subtitle: 'Hide or reveal dashboard net balance and rupee totals on screen',
    category: 'Privacy',
    badge: 'PRIVACY',
    badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    iconBg: 'bg-zinc-100 text-zinc-800 border border-zinc-200',
    icon: (cls) => icons.eyeOff(cls),
    keywords: ['privacy', 'hide balance', 'reveal balance', 'mask amounts', 'conceal', 'discreet', 'rupees'],
    action: () => {
      store.toggleBalanceVisibility();
      store.showToast(store.isBalanceHidden ? 'Balances hidden for privacy' : 'Balances revealed', 'info');
    }
  },
  {
    id: 'action-ai-cfo',
    type: 'actions',
    title: 'Consult AI CFO Advisor',
    subtitle: 'Ask AI for insights on yield trends, cutting costs, or cash flow forecasts',
    category: 'AI Assistant',
    badge: 'AI CFO',
    badgeClass: 'bg-lime-50 text-lime-800 border-lime-300',
    iconBg: 'bg-[#18181b] text-[#a3e635]',
    icon: (cls) => icons.sparkles(cls),
    keywords: ['ai', 'cfo', 'advisor', 'consult', 'assistant', 'forecast', 'insights', 'yield analysis', 'questions'],
    action: () => {
      store.setActiveTab('cfo');
    }
  }
];

function getSearchItems(query) {
  const q = (query || '').trim().toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);

  // Dynamic directory items from live state
  const customerItems = (store.customers || []).map((c) => ({
    id: `customer-${c.id}`,
    type: 'directory',
    title: c.name,
    subtitle: `${c.town ? `${c.town} • ` : ''}Due: ₹${(c.outstandingDue || 0).toLocaleString('en-IN')}`,
    category: 'Buyer / Customer',
    badge: 'BUYER',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    iconBg: 'bg-amber-50 text-amber-700 border border-amber-100',
    icon: (cls) => icons.creditCard(cls),
    keywords: [
      c.name.toLowerCase(),
      (c.town || '').toLowerCase(),
      (c.phone || '').toLowerCase(),
      'buyer',
      'customer',
      'dues',
      'settle'
    ],
    action: () => {
      store.setActiveTab('dues');
    }
  }));

  const workerItems = (store.workers || []).map((w) => ({
    id: `worker-${w.id}`,
    type: 'directory',
    title: w.name,
    subtitle: `${w.role || 'Worker'} • Wage: ₹${w.defaultDailyWage || 750}/day`,
    category: 'Employee / Worker',
    badge: 'WORKER',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconBg: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    icon: (cls) => icons.user(cls),
    keywords: [
      w.name.toLowerCase(),
      (w.role || '').toLowerCase(),
      (w.phone || '').toLowerCase(),
      'worker',
      'employee',
      'tapper',
      'wages',
      'pay'
    ],
    action: () => {
      setSelectedWorkerId(w.id);
      store.setActiveTab('wages');
    }
  }));

  const allItems = [...BASE_MODULES, ...customerItems, ...workerItems];

  // Filter by active category tab if selected
  let filtered = allItems;
  if (activeFilter !== 'all') {
    filtered = filtered.filter((item) => item.type === activeFilter);
  }

  // Filter by search query
  if (tokens.length > 0) {
    filtered = filtered.filter((item) => {
      const searchTarget = [
        item.title,
        item.subtitle,
        item.category,
        ...(item.keywords || [])
      ].join(' ').toLowerCase();

      return tokens.every((token) => searchTarget.includes(token));
    });
  }

  return filtered;
}

function highlightMatch(text, query) {
  if (!query || !query.trim()) return text;
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return text;

  try {
    const pattern = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    return text.replace(pattern, '<mark class="bg-lime-200 text-slate-900 rounded-xs px-0.5 font-bold">$1</mark>');
  } catch {
    return text;
  }
}

export function renderSearchModulesModal() {
  if (!store.isSearchModalOpen) return '';

  const query = store.searchModalQuery || '';
  const items = getSearchItems(query);

  if (activeSelectedIndex >= items.length) {
    activeSelectedIndex = Math.max(0, items.length - 1);
  }

  return `
    <div 
      id="search-modules-backdrop" 
      class="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-14 px-3 sm:px-4 bg-slate-950/65 backdrop-blur-xs transition-opacity animate-fade-in"
      style="touch-action: none;"
      aria-modal="true"
      role="dialog"
    >
      <div 
        id="search-modules-card" 
        class="w-full max-w-lg bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200/90 flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden animate-slide-up select-none pointer-events-auto overscroll-contain"
        style="touch-action: pan-y; overscroll-behavior: contain;"
      >
        <!-- Modal Top Bar: Search Input, Clear & Close Buttons -->
        <div class="p-4 sm:p-4.5 border-b border-slate-100 flex items-center space-x-3 shrink-0 bg-white">
          <div class="text-slate-400 shrink-0">
            ${icons.search("w-5 h-5 text-slate-500")}
          </div>

          <div class="flex-1 relative">
            <input
              id="search-modules-input"
              type="text"
              value="${query}"
              placeholder="Search modules, pages, actions, workers..."
              class="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
            />
          </div>

          ${query ? `
            <button
              id="btn-clear-search-query"
              class="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-500 flex items-center justify-center transition-all shrink-0"
              title="Clear search"
            >
              ${icons.x("w-3.5 h-3.5 stroke-[2.5]")}
            </button>
          ` : ''}

          <button
            id="btn-close-search-modal"
            class="px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 text-xs font-bold transition-all shrink-0 flex items-center space-x-1"
            title="Close (Esc)"
          >
            <span>Esc</span>
            ${icons.x("w-3.5 h-3.5 stroke-[2.5]")}
          </button>
        </div>

        <!-- Filter Category Tabs -->
        <div class="px-4 py-2.5 border-b border-slate-100/80 bg-slate-50/60 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs font-bold">
          <button
            class="filter-tab-btn px-3 py-1.5 rounded-full transition-all shrink-0 ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80'
            }"
            data-filter="all"
          >
            All Modules
          </button>

          <button
            class="filter-tab-btn px-3 py-1.5 rounded-full transition-all shrink-0 ${
              activeFilter === 'pages'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80'
            }"
            data-filter="pages"
          >
            Core Pages
          </button>

          <button
            class="filter-tab-btn px-3 py-1.5 rounded-full transition-all shrink-0 ${
              activeFilter === 'actions'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80'
            }"
            data-filter="actions"
          >
            Actions & Tools
          </button>

          <button
            class="filter-tab-btn px-3 py-1.5 rounded-full transition-all shrink-0 ${
              activeFilter === 'directory'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80'
            }"
            data-filter="directory"
          >
            Buyers & Workers
          </button>
        </div>

        <!-- Scrollable Search Results Area -->
        <div 
          id="search-modules-list" 
          class="flex-1 overflow-y-auto overscroll-contain p-2.5 sm:p-3 space-y-1.5 no-scrollbar focus:outline-none"
          tabindex="0"
        >
          ${items.length === 0 ? `
            <!-- Empty Results State -->
            <div class="py-12 px-4 text-center flex flex-col items-center justify-center space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                ${icons.search("w-6 h-6 stroke-[1.8]")}
              </div>
              <div>
                <h4 class="text-sm font-bold text-slate-800">No modules found</h4>
                <p class="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  No matching module for "${query}". Try searching for 
                  <span class="font-semibold text-slate-600">payments, expenses, wages, dues,</span> or a worker/buyer name.
                </p>
              </div>
              <button
                id="btn-reset-search-empty"
                class="mt-2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black active:scale-95 transition-all shadow-xs"
              >
                Clear Search
              </button>
            </div>
          ` : `
            <!-- Results Header Info -->
            <div class="px-2 pt-1 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>${items.length} ${items.length === 1 ? 'Module' : 'Modules & Items'}</span>
              <span class="hidden sm:inline">Use ↑ ↓ to navigate • Enter to open</span>
            </div>

            <!-- List Items -->
            ${items.map((item, idx) => {
              const isSelected = idx === activeSelectedIndex;
              return `
                <div
                  data-index="${idx}"
                  data-item-id="${item.id}"
                  class="search-item-row group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-slate-100/90 border-slate-300/80 shadow-xs ring-1 ring-slate-900/10'
                      : 'bg-white hover:bg-slate-50 border-slate-100/80'
                  }"
                  role="button"
                >
                  <div class="flex items-center space-x-3 min-w-0 pr-2">
                    <div class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs ${item.iconBg}">
                      ${item.icon("w-5 h-5")}
                    </div>

                    <div class="min-w-0">
                      <div class="flex items-center space-x-2">
                        <span class="text-sm font-bold text-slate-900 truncate">
                          ${highlightMatch(item.title, query)}
                        </span>
                        <span class="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border shrink-0 ${item.badgeClass}">
                          ${item.badge}
                        </span>
                      </div>
                      <p class="text-xs text-slate-500 truncate mt-0.5">
                        ${item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div class="shrink-0 flex items-center text-slate-400 group-hover:text-slate-800 transition-colors">
                    ${icons.chevronRight("w-4 h-4")}
                  </div>
                </div>
              `;
            }).join('')}
          `}
        </div>

        <!-- Footer Shortcuts Hint -->
        <div class="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div class="flex items-center space-x-2">
            <span class="w-2 h-2 rounded-full bg-[#84cc16]"></span>
            <span class="font-semibold text-slate-700">RubberFlow Instant Search</span>
          </div>
          <div class="flex items-center space-x-3 text-slate-400">
            <span>Tap any item to launch</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function attachSearchModulesEvents() {
  if (!store.isSearchModalOpen) return;

  const backdrop = document.getElementById('search-modules-backdrop');
  const card = document.getElementById('search-modules-card');
  const closeBtn = document.getElementById('btn-close-search-modal');
  const clearBtn = document.getElementById('btn-clear-search-query');
  const resetEmptyBtn = document.getElementById('btn-reset-search-empty');
  const searchInput = document.getElementById('search-modules-input');
  const filterBtns = document.querySelectorAll('.filter-tab-btn');
  const itemRows = document.querySelectorAll('.search-item-row');

  // Auto focus input
  if (searchInput) {
    setTimeout(() => {
      searchInput.focus();
      const valLen = searchInput.value.length;
      searchInput.setSelectionRange(valLen, valLen);
    }, 50);

    searchInput.oninput = (e) => {
      activeSelectedIndex = 0;
      store.setSearchModalQuery(e.target.value);
    };

    searchInput.onkeydown = (e) => {
      const items = getSearchItems(store.searchModalQuery);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (items.length > 0) {
          activeSelectedIndex = (activeSelectedIndex + 1) % items.length;
          store.notify();
          scrollSelectedIntoView();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (items.length > 0) {
          activeSelectedIndex = (activeSelectedIndex - 1 + items.length) % items.length;
          store.notify();
          scrollSelectedIntoView();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items.length > 0 && items[activeSelectedIndex]) {
          executeItemAction(items[activeSelectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        store.setSearchModalOpen(false);
      }
    };
  }

  function scrollSelectedIntoView() {
    setTimeout(() => {
      const selectedEl = document.querySelector(`.search-item-row[data-index="${activeSelectedIndex}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }, 20);
  }

  function executeItemAction(item) {
    if (!item) return;
    store.setSearchModalOpen(false);
    if (typeof item.action === 'function') {
      item.action();
    }
  }

  if (closeBtn) {
    closeBtn.onclick = () => store.setSearchModalOpen(false);
  }

  if (clearBtn) {
    clearBtn.onclick = () => {
      activeSelectedIndex = 0;
      store.setSearchModalQuery('');
      if (searchInput) searchInput.focus();
    };
  }

  if (resetEmptyBtn) {
    resetEmptyBtn.onclick = () => {
      activeSelectedIndex = 0;
      activeFilter = 'all';
      store.setSearchModalQuery('');
      if (searchInput) searchInput.focus();
    };
  }

  if (backdrop) {
    backdrop.onclick = (e) => {
      if (e.target === backdrop) {
        store.setSearchModalOpen(false);
      }
    };
    backdrop.addEventListener('touchmove', (e) => {
      if (e.target === backdrop) e.preventDefault();
    }, { passive: false });
  }

  filterBtns.forEach((btn) => {
    btn.onclick = () => {
      const filter = btn.getAttribute('data-filter');
      if (filter && activeFilter !== filter) {
        activeFilter = filter;
        activeSelectedIndex = 0;
        store.notify();
        if (searchInput) searchInput.focus();
      }
    };
  });

  itemRows.forEach((row) => {
    row.onclick = () => {
      const idx = Number(row.getAttribute('data-index'));
      const items = getSearchItems(store.searchModalQuery);
      if (!isNaN(idx) && items[idx]) {
        executeItemAction(items[idx]);
      }
    };
  });
}

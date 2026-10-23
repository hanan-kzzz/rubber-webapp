import { store } from '../state.js';
import { icons } from '../icons.js';
import { exportRubberLedgerToExcel } from '../utils/excelExport.js';
import { AI_CFO_PROMPTS } from '../data/aiPrompts.js';
import { openInstallModal } from './installModal.js';

let copiedPromptId = null;

export function renderCfoHub() {
  const { estate } = store;

  return `
    <div class="space-y-4 pb-8 pt-1">
      <!-- 1. Profile Avatar & Name (Exact Monex Settings Screen) -->
      <div class="text-center py-2 space-y-2">
        <div class="w-20 h-20 rounded-full bg-slate-900 text-lime-400 p-[3px] mx-auto shadow-md relative">
          <div class="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-800">
            ${icons.leaf("w-8 h-8 text-[#18181b]")}
          </div>
          <span class="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-lime-500 border-2 border-white"></span>
        </div>

        <div>
          <h2 class="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
            ${estate.owner}
          </h2>
          <span class="text-xs font-medium text-slate-400">
            @${estate.name.toLowerCase().replace(/\s+/g, '')} • ${estate.location}
          </span>
        </div>
      </div>

      <!-- App Download & Install Banner -->
      <div 
        id="btn-cfo-download-app"
        class="rounded-[24px] bg-[#18181b] text-white p-4 shadow-md border border-zinc-800 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all group"
      >
        <div class="flex items-center space-x-3.5">
          <div class="w-10 h-10 rounded-2xl bg-[#a3e635] text-slate-950 flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
            ${icons.download("w-5 h-5 text-slate-950 stroke-[2.5]")}
          </div>
          <div>
            <div class="flex items-center space-x-1.5">
              <h3 class="text-xs font-black tracking-tight text-white">Download RubberFlow App</h3>
              <span class="px-1.5 py-0.5 rounded-full bg-[#a3e635]/20 text-[#bef264] text-[9px] font-bold">Offline PWA</span>
            </div>
            <p class="text-[11px] text-zinc-400 mt-0.5">Install on home screen for 1-tap offline use</p>
          </div>
        </div>
        <div class="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 group-hover:bg-zinc-700 transition-colors">
          ${icons.arrowRight("w-4 h-4")}
        </div>
      </div>

      <!-- 2. Two Feature Cards Side-by-Side (Standard Plan & AI CFO from Monex Settings) -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Card 1: Estate Plan -->
        <div class="rounded-[24px] bg-white p-4 border border-slate-100 shadow-2xs space-y-2">
          <div class="w-8 h-8 rounded-full bg-lime-100 text-lime-900 flex items-center justify-center font-bold text-xs">
            ★
          </div>
          <div>
            <h3 class="text-xs font-bold text-slate-900">Standard Plan</h3>
            <span class="text-[10px] text-slate-400">Rubber Plantation</span>
          </div>
        </div>

        <!-- Card 2: 1-Click Excel -->
        <div
          id="btn-export-excel-card"
          class="rounded-[24px] bg-white p-4 border border-slate-100 hover:border-slate-300 shadow-2xs space-y-2 cursor-pointer active:scale-95 transition-all"
        >
          <div class="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
            ${icons.download("w-4 h-4 text-white")}
          </div>
          <div>
            <h3 class="text-xs font-bold text-slate-900">Excel Export</h3>
            <span class="text-[10px] text-slate-400 font-mono">.xlsx Pure JS</span>
          </div>
        </div>
      </div>

      <!-- 3. AI CFO Prompts (Clean Accordion/Cards) -->
      <div class="space-y-2 pt-1">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 block">
          AI CFO Prompts (Copy & Paste)
        </span>

        <div class="space-y-2">
          ${AI_CFO_PROMPTS.slice(0, 3).map((prompt) => {
            const isCopied = copiedPromptId === prompt.id;
            return `
              <div class="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between">
                <div class="min-w-0 mr-2">
                  <h4 class="text-xs font-bold text-slate-900 truncate">${prompt.title}</h4>
                  <span class="text-[10px] text-slate-400 block mt-0.5 truncate">${prompt.shortDesc}</span>
                </div>
                <button
                  data-prompt-id="${prompt.id}"
                  class="btn-copy-prompt shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isCopied
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }"
                >
                  ${isCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 4. Settings List Rows -->
      <div class="rounded-2xl bg-white border border-slate-100 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        <button
          id="btn-goto-dues-settings"
          class="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
        >
          <div class="flex items-center space-x-3">
            <span class="text-slate-400">${icons.creditCard("w-4 h-4")}</span>
            <span class="text-xs font-semibold text-slate-800">Customer Dues & WhatsApp Reminders</span>
          </div>
          <span class="text-slate-400">${icons.chevronRight("w-4 h-4")}</span>
        </button>

        <button
          id="btn-reset-demo"
          class="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
        >
          <div class="flex items-center space-x-3">
            <span class="text-slate-400">${icons.rotateCcw("w-4 h-4")}</span>
            <span class="text-xs font-semibold text-slate-800">Reset Demo Data</span>
          </div>
          <span class="text-slate-400">${icons.chevronRight("w-4 h-4")}</span>
        </button>

        <button
          id="btn-clear-all"
          class="w-full p-3.5 flex items-center justify-between hover:bg-rose-50 text-left transition-colors text-rose-600"
        >
          <div class="flex items-center space-x-3">
            <span>${icons.trash("w-4 h-4 text-rose-500")}</span>
            <span class="text-xs font-semibold text-rose-600">Clear All Transactions</span>
          </div>
          <span class="text-rose-400">${icons.chevronRight("w-4 h-4")}</span>
        </button>
      </div>
    </div>
  `;
}

export function attachCfoEvents() {
  const downloadAppCard = document.getElementById('btn-cfo-download-app');
  if (downloadAppCard) {
    downloadAppCard.onclick = () => openInstallModal();
  }

  const exportCard = document.getElementById('btn-export-excel-card');
  if (exportCard) {
    exportCard.onclick = () => {
      const res = exportRubberLedgerToExcel({
        transactions: store.transactions,
        customers: store.customers,
        workers: store.workers,
        estate: store.estate
      });
      if (res.success) {
        store.showToast(`Downloaded ${res.fileName}`);
      } else {
        store.showToast(`Export failed: ${res.error}`, 'error');
      }
    };
  }

  // Copy Prompt
  document.querySelectorAll('.btn-copy-prompt').forEach((b) => {
    b.onclick = () => {
      const pid = b.getAttribute('data-prompt-id');
      const prompt = AI_CFO_PROMPTS.find((p) => p.id === pid);
      if (prompt) {
        navigator.clipboard.writeText(prompt.promptText)
          .then(() => {
            copiedPromptId = pid;
            store.showToast(`Copied prompt`);
            store.notify();
            setTimeout(() => {
              copiedPromptId = null;
              store.notify();
            }, 2500);
          })
          .catch(() => store.showToast('Could not copy', 'error'));
      }
    };
  });

  const duesSettings = document.getElementById('btn-goto-dues-settings');
  if (duesSettings) {
    duesSettings.onclick = () => store.setActiveTab('dues');
  }

  const resetBtn = document.getElementById('btn-reset-demo');
  if (resetBtn) {
    resetBtn.onclick = () => {
      store.setConfirmModal({
        title: 'Reset Demo Data?',
        message: 'This will restore sample transactions and customer balances.',
        confirmText: 'Reset',
        isDanger: false,
        onConfirm: () => {
          store.resetToSampleData();
          store.closeConfirmModal();
        }
      });
    };
  }

  const clearBtn = document.getElementById('btn-clear-all');
  if (clearBtn) {
    clearBtn.onclick = () => {
      store.setConfirmModal({
        title: 'Clear All Data?',
        message: 'This will delete all ledger records permanently.',
        confirmText: 'Clear All',
        isDanger: true,
        onConfirm: () => {
          store.clearAllData();
          store.closeConfirmModal();
        }
      });
    };
  }
}

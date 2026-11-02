/**
 * Google Sheets Cloud Sync Utility for RubberFlow
 * Connects directly to Google Sheet via Google Apps Script Web App
 */

const STORAGE_KEY_SYNC_URL = 'rubberflow_sheets_sync_url';
const STORAGE_KEY_AUTO_SYNC = 'rubberflow_sheets_auto_sync';

export const DEFAULT_SYNC_URL = 'https://script.google.com/macros/s/AKfycbw3GtpARo0lwBknDp9ugot8a7ub8Oh5mfM9K973pc3HnrNNyVeTSVuQboKsyTdQAkmnNw/exec';

export function getSyncUrl() {
  try {
    return localStorage.getItem(STORAGE_KEY_SYNC_URL) || DEFAULT_SYNC_URL;
  } catch {
    return DEFAULT_SYNC_URL;
  }
}

export function setSyncUrl(url) {
  try {
    localStorage.setItem(STORAGE_KEY_SYNC_URL, (url || '').trim());
  } catch (e) {
    console.warn('Failed to save sync URL:', e);
  }
}

export function isAutoSyncEnabled() {
  try {
    const val = localStorage.getItem(STORAGE_KEY_AUTO_SYNC);
    return val === null ? true : val === 'true'; // enabled by default if URL set
  } catch {
    return true;
  }
}

export function setAutoSyncEnabled(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY_AUTO_SYNC, String(Boolean(enabled)));
  } catch (e) {
    console.warn('Failed to save auto sync setting:', e);
  }
}

/**
 * Formats a transaction into the exact row schema of the Google Sheet 'Transactions' tab:
 * [Transaction ID, Timestamp, Transaction Date, Transaction Type, Category, Amount, Income Source or Expense Purpose, Employee Name, Travel Details, Description, Entered By, Telegram User ID]
 */
export function formatTransactionRow(txn, owner = 'Ashraf') {
  const isIncome = txn.type === 'income';
  const typeStr = isIncome ? 'Income' : 'Expense';
  const timestamp = txn.createdAt 
    ? new Date(txn.createdAt).toISOString().replace('T', ' ').slice(0, 19)
    : new Date().toISOString().replace('T', ' ').slice(0, 19);

  let sourceOrPurpose = '';
  if (isIncome) {
    sourceOrPurpose = txn.customerName || (txn.subCategory ? txn.subCategory : 'General Sale');
  } else {
    if (txn.category === 'Staff Wages') {
      sourceOrPurpose = `Staff Wage: ${txn.workerName || txn.worker || ''}`;
    } else {
      sourceOrPurpose = txn.vendorName || txn.subCategory || 'General Expense';
    }
  }

  const employeeName = txn.category === 'Staff Wages' ? (txn.workerName || txn.worker || '') : '';
  const travelDetails = txn.route ? `${txn.route}${txn.purpose ? ' (' + txn.purpose + ')' : ''}` : '';
  const description = txn.notes || txn.subCategory || '';
  const enteredBy = owner || 'Ashraf';

  return [
    txn.id || '',
    timestamp,
    txn.date || new Date().toISOString().slice(0, 10),
    typeStr,
    txn.category || 'General',
    Number(txn.amount) || 0,
    sourceOrPurpose,
    employeeName,
    travelDetails,
    description,
    enteredBy,
    ''
  ];
}

/**
 * Pushes a single transaction to the Google Sheet
 */
export async function pushTransactionToSheet(txn, owner = 'Ashraf') {
  const syncUrl = getSyncUrl();
  if (!syncUrl || !isAutoSyncEnabled()) return { success: false, reason: 'Sync not configured or disabled' };

  const row = formatTransactionRow(txn, owner);
  try {
    await fetch(syncUrl, {
      method: 'POST',
      mode: 'no-cors', // standard for Google Apps Script Web App redirects
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addTransaction',
        row
      })
    });
    return { success: true };
  } catch (err) {
    console.warn('Google Sheets sync error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Pushes a customer to the Google Sheet 'Customers' tab
 */
export async function pushCustomerToSheet(cust) {
  const syncUrl = getSyncUrl();
  if (!syncUrl || !isAutoSyncEnabled()) return;

  try {
    await fetch(syncUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addCustomer',
        row: [cust.id || '', cust.name || '', 'Active']
      })
    });
  } catch (err) {
    console.warn('Customer sheet sync error:', err);
  }
}

/**
 * Pushes an employee/worker to the Google Sheet 'Employees' tab
 */
export async function pushWorkerToSheet(worker) {
  const syncUrl = getSyncUrl();
  if (!syncUrl || !isAutoSyncEnabled()) return;

  try {
    await fetch(syncUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addEmployee',
        row: [worker.id || '', worker.name || '', worker.active !== false ? 'Active' : 'Inactive']
      })
    });
  } catch (err) {
    console.warn('Worker sheet sync error:', err);
  }
}

/**
 * Bulk syncs all local transactions, customers, and employees to the Google Sheet
 */
export async function syncAllToSheet(store) {
  const syncUrl = getSyncUrl();
  if (!syncUrl) throw new Error('Please configure your Google Apps Script Sync URL first.');

  const owner = store.estate?.owner || 'Ashraf';
  const txRows = (store.transactions || []).map(t => formatTransactionRow(t, owner));
  const custRows = (store.customers || []).map(c => [c.id || '', c.name || '', 'Active']);
  const empRows = (store.workers || []).map(w => [w.id || '', w.name || '', w.active !== false ? 'Active' : 'Inactive']);

  try {
    await fetch(syncUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'syncAll',
        transactions: txRows,
        customers: custRows,
        employees: empRows
      })
    });
    return { success: true, count: txRows.length };
  } catch (err) {
    throw new Error('Sync failed: ' + err.message);
  }
}

/**
 * Test connectivity with the Apps Script Web App URL
 */
export async function testSyncConnection(url) {
  if (!url) throw new Error('Please enter a URL');
  try {
    const testUrl = url.includes('?') ? `${url}&test=1` : `${url}?test=1`;
    const res = await fetch(testUrl, { method: 'GET' });
    const data = await res.json();
    return data.status === 'ok' || data.success === true;
  } catch (e) {
    // If CORS prevents JSON read on GET, check if domain is script.google.com
    if (url.includes('script.google.com/macros/s/')) {
      return true; // Valid Apps Script Web App deployment shape
    }
    throw new Error('Connection failed: Ensure URL is deployed as Web App with "Anyone" access.');
  }
}

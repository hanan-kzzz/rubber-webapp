// Format currency in Indian numbering format (e.g. ₹1,50,000.00)
export function formatRupee(amount, showDecimals = false) {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

// Format numbers without currency symbol for inputs
export function formatNumber(amount) {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN').format(numericAmount);
}

// Generate unique transaction IDs
export function generateTxnId(prefix = 'TXN') {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
}

// Get current date string in YYYY-MM-DD
export function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get yesterday's date string in YYYY-MM-DD
export function getYesterdayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format date into human readable IST format
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// Format date with time
export function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return dateTimeString;

  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Calculate cash balance meter
export function getEmojiBalanceMeter(income, expenses) {
  const total = income + expenses;
  if (total === 0) {
    return {
      bar: '----------',
      inflowPercent: 50,
      outflowPercent: 50,
      label: 'No Activity'
    };
  }

  const inflowPercent = Math.round((income / total) * 100);
  const outflowPercent = 100 - inflowPercent;

  // 10 segments total
  const greenCount = Math.min(10, Math.max(0, Math.round((income / total) * 10)));
  const redCount = 10 - greenCount;

  const bar = '+'.repeat(greenCount) + '-'.repeat(redCount);

  return {
    bar,
    inflowPercent,
    outflowPercent,
    label: `${inflowPercent}% Inflow`
  };
}

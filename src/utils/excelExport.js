import * as XLSX from 'xlsx';

/**
 * Generates and downloads a multi-tab Rubber_Ledger.xlsx workbook using SheetJS (pure JavaScript).
 * Tabs:
 * 1. Transactions
 * 2. Customers
 * 3. Employees
 * 4. Categories
 */
export function exportRubberLedgerToExcel({ transactions, customers, workers, estate }) {
  try {
    const wb = XLSX.utils.book_new();

    // 1. Transactions Sheet
    const txRows = transactions.map(t => ({
      "Transaction ID": t.id,
      "Date": t.date,
      "Type": t.type ? t.type.toUpperCase() : 'UNKNOWN',
      "Category": t.category || '',
      "Sub Category / Grade": t.subCategory || '',
      "Customer / Worker / Vendor": t.customerName || t.workerName || t.vendorName || t.driverName || '—',
      "Total Amount (₹)": Number(t.amount) || 0,
      "Payment Status": t.paymentStatus ? t.paymentStatus.toUpperCase() : (t.type === 'expense' ? 'PAID' : 'N/A'),
      "Amount Paid (₹)": Number(t.paidAmount !== undefined ? t.paidAmount : (t.type === 'expense' ? t.amount : 0)),
      "Due Balance (₹)": Number(t.dueAmount) || 0,
      "Weight (kg)": t.weightKg ? Number(t.weightKg) : '',
      "Rate (₹/kg)": t.ratePerKg ? Number(t.ratePerKg) : '',
      "DRC (%)": t.dryRubberContent ? Number(t.dryRubberContent) : '',
      "Payment Mode": t.paymentMode || '',
      "Notes / Route": t.notes || t.route || ''
    }));

    const wsTransactions = XLSX.utils.json_to_sheet(txRows);
    
    // Column widths for readability
    wsTransactions['!cols'] = [
      { wch: 14 }, // Tx ID
      { wch: 12 }, // Date
      { wch: 10 }, // Type
      { wch: 18 }, // Category
      { wch: 22 }, // Sub Category
      { wch: 26 }, // Party
      { wch: 16 }, // Amount
      { wch: 14 }, // Status
      { wch: 16 }, // Paid
      { wch: 16 }, // Due
      { wch: 12 }, // Weight
      { wch: 12 }, // Rate
      { wch: 10 }, // DRC
      { wch: 14 }, // Mode
      { wch: 35 }, // Notes
    ];

    XLSX.utils.book_append_sheet(wb, wsTransactions, "Transactions");

    // 2. Customers Sheet
    const custRows = customers.map(c => ({
      "Customer ID": c.id,
      "Customer Name": c.name,
      "Phone": c.phone || '',
      "City": c.city || '',
      "Total Billed (₹)": Number(c.totalBilled) || 0,
      "Amount Received (₹)": Number(c.amountReceived) || 0,
      "Outstanding Due (₹)": Number(c.outstandingDue) || 0,
      "Last Purchase": c.lastPurchaseDate || '—'
    }));

    const wsCustomers = XLSX.utils.json_to_sheet(custRows);
    wsCustomers['!cols'] = [
      { wch: 14 },
      { wch: 26 },
      { wch: 16 },
      { wch: 18 },
      { wch: 18 },
      { wch: 20 },
      { wch: 20 },
      { wch: 16 },
    ];
    XLSX.utils.book_append_sheet(wb, wsCustomers, "Customers");

    // 3. Employees / Workers Sheet
    const workerRows = workers.map(w => {
      // Calculate total wages recorded for this worker
      const totalWages = transactions
        .filter(t => t.category === "Staff Wages" && (t.workerId === w.id || t.workerName?.includes(w.name)))
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      return {
        "Worker ID": w.id,
        "Worker Name": w.name,
        "Role / Designation": w.role || 'Field Staff',
        "Standard Daily Wage (₹)": Number(w.defaultDailyWage) || 0,
        "Active Status": w.active ? 'Active' : 'Inactive',
        "Total Wages Paid in Period (₹)": totalWages
      };
    });

    const wsWorkers = XLSX.utils.json_to_sheet(workerRows);
    wsWorkers['!cols'] = [
      { wch: 14 },
      { wch: 22 },
      { wch: 22 },
      { wch: 24 },
      { wch: 14 },
      { wch: 28 },
    ];
    XLSX.utils.book_append_sheet(wb, wsWorkers, "Employees");

    // 4. Categories Summary Sheet
    const categoryTotals = {};
    transactions.forEach(t => {
      const cat = t.category || 'Other';
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { type: t.type, total: 0, count: 0 };
      }
      categoryTotals[cat].total += (Number(t.amount) || 0);
      categoryTotals[cat].count += 1;
    });

    const categoryRows = Object.entries(categoryTotals).map(([cat, data]) => ({
      "Category Name": cat,
      "Type": data.type ? data.type.toUpperCase() : 'N/A',
      "Total Turnover / Spend (₹)": data.total,
      "Transaction Count": data.count
    }));

    const wsCategories = XLSX.utils.json_to_sheet(categoryRows);
    wsCategories['!cols'] = [
      { wch: 24 },
      { wch: 14 },
      { wch: 26 },
      { wch: 18 }
    ];
    XLSX.utils.book_append_sheet(wb, wsCategories, "Categories");

    // File name with estate prefix
    const fileName = `Rubber_Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error("Excel generation error:", error);
    return { success: false, error: error.message };
  }
}

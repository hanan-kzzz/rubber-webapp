export const INITIAL_ESTATE = {
  name: "Green Valley Rubber Estate",
  owner: "Ashraf",
  location: "Pala, Kottayam, Kerala",
  phone: "+91 98471 23456",
  currency: "INR",
};

export const INITIAL_CUSTOMERS = [
  {
    id: "CUST-101",
    name: "Kottayam Rubber Traders",
    phone: "9847012345",
    city: "Kottayam",
    totalBilled: 145000,
    amountReceived: 95000,
    outstandingDue: 50000,
    lastPurchaseDate: "2026-10-18",
  },
  {
    id: "CUST-102",
    name: "Apex Polymer Industries",
    phone: "9447156789",
    city: "Changanassery",
    totalBilled: 86500,
    amountReceived: 56500,
    outstandingDue: 30000,
    lastPurchaseDate: "2026-10-17",
  },
  {
    id: "CUST-103",
    name: "Highland Latex Co",
    phone: "9895088210",
    city: "Kanjirappally",
    totalBilled: 124000,
    amountReceived: 124000,
    outstandingDue: 0,
    lastPurchaseDate: "2026-10-16",
  },
  {
    id: "CUST-104",
    name: "Malabar Sheet Exporters",
    phone: "9745533412",
    city: "Ernakulam",
    totalBilled: 68000,
    amountReceived: 40000,
    outstandingDue: 28000,
    lastPurchaseDate: "2026-10-15",
  },
  {
    id: "CUST-105",
    name: "Cochin Tyre Retreaders",
    phone: "9400299881",
    city: "Aluva",
    totalBilled: 52000,
    amountReceived: 37000,
    outstandingDue: 15000,
    lastPurchaseDate: "2026-10-14",
  },
];

export const INITIAL_WORKERS = [
  { id: "WRK-01", name: "Raju M.", role: "Lead Tapper", phone: "98471 23001", defaultDailyWage: 750, pendingWages: 1500, active: true },
  { id: "WRK-02", name: "Suresh Kumar", role: "Tapper & Collector", phone: "98471 23002", defaultDailyWage: 700, pendingWages: 700, active: true },
  { id: "WRK-03", name: "Manikandan", role: "Field Worker", phone: "98471 23003", defaultDailyWage: 650, pendingWages: 1300, active: true },
  { id: "WRK-04", name: "Shaji Varghese", role: "Smokehouse Master", phone: "98471 23004", defaultDailyWage: 800, pendingWages: 1600, active: true },
  { id: "WRK-05", name: "Vijayan P.", role: "Acid & Sheeting", phone: "98471 23005", defaultDailyWage: 700, pendingWages: 700, active: true },
];

export const INITIAL_DRIVERS = [
  { id: "DRV-01", name: "Anil Kumar", vehicle: "Tata Ace (KL-05-AB-4021)" },
  { id: "DRV-02", name: "Jayan", vehicle: "Bolero Pickup (KL-35-C-8910)" },
];

export const INITIAL_TRANSACTIONS = [
  {
    id: "TXN-9081",
    type: "income",
    category: "Rubber Sales",
    subCategory: "RSS4 Sheet",
    date: "2026-10-19",
    amount: 54000,
    customerId: "CUST-101",
    customerName: "Kottayam Rubber Traders",
    paymentStatus: "partial", // paid, unpaid, partial
    paidAmount: 34000,
    dueAmount: 20000,
    weightKg: 250,
    ratePerKg: 216,
    dryRubberContent: 100,
    notes: "250kg top grade RSS-4 sheets delivered to depot",
    createdAt: "2026-10-19T09:30:00"
  },
  {
    id: "TXN-9080",
    type: "expense",
    category: "Staff Wages",
    subCategory: "Tapping & Processing",
    date: "2026-10-19",
    amount: 3600,
    workerId: "WRK-ALL",
    workerName: "5 Tapping Staff (Daily)",
    paymentMode: "Cash",
    notes: "Daily wages paid to Raju, Suresh, Manikandan, Shaji, Vijayan",
    createdAt: "2026-10-19T13:45:00"
  },
  {
    id: "TXN-9079",
    type: "expense",
    category: "Travel",
    subCategory: "Logistics & Freight",
    date: "2026-10-19",
    amount: 1450,
    driverName: "Anil Kumar",
    route: "Estate ➔ Kottayam Market",
    purpose: "Diesel + Toll for 250kg sheet delivery",
    paymentMode: "UPI",
    notes: "Receipt uploaded to petty cash",
    createdAt: "2026-10-19T11:15:00"
  },
  {
    id: "TXN-9078",
    type: "income",
    category: "Rubber Sales",
    subCategory: "Field Latex",
    date: "2026-10-18",
    amount: 38250,
    customerId: "CUST-102",
    customerName: "Apex Polymer Industries",
    paymentStatus: "unpaid",
    paidAmount: 0,
    dueAmount: 38250,
    weightKg: 375,
    dryRubberContent: 58,
    ratePerKg: 175,
    notes: "Latex collection with 58% DRC certified by lab",
    createdAt: "2026-10-18T10:00:00"
  },
  {
    id: "TXN-9077",
    type: "expense",
    category: "Maintenance",
    subCategory: "Formic Acid & Chemicals",
    date: "2026-10-18",
    amount: 8800,
    vendorName: "Travancore Chemicals Co",
    paymentMode: "Bank Transfer",
    notes: "2 Barrels 85% Formic Acid for latex coagulation",
    createdAt: "2026-10-18T14:20:00"
  },
  {
    id: "TXN-9076",
    type: "expense",
    category: "Tea/Sugar/Food Canteen",
    subCategory: "Estate Canteen",
    date: "2026-10-18",
    amount: 580,
    vendorName: "Mani's Tea Stall",
    paymentMode: "Cash",
    notes: "Morning tea, snacks & black coffee for tapping crew",
    createdAt: "2026-10-18T07:15:00"
  },
  {
    id: "TXN-9075",
    type: "income",
    category: "Rubber Sales",
    subCategory: "Scrap & Cup Lump",
    date: "2026-10-17",
    amount: 21500,
    customerId: "CUST-104",
    customerName: "Malabar Sheet Exporters",
    paymentStatus: "paid",
    paidAmount: 21500,
    dueAmount: 0,
    weightKg: 172,
    ratePerKg: 125,
    notes: "Weekly tree lace and cup lump clearing",
    createdAt: "2026-10-17T16:00:00"
  },
  {
    id: "TXN-9074",
    type: "expense",
    category: "LED/Maintenance",
    subCategory: "Smokehouse Maintenance",
    date: "2026-10-17",
    amount: 3200,
    vendorName: "Kottayam Hardware Mart",
    paymentMode: "UPI",
    notes: "Smokehouse trolley bearing replacement & temperature sensor",
    createdAt: "2026-10-17T11:45:00"
  },
  {
    id: "TXN-9073",
    type: "income",
    category: "Customer Payments",
    subCategory: "Due Settlement",
    date: "2026-10-16",
    amount: 45000,
    customerId: "CUST-103",
    customerName: "Highland Latex Co",
    paymentStatus: "paid",
    paidAmount: 45000,
    dueAmount: 0,
    notes: "NEFT Payment received against October invoice #884",
    createdAt: "2026-10-16T12:10:00"
  },
  {
    id: "TXN-9072",
    type: "expense",
    category: "Staff Wages",
    subCategory: "Weeding & Spraying",
    date: "2026-10-16",
    amount: 1950,
    workerId: "WRK-03",
    workerName: "Manikandan & 2 Helpers",
    paymentMode: "Cash",
    notes: "Monsoon weed clearance in Block B",
    createdAt: "2026-10-16T17:30:00"
  },
  {
    id: "TXN-9071",
    type: "expense",
    category: "Travel",
    subCategory: "Fuel & Freight",
    date: "2026-10-15",
    amount: 980,
    driverName: "Jayan",
    route: "Smokehouse ➔ Godown",
    purpose: "Delivery of 8 bundles RSS-5 sheets",
    paymentMode: "UPI",
    notes: "Fuel for Bolero pickup",
    createdAt: "2026-10-15T15:20:00"
  },
  {
    id: "TXN-9070",
    type: "income",
    category: "Goods Income",
    subCategory: "Acid Resale to Neighbor Estate",
    date: "2026-10-14",
    amount: 4200,
    customerId: "CUST-105",
    customerName: "Cochin Tyre Retreaders",
    paymentStatus: "paid",
    paidAmount: 4200,
    dueAmount: 0,
    notes: "Sold surplus 30L Formic acid at spot market markup",
    createdAt: "2026-10-14T10:45:00"
  }
];

export const INCOME_CATEGORIES = [
  "Rubber Sales",
  "Goods Income",
  "Customer Payments",
  "Other Income"
];

export const RUBBER_GRADES = [
  { id: "RSS4", name: "RSS-4 Sheet", defaultRate: 215, unit: "kg" },
  { id: "RSS5", name: "RSS-5 Sheet", defaultRate: 195, unit: "kg" },
  { id: "Latex", name: "Field Latex (DRC)", defaultRate: 180, unit: "kg dry" },
  { id: "Scrap", name: "Scrap / Cup Lump", defaultRate: 125, unit: "kg" },
  { id: "Other", name: "Other Rubber Lot", defaultRate: 170, unit: "kg" },
];

export const EXPENSE_CATEGORIES = [
  "Staff Wages",
  "Travel",
  "Tea/Sugar/Food Canteen",
  "LED/Maintenance",
  "Misc"
];

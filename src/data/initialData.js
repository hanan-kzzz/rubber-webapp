export const INITIAL_ESTATE = {
  name: "My Rubber Estate",
  owner: "",
  location: "",
  phone: "",
  currency: "INR",
};

export const INITIAL_CUSTOMERS = [];

export const INITIAL_WORKERS = [];

export const INITIAL_DRIVERS = [];

export const INITIAL_TRANSACTIONS = [];

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

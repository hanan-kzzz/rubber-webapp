export const AI_CFO_PROMPTS = [
  {
    id: "prompt-1",
    title: "1. Financial Health & Net Cashflow Audit",
    category: "Financial Health",
    badge: "Executive Audit",
    iconName: "TrendingUp",
    shortDesc: "Audits operational burn rate, net cashflow margin, and revenue velocity from rubber consignments.",
    promptText: `You are an elite Agricultural Chief Financial Officer (AI CFO) specializing in natural rubber plantation economics and commercial estate accounting.

I have attached our estate's ledger export workbook ("Rubber_Ledger.xlsx") containing our Transactions, Customer Ledgers, Employee Wage logs, and Category breakdowns.

Please execute a rigorous financial health audit with the following deliverables:
1. Executive Cashflow Summary: Total Inflow vs Outflow, Net Operational Cashflow, and Burn Rate.
2. Revenue Quality: Analyze the proportion of fully paid vs partial/unpaid sales. Compute our actual Cash Collection Ratio.
3. Top 3 Financial Strengths and Top 3 Vulnerabilities in our current cash reserves and payment cycles.
4. Actionable 30-Day Cashflow Optimization Plan tailored to stabilize weekly working capital.`
  },
  {
    id: "prompt-2",
    title: "2. Labor Cost & Worker Wage Variance Analysis",
    category: "Labor & Wages",
    badge: "Labor Variance",
    iconName: "Users",
    shortDesc: "Calculates cost per kg tapped, wage-to-yield ratio, and identifies worker productivity patterns.",
    promptText: `You are an experienced Estate Operations Analyst & Labor Cost Controller for commercial rubber plantations.

Review the attached "Rubber_Ledger.xlsx" (specifically the Transactions and Employees sheets) to evaluate our daily tapping wages and labor efficiency:

1. Wage Distribution & Daily Cost: Compute average daily wage payouts, breakdown between Lead Tappers vs Field Maintenance/Acid processing.
2. Wage vs Realized Yield: Based on our recorded RSS-4 and Latex kilogram sales, estimate the direct labor cost incurred per kg of rubber harvested.
3. Variance & Overtime Flags: Identify any sudden spikes or abnormal wage trends across consecutive tapping cycles.
4. Incentive Structuring: Recommend a performance-linked tapper incentive formula (base wage + per-kg latex collection bonus) to boost tapping turnout.`
  },
  {
    id: "prompt-3",
    title: "3. Goods Trading & Rubber Margin Optimizer",
    category: "Margins & Pricing",
    badge: "Grade Arbitrage",
    iconName: "Scale",
    shortDesc: "Compares RSS-4 vs Latex DRC profitability and optimizes acid/chemical trading margins.",
    promptText: `You are a Commodity Trading Strategist and Rubber Processing Margin Specialist.

Using the transaction data in "Rubber_Ledger.xlsx", analyze our rubber grade sales and input cost margins:
1. Grade Price Realization: Compare average realization per kg for RSS-4 Sheets, RSS-5 Sheets, Field Latex (DRC normalized), and Scrap/Cup Lump against prevailing market benchmarks.
2. Value-Addition Arbitrage: Based on our chemical (Formic Acid), smokehouse firewood, and labor costs, determine whether converting wet latex into RSS-4 smoked sheets delivers superior net margin versus selling raw field latex directly to factories.
3. Chemical & Goods Trade Margins: Calculate gross margin percentage on estate input supplies and resale items.
4. Pricing Recommendations: Suggest minimum reserve threshold prices for next month's consignment negotiations.`
  },
  {
    id: "prompt-4",
    title: "4. Customer Aging & Receivables Risk Assessment",
    category: "Receivables & Credit",
    badge: "Credit Risk",
    iconName: "AlertTriangle",
    shortDesc: "Ranks rubber buyers by overdue credit risk, payment velocity, and recommends recovery actions.",
    promptText: `You are a Credit Risk Officer and Working Capital Specialist for agricultural commodity trading.

Analyze the "Customers" and "Transactions" tabs in the attached "Rubber_Ledger.xlsx" to assess our outstanding receivables:
1. Customer Aging & Concentration: Calculate Days Sales Outstanding (DSO) and identify buyers with disproportionate pending dues (>30% of their total billed volume).
2. Credit Risk Ranking: Categorize each rubber dealer into Low Risk, Moderate Risk, or High Delinquency Risk based on historical partial payment frequency.
3. Bad Debt Prevention: Provide tailored payment restructuring terms for buyers with chronic backlogs.
4. Commercial WhatsApp Reminder Templates: Craft 2 courteous yet firm payment demand notices for the top delinquent buyers.`
  },
  {
    id: "prompt-5",
    title: "5. Operational Expense Reduction & Seasonal Budget Plan",
    category: "Cost Optimization",
    badge: "Cost Control",
    iconName: "PieChart",
    shortDesc: "Audits logistics, smokehouse maintenance, and canteen costs to eliminate operational waste.",
    promptText: `You are a Lean Operations Consultant and Estate Budget Planner.

Scrutinize the operational cost lines in "Rubber_Ledger.xlsx" (Logistics & Travel, Smokehouse Maintenance, Canteen & Food, and Chemicals):
1. Expense Breakdown: Quantify the proportion of fixed overheads vs variable volume-driven costs.
2. Logistics & Route Efficiency: Analyze travel/freight expenditures per consignment trip between Estate, Smokehouse, and Kottayam Depot. Recommend route consolidation tactics.
3. Preventative Smokehouse Cost Control: Provide recommendations to minimize wood consumption and drying chamber heat loss.
4. Zero-Based 90-Day Estate Budget: Formulate a lean monthly operational expenditure target that protects margins during monsoon/low-yield tapping seasons.`
  }
];

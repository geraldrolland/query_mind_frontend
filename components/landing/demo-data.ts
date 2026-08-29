export const DEMO_DATASETS = [
  {
    name: "sales-2025.csv",
    rows: 248_312,
    size: "42.1 MB",
    date: "Jul 28, 2026",
    cleaned: true,
  },
  {
    name: "signups-2025.csv",
    rows: 96_410,
    size: "18.7 MB",
    date: "Jul 14, 2026",
    cleaned: true,
  },
  {
    name: "customers.csv",
    rows: 12_890,
    size: "3.2 MB",
    date: "Jun 30, 2026",
    cleaned: true,
  },
];

export const DEMO_NEW_DATASET = {
  name: "sales-2026.csv",
  rows: 312_480,
  size: "51.8 MB",
  date: "Jul 29, 2026",
  cleaned: true,
};

export const DEMO_UPLOAD_FILE = "sales-2026.csv";

export const DEMO_CLEANING_REPORT = {
  raw_rows: 312_480,
  rows_ingested: 305_120,
  duplicates_removed: 7_360,
  null_counts: { region: 0, revenue: 18, date: 5, category: 0 },
};

export const DEMO_EXPLORE = {
  columns: ["region", "revenue", "date"],
  stats: { rows: 305_120, columns: 12, nulls: 23, completeness: 99.9 },
  sampleRows: [
    { region: "East", revenue: "$1,240,000", date: "Jan 15, 2026" },
    { region: "West", revenue: "$1,050,000", date: "Jan 22, 2026" },
    { region: "South", revenue: "$860,000", date: "Feb 3, 2026" },
    { region: "Central", revenue: "$640,000", date: "Feb 11, 2026" },
  ],
};

export const DEMO_SUGGESTIONS = [
  "Average revenue by region, top 5",
  "Monthly signups in 2025",
  "Breakdown of plan types",
];

export const DEMO_QUERY = "Average revenue by region, top 5";

export const DEMO_PROGRESS = [
  "Analyzing your question…",
  "Building query plan…",
  "Executing query…",
  "Formatting results…",
];

export const DEMO_ANSWER =
  "East leads with $1.24M average revenue — 18% above the next region. West follows at $1.05M, then South, Central and North.";

export const DEMO_CHART_DATA = {
  chartType: "bar",
  rows: [
    { region: "East", revenue: 1240000 },
    { region: "West", revenue: 1050000 },
    { region: "South", revenue: 860000 },
    { region: "Central", revenue: 640000 },
    { region: "North", revenue: 410000 },
  ],
};

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

export const DEMO_QUESTIONS = [
  {
    text: "Average revenue by region, top 5",
    chartType: "bar",
    answer:
      "East leads with $1.24M average revenue — 18% above the next region. West follows at $1.05M, then South, Central and North.",
    rows: [
      { region: "East", revenue: 1240000 },
      { region: "West", revenue: 1050000 },
      { region: "South", revenue: 860000 },
      { region: "Central", revenue: 640000 },
      { region: "North", revenue: 410000 },
    ],
  },
  {
    text: "Monthly signups in 2025",
    chartType: "line",
    answer:
      "Signups grew 212% across the year, peaking in November at 14.2K before a seasonal dip in December.",
    rows: [
      { month: "Jan", signups: 4200 },
      { month: "Feb", signups: 5100 },
      { month: "Mar", signups: 5900 },
      { month: "Apr", signups: 6400 },
      { month: "May", signups: 7300 },
      { month: "Jun", signups: 8100 },
      { month: "Jul", signups: 9200 },
      { month: "Aug", signups: 10400 },
      { month: "Sep", signups: 11800 },
      { month: "Oct", signups: 13100 },
      { month: "Nov", signups: 14200 },
      { month: "Dec", signups: 12900 },
    ],
  },
  {
    text: "Breakdown of plan types",
    chartType: "pie",
    answer:
      "Free accounts make up 58% of all plans. Pro is the fastest-growing tier at 26%, while Team and Enterprise trail at 11% and 5%.",
    rows: [
      { name: "Free", value: 58 },
      { name: "Pro", value: 26 },
      { name: "Team", value: 11 },
      { name: "Enterprise", value: 5 },
    ],
  },
];

export const DEMO_PROGRESS = [
  "Cleaning up question…",
  "Validating schema…",
  "Writing query plan…",
  "Running query…",
  "Rendering answer…",
];
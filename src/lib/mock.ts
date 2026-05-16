// Static mock data for the ICAI Publication Portal prototype.
// No backend — everything lives here and in localStorage.

export type Publication = {
  id: string;
  title: string;
  committee: string;
  topic: string;
  type: "Guide" | "Standard" | "Handbook" | "Bulletin" | "Journal";
  date: string; // ISO
  synopsis: string;
  keywords: string[];
  cover: string; // gradient seed
  pages: number;
};

export const COMMITTEES = [
  "Auditing & Assurance Standards Board",
  "Accounting Standards Board",
  "Direct Taxes Committee",
  "GST & Indirect Taxes Committee",
  "Corporate Laws & Governance",
  "Ethical Standards Board",
  "Sustainability Reporting Board",
  "Banking, Insurance & Pension",
];

export const TOPICS = [
  "Audit",
  "Taxation",
  "GST",
  "IFRS / Ind AS",
  "Corporate Law",
  "Ethics",
  "ESG",
  "Banking",
  "Insolvency",
  "Forensic Accounting",
];

const seed = (i: number) =>
  `linear-gradient(135deg, hsl(${(i * 47) % 360} 55% 28%) 0%, hsl(${(i * 47 + 40) % 360} 60% 18%) 100%)`;

export const PUBLICATIONS: Publication[] = Array.from({ length: 24 }).map((_, i) => {
  const committee = COMMITTEES[i % COMMITTEES.length];
  const topic = TOPICS[i % TOPICS.length];
  const types: Publication["type"][] = ["Guide", "Standard", "Handbook", "Bulletin", "Journal"];
  const titles = [
    "Technical Guide on Internal Audit of Treasury Function",
    "Compendium of Ind AS — 2026 Edition",
    "Handbook on GST Annual Return & Reconciliation",
    "Practitioner's Guide to Faceless Assessments",
    "Standards on Auditing — Implementation Guide",
    "Guidance Note on Reporting under CARO 2026",
    "Background Material on ESG Assurance",
    "Technical Guide on Bank Branch Audit",
    "Compendium of Opinions — Expert Advisory Committee",
    "Handbook on Insolvency & Bankruptcy Code",
    "Guide to Transfer Pricing Documentation",
    "Code of Ethics — Revised Edition",
  ];
  return {
    id: `pub-${i + 1}`,
    title: titles[i % titles.length] + (i >= titles.length ? ` (Vol. ${Math.floor(i / titles.length) + 1})` : ""),
    committee,
    topic,
    type: types[i % types.length],
    date: new Date(2026, 4 - (i % 12), 1 + (i % 27)).toISOString(),
    synopsis:
      "An authoritative publication issued by the Institute of Chartered Accountants of India providing in-depth guidance, illustrative examples, and best practices for professionals in practice and industry.",
    keywords: [topic, committee.split(" ")[0], "ICAI", "Guidance"],
    cover: seed(i + 1),
    pages: 24 + (i % 6) * 4,
  };
});

export const getPublication = (id: string) => PUBLICATIONS.find((p) => p.id === id);

export type Template = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  tags?: string[];
  promptInstructions?: string;
};

export const templates: Template[] = [
  {
    id: "classic-ats",
    name: "Classic ATS",
    description:
      "Clean, single-column, ATS-friendly with clear headings and ample white space.",
    imageUrl: "https://placehold.co/400x500/F8FAFC/0F172A.png?text=Classic+ATS",
    tags: ["ATS", "single-column", "serif"],
    promptInstructions: `
Layout: Single column. Generous margins. Use simple typography (e.g., Georgia or Times). No icons or graphics. Max 1 page if possible.
Sections order: Header (name + contacts) → Summary → Skills (comma-separated) → Experience (reverse-chronological, bullet points) → Education → Optional: Certifications.
Style: Clear H2-like headings in ALL CAPS, horizontal rule between sections, 10–11pt body.
Tone: Professional, concise, impact-focused bullet points starting with strong verbs.
Constraints: 0 tables, no images, no color blocks. Ensure ATS keyword density based on experience and skills provided.
`,
  },
  {
    id: "modern-two-col",
    name: "Modern Two-Column",
    description:
      "Contemporary two-column layout with accent color for headings and side rail.",
    imageUrl:
      "https://placehold.co/400x500/ECFEFF/083344.png?text=Modern+Two+Col",
    tags: ["two-column", "accent", "modern"],
    promptInstructions: `
Layout: Two columns. Left column 30% for contact, links, skills. Right column 70% for summary, experience, education.
Style: Sans-serif (e.g., Inter). Headings colored with a single accent color. Use subtle separators. Avoid heavy graphics.
Sections: Header → Summary → Experience → Education → Projects (if provided) → Skills in left column as compact tags.
Tone: Crisp and modern. Keep bullets tight; include quantified results.
Constraints: Keep under 2 pages. No photos.
`,
  },
  {
    id: "minimal-mono",
    name: "Minimal Monochrome",
    description:
      "Ultra-clean, monochrome design focused purely on content readability.",
    imageUrl:
      "https://placehold.co/400x500/F1F5F9/0F172A.png?text=Minimal+Mono",
    tags: ["minimal", "monochrome", "readable"],
    promptInstructions: `
Layout: Single column with wide line spacing. No borders. Use typographic hierarchy only.
Sections: Header → Summary → Key Skills (grouped) → Experience → Education → Awards (if any).
Style: Use one font family. Bold headings, regular body. No color.
Tone: Balanced and calm; avoid marketing language.
Constraints: Prioritize scannability. Keep bullets to 1–2 lines each.
`,
  },
  {
    id: "creative-accent",
    name: "Creative Accent",
    description:
      "A creative-friendly layout with a bold nameplate and subtle accent blocks.",
    imageUrl:
      "https://placehold.co/400x500/FEFCE8/713F12.png?text=Creative+Accent",
    tags: ["creative", "accent", "portfolio"],
    promptInstructions: `
Layout: Single column with an eye-catching nameplate at top. Accent blocks for section headers.
Sections: Header with short tagline → Selected Projects (with links) → Experience → Skills → Education.
Style: One accent color used sparingly. Allow 1–2 short quotes or testimonials if provided.
Tone: Confident and personable while staying professional.
Constraints: Limit accent areas to 10–15% of page. Ensure accessibility and readability.
`,
  },
  {
    id: "technical-engineer",
    name: "Technical Engineer",
    description:
      "Engineer-focused template emphasizing tech stack, impact, and complexity handled.",
    imageUrl:
      "https://placehold.co/400x500/EEF2FF/1E3A8A.png?text=Technical+Engineer",
    tags: ["engineering", "metrics", "stack"],
    promptInstructions: `
Layout: Single column with prominent Skills/Stack section near the top.
Sections: Header → Summary with target roles → Skills/Stack (group by domain) → Experience (STAR-style bullets with metrics) → Projects → Education → Certifications.
Style: Use code-style formatting for tech names if applicable. Keep it dense but skimmable.
Tone: Evidence-based; include scale, latency, throughput, savings, and ownership.
Constraints: Prefer 1–2 pages depending on experience; no images.
`,
  },
  {
    id: "product-manager",
    name: "Product Manager",
    description:
      "Outcome-driven layout focusing on product impact, strategy, and collaboration.",
    imageUrl:
      "https://placehold.co/400x500/FFF1F2/9F1239.png?text=Product+Manager",
    tags: ["PM", "outcomes", "leadership"],
    promptInstructions: `
Layout: Single column with Highlights at the top.
Sections: Header → Highlights (3–5 bullets) → Experience (problem, action, impact) → Skills (product, analytics, leadership) → Education → Certifications.
Style: Emphasize metrics tied to growth, retention, revenue, NPS, time-to-market.
Tone: Strategic and collaborative; show stakeholder management and roadmap ownership.
Constraints: Avoid jargon; quantify outcomes.
`,
  },
  {
    id: "academic-cv",
    name: "Academic CV",
    description:
      "Structured multi-page CV with publications, teaching, and service sections.",
    imageUrl: "https://placehold.co/400x500/FFF7ED/7C2D12.png?text=Academic+CV",
    tags: ["CV", "publications", "multi-page"],
    promptInstructions: `
Layout: Single column, multi-page allowed.
Sections: Header → Research Interests → Education → Appointments → Publications (peer-reviewed first) → Teaching → Grants & Awards → Service → Talks.
Style: Numbered publications in standard citation style. Bold author name.
Tone: Formal and thorough.
Constraints: Maintain consistent citation format; include DOIs/links when provided.
`,
  },
  {
    id: "executive-leadership",
    name: "Executive Leadership",
    description:
      "Senior-level narrative focusing on scale, P&L, org design, and transformation.",
    imageUrl: "https://placehold.co/400x500/F0FDF4/14532D.png?text=Executive",
    tags: ["executive", "strategy", "scale"],
    promptInstructions: `
Layout: Single column; add a top Summary with 3–4 headline achievements.
Sections: Header → Executive Summary → Core Competencies (tags) → Experience (scope, teams, budgets, transformations) → Board/Advisory → Education.
Style: Confident typography, space for quantified outcomes and scope.
Tone: Strategic, results-oriented, governance-aware.
Constraints: 1–2 pages. No jargon; emphasize scope and impact.
`,
  },
];

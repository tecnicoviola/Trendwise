# TRENDWISE — Source & Dependency Register

*Version 1.0 · 8 November 2026*

This register records every library dependency, licence, font, data provider, and competitor reference used in or cited by the TRENDWISE project.

---

## 1. Locked Production Dependencies & Licences

| Package | Version | Licence | Purpose |
| --- | --- | --- | --- |
| `next` | ^15.1.7 | MIT | React application framework (App Router) |
| `react` | ^19.0.0 | MIT | UI component library |
| `react-dom` | ^19.0.0 | MIT | React DOM renderer |
| `tailwindcss` | ^3.4.17 | MIT | Utility-first CSS framework |
| `lucide-react` | ^0.475.0 | ISC | Design system UI icons |
| `recharts` | ^2.15.1 | MIT | SVG charting library |
| `motion` | ^12.4.7 | MIT | Motion and animation library |
| `papaparse` | ^5.5.2 | MIT | In-browser CSV parser and serializer |
| `zod` | ^3.24.2 | MIT | TypeScript schema declaration and runtime validation |
| `@radix-ui/react-accordion` | ^1.2.3 | MIT | Accessible accordion primitive |
| `@radix-ui/react-dialog` | ^1.1.6 | MIT | Accessible modal dialog primitive |
| `@radix-ui/react-dropdown-menu`| ^2.1.6 | MIT | Accessible dropdown primitive |
| `@radix-ui/react-popover` | ^1.1.6 | MIT | Accessible popover primitive |
| `@radix-ui/react-select` | ^2.1.6 | MIT | Accessible select primitive |
| `@radix-ui/react-slot` | ^1.1.2 | MIT | Component slotting primitive |
| `@radix-ui/react-tabs` | ^1.1.3 | MIT | Accessible tabs primitive |
| `@radix-ui/react-tooltip` | ^1.1.8 | MIT | Accessible tooltip primitive |
| `clsx` | ^2.1.1 | MIT | Class composition helper |
| `tailwind-merge` | ^3.0.1 | MIT | Tailwind utility conflict resolver |
| `class-variance-authority` | ^0.7.1 | Apache-2.0 | Type-safe variant generator |

---

## 2. Development & Test Dependencies

| Package | Version | Licence | Purpose |
| --- | --- | --- | --- |
| `typescript` | ^5.7.3 | Apache-2.0 | Static type checker |
| `vitest` | ^3.0.5 | MIT | Unit test runner |
| `eslint` | ^9.20.1 | MIT | Code quality linter |
| `eslint-config-next` | ^15.1.7 | MIT | Next.js ESLint ruleset |
| `postcss` | ^8.5.2 | MIT | CSS transform pipeline |
| `autoprefixer` | ^10.4.20 | MIT | CSS vendor prefixer |

---

## 3. Typography & Fonts

| Font | Source | Licence | Status |
| --- | --- | --- | --- |
| `Manrope` | Google Fonts | SIL Open Font License 1.1 | Primary sans-serif UI font (with fallback to `-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`) |
| `DM Serif Display` | Google Fonts | SIL Open Font License 1.1 | Editorial serif title font (with fallback to `Georgia, serif`) |

---

## 4. External Data Sources & Provenance

| Source | Domain / Access | Scope | Status |
| --- | --- | --- | --- |
| **Google Trends** | `trends.google.com` | Relative search interest index (0–100), India market, 36 complete months. | Verified structure |
| **Retailer Fashion Audit** | Manual online catalog audit | 50 sampled women's tops, New Arrivals sections across three fashion retailers. | Verified snapshot |

---

## 5. Competitor & Industry Benchmark Register

| Organisation | Scope & Offering | Comparison to TRENDWISE | Status |
| --- | --- | --- | --- |
| **WGSN** (`wgsn.com`) | Global commercial trend forecasting agency using extensive global analyst teams, runway analysis, and qualitative forecasting. | TRENDWISE is an open educational prototype with mathematical transparency; WGSN uses proprietary qualitative consulting. | Verified reference |
| **Heuritech** (`heuritech.com`) | B2B fashion intelligence platform using computer vision to analyse millions of social media images daily. | TRENDWISE does not scrape social media, use live APIs, or claim computer vision; it transparently benchmarks search vs shelf presence. | Verified reference |
| **EDITED** (`edited.com`) | Retail market and pricing intelligence platform tracking retail ecommerce SKUs, discounting, and stock-outs. | EDITED focuses on pricing and inventory depth; TRENDWISE focuses on directional trend trajectory. | Verified reference |
| **VisioNxt** (`visionxt.in`) | National Fashion Forecasting Initiative by NIFT and Ministry of Textiles, Government of India, focused on Indian fashion and craft intelligence. | TRENDWISE is an academic end-term prototype inspired by VisioNxt's mission to establish data-driven trend intelligence tailored to India. | Verified reference |


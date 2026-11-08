# TRENDWISE — Decisions Register

| Decision | Reason |
| --- | --- |
| Static client-side state with React Context + useReducer | Spec requirement: all data handled client-side without external database or network calls |
| Query parameter `/trend?id=T001` with Suspense | Avoids dynamic route SSR issues when dynamic trend IDs come from uploaded CSVs |
| Color tokens mapped to CSS variables | Preserves Editorial Fashion design language while retaining Tailwind and component interoperability |
| System font fallback for offline environment | Sandbox and offline environments block calls to Google's font CDN (`fonts.googleapis.com`); system serif (`Georgia, serif`) and sans-serif (`-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`) stacks ensure 100% reliable zero-network builds |
| Deterministic embedded sample dataset | Eliminates network-fetch dependency on client-side initialisation, guaranteeing instant demo data availability and static export compatibility |

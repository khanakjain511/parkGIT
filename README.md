# Perishables Black Box

A cold-chain audit workspace built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4. The interface follows the supplied dashboard reference with solid green surfaces, aligned layouts, and responsive navigation. No gradients or emoji assets are used. Motion for React (Framer Motion) provides shared spring transitions, coordinated reveals, SVG chart animation, and reduced-motion support.

Poppins is hosted locally through `next/font/local`. The shared light/dark palette covers the landing page, dashboard, charts, forms, and illustrations. Theme selection persists in browser storage, synchronizes across tabs, and follows the device preference until a theme is chosen. The circular theme reveal and candy button treatment adapt [DevClub UI’s Theme Toggle](https://ui.devclubxnst.com/components/theme-toggle) and [Candy Button](https://ui.devclubxnst.com/components/candy-button), with solid fills to preserve the no-gradient design. Component and font licenses are retained in `DEVCLUB-LICENSE.txt` and `src/app/fonts/OFL.txt`.

## Run locally

Use Node.js 22.18 or later for the built-in TypeScript test runner.

```sh
npm ci
npm run dev
```

Open [the landing page](http://localhost:3000) or [the audit workspace](http://localhost:3000/dashboard). Workspace sections have shareable fragment links, including `/dashboard#diagnostics` and `/dashboard#evidence`.

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

## Working software

- Product landing page with an interactive audit workflow, stakeholder explanations, keyboard-accessible FAQs, and direct links into the dashboard.
- Dashboard with shipment search, status filtering, cargo values, thermal charts, alerts, and trust indicators.
- Shipment creation and browser-persisted origin, departure, arrival, and unloading records.
- Six-channel telemetry simulator and S1–S6 deterministic diagnostic workbench.
- Crop-specific tomato, banana, and leafy-green temperature bands, including lower-bound chilling alerts.
- Q₁₀ degradation ranges and cumulative exposure integration, with explicit assumptions.
- Cross-probe and cooling-rate trust assessment, tamper simulation, and low-trust review holds.
- Fifteen-minute origin stabilization gate and a destination-wait liability preview after 120 minutes.
- Three-tier settlement recommendations, fund reconciliation, driver protection, and extreme-heat rejection handling.
- Origin-gated insurance routing, including parametric, indemnity, and manual-review paths; downloadable claim drafts.
- SHA-256 evidence JSON, paginated unsigned PDF certificate drafts, and CSV audit registers.
- Device manifests, reviewed-alert tracking, driver self-view, and saved workspace preferences.

The calculation tests exercise physical scenario distinctions, mathematical benchmarks, chilling detection, tampering, financial conservation, exact tier thresholds, continuous origin history, demurrage thresholds, and claim-routing gaps.

## Demonstration scope

This is a local, software-only demonstration. Records and preferences are stored in the browser, not in a shared database. The illustrative chart series, device readings, completeness measures, and compliance bonuses are simulated. New origin records remain unclassified until a demo stabilization history is explicitly generated.

Physical ESP32 acquisition, offline flash buffering, MQTT ingestion, ECDSA hardware verification, authentication, role-based access, geofence validation, production DTW-OC calibration, regional voice/SMS delivery, escrow/CBDC rails, and insurer connections require implementation with real devices, infrastructure, and partner credentials. No financial transaction, policy binding, or claim submission occurs.

The Q₁₀ parameters are uncalibrated demonstration assumptions; outputs are advisory ranges. Chilling injury and non-thermal damage require separate evaluation. The certificate is a preparation worksheet, not a statutory form or legal opinion, and requires custodian/expert completion and legal review. Language and retention settings are stored preferences; full interface translation and automatic data deletion are not implemented.

## Source organization

- `src/components`: dashboard, operations, diagnostics, settlements, custody, and shared interface elements.
- `src/lib/motion.ts`: shared spring, fade, and reveal settings.
- `src/components/motion.tsx`: animation configuration, button feedback, and view transitions.
- `src/components/theme.tsx`: persisted theme synchronization and accessible theme toggle.
- `src/lib/theme.ts`: shared theme keys and initialization before the first paint.
- `src/lib/auditor.ts`: pure diagnostic, trust, degradation, settlement, origin, demurrage, and insurance rules.
- `src/lib/workspace.ts`: browser persistence and downloadable evidence records.
- `tests/auditor.test.mjs`: public-interface behavior checks using Node's test runner.

The optional `skills-agents-all` checkout is excluded from application linting and TypeScript compilation. It remains project guidance rather than shipped application source.

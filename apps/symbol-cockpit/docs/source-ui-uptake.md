# Source UI Uptake

The Symbol Cockpit GUI is an sdk-native React/Vite uptake of the Source Intelligence
Network foundation from the sibling `source-int-network-standard` checkout.

It is the reference mature vertical trial for the Source UI React adapter. The
framework-neutral static path remains covered by the fixtures in
`source-int-network-standard`.

Implemented surfaces:

- `/` loads `/source-ui/source-ui.css` before the Vite bundle and imports shared
  contract/theme/React helpers through the Source UI SDK.
- `/feedback` is rendered by the same React/Vite app and uses `tradeos.theme`
  through the Source UI React theme runtime.
- Admin & Ops renders live UX conformance metadata from the same runtime report
  shape exposed on `window.__SOURCE_UI_CONFORMANCE__`.
- Admin & Ops renders a Standards Trial Matrix that maps each standard area to
  a Source UI module, a Symbol Cockpit surface, and the matching TradeOS
  dashboard anchor.
- App conformance artifacts live in `conformance/` and are served from
  `/conformance/*` by the local static server.
- Provider-review screenshots are generated into `conformance/screenshots/`
  for desktop/mobile, dark/light, cockpit/admin/feedback coverage.
- The headless E2E suite runs an axe accessibility scan over cockpit, admin,
  and feedback surfaces.

Trial coverage:

| Standard area | Source UI path | Symbol Cockpit trial | TradeOS anchor |
| --- | --- | --- | --- |
| Tokens and theme | `source-ui.css`, React theme hook | Root `data-theme`, `tradeos.theme`, dark/light toggle | `globals.css`, `themeStore.ts` |
| Shell and layout | `source-shell`, page/header/layout classes | Toolbar, status strip, Source UX pulse, tabbed workbench | `MainLayout`, `PublicDashboardLayout` |
| Proof counters | `source-proof-counter-grid` | Source UX strip and conformance counters | `ProofPagePattern.ProofCounterGrid` |
| Evidence cockpit | evidence view models and cockpit classes | Verdict evidence summary and source refs | `ProofPagePattern.EvidenceCockpit` |
| Feedback/outcome | feedback target model and panel classes | Recommendation cards and `/feedback` target flow | `FeedbackLoopSignalStrip`, Feedback pages |
| Platform Pulse | `PlatformPulseViewModel`, pulse classes | Source UX strip and 21-symbol pulse | `PlatformLoops` |
| Service catalog | service SKU/trust classes | Admin Local Gates service grid | `IntelligenceCatalog`, `AgenticMarketplace` |
| Operator boundary | operator boundary model/classes | Hero, footer, manifest, Admin & Ops panel | TradeOS boundary copy |
| States and controls | buttons, forms, tabs, states | Review/preflight/ask/scan controls | TradeOS UI primitives |
| React adapter | `packages/source-ui/src/react` | React/Vite app uses Source UI adapter primitives across proof, conformance, services, events, and trial matrix | Dashboard React component library |

The app still keeps domain behavior local: symbol review, preflight, market
pulse scanning, paper execution, and action-agent prompts are not SDK concerns.

Host portability:

- default foundation layout expects `source-int-network-standard` next to
  `distribution-kit`;
- moved or independent checkouts should set
  `SOURCE_UI_STANDARD_PATH=/path/to/source-int-network-standard`;
- marketplace-ready releases should move from local path consumption to a
  versioned tarball or published `@agenticsrclab/source-ui` package.

Run checks:

```bash
npm --workspace @tradeos/symbol-cockpit run check:source-ui
npm --workspace @tradeos/symbol-cockpit run e2e:headless
```

Current exception posture:

- `font_delivery` is `package_managed_fontsource`; Fontsource assets are bundled
  into the Vite output.
- `visual_conformance_status` is `pass`; provider-review screenshots are
  committed and checked by Source UI conformance.

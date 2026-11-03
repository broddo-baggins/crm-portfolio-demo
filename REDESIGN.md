# Redesign, November 2026

Branch `redesign/2026-11`. UI, styles and components only: routing setup, package versions and API/env code are untouched (a parallel branch is moving react-router 6 to 7 and the API calls server-side). The system is written up in [DESIGN.md](DESIGN.md); tokens in [`design/tokens.json`](design/tokens.json).

## Critique of what was there

Captured headless at 1440 and 390 on all 48 routes before any change.

1. **No identity.** Stock Tailwind blue `#3b82f6` as the brand, plus purple, indigo, pink and rainbow gradients wherever something wanted attention: gradient headline text, a purple-to-blue AI button with a ping and a red "NEW" badge, gradient cards, a `CRM Demo` H1 in blue as the hero. Nothing said "lead heating", which is the product.
2. **AI-template furniture.** Meteor showers on every error page, orbiting circles with hand-drawn fake Salesforce/HubSpot/Jira logos and an "oven" mark, a typing-effect hero line, CountUp stats, emoji as icons (🔥 🌡️ ❌ ✨ 🏆 🔒 ⚠️ 👤 📁) and literal placeholder words rendered as icons (`CALENDAR`, `NOTIFY`, `LINK`, `REFRESH`, `CHAT`).
3. **Type was broken by a global `html { zoom: 0.85 }`.** Mobile body text rendered at an effective 11 px, and every full-height page (login, password recovery) ended 135 px early with a white band. Three families were loaded (Inter from Google, Geist, Rubik) and headings ran up to weight 700.
4. **The app did not work on a phone.** The 256 px sidebar was always open at 390, squeezing every page into ~130 px; the dashboard added its own second header and bottom bar on top.
5. **English layouts were mirrored.** `useLang().flexRowReverse()` returned `flex-row-reverse` in English, so Messages (and 15 other components, 77 call sites) put titles on the right and icons before labels.
6. **Colour as decoration, not data.** Stat rows in five tints (blue, green, orange, red, purple cards), figures coloured by mood (a red `0`, a green `35.0%`), the Reports funnel rendered as solid black bars (its chart config had no colour), and the `error-*`/`success-*`/`warning-*` classes used by Button and Input were never defined, so destructive buttons had no fill.
7. **Contrast and accessibility gaps.** White on WhatsApp green 2.0:1, placeholder grey 2.5:1, `gray-400` result text, no skip link, icon buttons with no names, emoji in headings, and the Hebrew accessibility declaration rendered left-to-right.
8. **Dead links.** The app footer's Accessibility link (`/accessibility`) and the login's Forgot password link (`/password-recovery`) both went to 404.

## Decisions

- **Identity: Thermal.** The product moves leads from cold to hot, so the system has one warm colour, ember `#C24816`, that means heat or the next action, on cool slate ink and paper. The heat ramp (steel, pale steel, amber, ember) is the only gradient and only ever draws lead temperature. The mark is three rising bars on that ramp.
- **Systemic, not cosmetic.** 656 hard-coded hue classes across 154 files were folded at the source: Tailwind's `blue/indigo/purple/...` scales now resolve to steel, `orange` and `primary-*` to ember, `green` to moss, `red/pink` to brick, `gray/slate/zinc` to ink. 99 stock hex colours in charts and CSS were mapped the same way. `rounded-xl/2xl/3xl` resolve to the 10 px surface radius; legacy shadows resolve to two elevations.
- **Type:** Geist for Latin, Rubik for Hebrew (both OFL, self-hosted); Inter removed; weights 400/500/600; one scale (DESIGN.md); zoom hack removed.
- **Real assets:** the landing page shows captures of the running, redesigned app (`public/screens/`), the product's own WhatsApp conversation, and a drawn flow diagram with platform names as text rather than counterfeit logos.
- **Shared structure:** one app shell with a mobile drawer, `PageHeader`, `EmptyState`/`ErrorState`/`LoadingState`/`StatusScreen`, `ErrorPageLayout` for 4xx/5xx, `PublicPageShell`/`LegalDocument` for public pages, `AuthFrame` for stand-alone auth forms.
- **Kept on purpose:** every route, handler, test id and i18n key; the WhatsApp mock keeps WhatsApp's own chrome (now its dark teal, for contrast); dark mode is retuned on the same tokens.

## Pages (48 routes)

| Area | Routes | What changed |
| --- | --- | --- |
| Marketing | `/`, `/he` | Rebuilt: split hero with the real dashboard, figures row, cold-to-hot journey on the heat ramp, live chat beside the agent's capabilities, product bento of real captures, before/after, build process, comparison table, integration flow, FAQ, closing band. `/he` is the same page in Hebrew and RTL. |
| Auth | `/auth/login`, `callback`, `reset-password`, `password-recovery`, `magic-link`, `change-email`, `reauthenticate`, `invite-user`, Calendly and Google callbacks | Login rebuilt (form beside an ink panel with the product); stand-alone forms framed by `AuthFrame`; gradients removed. |
| Public content | `/privacy-policy`, `/terms-of-service`, `/cookies`, `/data-deletion`, `/data-export`, `/accessibility-declaration`, `/faq`, `/calendly-demo` | Shared header and footer; Privacy and Terms as `LegalDocument` with a contents rail; emoji and decorative rules removed; Hebrew declaration set RTL. |
| Status | `/maintenance`, `/coming-soon`, `/unauthorized`, `/bad-request`, `/forbidden`, `/internal-server-error`, `/service-unavailable`, `/not-found-alternative`, `/404` | One status layout; meteors and spinning compass removed; every action and countdown kept. |
| App | `/dashboard`, `/leads`, `/queue-management`, `/lead-pipeline`, `/projects`, `/calendar`, `/messages`, `/messages/optimized`, `/messages-analytics`, `/notifications`, `/reports`, `/settings`, `/users`, `/admin`, `/admin/console`, `/admin/company`, `/admin/data-requests`, `/admin/users`, `/admin/app-layout` | New shell and primitives everywhere; metric cards neutral with hue on the icon chip; heat-ramp temperature bar; Leads and Messages headers and stats rebuilt; Reports charts coloured from chart tokens. |

## Before and after

Screenshots: `/private/tmp/claude-502/-Users-Amit-Yogev-Downloads-projects-shellcv/d9eb7315-1044-4b41-896f-5a4547688b8e/scratchpad/design-shots/crm-portfolio-demo/` (`before-<route>-<1440|390>.png`, `after-<route>-<1440|390>.png`, side-by-side `compare-<route>.png`).

## Results (Nov 3, 2026)

- **Contrast, measured from rendered pixels** (headless Chrome, 1440, light, all 48 routes): 3,041 text elements, 2,953 pass (97.1%). 37 of 48 routes have zero failures, including every marketing, auth, legal and status page. Known open failures: green WhatsApp message bubbles and the "Meeting scheduling ready" label on Messages (white or green on `#26D266`, about 2:1); white time labels on steel calendar events (4.26:1, Calendar and Calendly callback); two Privacy data-request buttons; collapsed accordion text measured while hidden on FAQ and Leads (1.0:1, not visible text); "3 Pending" on Users (4.48:1).
- **Unit tests:** 12 files, 108 tests pass (same as baseline). One LeadForm test timed out under machine load and passes when rerun alone.
- **Lint:** clean after removing two useless regex escapes in `GeminiAgent.tsx` (lint was red at HEAD).
- **Type-check:** clean. **Build:** `npm run build` passes.
- **Smoke:** 55 routes and 5 assets return 200 from the production build; no runtime errors on any of 96 captures (the Maintenance page crashed before).
- **Mobile:** 22 routes overflowed at 390 before; none can be scrolled sideways by a user now.
- **Not changed (out of scope):** `/auth/reset-password` without a token redirects to `/login`, which is not a route. Fixing it needs routing or redirect logic changes.

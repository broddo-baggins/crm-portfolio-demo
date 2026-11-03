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

Screenshots: `/private/tmp/claude-502/-Users-Amit-Yogev-Downloads-projects-shellcv/d9eb7315-1044-4b41-896f-5a4547688b8e/scratchpad/design-shots/crm-portfolio-demo/` (`before-<route>-<1440|390>.png`, `after-<route>-<1440|390>.png`, side-by-side `compare-<route>.png`). The `after-*` set was recaptured in light after the final fixes. `contrast-final.json` holds every measured failure (none) and every excluded run with its reason, and `contrast-measure.cjs` is the script that produced it.

## Results (final, Nov 3, 2026)

### Contrast, measured from rendered pixels

All 48 routes, at 1440×900 and 390×844 (phone emulation), in light and in dark (`vite-ui-theme` and `prefers-color-scheme` both set; the `dark` class was confirmed on `<html>` in all 96 dark runs). Headless Chrome at device scale 2. Each page is stepped through a viewport at a time, its horizontal scrollers are paged sideways, and any text never captured cleanly is scrolled to mid-screen and measured again, a second time after declining the cookie banner. For each text run, the most common pixel colour is the ground and the 90th percentile of the glyph pixels is the ink. A run counts only when it is on top at its centre and both ends, inside every clipping ancestor, and has the same position and opacity before and after the screenshot, so a fade or a late badge is not misread. Threshold 4.5:1 (3:1 for 24 px, or 18.66 px bold).

| Theme | Text runs | Pass | Lowest | Routes with a failure |
| --- | --- | --- | --- | --- |
| Light | 8,660 (4,915 at 1440, 3,745 at 390) | **100%** | 4.51:1 | 0 of 48 |
| Dark | 8,682 (4,923 at 1440, 3,759 at 390) | **100%** | 4.56:1 | 0 of 48 |

**Hidden text, and why it was left out.** Text is excluded only for a reason recorded per run, and only when it was never measured anywhere on the page. Over all 192 page loads: `display: none` 2,032 (inactive tabs, the other breakpoint's copy of a label, closed menus), `.sr-only` 304 (skip link, table-action labels, figure captions for screen readers), zero-size 302 (empty separators, collapsed accordion panels), clipped by an `overflow` ancestor 102 (truncated previews), off the side of a scroller that cannot scroll further 50, `opacity: 0` 5 (toasts that have finished fading). The full list with the text of every excluded run is in `contrast-final.json` next to the screenshots. Another 260 runs (1.5%) were visible on the page but never captured cleanly: 100 truncated `...` previews on `/messages/optimized`, older chat history and dates inside the `/messages` chat pane, chart tick numbers on Reports and Dashboard, calendar cells, and footer links under the fixed cookie banner on five pages.

**What fixed the open failures** (all on the tokens; see DESIGN.md):
- WhatsApp: new `whatsapp-bubble`, `whatsapp-bubble-foreground` and `whatsapp-accent` tokens. Sent bubbles are WhatsApp's own pale outgoing green with dark text (15.8:1; dark 6.8:1), and "Meeting scheduling ready" is 5.5:1 or better. They used to be white or green on `#25D366`, about 2:1.
- Calendar and Calendly event times: steel-500 `#486C86` and brick-500 `#B93E37`, so even the 90%-white time line passes (4.33 → 4.9 and 4.8:1).
- Privacy data-request buttons: the legal-prose link colour no longer overrides links styled as buttons (2.5 → 6.8:1).
- Users "3 Pending": passes in both themes (white on ember-500, 4.96:1). In dark, a 500 to 700 fill under on-primary text keeps white text.
- FAQ pale questions: these were captured mid-fade from an uncapped entrance stagger (up to 2 s). The stagger is now capped.
- Found by the deeper sweep and fixed: dark-mode `dark:text-gray-400` picks (2.6 to 3.2:1); recharts' default axis, label and legend greys (3.0 to 4.3:1, every chart); disabled buttons at 50% opacity (2.2:1, including the live "Retrying in 58s" countdown); the landing CTA and WhatsApp mock in dark (2.2 and 1.2:1, now a light island); the Reports period select clipping "Last 30 days"; ink-400 (`text-gray-400`) on tinted grounds (4.27 → 5.0:1 on steel-50, and 4.6:1 even on ink-100).

### Build and tests

- **Lint** (`npm run lint`, whole repo, `--max-warnings 0`): clean. Lint was red at HEAD on two useless regex escapes in `GeminiAgent.tsx`, which were removed earlier on this branch.
- **Type-check** (`tsc --noEmit`): clean.
- **Unit tests** (`vitest run`, the repo's only test suite; the Playwright scripts in `package.json` point at directories that do not exist): 12 files, 108 of 108 pass, with no timeouts on the final run.
- **Build** (`npm run build`): passes.
- **Captures:** all 96 `after-*` shots return 200, with no page errors. None is wider than its viewport, measured against the device width, which catches a phone layout widening as well as a page scrolling sideways. That check found and fixed `/leads` laying out 481 px wide at 390: sr-only header labels were escaping the table's scroller.

### Not changed (out of scope)

`/auth/reset-password` without a token redirects to `/login`, which is not a route. Fixing it needs routing or redirect logic changes. `/he` reuses the main landing page in Hebrew, so the old Hebrew page's own FAQ items are gone.

# CRM Demo design system: Thermal

CRM Demo is an AI sales agent that warms cold real-estate leads over WhatsApp and books them into a sales manager's calendar, in English and Hebrew. The product's own idea is temperature: a lead is cold, cool, warm or hot. The design system takes that one idea and nothing else.

**Thermal** is a cool, quiet slate workspace with one warm colour, ember, that means heat: the action you should take, the lead you should call, the thing that is live. Everything that is not heat is ink on paper.

The tokens live in [`design/tokens.json`](design/tokens.json) (name, value, usage, contrast). [`src/styles/tokens.css`](src/styles/tokens.css) is generated from it (`node design/build-tokens.mjs`) and `tailwind.config.ts` reads the same scales, so a Tailwind class, a CSS variable and this page always agree.

## 1. Principles

| Principle | On a screen |
| --- | --- |
| **One warm thing** | Ember marks the primary action, the active nav item, the focus ring and a hot lead. If two things on a screen are ember, one of them is wrong. |
| **Colour carries data or status, never mood** | The heat ramp (steel, cool, amber, ember) is the only gradient, and it only draws lead temperature. Status hues (moss, amber, brick) only say done, waiting, failed. No decorative gradients, glows, meteors or glass. |
| **Ink does the hierarchy** | Hierarchy comes from size, weight and the three text inks (text, secondary, muted), never from a paler grey that fails contrast. |
| **Borders, not shadows** | A card on the page is a 1 px border on surface. A shadow means it floats: popover, dialog, sticky bar. |
| **Bilingual by construction** | Every layout uses logical properties (start/end) so Hebrew mirrors without a second stylesheet; Hebrew is set in Rubik, Latin in Geist. |
| **Real content** | The landing page shows the product itself (captures of the running app, `public/screens/`), its own chat, its own numbers. No stock art, no fake logos. |

## 2. Tokens

### Colour

Six scales (50 to 950) in `tokens.json`: **ink** (the neutral), **ember** (the accent), **steel** (cold and info), **moss**, **amber**, **brick** (status). Tailwind's stock hue names are remapped onto them in `tailwind.config.ts`, so legacy `text-blue-600` resolves to steel and `bg-purple-500` can never render purple again: gray/slate/zinc/neutral/stone to ink; blue/indigo/sky/cyan/violet/purple/fuchsia to steel; orange and `primary-*` to ember; green/emerald/teal/lime to moss; amber/yellow to amber; red/rose/pink to brick.

| Token | Light | Dark | Use | Contrast (light) |
| --- | --- | --- | --- | --- |
| `paper` | #FAFBFC | #0F1419 | page ground | text 16.4:1 |
| `surface` | #FFFFFF | #171D24 | cards, sidebar, popovers | text 17.2:1 |
| `surface-sunken` | #F3F5F7 | #0B0F13 | wells, table heads | muted 5.1:1 |
| `text` | #171D24 | #E9ECEF | headings, body | |
| `text-secondary` | #4A5562 | #B9C0C8 | supporting copy | 7.3:1 |
| `text-muted` | #5E6975 | #9AA4AF | meta, placeholders | 5.4:1 (the floor) |
| `line` / `line-strong` | #D9DEE3 / #B9C0C8 | #2A333D / #3B4652 | hairlines / inputs (Tailwind `border`, `input`) | not text |
| `action` | #C24816 | #E8784C | primary button, links, active nav (Tailwind `primary`) | white on it 5.0:1 |
| `action-soft` | #FDF3EE | #33130A | selected / active background | ember-700 on it 6.8:1 |
| `success` `warning` `danger` `info` | moss-600, amber-600, brick-600, steel-600 | the 300 steps | status text and icons | 6.2 to 6.8:1 |
| `whatsapp-bubble` / `-foreground` | #D9FDD3 / #111B21 | #005C4B / #E9EDEF | a sent WhatsApp message (Tailwind `bg-whatsapp-bubble`) | 15.8:1 (dark 6.8:1) |
| `whatsapp-accent` | #00705C | #25D366 | WhatsApp-green text and icons | 5.5:1 on sunken (dark 7.8:1) |

Shade rule for legacy classes: on a white or 50-tinted ground, text uses step **400 or darker** (ink-400 is 4.6:1 even on ink-100; every 500 is at least 4.9:1 on white); fills that carry white text use **500 or darker**, and every 500 holds white at 4.9:1 or better; steel-500 and brick-500 (the calendar's Calendly and Google event fills) also hold white at 90% opacity (4.9 and 4.8:1), the others do not, so use full white on them; 50 to 200 are grounds only. The WhatsApp brand green `#25D366` is never a fill under white text (2.0:1).

Dark-mode safety net (generated into `tokens.css`): legacy text steps 400 to 950 become the family's 300 step (ink 400 and 500 become `text-muted`, so captions keep their rank); explicit `dark:text-*-400/500/600` variants, which pick light-theme steps, get the same treatment; a 500 to 700 fill under `text-primary-foreground` keeps white text, because the fill does not change with the theme. Recharts' axis, label and legend text is set on `text-muted` / `text-secondary` in `index.css` for every chart.

**Heat ramp:** cold `#486C86`, cool `#97B2C6`, warm `#D69A2E`, hot `#C24816`. Always with its word.

**Charts:** series order ember, steel-600, amber-400, moss-500, steel-300 (`--chart-1..5`).

### Type

Two families, both OFL and self-hosted: **Geist** (Latin) and **Rubik** (Hebrew). Weights 400, 500, 600 only; figures are `tabular-nums`.

| Role | Size / line | Weight | Where |
| --- | --- | --- | --- |
| display | 60/64 (40/44 at 390) | 600, -0.035em | landing hero only |
| h1 | 36/42 (28/34) | 600, -0.025em | marketing section titles |
| page-title | 24/32 | 600, -0.02em | one per app page |
| h2 | 18/26 | 600 | card and panel titles |
| body-lg | 18/28 | 400 | marketing lead, max 60ch |
| body | 15/24 | 400 | app and legal reading text, max 68ch |
| ui | 14/20 | 500 | buttons, nav, table cells, labels |
| caption | 12/16 | 500 | meta, helper text, badges |
| kpi | 32/36 | 600, tabular | one figure per stat card |

The old `html { zoom: 0.85 }` is gone: it shrank 13 px mobile text to an effective 11 px and left a white band under every full-height page.

### Space, radius, elevation, motion

- **Space:** 4 px base; steps 4, 8, 12, 16, 24, 32, 48, 64, 96. Gutters 16 (mobile) / 32 (desktop); content max 1200; prose max 68ch; sidebar 248; top bar 60.
- **Radius:** controls **6**, surfaces **10**, pills and avatars **full**. `rounded-xl/2xl/3xl` resolve to 10, so no 24 px blobs.
- **Elevation:** `shadow-raised` for a hovered card, `shadow-float` for popovers and dialogs. Nothing else.
- **Motion:** 120 ms press/hover, 200 ms panels, 400 ms max entrance, ease `cubic-bezier(0.2, 0.8, 0.2, 1)`. Under `prefers-reduced-motion` every animation and transition is off. No infinite loops except a real live indicator.

## 3. Components

| Component | File | Notes |
| --- | --- | --- |
| Logo mark | `src/components/brand/BrandMark.tsx` | Three rising bars on the heat ramp: cold, warm, hot. Drawn in code, 1 colour per bar, works on light and dark. |
| Button | `src/components/ui/button.tsx` | `default` ember fill, `secondary` ink-100 fill, `outline` border-strong, `ghost`, `link`, `destructive`. 36 px (sm 32, lg 44), radius 6, 1 px press translate. One primary per view. |
| Card | `src/components/ui/card.tsx` | surface, 1 px border, radius 10, no shadow; title is h2. |
| Badge | `src/components/ui/badge.tsx` | pill, caption type, tinted 50 ground + 700 text. |
| Input / Select / Textarea | `src/components/ui/*` | 36 px, border-strong, radius 6, ember focus ring; label above, helper/error below. |
| App shell | `src/components/layout/{Layout,Sidebar,TopBar,Footer}.tsx` | Sidebar 248 on desktop, a drawer under 1024 px opened from the top bar (theme and language move into the drawer under 640 px); one 60 px top bar row; a skip link to `#main-content`. |
| Page header | `src/components/system/PageHeader.tsx` | page-title + one line of secondary text + actions at the end. |
| States | `src/components/system/States.tsx` | `EmptyState`, `ErrorState`, `LoadingState` (skeleton rows shaped like the content), `StatusScreen` (the full-page status layout, with a quiet cold-bars drawing). |
| Error pages | `src/pages/errors/ErrorPageLayout.tsx` | 400, 401, 403, 500, 503 on one layout: code as a caption, plain title, the reason in a ruled aside, one primary action, Go back, Home. |
| Heat meter | `src/components/system/HeatMeter.tsx` | Four cells on the heat ramp plus the word. Used on the landing journey; badges use the same ramp. |
| Public pages | `src/components/marketing/PublicPageShell.tsx` | `PublicPageShell` (brand header with a way home, slim footer) and `LegalDocument` (sticky contents list, numbered prose sections, `.legal-prose`). |
| Auth frame | `src/features/auth/components/AuthFrame.tsx` | The page around a stand-alone auth form (magic link, change email, reauthenticate, invite). |
| Product shot | `src/components/marketing/ProductShot.tsx` | A real capture from `public/screens/` in a 1 px frame with a window bar. Recapture after a UI change. |
| Landing SEO | `src/components/marketing/LandingSeo.tsx` | The landing page's Helmet and JSON-LD, moved out unchanged. |

## 4. Patterns

- **Page:** page header, then content in a 12-column grid at 1440, 8 at 768, 1 at 390. Never centre an app page.
- **Empty:** say what is missing and the one action that fills it ("No leads yet" + "Import leads").
- **Loading:** skeleton blocks the shape of the real content; a spinner only inside a button.
- **Error:** one plain sentence, what is kept, one way to retry. Brick is for the icon, never a full red panel.
- **Status pages (4xx/5xx):** code as a quiet caption, a plain title, one sentence, one primary and one secondary action, left-aligned in a narrow column.

## 5. Do and don't

| Do | Don't |
| --- | --- |
| One ember action per view | Purple/blue gradients, glows, shimmer or meteor effects |
| Lucide icons at 16/20 px, stroke 1.75 | Emoji as icons (the old notification list used them) |
| Borders to group, space to separate | Shadows on every card, `rounded-3xl` |
| `text-muted` as the palest text | Grey text below 4.5:1, placeholder-as-label |
| Logical `ms-/me-/start-/end-` | `ml-`/`mr-` plus an RTL override stylesheet |
| Real captures of the app | Div-drawn fake dashboards, stock photos, invented logos |
| Sentence case, plain verbs | "Revolutionary", "Why everyone's talking", caps kickers, "NEW!" badges |

# Upgrade notes (November 2026)

Branch `fix/security-2026-11`. Node engine: **24.x** (`engines` in package.json; Vercel builds with it).

## Dependencies, old → new

| Package | Old | New | Notes |
|---|---|---|---|
| react, react-dom | 18.3.1 | 19.3.1 | `JSX` namespace → `React.JSX`; `useRef()` needs an initial value |
| @types/react, @types/react-dom | 18.3 | 19.3 | |
| react-router | 7.18.5 | 8.5.1 | No API changes needed for this app's routes |
| vite | 6.4.5 | 8.3.5 | Rolldown: `rollupOptions` → `rolldownOptions`, `manualChunks` → `codeSplitting.groups`; minification is on again (main chunk 2.17 MB → 680 KB) |
| @vitejs/plugin-react | 4.7.0 | 6.2.1 | No Babel options any more |
| typescript | 5.9.3 | 6.0.3 | `baseUrl` removed (deprecated); lib/target ES2022 |
| vitest, @vitest/coverage-v8 | 3.2 | 5.1 | Two projects: `app` (jsdom) and `api` (node); observer mocks must be constructible |
| jsdom | 26.1 | 30.1 | |
| eslint, @eslint/js | 9.38 | 10.14 / 10.0 | Flat config with `defineConfig`/`globalIgnores` |
| eslint-plugin-react-hooks | 5.2 | 7.1 | See "left behind" |
| eslint-plugin-react-refresh, globals | 0.4 / 15 | 0.5 / 17 | |
| @playwright/test | 1.56 | 1.64 | |
| axe-core | 4.11 | 4.14 | |
| @testing-library/jest-dom | 6.9 | 7.0 | Import `@testing-library/jest-dom/vitest` |
| recharts | 2.15 | 3.10 | Tooltip/Legend content types; `Pie activeIndex` → `shape` |
| react-grid-layout | 1.5 | 2.3 | Uses the official `react-grid-layout/legacy` entry (v1 API) |
| react-resizable | (transitive) | 3.2 | Listed explicitly because its CSS is imported; 3.x is the line react-grid-layout 2 uses |
| framer-motion | 12.23 | 14.9 | |
| lucide-react | 0.462 | 1.67 | |
| i18next / react-i18next / i18next-http-backend | 25 / 15 / 3 | 26 / 17 / 4 | |
| @hookform/resolvers | 5.9 | 7.0 | |
| react-helmet-async | 1.3 | 3.0 | |
| sonner | 1.7 | 2.0 | |
| date-fns | 3.6 | 4.4 | |
| mermaid | 11.17 | 12.2 | |
| @vercel/analytics / speed-insights | 1.5 / 1.2 | 2.0 / 2.0 | |
| @supabase/supabase-js | 2.76 | 2.118 | |
| @radix-ui/* | various | latest minors | Unused Radix packages removed |
| daisyui | 5.3 | **4.12** | See "left behind" |
| knip | — | 6.44 | New: `npm run knip` |

**Removed (never imported, or only by dead code):** @chatscope/*, @fontsource/rubik, @llamaindex/chat-ui,
@pdfme/*, @supabase/ssr, @tanstack/react-table, @tanstack/react-query-devtools, axios, chart.js, cmdk, dotenv,
embla-carousel-react, exceljs, flowbite-react, input-otp, lodash/lodash-es, moment, next-themes, papaparse, pg,
puppeteer, react-big-calendar, react-day-picker, react-icons, react-intersection-observer, react-resizable-panels,
sharp, stream-chat(-react), vaul, ws, zustand, jest-axe, allure-playwright, node-fetch, prettier, husky (no hooks
were installed), terser, webpack-bundle-analyzer, @vitejs/plugin-react-swc and unused @types/*. 581 packages installed in total.

`npm audit`: **0 vulnerabilities** (all dependencies). The only remaining advisory (minimatch < 11.0.1 inside the
ESLint toolchain) is closed with an `overrides` entry.

## Left behind, and why

| What | Kept at | Why |
|---|---|---|
| tailwindcss | 3.4.19 | Tailwind 4 is a styling migration (CSS-first config, new utilities); it belongs to the `redesign/2026-11` branch |
| tailwind-merge | 2.6.1 | 3.x targets Tailwind 4 |
| daisyui | 4.12.24 (was 5.3) | daisyUI 5 is a Tailwind 4 plugin; under Tailwind 3 it emitted invalid CSS (`[object Object]`) that Vite 8's CSS minifier rejects. Move to 5 together with Tailwind 4 |
| typescript | 6.0.3 (latest is 7.0.2) | typescript-eslint 8.72 (latest) supports TypeScript `<6.1`; upgrade when it supports 7 |
| React Compiler lint rules | off (except `rules-of-hooks`, `static-components`) | react-hooks 7 added compiler rules to `recommended` (~90 hits: set-state-in-effect, immutability, purity, refs, preserve-manual-memoization). They matter once the React Compiler is adopted; `static-components` found real remount bugs and is enforced |
| jQuery for NagishLi | 3.7.1 (CDN, SRI) | The bundled NagishLi 3.0 beta targets jQuery 3; jQuery 4 removes APIs it may use |

## AI models

| Provider | Old | New (default) | Fallback | Override |
|---|---|---|---|---|
| Google Gemini | `gemini-2.5-flash` (deprecated; auto-rerouted from 2026-12-01) | `gemini-3.8-flash` (stable, Sept 2026) | `gemini-3.5-flash-lite` | `GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL` |
| Groq | `llama-3.3-70b-versatile` (**shut down 2026-08-16**, so the fallback was dead) | `openai/gpt-oss-120b` (production) | `openai/gpt-oss-20b` | `GROQ_MODEL`, `GROQ_FALLBACK_MODEL` |

`gemini-4-argon` (Oct 2026) is Google's newest stable model overall, but it is the heavy reasoning tier; the
assistant uses the newest Flash. Set `GEMINI_MODEL=gemini-4-argon` to switch. Sources:
ai.google.dev/gemini-api/docs/models, console.groq.com/docs/models, console.groq.com/docs/deprecations.

## Dead code

228 unreachable source files (found with knip from `src/main.tsx` and `api/*`), 32 unused shadcn/ui primitives,
the `/admin/app-layout` route (an empty shell), ~120 npm scripts pointing at a `scripts/` directory that doesn't
exist, `public/test-speed-insights.html`, `TEST_RESULTS.md`, `.vercel-trigger`. All recoverable from git history.

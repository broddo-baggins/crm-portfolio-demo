/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { readFileSync } from "node:fs";

/**
 * The site-wide security headers from vercel.json, so `vite preview` (and the e2e suite
 * that runs against it) serves the same CSP as production. Over plain-http localhost the
 * HTTPS-only parts are dropped.
 */
function vercelSecurityHeaders(): Record<string, string> {
  const vercel = JSON.parse(readFileSync(new URL("./vercel.json", import.meta.url), "utf8"));
  const site = vercel.headers.find((h: { source: string }) => h.source === "/(.*)");
  const headers: Record<string, string> = {};
  for (const { key, value } of site?.headers ?? []) {
    if (key === "Strict-Transport-Security") continue;
    headers[key] = key === "Content-Security-Policy" ? value.replace(/;\s*upgrade-insecure-requests/, "") : value;
  }
  return headers;
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    define: {
      // A few modules still read public settings through process.env
      "process.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL),
      "process.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      "process.env.VITE_APP_URL": JSON.stringify(env.VITE_APP_URL),
      "process.env.VITE_ENVIRONMENT": JSON.stringify(env.VITE_ENVIRONMENT),
      "process.env.VITE_ENABLE_FALLBACK_LOGIN": JSON.stringify(env.VITE_ENABLE_FALLBACK_LOGIN),
      "process.env.VITE_ALLOW_REGISTRATION": JSON.stringify(env.VITE_ALLOW_REGISTRATION),
      global: "globalThis",
    },
    server: {
      port: 3000,
      host: true,
      hmr: {
        overlay: false,
      },
    },
    preview: {
      port: 3000,
      host: true,
      headers: vercelSecurityHeaders(),
    },
    build: {
      outDir: "dist",
      sourcemap: mode === "development",
      // Keep small assets as files rather than base64 data URLs
      assetsInlineLimit: 1024,
      target: "es2022",
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1500,
      rolldownOptions: {
        // Production only: calls to console.log/info/debug/trace are dropped so a visitor's
        // devtools stays quiet. console.warn and console.error stay.
        treeshake:
          mode === "production"
            ? { manualPureFunctions: ["console.log", "console.info", "console.debug", "console.trace"] }
            : undefined,
        output: {
          codeSplitting: {
            groups: [
              { name: "react-runtime", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 20 },
              { name: "vendor", test: /node_modules[\\/]@supabase[\\/]/, priority: 10 },
            ],
          },
          chunkFileNames: "assets/[name]-[hash:8].js",
          entryFileNames: "assets/app-[hash:8].js",
          assetFileNames: (assetInfo) => {
            const name = assetInfo.names?.[0] ?? "asset";
            if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif)$/i.test(name)) {
              return "assets/images/[name]-[hash:8][extname]";
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
              return "assets/fonts/[name]-[hash:8][extname]";
            }
            return "assets/[name]-[hash:8][extname]";
          },
        },
      },
    },
    test: {
      reporters: ["default"],
      projects: [
        {
          extends: true,
          test: {
            name: "app",
            environment: "jsdom",
            globals: true,
            setupFiles: ["./src/test/setup.ts"],
            include: ["src/**/*.test.{ts,tsx}"],
          },
        },
        {
          extends: true,
          test: { name: "api", environment: "node", include: ["api/**/*.test.ts"] },
        },
      ],
      coverage: {
        provider: "v8",
        reporter: ["text", "json-summary"],
        exclude: ["src/test/**", "**/*.test.{ts,tsx}"],
      },
    },
  };
});

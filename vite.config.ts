/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Polyfill plugin for module.exports (DISABLED FOR DEBUGGING)
const modulePolyfillPlugin = () => {
  return {
    name: 'module-polyfill-disabled',
    renderChunk(code) {
      // Disabled: Add module polyfill at the beginning of each chunk
      return code; // Return unchanged code
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
        jsxImportSource: 'react',
        babel: {
          plugins: [],
          presets: []
        }
      }), 
      modulePolyfillPlugin()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        lodash: "lodash-es",
      },
    },
    define: {
      "process.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL),
      "process.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(
        env.VITE_SUPABASE_ANON_KEY,
      ),
      "process.env.VITE_APP_URL": JSON.stringify(env.VITE_APP_URL),
      "process.env.VITE_ENVIRONMENT": JSON.stringify(env.VITE_ENVIRONMENT),
      "process.env.VITE_ENABLE_FALLBACK_LOGIN": JSON.stringify(
        env.VITE_ENABLE_FALLBACK_LOGIN,
      ),
      "process.env.VITE_ALLOW_REGISTRATION": JSON.stringify(
        env.VITE_ALLOW_REGISTRATION,
      ),
      // Fix for React DevTools in production
      global: 'globalThis',
    },
    server: {
      port: 3000,
      host: true,
      cors: {
        origin: true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      },
      proxy: {
        "/api": {
          target: "http://localhost:3002",
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Proxying:', req.method, req.url, '→', proxyReq.path);
            });
          }
        },
      },
      hmr: {
        overlay: false, // Disable error overlay in development
      },
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/dist/**',
          '**/EMERGENCY_BACKUP/**',
          '**/.git/**'
        ]
      },
    },
    preview: {
      port: 3000,
      host: true,
      cors: true,
    },
    build: {
      outDir: "dist",
      sourcemap: mode === "development",
      // DOA PREVENTION: Disable minification to prevent React corruption
      minify: false,
      cssMinify: true,
      // Prevent inlining of assets to avoid base64 data URL warnings
      assetsInlineLimit: 1024,
      // Optimize build performance
      target: "es2020",
      reportCompressedSize: false,

      // Add CommonJS options to handle exports properly
      commonjsOptions: {
        transformMixedEsModules: true,
        strictRequires: false,
        esmExternals: true,
      },
      rollupOptions: {
        onwarn(warning, warn) {
          // Suppress react-helmet-async comment warnings
          if (
            warning.code === "INVALID_ANNOTATION" &&
            warning.message.includes("react-helmet-async")
          ) {
            return;
          }
          warn(warning);
        },
        external: [],
        output: {
          format: 'es',
          // DOA PREVENTION: React runtime chunk separation for reliable loading
          manualChunks: {
            'react-runtime': ['react', 'react-dom', 'react/jsx-runtime'],
            'vendor': ['@supabase/supabase-js'],
          },
          chunkFileNames: (chunkInfo) => {
            const name = chunkInfo.name || "chunk";
            return `assets/${name}-[hash:8].js`;
          },
          entryFileNames: 'assets/app-[hash:8].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || 'asset';
            const info = name.split('.');
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash:8].[ext]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash:8].[ext]`;
            }
            return `assets/[name]-[hash:8].[ext]`;
          },
        },
      },
      // Reduce chunk size warning for mobile
      chunkSizeWarningLimit: 300,
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react-router",
        "lucide-react",
        "recharts",
        "lodash-es",
        // All Radix UI packages to prevent dependency resolution issues
        "@radix-ui/react-dialog",
        "@radix-ui/react-dropdown-menu", 
        "@radix-ui/react-select",
        "@radix-ui/react-slot",
        "@radix-ui/react-tooltip",
        "@radix-ui/react-accordion",
        "@radix-ui/react-alert-dialog",
        "@radix-ui/react-avatar",
        "@radix-ui/react-checkbox",
        "@radix-ui/react-label",
        "@radix-ui/react-tabs",
        "@radix-ui/react-toast",
        "clsx",
        "tailwind-merge",
        "date-fns",
      ],
      exclude: [
        'playwright',
        '@playwright/test',
        'fsevents'
      ],
      esbuildOptions: {
        target: "es2020",
        supported: {
          'top-level-await': true
        },
      },
    },
    esbuild: {
      keepNames: mode === "development",
      legalComments: "none",
      target: "es2020",
      treeShaking: true,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      
      // 🚨 CRITICAL: TEXT-ONLY REPORTERS - NO HTML REPORTS!
      reporters: [
        ['default', { summary: false }],
        'json'
      ],
      outputFile: {
        json: 'test-results/vitest-results.json'
      },
      
      // Coverage settings - text output only
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.test.{ts,tsx}',
          '**/*.spec.{ts,tsx}',
          'src/stories/',
          'src/**/*.stories.{ts,tsx}'
        ]
      },
    },
  };
});

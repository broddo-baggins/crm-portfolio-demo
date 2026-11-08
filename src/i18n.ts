import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(Backend) // loads /locales/{lng}/{ns}.json
  .use(LanguageDetector) // detects from localStorage, URL, browser
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "he"],
    ns: [
      "common",
      "widgets",
      "auth",
      "dashboard",
      "landing",
      "forms",
      "tables",
      "leads",
      "charts",
      "notifications",
      "pages",
    ],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
      // Components ask the pages namespace for "pages.messages.x"; the files hold "messages.x"
      parse: (data: string, _lng?: string | string[], ns?: string | string[]) => {
        const parsed = JSON.parse(data);
        return ns === "pages" ? { ...parsed, pages: parsed } : parsed;
      },
    },
    detection: {
      order: ["localStorage", "htmlTag"], // Removed 'navigator' to prevent browser language detection on first visit
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
    debug: false, // Disabled to reduce console spam
    missingKeyHandler: function (lng, ns, key, fallbackValue) {
      if (process.env.NODE_ENV === "development") {
        // Only log each missing key once to avoid spam
        const logKey = `${lng}-${ns}-${key}`;
        if (!(window as any).__i18n_logged_keys__) {
          (window as any).__i18n_logged_keys__ = new Set();
        }
        if (!(window as any).__i18n_logged_keys__.has(logKey)) {
          console.warn(
            `i18next: Missing translation key "${key}" in namespace "${ns}" for language "${lng}"`,
          );
          (window as any).__i18n_logged_keys__.add(logKey);
        }
      }
    },
  });

export default i18n;

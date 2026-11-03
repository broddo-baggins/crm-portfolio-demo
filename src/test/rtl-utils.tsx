import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { expect, vi } from "vitest";

// Mock react-router-dom properly
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="browser-router">{children}</div>
    ),
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: "/", search: "", hash: "", state: null }),
    useParams: () => ({}),
  };
});

// Mock react-i18next properly
vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next");
  return {
    ...actual,
    I18nextProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="i18next-provider">{children}</div>
    ),
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { language: "en", changeLanguage: vi.fn() },
    }),
  };
});

// Mock useLang hook properly
vi.mock("@/hooks/useLang", () => ({
  useLang: () => ({
    language: "en",
    changeLanguage: vi.fn(),
    t: (key: string) => key,
    isRTL: false,
    isLTR: true,
    rtl: {
      dir: "ltr",
      opposite: "rtl",
      flexRow: "flex-row",
      flexRowReverse: "flex-row-reverse",
      textLeft: "text-left",
      textRight: "text-right",
      textStart: "text-left",
      textEnd: "text-right",
      marginStart: "ml",
      marginEnd: "mr",
      paddingStart: "pl",
      paddingEnd: "pr",
      borderStart: "border-l",
      borderEnd: "border-r",
      left: "left",
      right: "right",
      rtlClass: (rtlClass: string, ltrClass?: string) => ltrClass || "",
      rtlStyle: (
        rtlStyles: Record<string, any>,
        ltrStyles?: Record<string, any>,
      ) => ltrStyles || {},
    },
    dir: "ltr",
    setLang: vi.fn(),
    lang: "en",
    marginStart: (value: string) => `ml-${value}`,
    marginEnd: (value: string) => `mr-${value}`,
    paddingStart: (value: string) => `pl-${value}`,
    paddingEnd: (value: string) => `pr-${value}`,
    borderStart: (value: string = "1") => `border-l-${value}`,
    borderEnd: (value: string = "1") => `border-r-${value}`,
    textStart: () => "text-left",
    textEnd: () => "text-right",
    flexRowReverse: () => "flex-row",
    left: (value: string) => `left-${value}`,
    right: (value: string) => `right-${value}`,
    floatStart: () => "float-left",
    floatEnd: () => "float-right",
    flipIcon: () => "",
    rotateIcon: () => "",
    rtlClass: (ltrClass: string, rtlClass: string) => ltrClass,
    rtlValue: (ltrValue: any, rtlValue: any) => ltrValue,
  }),
}));

// Mock ProjectProvider
vi.mock("@/context/ProjectContext", async () => {
  const actual = await vi.importActual("@/context/ProjectContext");
  return {
    ...actual,
    ProjectProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="project-provider">{children}</div>
    ),
    useProject: () => ({
      currentProject: {
        id: "test-project-1",
        name: "Test Project",
        status: "active",
      },
      setCurrentProject: vi.fn(),
      projects: [],
    }),
  };
});

// Mock RTL context provider
const RTLProvider = ({
  children,
  isRTL = false,
}: {
  children: React.ReactNode;
  isRTL?: boolean;
}) => {
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "font-hebrew" : ""}>
      {children}
    </div>
  );
};

// All the providers wrapper
const AllProviders = ({
  children,
  isRTL = false,
}: {
  children: React.ReactNode;
  isRTL?: boolean;
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div data-testid="project-provider">
          <RTLProvider isRTL={isRTL}>{children}</RTLProvider>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render function with RTL support
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & { isRTL?: boolean },
) => {
  const { isRTL = false, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders isRTL={isRTL}>{children}</AllProviders>
    ),
    ...renderOptions,
  });
};

// RTL-specific test utilities
export const rtlTestUtils = {
  // Test if element has proper RTL direction
  expectRTLDirection: (element: HTMLElement) => {
    expect(element).toHaveAttribute("dir", "rtl");
  },

  // Test if element has proper LTR direction
  expectLTRDirection: (element: HTMLElement) => {
    expect(element).toHaveAttribute("dir", "ltr");
  },

  // Test if numbers are properly localized
  expectLocalizedNumber: (
    element: HTMLElement,
    number: number,
    isRTL: boolean,
  ) => {
    const expectedFormat = number.toLocaleString(isRTL ? "he-IL" : "en-US");
    expect(element).toHaveTextContent(expectedFormat);
  },

  // Test if flex direction is properly reversed for RTL
  expectFlexReverse: (element: HTMLElement, isRTL: boolean) => {
    if (isRTL) {
      expect(element).toHaveClass("flex-row-reverse");
    } else {
      expect(element).not.toHaveClass("flex-row-reverse");
    }
  },

  // Test if text alignment is correct for RTL
  expectTextAlignment: (element: HTMLElement, isRTL: boolean) => {
    if (isRTL) {
      expect(element).toHaveClass("text-right");
    } else {
      expect(element).toHaveClass("text-left");
    }
  },

  // Test dark mode classes
  expectDarkModeSupport: (element: HTMLElement) => {
    const classes = element.className;
    const hasDarkVariant = classes.includes("dark:");
    expect(hasDarkVariant).toBe(true);
  },

  // Test Hebrew font class
  expectHebrewFont: (element: HTMLElement, isRTL: boolean) => {
    if (isRTL) {
      expect(element).toHaveClass("font-hebrew");
    } else {
      expect(element).not.toHaveClass("font-hebrew");
    }
  },
};

// Theme testing utilities
export const themeTestUtils = {
  // Simulate dark mode
  enableDarkMode: () => {
    document.documentElement.classList.add("dark");
  },

  // Simulate light mode
  enableLightMode: () => {
    document.documentElement.classList.remove("dark");
  },

  // Check if element has proper dark mode styling
  expectDarkModeStyles: (element: HTMLElement) => {
    const style = window.getComputedStyle(element);
    // This would need to be implemented based on actual CSS-in-JS or computed styles
    // For now, we check for dark mode classes
    expect(element.className).toMatch(/dark:/);
  },
};

// Translation testing utilities
export const translationTestUtils = {
  // Mock translation function with specific values
  mockTranslation: (key: string, defaultValue: string) => {
    return defaultValue || key;
  },

  // Test if element uses translation keys
  expectTranslationKey: (element: HTMLElement, key: string) => {
    // This checks if the element contains text that looks like a translation key
    expect(element.textContent).toContain(key);
  },
};

// Export everything needed for testing
export * from "@testing-library/react";
export { customRender as render };

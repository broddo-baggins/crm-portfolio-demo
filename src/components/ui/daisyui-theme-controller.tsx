import { useTheme } from "@/components/theme-provider"
import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export function DaisyUIThemeController() {
  const { theme, setTheme } = useTheme()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (theme === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDark(systemDark)
    } else {
      setIsDark(theme === "dark")
    }
  }, [theme])

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  const Icon = isDark ? Sun : Moon

  // A real checkbox (keyboard, screen readers, tests) drawn as one icon button.
  return (
    <label
      className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-subtle transition-colors duration-[120ms] hover:bg-accent hover:text-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
      data-testid="theme-controller"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <input
        type="checkbox"
        className="theme-controller peer sr-only"
        data-testid="dark-mode-toggle"
        aria-label="Dark mode"
        checked={isDark}
        onChange={(e) => handleToggle(e.target.checked)}
      />
      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
    </label>
  )
}

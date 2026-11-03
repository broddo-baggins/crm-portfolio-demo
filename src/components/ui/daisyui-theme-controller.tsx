import { useTheme } from "@/components/theme-provider"
import { useEffect, useState } from "react"

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

  return (
    <label 
      className="flex cursor-pointer gap-2 items-center transition-all duration-200 hover:opacity-80" 
      data-testid="theme-controller"
    >
      {/* Sun Icon */}
      <svg 
        aria-hidden="true"
        className={`sun-icon transition-all duration-300 ${
          isDark ? 'opacity-40 scale-75' : 'opacity-100 scale-100 text-yellow-500'
        }`} 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </svg>
      
      {/* DaisyUI Toggle */}
      <input 
        type="checkbox" 
        className="toggle toggle-primary theme-controller transition-all duration-300" 
        data-testid="dark-mode-toggle"
        aria-label="Dark mode"
        checked={isDark}
        onChange={(e) => handleToggle(e.target.checked)}
      />
      
      {/* Moon Icon */}
      <svg 
        aria-hidden="true"
        className={`moon-icon transition-all duration-300 ${
          isDark ? 'opacity-100 scale-100 text-blue-400' : 'opacity-40 scale-75'
        }`} 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </label>
  )
} 
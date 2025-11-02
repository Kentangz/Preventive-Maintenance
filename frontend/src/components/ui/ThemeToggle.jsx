import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "../../contexts/ThemeContext"
import { Button } from "./Button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [effectiveTheme, setEffectiveTheme] = useState(() => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return theme
  })

  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const updateEffectiveTheme = () => {
        setEffectiveTheme(mediaQuery.matches ? "dark" : "light")
      }
      
      updateEffectiveTheme()
      mediaQuery.addEventListener("change", updateEffectiveTheme)
      
      return () => mediaQuery.removeEventListener("change", updateEffectiveTheme)
    } else {
      setEffectiveTheme(theme)
    }
  }, [theme])

  const toggleTheme = () => {
    // Jika theme adalah "system", detect system theme dulu
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      // Toggle ke tema yang berlawanan dengan system theme
      setTheme(systemTheme === "light" ? "dark" : "light")
    } else if (theme === "light") {
      setTheme("dark")
    } else {
      // theme === "dark"
      setTheme("light")
    }
  }

  const getIcon = () => {
    return effectiveTheme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
  }

  const getLabel = () => {
    return effectiveTheme === "light" ? "Light" : "Dark"
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center gap-2"
    >
      {getIcon()}
      <span className="hidden sm:inline">{getLabel()}</span>
    </Button>
  )
}

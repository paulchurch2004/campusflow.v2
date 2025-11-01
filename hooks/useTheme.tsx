'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('campusflow-theme') as Theme | null
    if (savedTheme) {
      setThemeState(savedTheme)
    }
  }, [])

  // Update actual theme based on system preference
  useEffect(() => {
    const updateActualTheme = () => {
      const root = window.document.documentElement

      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'

        root.classList.remove('light', 'dark')
        root.classList.add(systemTheme)
        setActualTheme(systemTheme)
      } else {
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
        setActualTheme(theme)
      }
    }

    updateActualTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        updateActualTheme()
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('campusflow-theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

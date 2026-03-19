import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

const themes = {
  midnight: {
    '--bg-gradient': 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0f3460 100%)',
    '--glass-bg': 'rgba(255, 255, 255, 0.08)',
    '--glass-border': 'rgba(255, 255, 255, 0.15)',
    '--glass-border-top': 'rgba(255, 255, 255, 0.3)',
    '--accent': '#E8FF00',
    '--accent-hover': 'rgba(232, 255, 0, 0.15)',
    '--text-primary': 'rgba(255, 255, 255, 0.95)',
    '--text-secondary': 'rgba(255, 255, 255, 0.6)',
    '--text-accent': '#E8FF00',
    '--card-bg': 'rgba(255, 255, 255, 0.06)',
    '--navbar-bg': 'rgba(10, 10, 26, 0.85)',
    '--input-bg': 'rgba(255, 255, 255, 0.06)',
    '--btn-primary-bg': 'rgba(232, 255, 0, 0.15)',
    '--btn-primary-border': 'rgba(232, 255, 0, 0.4)',
    '--btn-primary-text': '#E8FF00',
    '--success': '#1D9E75',
    '--error': '#E24B4A',
    '--warning': '#EF9F27'
  },
  ocean: {
    '--bg-gradient': 'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #1a3a5c 100%)',
    '--glass-bg': 'rgba(255, 255, 255, 0.08)',
    '--glass-border': 'rgba(255, 255, 255, 0.15)',
    '--glass-border-top': 'rgba(255, 255, 255, 0.3)',
    '--accent': '#1D9E75',
    '--accent-hover': 'rgba(29, 158, 117, 0.2)',
    '--text-primary': 'rgba(255, 255, 255, 0.95)',
    '--text-secondary': 'rgba(255, 255, 255, 0.6)',
    '--text-accent': '#1D9E75',
    '--card-bg': 'rgba(255, 255, 255, 0.06)',
    '--navbar-bg': 'rgba(10, 22, 40, 0.85)',
    '--input-bg': 'rgba(255, 255, 255, 0.06)',
    '--btn-primary-bg': 'rgba(29, 158, 117, 0.15)',
    '--btn-primary-border': 'rgba(29, 158, 117, 0.4)',
    '--btn-primary-text': '#1D9E75',
    '--success': '#1D9E75',
    '--error': '#E24B4A',
    '--warning': '#EF9F27'
  },
  pearl: {
    '--bg-gradient': 'linear-gradient(135deg, #f5f2ec 0%, #e8e4dc 50%, #d4cfc6 100%)',
    '--glass-bg': 'rgba(255, 255, 255, 0.5)',
    '--glass-border': 'rgba(26, 26, 46, 0.1)',
    '--glass-border-top': 'rgba(255, 255, 255, 0.8)',
    '--accent': '#1A1A2E',
    '--accent-hover': 'rgba(26, 26, 46, 0.08)',
    '--text-primary': 'rgba(26, 26, 46, 0.95)',
    '--text-secondary': 'rgba(26, 26, 46, 0.6)',
    '--text-accent': '#1A1A2E',
    '--card-bg': 'rgba(255, 255, 255, 0.6)',
    '--navbar-bg': 'rgba(245, 242, 236, 0.85)',
    '--input-bg': 'rgba(255, 255, 255, 0.6)',
    '--btn-primary-bg': 'rgba(26, 26, 46, 0.08)',
    '--btn-primary-border': 'rgba(26, 26, 46, 0.3)',
    '--btn-primary-text': '#1A1A2E',
    '--success': '#1D9E75',
    '--error': '#E24B4A',
    '--warning': '#EF9F27'
  },
  sunset: {
    '--bg-gradient': 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #5c2800 100%)',
    '--glass-bg': 'rgba(255, 255, 255, 0.08)',
    '--glass-border': 'rgba(255, 255, 255, 0.15)',
    '--glass-border-top': 'rgba(255, 255, 255, 0.3)',
    '--accent': '#FF6400',
    '--accent-hover': 'rgba(255, 100, 0, 0.2)',
    '--text-primary': 'rgba(255, 255, 255, 0.95)',
    '--text-secondary': 'rgba(255, 255, 255, 0.6)',
    '--text-accent': '#FF6400',
    '--card-bg': 'rgba(255, 255, 255, 0.06)',
    '--navbar-bg': 'rgba(26, 10, 0, 0.85)',
    '--input-bg': 'rgba(255, 255, 255, 0.06)',
    '--btn-primary-bg': 'rgba(255, 100, 0, 0.15)',
    '--btn-primary-border': 'rgba(255, 100, 0, 0.4)',
    '--btn-primary-text': '#FF6400',
    '--success': '#1D9E75',
    '--error': '#E24B4A',
    '--warning': '#EF9F27'
  }
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'midnight'
  )

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const applyTheme = (themeName) => {
    const vars = themes[themeName]
    const root = document.documentElement
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    localStorage.setItem('theme', themeName)
  }

  const changeTheme = (themeName) => {
    setTheme(themeName)
  }

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, themes: Object.keys(themes) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

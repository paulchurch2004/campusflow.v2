'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme()

  const themeOptions = [
    { value: 'light' as const, label: 'Clair', icon: Sun },
    { value: 'dark' as const, label: 'Sombre', icon: Moon },
    { value: 'system' as const, label: 'Système', icon: Monitor },
  ]

  const getCurrentIcon = () => {
    if (theme === 'system') {
      return actualTheme === 'dark' ? Moon : Sun
    }
    return theme === 'dark' ? Moon : Sun
  }

  const CurrentIcon = getCurrentIcon()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="group relative h-9 w-9 overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br from-background via-background to-muted/20 transition-all hover:border-border/60 hover:shadow-md"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={actualTheme}
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                duration: 0.3
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <CurrentIcon className={cn(
                "h-4 w-4 transition-colors",
                actualTheme === 'dark'
                  ? "text-blue-400"
                  : "text-amber-500"
              )} />
            </motion.div>
          </AnimatePresence>
          <span className="sr-only">Changer de thème</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themeOptions.map((option) => {
          const Icon = option.icon
          const isActive = theme === option.value

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                "cursor-pointer transition-colors",
                isActive && "bg-primary/10 text-primary font-medium"
              )}
            >
              <Icon className={cn(
                "mr-2 h-4 w-4",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <span>{option.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTheme"
                  className="ml-auto h-2 w-2 rounded-full bg-primary"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

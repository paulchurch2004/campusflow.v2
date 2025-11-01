'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Search,
  Wallet,
  Calendar,
  Handshake,
  Users,
  Loader2,
  ArrowRight,
  FileText,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  title: string
  subtitle?: string
  type: 'expense' | 'event' | 'partner' | 'user'
  url: string
  metadata?: string
}

interface GroupedResults {
  expenses: SearchResult[]
  events: SearchResult[]
  partners: SearchResult[]
  users: SearchResult[]
}

const resultTypeConfig = {
  expenses: {
    icon: Wallet,
    label: 'Dépenses',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  events: {
    icon: Calendar,
    label: 'Événements',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  partners: {
    icon: Handshake,
    label: 'Partenaires',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  users: {
    icon: Users,
    label: 'Membres',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
}

export function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GroupedResults>({
    expenses: [],
    events: [],
    partners: [],
    users: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const debounceRef = useRef<NodeJS.Timeout>()

  // Listen for CMD+K / CTRL+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setResults({
        expenses: [],
        events: [],
        partners: [],
        users: [],
      })
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Flatten results for keyboard navigation
  const flatResults = useMemo(() => [
    ...results.expenses,
    ...results.events,
    ...results.partners,
    ...results.users,
  ], [results.expenses, results.events, results.partners, results.users])

  // Search function with debounce
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({
        expenses: [],
        events: [],
        partners: [],
        users: [],
      })
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)

      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle search input with debounce
  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    setSelectedIndex(0)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!value.trim()) {
      setResults({
        expenses: [],
        events: [],
        partners: [],
        users: [],
      })
      return
    }

    setIsLoading(true)
    debounceRef.current = setTimeout(() => {
      performSearch(value)
    }, 300)
  }, [performSearch])

  // Handle result click
  const handleResultClick = useCallback((result: SearchResult) => {
    router.push(result.url)
    setIsOpen(false)
  }, [router])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < flatResults.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
        e.preventDefault()
        handleResultClick(flatResults[selectedIndex])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, flatResults, selectedIndex, handleResultClick])

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text

    const regex = new RegExp(`(${highlight})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-primary/20 text-primary font-semibold">
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      )
    )
  }

  const renderResultGroup = (
    type: keyof GroupedResults,
    items: SearchResult[]
  ) => {
    if (items.length === 0) return null

    const config = resultTypeConfig[type]
    const Icon = config.icon
    const startIndex = flatResults.indexOf(items[0])

    return (
      <div key={type} className="mb-4">
        <div className="mb-2 flex items-center space-x-2 px-3">
          <Icon className={cn('h-4 w-4', config.color)} />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {config.label}
          </h3>
          <span className="text-xs text-muted-foreground">({items.length})</span>
        </div>
        <div className="space-y-1">
          {items.map((result, index) => {
            const globalIndex = startIndex + index
            const isSelected = globalIndex === selectedIndex

            return (
              <motion.button
                key={result.id}
                onClick={() => handleResultClick(result)}
                onMouseEnter={() => setSelectedIndex(globalIndex)}
                className={cn(
                  'group relative w-full rounded-lg px-3 py-2.5 text-left transition-all',
                  isSelected
                    ? 'bg-primary/10 shadow-sm'
                    : 'hover:bg-muted/60'
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {highlightText(result.title, query)}
                    </p>
                    {result.subtitle && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {highlightText(result.subtitle, query)}
                      </p>
                    )}
                    {result.metadata && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.metadata}
                      </p>
                    )}
                  </div>
                  <ArrowRight
                    className={cn(
                      'h-4 w-4 ml-2 shrink-0 transition-all',
                      isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                    )}
                  />
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  const hasResults = flatResults.length > 0
  const showEmptyState = query.trim() && !isLoading && !hasResults

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center border-b border-border/40 px-4 py-3">
            <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
            <Input
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Rechercher des dépenses, événements, partenaires, membres..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/60"
              autoFocus
            />
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2 shrink-0" />
            )}
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto p-3 scrollbar-thin">
            <AnimatePresence mode="wait">
              {isLoading && !hasResults ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-12"
                >
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </motion.div>
              ) : showEmptyState ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center justify-center py-12 px-4 text-center"
                >
                  <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    Aucun résultat trouvé
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Essayez avec d&apos;autres mots-clés
                  </p>
                </motion.div>
              ) : hasResults ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {renderResultGroup('expenses', results.expenses)}
                  {renderResultGroup('events', results.events)}
                  {renderResultGroup('partners', results.partners)}
                  {renderResultGroup('users', results.users)}
                </motion.div>
              ) : (
                <motion.div
                  key="initial"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 px-4 text-center"
                >
                  <Search className="h-12 w-12 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    Recherche rapide
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Commencez à taper pour rechercher
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border/40 px-4 py-2 bg-muted/30">
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium">
                  <span className="text-xs">↑↓</span>
                </kbd>
                <span>Naviguer</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium">
                  <span className="text-xs">↵</span>
                </kbd>
                <span>Sélectionner</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium">
                  <span className="text-xs">ESC</span>
                </kbd>
                <span>Fermer</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function SearchTrigger() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="group flex items-center justify-between w-full rounded-xl border border-border/40 bg-gradient-to-r from-background via-background to-muted/20 px-3 py-2 text-sm transition-all hover:border-border/60 hover:shadow-md"
    >
      <div className="flex items-center space-x-2 text-muted-foreground">
        <Search className="h-4 w-4" />
        <span className="text-sm">Rechercher...</span>
      </div>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">{isMac ? '⌘' : 'Ctrl'}</span>K
      </kbd>
    </button>
  )
}

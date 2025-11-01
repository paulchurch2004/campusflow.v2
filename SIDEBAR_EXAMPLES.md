# Exemples d'Utilisation - Sidebar CampusFlow

## 📚 Table des Matières

1. [Exemples de Base](#exemples-de-base)
2. [Personnalisation Avancée](#personnalisation-avancée)
3. [Intégrations](#intégrations)
4. [Cas d'Usage Réels](#cas-dusage-réels)

---

## Exemples de Base

### 1. Ajouter un Nouveau Lien Simple

```typescript
// components/dashboard/sidebar.tsx

const navLinks: NavLink[] = [
  // ... liens existants

  // Nouveau lien simple
  {
    href: '/dashboard/documents',
    label: 'Documents',
    icon: FileText,           // Import: import { FileText } from 'lucide-react'
    color: 'text-indigo-500',
    group: 'gestion',
  },
]
```

**Résultat:**
```
GESTION
💰 Trésorerie
📅 Événements [3]
🤝 Partenaires
📄 Documents        ← Nouveau
```

---

### 2. Ajouter un Badge de Notification

```typescript
{
  href: '/dashboard/messages',
  label: 'Messages',
  icon: MessageSquare,
  color: 'text-blue-500',
  group: 'general',
  badge: 12,              // ← Nombre de messages non lus
}
```

**Résultat:**
```
📨 Messages [12]
```

**Note:** Le badge s'affiche automatiquement avec un gradient bleu-violet et une animation scale.

---

### 3. Créer un Nouveau Groupe

```typescript
// Étape 1: Ajouter le groupe dans navGroups
const navGroups = {
  general: 'Général',
  gestion: 'Gestion',
  administration: 'Administration',
  outils: 'Outils',        // ← Nouveau groupe
}

// Étape 2: Créer des liens pour ce groupe
const navLinks: NavLink[] = [
  // ... liens existants

  {
    href: '/dashboard/analytics',
    label: 'Analytics',
    icon: BarChart3,
    color: 'text-green-500',
    group: 'outils',        // ← Assigner au nouveau groupe
  },
  {
    href: '/dashboard/exports',
    label: 'Exports',
    icon: Download,
    color: 'text-orange-500',
    group: 'outils',
  },
]
```

**Résultat:**
```
GÉNÉRAL
🏠 Home

GESTION
💰 Trésorerie
📅 Événements [3]
🤝 Partenaires

ADMINISTRATION
👥 Équipe
⚙️ Paramètres

OUTILS              ← Nouveau groupe
📊 Analytics
⬇️ Exports
```

---

## Personnalisation Avancée

### 4. Badge Dynamique depuis l'API

```typescript
// components/dashboard/sidebar.tsx

export function Sidebar() {
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    // Fetch notification count
    const fetchNotifications = async () => {
      const res = await fetch('/api/notifications/count')
      const data = await res.json()
      setNotificationCount(data.count)
    }

    fetchNotifications()

    // Polling toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Puis utiliser dans navLinks
  const navLinks: NavLink[] = [
    {
      href: '/dashboard/notifications',
      label: 'Notifications',
      icon: Bell,
      color: 'text-red-500',
      group: 'general',
      badge: notificationCount,  // ← Badge dynamique
    },
  ]

  // ... reste du code
}
```

---

### 5. Rôles Personnalisés avec Couleurs

```typescript
// Ajouter de nouveaux rôles
const getRoleBadgeColor = (role: string) => {
  const roleColors: Record<string, string> = {
    president: 'bg-gradient-to-r from-purple-500 to-pink-500',
    vice_president: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    treasurer: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    secretary: 'bg-gradient-to-r from-amber-500 to-orange-500',
    member: 'bg-gradient-to-r from-slate-400 to-slate-500',

    // Nouveaux rôles
    moderator: 'bg-gradient-to-r from-indigo-500 to-blue-500',
    admin: 'bg-gradient-to-r from-red-500 to-orange-500',
    guest: 'bg-gradient-to-r from-gray-400 to-gray-500',
  }
  return roleColors[role] || 'bg-gradient-to-r from-slate-400 to-slate-500'
}

const formatRole = (role: string) => {
  const roleNames: Record<string, string> = {
    president: 'Président',
    vice_president: 'Vice-Président',
    treasurer: 'Trésorier',
    secretary: 'Secrétaire',
    member: 'Membre',

    // Nouveaux rôles
    moderator: 'Modérateur',
    admin: 'Administrateur',
    guest: 'Invité',
  }
  return roleNames[role] || role
}
```

---

### 6. Navigation Conditionnelle par Rôle

```typescript
export function Sidebar() {
  const [user, setUser] = useState<User | null>(null)

  // Définir les liens selon le rôle
  const getNavLinks = (userRole: string): NavLink[] => {
    const baseLinks = [
      {
        href: '/dashboard',
        label: 'Home',
        icon: LayoutDashboard,
        color: 'text-blue-500',
        group: 'general',
      },
    ]

    // Liens pour tous les membres
    const memberLinks = [
      {
        href: '/dashboard/events',
        label: 'Événements',
        icon: Calendar,
        color: 'text-purple-500',
        group: 'gestion',
      },
    ]

    // Liens réservés aux admins
    const adminLinks = [
      {
        href: '/dashboard/treasury',
        label: 'Trésorerie',
        icon: Wallet,
        color: 'text-emerald-500',
        group: 'gestion',
      },
      {
        href: '/dashboard/teams',
        label: 'Équipe',
        icon: Users,
        color: 'text-pink-500',
        group: 'administration',
      },
    ]

    // Combiner selon le rôle
    const canAccessAdmin = ['president', 'treasurer', 'vice_president'].includes(userRole)

    return [
      ...baseLinks,
      ...memberLinks,
      ...(canAccessAdmin ? adminLinks : []),
    ]
  }

  // Utiliser dans le rendu
  const navLinks = user ? getNavLinks(user.role) : []

  // ... reste du code
}
```

---

### 7. Sous-menus Dépliables

```typescript
interface NavLink {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  color?: string
  group?: string
  subLinks?: NavLink[]  // ← Nouveau: sous-liens
}

// Exemple avec sous-menus
const navLinks: NavLink[] = [
  {
    href: '/dashboard/treasury',
    label: 'Trésorerie',
    icon: Wallet,
    color: 'text-emerald-500',
    group: 'gestion',
    subLinks: [
      {
        href: '/dashboard/treasury/income',
        label: 'Revenus',
        icon: TrendingUp,
        color: 'text-green-500',
      },
      {
        href: '/dashboard/treasury/expenses',
        label: 'Dépenses',
        icon: TrendingDown,
        color: 'text-red-500',
      },
    ],
  },
]

// Dans le composant
const [expandedLinks, setExpandedLinks] = useState<string[]>([])

const toggleExpand = (href: string) => {
  setExpandedLinks(prev =>
    prev.includes(href)
      ? prev.filter(h => h !== href)
      : [...prev, href]
  )
}

// Rendu avec animation
{link.subLinks && (
  <motion.div
    initial={{ height: 0 }}
    animate={{ height: expandedLinks.includes(link.href) ? 'auto' : 0 }}
    className="overflow-hidden pl-4"
  >
    {link.subLinks.map(subLink => (
      // ... rendu des sous-liens
    ))}
  </motion.div>
)}
```

---

## Intégrations

### 8. Intégration avec React Query

```typescript
import { useQuery } from '@tanstack/react-query'

export function Sidebar() {
  // Fetch user avec cache
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/session')
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch notifications
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications/count')
      return res.json()
    },
    refetchInterval: 30000, // Refresh every 30s
  })

  // Utiliser dans navLinks
  const navLinks: NavLink[] = [
    {
      href: '/dashboard/events',
      label: 'Événements',
      icon: Calendar,
      badge: notifications?.count,
      color: 'text-purple-500',
      group: 'gestion',
    },
  ]

  // ... reste du code
}
```

---

### 9. Intégration avec i18n (Internationalisation)

```typescript
import { useTranslation } from 'next-i18next'

export function Sidebar() {
  const { t } = useTranslation('sidebar')

  const navLinks: NavLink[] = [
    {
      href: '/dashboard',
      label: t('home'),              // 'Home' ou 'Accueil'
      icon: LayoutDashboard,
      color: 'text-blue-500',
      group: 'general',
    },
    {
      href: '/dashboard/treasury',
      label: t('treasury'),          // 'Treasury' ou 'Trésorerie'
      icon: Wallet,
      color: 'text-emerald-500',
      group: 'gestion',
    },
  ]

  const navGroups = {
    general: t('groups.general'),          // 'General' ou 'Général'
    gestion: t('groups.management'),       // 'Management' ou 'Gestion'
    administration: t('groups.admin'),     // 'Admin' ou 'Administration'
  }

  // ... reste du code
}
```

---

### 10. Intégration avec Analytics

```typescript
import { trackEvent } from '@/lib/analytics'

export function Sidebar() {
  const handleNavClick = (linkLabel: string) => {
    // Track navigation
    trackEvent({
      action: 'sidebar_navigation',
      category: 'Navigation',
      label: linkLabel,
    })
  }

  // Dans le rendu
  <Link
    key={link.href}
    href={link.href}
    onClick={() => {
      setIsMobileOpen(false)
      handleNavClick(link.label)  // ← Track click
    }}
  >
    {/* ... */}
  </Link>
}
```

---

## Cas d'Usage Réels

### 11. Sidebar avec Recherche Rapide

```typescript
export function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('')

  // Filtrer les liens selon la recherche
  const filteredLinks = navLinks.filter(link =>
    link.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div className="flex h-full flex-col">
      {/* Logo & Branding */}
      {/* ... */}

      {/* Search Input */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg bg-muted/50 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Navigation avec liens filtrés */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {filteredLinks.map(link => (
          // ... rendu des liens
        ))}
      </nav>

      {/* ... footer */}
    </motion.div>
  )
}
```

---

### 12. Mode Compact/Étendu

```typescript
export function Sidebar() {
  const [isCompact, setIsCompact] = useState(false)

  return (
    <>
      {/* Bouton toggle compact mode */}
      <button
        onClick={() => setIsCompact(!isCompact)}
        className="absolute -right-3 top-4 rounded-full bg-background p-1 shadow-md"
      >
        {isCompact ? <ChevronRight /> : <ChevronLeft />}
      </button>

      {/* Sidebar avec width variable */}
      <aside className={cn(
        'transition-all duration-300',
        isCompact ? 'w-16' : 'w-72'
      )}>
        <motion.div
          animate={{ width: isCompact ? 64 : 288 }}
          className="flex h-full flex-col"
        >
          {/* Logo - caché en mode compact */}
          {!isCompact && (
            <div className="border-b px-6 py-5">
              {/* ... logo */}
            </div>
          )}

          {/* Nav avec labels conditionnels */}
          <nav className="flex-1 px-3 py-4">
            {navLinks.map(link => {
              const Icon = link.icon
              return (
                <Link key={link.href} href={link.href}>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Icon className="h-5 w-5" />
                    {!isCompact && <span>{link.label}</span>}
                  </div>
                </Link>
              )
            })}
          </nav>
        </motion.div>
      </aside>
    </>
  )
}
```

---

### 13. Sidebar avec Favoris

```typescript
export function Sidebar() {
  const [favorites, setFavorites] = useState<string[]>([])

  const toggleFavorite = (href: string) => {
    setFavorites(prev =>
      prev.includes(href)
        ? prev.filter(f => f !== href)
        : [...prev, href]
    )
  }

  const favoriteLinks = navLinks.filter(link => favorites.includes(link.href))

  return (
    <motion.div className="flex h-full flex-col">
      {/* ... logo & profile */}

      {/* Favoris en haut */}
      {favoriteLinks.length > 0 && (
        <div className="border-b px-3 py-3">
          <h3 className="mb-2 px-3 text-xs font-bold uppercase text-muted-foreground">
            Favoris
          </h3>
          {favoriteLinks.map(link => (
            <div key={link.href} className="flex items-center gap-2">
              <Link href={link.href} className="flex-1">
                {/* ... lien */}
              </Link>
              <button
                onClick={() => toggleFavorite(link.href)}
                className="p-1"
              >
                <Star className="h-4 w-4 fill-yellow-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Navigation normale avec bouton star */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navLinks.map(link => (
          <div key={link.href} className="group flex items-center gap-2">
            <Link href={link.href} className="flex-1">
              {/* ... lien */}
            </Link>
            <button
              onClick={() => toggleFavorite(link.href)}
              className="opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Star
                className={cn(
                  'h-4 w-4',
                  favorites.includes(link.href) && 'fill-yellow-500'
                )}
              />
            </button>
          </div>
        ))}
      </nav>

      {/* ... footer */}
    </motion.div>
  )
}
```

---

### 14. Notifications Toast au Clic

```typescript
import { toast } from 'sonner'

export function Sidebar() {
  const handleNavClick = (link: NavLink) => {
    // Si le lien a un badge
    if (link.badge && link.badge > 0) {
      toast.info(`Vous avez ${link.badge} notification(s) non lue(s)`, {
        icon: <Bell className="h-4 w-4" />,
      })
    }
  }

  return (
    // ... dans le rendu
    <Link
      href={link.href}
      onClick={() => handleNavClick(link)}
    >
      {/* ... */}
    </Link>
  )
}
```

---

### 15. Thème Dynamique

```typescript
export function Sidebar() {
  const [theme, setTheme] = useState<'default' | 'blue' | 'green'>('default')

  const gradients = {
    default: 'from-blue-600 via-purple-600 to-pink-600',
    blue: 'from-blue-500 via-cyan-500 to-blue-600',
    green: 'from-emerald-500 via-green-500 to-teal-600',
  }

  return (
    <motion.div className="flex h-full flex-col">
      {/* Logo avec gradient dynamique */}
      <div className="border-b px-6 py-5">
        <div className={cn(
          'h-10 w-10 rounded-xl bg-gradient-to-br',
          gradients[theme]
        )}>
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <h1 className={cn(
          'bg-gradient-to-r bg-clip-text text-transparent',
          gradients[theme]
        )}>
          CampusFlow
        </h1>
      </div>

      {/* ... navigation */}

      {/* Theme Switcher dans footer */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          {Object.keys(gradients).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t as any)}
              className={cn(
                'h-8 w-8 rounded-full',
                gradients[t as keyof typeof gradients]
              )}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
```

---

## 🎯 Templates Prêts à l'Emploi

### Template 1: E-Commerce
```typescript
const ecommerceLinks: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500', group: 'general' },
  { href: '/dashboard/products', label: 'Produits', icon: Package, color: 'text-purple-500', group: 'catalog', badge: 24 },
  { href: '/dashboard/orders', label: 'Commandes', icon: ShoppingCart, color: 'text-emerald-500', group: 'sales', badge: 8 },
  { href: '/dashboard/customers', label: 'Clients', icon: Users, color: 'text-pink-500', group: 'sales' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, color: 'text-orange-500', group: 'reports' },
]
```

### Template 2: SaaS Platform
```typescript
const saasLinks: NavLink[] = [
  { href: '/dashboard', label: 'Overview', icon: Home, color: 'text-blue-500', group: 'general' },
  { href: '/dashboard/projects', label: 'Projects', icon: Folder, color: 'text-purple-500', group: 'work' },
  { href: '/dashboard/team', label: 'Team', icon: Users, color: 'text-pink-500', group: 'work' },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard, color: 'text-emerald-500', group: 'settings' },
  { href: '/dashboard/api', label: 'API Keys', icon: Key, color: 'text-amber-500', group: 'developer' },
]
```

---

**Besoin d'aide?** Consultez la [documentation complète](./SIDEBAR_DOCUMENTATION.md)!

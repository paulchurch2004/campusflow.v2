# Dashboard Quick Reference

Quick reference guide for maintaining and extending the dashboard.

---

## File Location
```
/app/dashboard/page.tsx (844 lines)
```

---

## Component Hierarchy

```
DashboardPage (Main Component)
├── Header Section
│   ├── Title with Sparkles icon
│   ├── Welcome message
│   ├── Date display
│   └── Quick action buttons (Link)
│
├── Stats Grid
│   └── StatCard x4 (with stagger)
│
├── Charts Section
│   ├── ExpenseChart
│   └── PoleBudgetChart
│
├── Activity & Events Grid
│   ├── Recent Activity
│   │   └── ActivityItem x5
│   └── Upcoming Events
│       └── Event cards x3
│
└── Quick Actions Grid
    └── QuickActionCard x4
```

---

## Key State Variables

```tsx
// User & Auth
const [user, setUser] = useState<User | null>(null)

// Dashboard Statistics
const [stats, setStats] = useState<DashboardStats>({
  totalBudget: number
  expensesThisMonth: number
  upcomingEventsCount: number
  activeMembersCount: number
  pendingExpensesCount: number
  expensesLastMonth: number
})

// Data Collections
const [recentExpenses, setRecentExpenses] = useState<Expense[]>([])
const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
const [poles, setPoles] = useState<Pole[]>([])
const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([])

// Loading State
const [isLoading, setIsLoading] = useState(true)
```

---

## API Endpoints Used

```tsx
GET /api/session              // User session
GET /api/poles?listId=...     // Poles data
GET /api/expenses?listId=...  // All expenses
GET /api/events?listId=...&status=PUBLISHED  // Events
GET /api/users?listId=...     // Users count
```

---

## Helper Functions

```tsx
// Status Icon Mapping
getStatusIcon(status: string) → LucideIcon
  PENDING   → Clock
  APPROVED  → CheckCircle2
  PAID      → CheckCircle2
  REJECTED  → XCircle

// Status Color Mapping
getStatusColor(status: string) → string
  PENDING   → 'bg-gradient-to-br from-amber-500 to-orange-500'
  APPROVED  → 'bg-gradient-to-br from-blue-500 to-cyan-500'
  PAID      → 'bg-gradient-to-br from-emerald-500 to-green-500'
  REJECTED  → 'bg-gradient-to-br from-red-500 to-rose-500'
```

---

## Data Calculations

### Expenses This Month
```tsx
const expensesThisMonth = expenses
  .filter(expense =>
    expenseDate.getMonth() === currentMonth &&
    expenseDate.getFullYear() === currentYear &&
    (expense.status === 'APPROVED' || expense.status === 'PAID')
  )
  .reduce((sum, expense) => sum + expense.amount, 0)
```

### Trend Calculation
```tsx
const expenseTrend = stats.expensesLastMonth > 0
  ? ((stats.expensesThisMonth - stats.expensesLastMonth) / stats.expensesLastMonth) * 100
  : 0

const trendDirection = expenseTrend >= 0 ? 'up' : 'down'
const trendLabel = `${Math.abs(expenseTrend).toFixed(0)}% vs last month`
```

### Monthly Aggregation (Last 6 Months)
```tsx
for (let i = 5; i >= 0; i--) {
  const monthIndex = currentMonth - i < 0 ? 12 + (currentMonth - i) : currentMonth - i
  const year = currentMonth - i < 0 ? currentYear - 1 : currentYear

  const monthTotal = expenses
    .filter(expense =>
      expenseDate.getMonth() === monthIndex &&
      expenseDate.getFullYear() === year &&
      (expense.status === 'APPROVED' || expense.status === 'PAID')
    )
    .reduce((sum, expense) => sum + expense.amount, 0)

  last6Months.push({ month: monthNames[monthIndex], amount: monthTotal })
}
```

---

## Gradient Classes Reference

```css
/* Budget/Success */
bg-gradient-to-br from-emerald-500 to-green-600

/* Primary Actions/Expenses */
bg-gradient-to-br from-blue-500 to-violet-600

/* Warnings/Events */
bg-gradient-to-br from-amber-500 to-orange-600

/* Team/Community */
bg-gradient-to-br from-purple-500 to-pink-600

/* Alerts/Errors */
bg-gradient-to-br from-red-500 to-rose-500

/* Approved Status */
bg-gradient-to-br from-blue-500 to-cyan-500
```

---

## Animation Delays

```tsx
// Stat Cards: 0ms, 100ms, 200ms, 300ms
<StatCard delay={0} />
<StatCard delay={100} />
<StatCard delay={200} />
<StatCard delay={300} />

// Activity Items: index * 100
{recentExpenses.map((expense, index) => (
  <ActivityItem delay={index * 100} />
))}

// Quick Actions: 0ms, 100ms, 200ms, 300ms
<QuickActionCard delay={0} />
<QuickActionCard delay={100} />
<QuickActionCard delay={200} />
<QuickActionCard delay={300} />
```

---

## Common Tasks

### Adding a New Stat Card
```tsx
<StatCard
  title="Your Metric"
  value={yourValue}
  description="Description text"
  icon={YourIcon}
  trend="up" // optional
  trendLabel="+X%" // optional
  gradient="bg-gradient-to-br from-COLOR-500 to-COLOR-600"
  delay={400} // next in sequence
/>
```

### Adding a New Quick Action
```tsx
<QuickActionCard
  title="Action Title"
  description="Action description"
  icon={YourIcon}
  href="/app/your-route"
  gradient="bg-gradient-to-br from-COLOR-500 to-COLOR-600"
  delay={400} // next in sequence
/>
```

### Modifying Chart Data
```tsx
// Monthly chart expects:
interface MonthlyExpense {
  month: string  // 'Jan', 'Feb', etc.
  amount: number
}

// Pole chart expects:
interface Pole {
  id: string
  name: string
  allocatedBudget: number
  spentAmount: number
  color: string  // hex color
}
```

---

## Responsive Grid Classes

```tsx
// Stats & Quick Actions (4 columns desktop)
className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"

// Charts & Activity (2 columns desktop)
className="grid gap-6 lg:grid-cols-2"

// Header (stack to row)
className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between"
```

---

## Common Styling Patterns

### Card Hover Effect
```tsx
className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
```

### Icon Scale on Hover
```tsx
className="transition-transform group-hover:scale-110"
```

### Fade In Animation
```tsx
const [isVisible, setIsVisible] = useState(false)

useEffect(() => {
  const timer = setTimeout(() => setIsVisible(true), delay)
  return () => clearTimeout(timer)
}, [delay])

className={`
  transition-all duration-500
  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
`}
```

### Chevron Reveal
```tsx
<ChevronRight className="
  h-4 w-4 opacity-0 -translate-x-2
  transition-all
  group-hover:opacity-100 group-hover:translate-x-0
" />
```

---

## Formatting Utilities

```tsx
import { formatCurrency, formatDate } from '@/lib/utils'

formatCurrency(5000)     // "$5,000"
formatDate('2024-10-31') // "Oct 31, 2024"
```

---

## Icons Used

```tsx
import {
  TrendingUp,      // Trend up
  Wallet,          // Budget/Money
  Calendar,        // Events/Date
  Users,           // Team/Members
  MapPin,          // Location
  Plus,            // Add new
  ArrowUpRight,    // Trend up arrow
  ArrowDownRight,  // Trend down arrow
  Activity,        // Activity/Analytics
  DollarSign,      // Currency
  Receipt,         // Expenses
  Clock,           // Pending/Time
  CheckCircle2,    // Approved/Success
  XCircle,         // Rejected/Error
  ChevronRight,    // Navigation arrow
  Sparkles         // Decoration
} from 'lucide-react'
```

---

## Performance Best Practices

1. **Animations use CSS transforms** (GPU accelerated)
   ```tsx
   // ✅ Good
   className="hover:-translate-y-1"

   // ❌ Avoid
   className="hover:mt-1"
   ```

2. **Stagger delays prevent jank**
   ```tsx
   delay={index * 100} // Spreads out animations
   ```

3. **Cleanup timers**
   ```tsx
   useEffect(() => {
     const timer = setTimeout(...)
     return () => clearTimeout(timer) // ✅ Cleanup
   }, [delay])
   ```

4. **Memoize expensive calculations** (if needed)
   ```tsx
   const expenseTrend = useMemo(() =>
     calculateTrend(stats),
     [stats]
   )
   ```

---

## Accessibility Checklist

- ✅ Semantic HTML (headers, sections)
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation (via Link/Button)
- ✅ Color contrast (WCAG AA)
- ✅ Focus indicators
- ✅ Screen reader friendly text
- ✅ Loading states announced

---

## Troubleshooting

### Issue: Animations not working
**Check:**
- `tailwindcss-animate` plugin installed
- Animation classes in tailwind.config
- `delay` prop passed correctly

### Issue: Data not loading
**Check:**
- Network tab for API errors
- Console for error messages
- `listId` present in session
- API endpoints accessible

### Issue: Gradients not showing
**Check:**
- Gradient class syntax
- No conflicting background classes
- Background opacity not 0

### Issue: Hover effects not triggering
**Check:**
- `group` class on parent element
- `group-hover:` prefix on child
- Transition classes present

---

## Testing

### Manual Testing Checklist
- [ ] Page loads without errors
- [ ] All stats display correctly
- [ ] Charts render with data
- [ ] Animations play smoothly
- [ ] Hover effects work
- [ ] Links navigate correctly
- [ ] Empty states show when no data
- [ ] Loading skeleton appears
- [ ] Responsive on mobile/tablet
- [ ] Dark mode compatible

### Test Data Scenarios
- Empty state (no expenses, no events)
- Single item (1 expense, 1 event)
- Full list (5+ expenses, 3+ events)
- Over-budget poles
- Zero budget poles
- Pending vs approved expenses

---

## Future Enhancement Ideas

1. **Real-time updates**
   ```tsx
   // WebSocket integration
   useEffect(() => {
     const ws = new WebSocket(...)
     ws.onmessage = (e) => updateDashboard(e.data)
   }, [])
   ```

2. **Date range filters**
   ```tsx
   const [dateRange, setDateRange] = useState({ start, end })
   ```

3. **Export functionality**
   ```tsx
   const exportToPDF = () => { /* generate PDF */ }
   ```

4. **Customizable widgets**
   ```tsx
   const [visibleWidgets, setVisibleWidgets] = useState([...])
   ```

5. **Notifications**
   ```tsx
   const [notifications, setNotifications] = useState([...])
   ```

---

## Dependencies

```json
{
  "lucide-react": "^0.x.x",
  "@/components/ui/card": "shadcn/ui",
  "@/components/ui/button": "shadcn/ui",
  "@/components/ui/badge": "shadcn/ui",
  "@/lib/utils": "local utility functions",
  "next/link": "Next.js 15",
  "sonner": "toast notifications",
  "tailwindcss-animate": "animation utilities"
}
```

---

## Related Files

```
/components/ui/card.tsx       - Card components
/components/ui/button.tsx     - Button component
/components/ui/badge.tsx      - Badge component
/lib/utils.ts                 - Utility functions
/tailwind.config.ts           - Tailwind configuration
/app/layout.tsx               - Root layout
/app/dashboard/layout.tsx     - Dashboard layout
```

---

## Quick Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format
npm run format
```

---

## Support & Documentation

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Lucide Icons](https://lucide.dev)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate)

---

## Version History

**v2.0 (Current)** - Premium Dashboard Redesign
- Complete visual overhaul
- 5 new reusable components
- Enhanced animations
- Chart visualizations
- Quick actions section

**v1.0** - Basic Dashboard
- Simple stats display
- Basic tables
- Minimal styling

---

**Last Updated:** 2025-10-31
**File Location:** `/app/dashboard/page.tsx`
**Line Count:** 844 lines
**Components:** 5 custom + base UI components

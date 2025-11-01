# Dashboard Components Guide

This guide explains the key components and their usage in the new premium dashboard.

## Component Overview

### 1. StatCard Component

A reusable stat card with gradient backgrounds, icons, and optional trend indicators.

```tsx
<StatCard
  title="Total Budget"
  value={formatCurrency(stats.totalBudget)}
  description="Allocated across all poles"
  icon={DollarSign}
  gradient="bg-gradient-to-br from-emerald-500 to-green-600"
  delay={0}
/>

// With trend indicator
<StatCard
  title="This Month"
  value={formatCurrency(stats.expensesThisMonth)}
  description="Approved & paid expenses"
  icon={TrendingUp}
  trend="up"
  trendLabel="+12% vs last month"
  gradient="bg-gradient-to-br from-blue-500 to-violet-600"
  delay={100}
/>
```

**Props:**
- `title`: Card title (string)
- `value`: Main value to display (string | number)
- `description`: Helper text below value (string)
- `icon`: Lucide icon component
- `gradient`: Tailwind gradient class (string)
- `trend?`: 'up' | 'down' (optional)
- `trendLabel?`: Trend text (string, optional)
- `delay?`: Animation delay in ms (number, default: 0)

**Features:**
- Staggered fade-in animation
- Hover elevation effect
- Gradient icon background
- Subtle gradient overlay (5% opacity)
- Trend arrows with color coding

---

### 2. ActivityItem Component

Timeline-style item for displaying recent activities with icons.

```tsx
<ActivityItem
  icon={CheckCircle2}
  title="Office supplies purchase"
  description="John Doe • Marketing • $150.00"
  time="2 hours ago"
  iconBg="bg-gradient-to-br from-emerald-500 to-green-500"
  delay={0}
/>
```

**Props:**
- `icon`: Lucide icon component
- `title`: Activity title (string)
- `description`: Activity details (string)
- `time`: Timestamp (string)
- `iconBg`: Icon background gradient (string)
- `delay?`: Animation delay in ms (number, default: 0)

**Features:**
- Timeline connector line
- Slide-in from left animation
- Hover background highlight
- Icon scale on hover
- Circular gradient icon background

---

### 3. QuickActionCard Component

Interactive card that links to different sections of the app.

```tsx
<QuickActionCard
  title="Manage Expenses"
  description="Review and approve expense requests"
  icon={Receipt}
  href="/app/expenses"
  gradient="bg-gradient-to-br from-blue-500 to-violet-600"
  delay={0}
/>
```

**Props:**
- `title`: Action title (string)
- `description`: Action description (string)
- `icon`: Lucide icon component
- `href`: Link destination (string)
- `gradient`: Icon background gradient (string)
- `delay?`: Animation delay in ms (number, default: 0)

**Features:**
- Click to navigate
- Border highlight on hover
- Shadow elevation
- Icon scale animation
- Chevron reveal on hover
- Scale-in entrance animation

---

### 4. ExpenseChart Component

Simple bar chart for monthly expense visualization.

```tsx
const monthlyData = [
  { month: 'Jun', amount: 5000 },
  { month: 'Jul', amount: 7500 },
  { month: 'Aug', amount: 6200 },
  { month: 'Sep', amount: 8100 },
  { month: 'Oct', amount: 7800 },
  { month: 'Nov', amount: 9200 }
]

<ExpenseChart data={monthlyData} />
```

**Props:**
- `data`: Array of { month: string, amount: number }

**Features:**
- Auto-scaling based on max value
- Gradient bars (blue to violet)
- Staggered reveal animations
- Smooth 1s transitions
- Amount labels

---

### 5. PoleBudgetChart Component

Progress bars showing budget utilization by pole.

```tsx
const poles = [
  {
    id: '1',
    name: 'Marketing',
    allocatedBudget: 10000,
    spentAmount: 7500,
    color: '#3B82F6'
  },
  // ... more poles
]

<PoleBudgetChart poles={poles} />
```

**Props:**
- `poles`: Array of pole objects with budget data

**Features:**
- Color-coded by pole
- Red for over-budget (>100%)
- Green for on-track
- Percentage calculation
- Animated width transitions
- Amount/budget display

---

### 6. StatCardSkeleton Component

Loading placeholder for stat cards.

```tsx
<StatCardSkeleton />
```

**Features:**
- Pulse animations
- Matches StatCard layout
- Smooth transition to content

---

## Layout Structure

```
Dashboard Page
├── Header Section
│   ├── Title with gradient text
│   ├── Welcome message
│   ├── Current date
│   └── Quick action buttons
├── Stats Grid (4 columns)
│   ├── StatCard x4
│   └── Staggered animations
├── Charts Section (2 columns)
│   ├── ExpenseChart
│   └── PoleBudgetChart
├── Activity & Events (2 columns)
│   ├── Activity Timeline
│   │   └── ActivityItem x5
│   └── Upcoming Events
│       └── Event cards x3
└── Quick Actions (4 columns)
    └── QuickActionCard x4
```

---

## Color Scheme

### Gradient Mappings
```tsx
// Budget/Success
"bg-gradient-to-br from-emerald-500 to-green-600"

// Primary Actions/Expenses
"bg-gradient-to-br from-blue-500 to-violet-600"

// Warnings/Events
"bg-gradient-to-br from-amber-500 to-orange-600"

// Team/Community
"bg-gradient-to-br from-purple-500 to-pink-600"

// Errors/Alerts
"bg-gradient-to-br from-red-500 to-rose-500"

// Approved
"bg-gradient-to-br from-blue-500 to-cyan-500"
```

### Status Colors
```tsx
const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-gradient-to-br from-amber-500 to-orange-500'
    case 'APPROVED':
      return 'bg-gradient-to-br from-blue-500 to-cyan-500'
    case 'PAID':
      return 'bg-gradient-to-br from-emerald-500 to-green-500'
    case 'REJECTED':
      return 'bg-gradient-to-br from-red-500 to-rose-500'
  }
}
```

---

## Animation Patterns

### Staggered Entry
```tsx
// Delays increment by 100ms for each item
delay={index * 100}
```

### Fade In with Translation
```tsx
className={`
  transition-all duration-500
  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
`}
```

### Hover Elevation
```tsx
className="transition-all hover:shadow-xl hover:-translate-y-1"
```

### Icon Scale
```tsx
className="transition-transform group-hover:scale-110"
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

## Responsive Breakpoints

```tsx
// Stats and Quick Actions
className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"

// Charts and Activity sections
className="grid gap-6 lg:grid-cols-2"

// Header buttons
className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between"
```

**Behavior:**
- Mobile: 1 column
- Tablet (md): 2 columns
- Desktop (lg): 4 columns (stats) or 2 columns (charts)

---

## Data Flow

### Stats Calculation
```tsx
// Current month expenses
const expensesThisMonth = expenses
  .filter(expense =>
    expenseDate.getMonth() === currentMonth &&
    (expense.status === 'APPROVED' || expense.status === 'PAID')
  )
  .reduce((sum, expense) => sum + expense.amount, 0)

// Trend calculation
const expenseTrend =
  ((expensesThisMonth - expensesLastMonth) / expensesLastMonth) * 100
```

### Monthly Aggregation
```tsx
// Last 6 months
for (let i = 5; i >= 0; i--) {
  const monthIndex = currentMonth - i < 0
    ? 12 + (currentMonth - i)
    : currentMonth - i

  const monthTotal = expenses
    .filter(/* month matches */)
    .reduce((sum, expense) => sum + expense.amount, 0)

  last6Months.push({ month: monthNames[monthIndex], amount: monthTotal })
}
```

---

## Usage Examples

### Adding a New Stat Card
```tsx
<StatCard
  title="Your Metric"
  value="42"
  description="Description text"
  icon={YourIcon}
  gradient="bg-gradient-to-br from-blue-500 to-purple-600"
  delay={400} // Add to stagger sequence
/>
```

### Adding a New Quick Action
```tsx
<QuickActionCard
  title="New Feature"
  description="Access new functionality"
  icon={NewIcon}
  href="/app/new-feature"
  gradient="bg-gradient-to-br from-teal-500 to-cyan-600"
  delay={400}
/>
```

### Customizing Empty States
```tsx
{items.length === 0 ? (
  <div className="text-center py-12">
    <YourIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
    <p className="text-sm text-muted-foreground">No items found</p>
  </div>
) : (
  // render items
)}
```

---

## Performance Tips

1. **Memoize expensive calculations**
   ```tsx
   const expenseTrend = useMemo(() => calculateTrend(), [stats])
   ```

2. **Lazy load charts** if data is large
   ```tsx
   const ExpenseChart = lazy(() => import('./ExpenseChart'))
   ```

3. **Debounce animations** on resize
   ```tsx
   const [windowSize, setWindowSize] = useState(0)
   useEffect(() => {
     const handleResize = debounce(() => setWindowSize(window.innerWidth), 200)
     // ...
   }, [])
   ```

4. **Use CSS transforms** for animations (already implemented)
   - Transforms are GPU-accelerated
   - Avoid animating width/height directly

---

## Accessibility Checklist

- ✅ Semantic HTML structure
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ Color contrast meets WCAG AA
- ✅ Focus indicators visible
- ✅ Screen reader friendly text
- ✅ Descriptive link text
- ✅ Loading states announced

---

## Browser Support

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

**Features used:**
- CSS Grid
- CSS Gradients
- CSS Transforms
- CSS Transitions
- Flexbox
- backdrop-filter (optional enhancement)

---

## Troubleshooting

### Cards not animating
- Check that `tailwindcss-animate` plugin is installed
- Verify animations in tailwind.config.ts
- Ensure delay prop is passed correctly

### Gradients not showing
- Check background opacity is not 0
- Verify gradient class syntax
- Check for conflicting background classes

### Links not working
- Verify href paths are correct
- Check Next.js Link component import
- Ensure routes exist in app directory

### Data not loading
- Check API endpoints are accessible
- Verify listId is present in session
- Check network tab for errors
- Review error handling in fetchDashboardData

---

## Future Improvements

1. **Real-time updates**: WebSocket integration for live data
2. **Drag & drop**: Reorderable dashboard widgets
3. **Export**: PDF/CSV export functionality
4. **Filters**: Date range and category filters
5. **Drill-down**: Click stats to view details
6. **Customization**: User preferences for layout
7. **Dark mode**: Optimized dark theme
8. **Notifications**: In-app notification center

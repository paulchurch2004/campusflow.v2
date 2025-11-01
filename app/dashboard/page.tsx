'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  TrendingUp,
  Wallet,
  Calendar,
  Users,
  MapPin,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CreditCard,
  DollarSign,
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Sparkles,
  Filter,
  Download,
  TrendingDown,
  BarChart3
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface User {
  id: string
  name: string
  email: string
  role: string
  listId: string | null
}

interface Pole {
  id: string
  name: string
  allocatedBudget: number
  spentAmount: number
  color: string
}

interface Expense {
  id: string
  description: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED'
  requestedAt: string
  user: {
    name: string
  }
  pole: {
    name: string
  }
}

interface Event {
  id: string
  name: string
  date: string
  location: string | null
  status: string
}

interface DashboardStats {
  totalBudget: number
  expensesThisMonth: number
  upcomingEventsCount: number
  activeMembersCount: number
  pendingExpensesCount: number
  expensesLastMonth: number
  expensesCurrentPeriod: number
  expensesLastPeriod: number
  expensesPrediction: number
}

interface MonthlyExpense {
  month: string
  amount: number
}

// Skeleton Loading Component
function StatCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
        <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
      </CardHeader>
      <CardContent>
        <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2"></div>
        <div className="h-3 w-full bg-muted animate-pulse rounded"></div>
      </CardContent>
    </Card>
  )
}

// Enhanced Stat Card Component
function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendLabel,
  gradient,
  delay = 0
}: {
  title: string
  value: string | number
  description: string
  icon: any
  trend?: 'up' | 'down'
  trendLabel?: string
  gradient: string
  delay?: number
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <Card
      className={`
        overflow-hidden border-0 shadow-lg transition-all duration-500 hover:shadow-xl hover:-translate-y-1
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 opacity-5 ${gradient}`}></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${gradient}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && trendLabel && (
            <div className={`flex items-center text-xs font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {trendLabel}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Activity Timeline Item
function ActivityItem({
  icon: Icon,
  title,
  description,
  time,
  iconBg,
  delay = 0
}: {
  icon: any
  title: string
  description: string
  time: string
  iconBg: string
  delay?: number
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`
        flex items-start gap-4 group transition-all duration-300 hover:bg-accent/50 p-3 rounded-lg -mx-3
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="relative">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${iconBg} transition-transform group-hover:scale-110`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-8 w-0.5 bg-border"></div>
      </div>
      <div className="flex-1 space-y-1 pt-1">
        <p className="text-sm font-medium leading-none">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {time}
        </p>
      </div>
    </div>
  )
}

// Quick Action Card
function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  gradient,
  delay = 0
}: {
  title: string
  description: string
  icon: any
  href: string
  gradient: string
  delay?: number
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <Link href={href}>
      <Card
        className={`
          group cursor-pointer border-2 border-transparent transition-all duration-300
          hover:border-primary hover:shadow-lg hover:-translate-y-1
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${gradient} transition-transform group-hover:scale-110`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                {title}
                <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
              </h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// Recharts Expense Trend Area Chart
function ExpenseChart({ data }: { data: MonthlyExpense[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="month"
          className="text-xs"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: 'currentColor' }}
          tickFormatter={(value) => `${value}€`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          formatter={(value: any) => [`${value}€`, 'Montant']}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#8b5cf6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorAmount)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// Recharts Pole Budget Bar Chart
function PoleBudgetChart({ poles }: { poles: Pole[] }) {
  const chartData = poles.map(pole => ({
    name: pole.name,
    allocated: pole.allocatedBudget,
    spent: pole.spentAmount,
    color: pole.color
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="name"
          className="text-xs"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: 'currentColor' }}
          tickFormatter={(value) => `${value}€`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          formatter={(value: any) => `${value}€`}
        />
        <Legend />
        <Bar dataKey="allocated" fill="#10b981" name="Alloué" radius={[8, 8, 0, 0]} />
        <Bar dataKey="spent" fill="#8b5cf6" name="Dépensé" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Expenses by Status Pie Chart
function ExpenseStatusChart({
  data
}: {
  data: { pending: number; approved: number; rejected: number; paid: number }
}) {
  const chartData = [
    { name: 'En attente', value: data.pending, color: '#f59e0b' },
    { name: 'Approuvé', value: data.approved, color: '#3b82f6' },
    { name: 'Payé', value: data.paid, color: '#10b981' },
    { name: 'Rejeté', value: data.rejected, color: '#ef4444' },
  ].filter(item => item.value > 0)

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Aucune dépense
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month')
  const [stats, setStats] = useState<DashboardStats>({
    totalBudget: 0,
    expensesThisMonth: 0,
    upcomingEventsCount: 0,
    activeMembersCount: 0,
    pendingExpensesCount: 0,
    expensesLastMonth: 0,
    expensesCurrentPeriod: 0,
    expensesLastPeriod: 0,
    expensesPrediction: 0
  })
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [poles, setPoles] = useState<Pole[]>([])
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([])
  const [expensesByStatus, setExpensesByStatus] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    paid: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [period])

  // Helper function to get date ranges based on period
  // Export to PDF function
  const exportToPDF = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import('jspdf')).default
      const autoTable = (await import('jspdf-autotable')).default

      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.text('CampusFlow - Rapport d\'Analyse', 14, 22)

      // Add date
      doc.setFontSize(10)
      doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30)
      doc.text(`Période: ${period === 'week' ? 'Cette semaine' : period === 'month' ? 'Ce mois' : period === 'year' ? 'Cette année' : 'Tout'}`, 14, 36)

      // Add summary statistics
      doc.setFontSize(14)
      doc.text('Statistiques Principales', 14, 48)

      const statsData = [
        ['Budget Total', formatCurrency(stats.totalBudget)],
        ['Dépenses (Période actuelle)', formatCurrency(stats.expensesCurrentPeriod)],
        ['Dépenses (Période précédente)', formatCurrency(stats.expensesLastPeriod)],
        ['Variation', `${periodTrend >= 0 ? '+' : ''}${periodTrend.toFixed(1)}%`],
        ['Prédiction (Prochaine période)', formatCurrency(stats.expensesPrediction)],
        ['Demandes en attente', stats.pendingExpensesCount.toString()],
        ['Membres actifs', stats.activeMembersCount.toString()],
      ]

      autoTable(doc, {
        startY: 52,
        head: [['Métrique', 'Valeur']],
        body: statsData,
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241] },
      })

      // Add poles budget breakdown
      if (poles.length > 0) {
        doc.setFontSize(14)
        doc.text('Budget par Pôle', 14, (doc as any).lastAutoTable.finalY + 15)

        const polesData = poles.map(pole => [
          pole.name,
          formatCurrency(pole.allocatedBudget),
          formatCurrency(pole.spentAmount),
          `${((pole.spentAmount / pole.allocatedBudget) * 100).toFixed(1)}%`
        ])

        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 19,
          head: [['Pôle', 'Budget Alloué', 'Dépensé', 'Utilisation']],
          body: polesData,
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129] },
        })
      }

      // Add recent expenses
      if (recentExpenses.length > 0) {
        doc.addPage()
        doc.setFontSize(14)
        doc.text('Dépenses Récentes', 14, 22)

        const expensesData = recentExpenses.map(expense => [
          expense.description,
          expense.user.name,
          expense.pole.name,
          formatCurrency(expense.amount),
          expense.status
        ])

        autoTable(doc, {
          startY: 26,
          head: [['Description', 'Demandeur', 'Pôle', 'Montant', 'Statut']],
          body: expensesData,
          theme: 'grid',
          headStyles: { fillColor: [99, 102, 241] },
        })
      }

      // Save PDF
      doc.save(`rapport-campusflow-${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success('Rapport PDF généré avec succès')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Erreur lors de la génération du PDF')
    }
  }

  const getDateRange = (period: 'week' | 'month' | 'year' | 'all') => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const currentDay = now.getDate()

    switch (period) {
      case 'week': {
        const weekStart = new Date(now)
        weekStart.setDate(currentDay - now.getDay()) // Start of week (Sunday)
        weekStart.setHours(0, 0, 0, 0)

        const lastWeekStart = new Date(weekStart)
        lastWeekStart.setDate(weekStart.getDate() - 7)

        const lastWeekEnd = new Date(weekStart)
        lastWeekEnd.setSeconds(-1)

        return {
          currentStart: weekStart,
          currentEnd: now,
          lastStart: lastWeekStart,
          lastEnd: lastWeekEnd
        }
      }
      case 'month': {
        const monthStart = new Date(currentYear, currentMonth, 1)
        const lastMonthStart = new Date(currentYear, currentMonth - 1, 1)
        const lastMonthEnd = new Date(monthStart)
        lastMonthEnd.setSeconds(-1)

        return {
          currentStart: monthStart,
          currentEnd: now,
          lastStart: lastMonthStart,
          lastEnd: lastMonthEnd
        }
      }
      case 'year': {
        const yearStart = new Date(currentYear, 0, 1)
        const lastYearStart = new Date(currentYear - 1, 0, 1)
        const lastYearEnd = new Date(yearStart)
        lastYearEnd.setSeconds(-1)

        return {
          currentStart: yearStart,
          currentEnd: now,
          lastStart: lastYearStart,
          lastEnd: lastYearEnd
        }
      }
      case 'all':
      default: {
        return {
          currentStart: new Date(0), // Beginning of time
          currentEnd: now,
          lastStart: new Date(0),
          lastEnd: new Date(0)
        }
      }
    }
  }

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)

      // Fetch user session
      const sessionResponse = await fetch('/api/session')
      if (!sessionResponse.ok) {
        throw new Error('Failed to fetch session')
      }
      const userData: User | null = await sessionResponse.json()

      if (!userData || !userData.listId) {
        toast.error('User session not found')
        return
      }

      setUser(userData)

      // Fetch poles for total budget
      const polesResponse = await fetch(`/api/poles?listId=${userData.listId}`)
      if (!polesResponse.ok) {
        throw new Error('Failed to fetch poles')
      }
      const polesData: Pole[] = await polesResponse.json()
      setPoles(polesData)
      const totalBudget = polesData.reduce((sum, pole) => sum + pole.allocatedBudget, 0)

      // Fetch all expenses for the list
      const expensesResponse = await fetch(`/api/expenses?listId=${userData.listId}`)
      if (!expensesResponse.ok) {
        throw new Error('Failed to fetch expenses')
      }
      const expenses: Expense[] = await expensesResponse.json()

      // Calculate expenses for current month
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      const expensesThisMonth = expenses
        .filter((expense) => {
          const expenseDate = new Date(expense.requestedAt)
          return (
            expenseDate.getMonth() === currentMonth &&
            expenseDate.getFullYear() === currentYear &&
            (expense.status === 'APPROVED' || expense.status === 'PAID')
          )
        })
        .reduce((sum, expense) => sum + expense.amount, 0)

      // Calculate last month expenses for trend
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

      const expensesLastMonth = expenses
        .filter((expense) => {
          const expenseDate = new Date(expense.requestedAt)
          return (
            expenseDate.getMonth() === lastMonth &&
            expenseDate.getFullYear() === lastMonthYear &&
            (expense.status === 'APPROVED' || expense.status === 'PAID')
          )
        })
        .reduce((sum, expense) => sum + expense.amount, 0)

      // Calculate expenses for current and last period (based on filter)
      const dateRange = getDateRange(period)

      const expensesCurrentPeriod = expenses
        .filter((expense) => {
          const expenseDate = new Date(expense.requestedAt)
          return (
            expenseDate >= dateRange.currentStart &&
            expenseDate <= dateRange.currentEnd &&
            (expense.status === 'APPROVED' || expense.status === 'PAID')
          )
        })
        .reduce((sum, expense) => sum + expense.amount, 0)

      const expensesLastPeriod = expenses
        .filter((expense) => {
          const expenseDate = new Date(expense.requestedAt)
          return (
            expenseDate >= dateRange.lastStart &&
            expenseDate <= dateRange.lastEnd &&
            (expense.status === 'APPROVED' || expense.status === 'PAID')
          )
        })
        .reduce((sum, expense) => sum + expense.amount, 0)

      // Calculate prediction (simple linear projection)
      const growthRate = expensesLastPeriod > 0
        ? (expensesCurrentPeriod - expensesLastPeriod) / expensesLastPeriod
        : 0
      const expensesPrediction = expensesCurrentPeriod * (1 + growthRate)

      // Calculate monthly expenses for last 6 months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const last6Months: MonthlyExpense[] = []

      for (let i = 5; i >= 0; i--) {
        const monthIndex = currentMonth - i < 0 ? 12 + (currentMonth - i) : currentMonth - i
        const year = currentMonth - i < 0 ? currentYear - 1 : currentYear

        const monthTotal = expenses
          .filter((expense) => {
            const expenseDate = new Date(expense.requestedAt)
            return (
              expenseDate.getMonth() === monthIndex &&
              expenseDate.getFullYear() === year &&
              (expense.status === 'APPROVED' || expense.status === 'PAID')
            )
          })
          .reduce((sum, expense) => sum + expense.amount, 0)

        last6Months.push({
          month: monthNames[monthIndex],
          amount: monthTotal
        })
      }
      setMonthlyExpenses(last6Months)

      // Count pending expenses
      const pendingExpensesCount = expenses.filter(e => e.status === 'PENDING').length

      // Count expenses by status
      setExpensesByStatus({
        pending: expenses.filter(e => e.status === 'PENDING').length,
        approved: expenses.filter(e => e.status === 'APPROVED').length,
        rejected: expenses.filter(e => e.status === 'REJECTED').length,
        paid: expenses.filter(e => e.status === 'PAID').length,
      })

      // Get recent expenses (last 5)
      const sortedExpenses = [...expenses].sort(
        (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      )
      setRecentExpenses(sortedExpenses.slice(0, 5))

      // Fetch events
      const eventsResponse = await fetch(`/api/events?listId=${userData.listId}&status=PUBLISHED`)
      if (!eventsResponse.ok) {
        throw new Error('Failed to fetch events')
      }
      const events: Event[] = await eventsResponse.json()

      // Filter upcoming events (date >= today)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const upcomingEventsFiltered = events.filter((event) => {
        const eventDate = new Date(event.date)
        eventDate.setHours(0, 0, 0, 0)
        return eventDate >= today
      })

      // Sort by date and get next 3
      const sortedEvents = upcomingEventsFiltered.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      setUpcomingEvents(sortedEvents.slice(0, 3))

      // Fetch users count
      const usersResponse = await fetch(`/api/users?listId=${userData.listId}`)
      if (!usersResponse.ok) {
        throw new Error('Failed to fetch users')
      }
      const users: User[] = await usersResponse.json()

      // Update stats
      setStats({
        totalBudget,
        expensesThisMonth,
        upcomingEventsCount: upcomingEventsFiltered.length,
        activeMembersCount: users.length,
        pendingExpensesCount,
        expensesLastMonth,
        expensesCurrentPeriod,
        expensesLastPeriod,
        expensesPrediction
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return Clock
      case 'APPROVED':
        return CheckCircle2
      case 'PAID':
        return CheckCircle2
      case 'REJECTED':
        return XCircle
      default:
        return Activity
    }
  }

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
      default:
        return 'bg-gradient-to-br from-gray-500 to-slate-500'
    }
  }

  // Calculate trend
  const expenseTrend = stats.expensesLastMonth > 0
    ? ((stats.expensesThisMonth - stats.expensesLastMonth) / stats.expensesLastMonth) * 100
    : 0

  const trendDirection = expenseTrend >= 0 ? 'up' : 'down'
  const trendLabel = `${Math.abs(expenseTrend).toFixed(0)}% vs last month`

  // Period-based trend
  const periodTrend = stats.expensesLastPeriod > 0
    ? ((stats.expensesCurrentPeriod - stats.expensesLastPeriod) / stats.expensesLastPeriod) * 100
    : 0

  const periodTrendDirection = periodTrend >= 0 ? 'up' : 'down'
  const periodLabel = period === 'week' ? 'semaine' : period === 'month' ? 'mois' : period === 'year' ? 'année' : 'période'
  const periodTrendLabel = `${Math.abs(periodTrend).toFixed(0)}% vs ${periodLabel} précédente`

  // Get current date info
  const today = new Date()
  const dateString = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="h-10 w-64 bg-muted animate-pulse rounded"></div>
          <div className="h-4 w-96 bg-muted animate-pulse rounded"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 dark:from-gray-100 dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
              Tableau de bord
            </h1>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center animate-pulse">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-lg text-muted-foreground">
            Bon retour, <span className="font-semibold text-foreground">{user?.name || 'Utilisateur'}</span>
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {dateString}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Link href="/app/expenses">
            <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg hover:shadow-xl transition-all">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Dépense
            </Button>
          </Link>
          <Link href="/app/events">
            <Button variant="outline" className="border-2 hover:bg-accent shadow-sm hover:shadow-md transition-all">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Événement
            </Button>
          </Link>
        </div>
      </div>

      {/* Period Filter */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Période d'analyse</h3>
                <p className="text-sm text-muted-foreground">Filtrez les données par période</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={period} onValueChange={(value: 'week' | 'month' | 'year' | 'all') => setPeriod(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sélectionner une période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                  <SelectItem value="all">Tout</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={exportToPDF}
                variant="outline"
                className="gap-2 border-2 hover:bg-red-50 hover:border-red-500 dark:hover:bg-red-950/20"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Budget Total"
          value={formatCurrency(stats.totalBudget)}
          description="Réparti sur tous les pôles"
          icon={DollarSign}
          gradient="bg-gradient-to-br from-emerald-500 to-green-600"
          delay={0}
        />
        <StatCard
          title={`Dépenses (${periodLabel})`}
          value={formatCurrency(stats.expensesCurrentPeriod)}
          description="Approuvées & payées"
          icon={TrendingUp}
          trend={periodTrendDirection}
          trendLabel={periodTrendLabel}
          gradient="bg-gradient-to-br from-blue-500 to-violet-600"
          delay={100}
        />
        <StatCard
          title="Prédiction"
          value={formatCurrency(stats.expensesPrediction)}
          description={`Projection pour prochaine ${periodLabel}`}
          icon={BarChart3}
          gradient="bg-gradient-to-br from-purple-500 to-pink-600"
          delay={200}
        />
        <StatCard
          title="Demandes en Attente"
          value={stats.pendingExpensesCount}
          description="En attente d'approbation"
          icon={Clock}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          delay={300}
        />
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Période actuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(stats.expensesCurrentPeriod)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {period === 'week' ? 'Cette semaine' : period === 'month' ? 'Ce mois' : period === 'year' ? 'Cette année' : 'Total'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Période précédente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(stats.expensesLastPeriod)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {period === 'week' ? 'Semaine dernière' : period === 'month' ? 'Mois dernier' : period === 'year' ? 'Année dernière' : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-500/20 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
              Variation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${periodTrend >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {periodTrend >= 0 ? '+' : ''}{periodTrend.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Par rapport à la période précédente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Monthly Expenses Chart */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              Tendances des dépenses
            </CardTitle>
            <CardDescription>Dépenses mensuelles des 6 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseChart data={monthlyExpenses} />
          </CardContent>
        </Card>

        {/* Budget by Pole */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              Vue d'ensemble du budget
            </CardTitle>
            <CardDescription>Dépenses par pôle</CardDescription>
          </CardHeader>
          <CardContent>
            {poles.length > 0 ? (
              <PoleBudgetChart poles={poles} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun pôle configuré</p>
            )}
          </CardContent>
        </Card>

        {/* Expenses by Status */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              Statut des dépenses
            </CardTitle>
            <CardDescription>Répartition des demandes de dépenses</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseStatusChart data={expensesByStatus} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Events Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity Timeline */}
        <Card className="shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                Activité Récente
              </CardTitle>
              <CardDescription>Dernières transactions et mises à jour</CardDescription>
            </div>
            <Link href="/app/expenses">
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentExpenses.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-sm text-muted-foreground">Aucune activité récente</p>
              </div>
            ) : (
              <div className="space-y-0">
                {recentExpenses.map((expense, index) => {
                  const StatusIcon = getStatusIcon(expense.status)
                  const statusColor = getStatusColor(expense.status)

                  return (
                    <ActivityItem
                      key={expense.id}
                      icon={StatusIcon}
                      title={expense.description}
                      description={`${expense.user.name} • ${expense.pole.name} • ${formatCurrency(expense.amount)}`}
                      time={formatDate(expense.requestedAt)}
                      iconBg={statusColor}
                      delay={index * 100}
                    />
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                Événements à Venir
              </CardTitle>
              <CardDescription>{stats.upcomingEventsCount} prochains événements programmés</CardDescription>
            </div>
            <Link href="/app/events">
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-sm text-muted-foreground">Aucun événement à venir</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className={`
                      group relative overflow-hidden rounded-lg border-2 border-transparent p-4
                      transition-all duration-300 hover:border-primary hover:bg-accent/50 hover:shadow-md
                      opacity-0 translate-x-4 animate-in fade-in slide-in-from-right
                    `}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold leading-none flex items-center gap-2">
                          {event.name}
                          <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Cards */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          Actions Rapides
          <div className="h-1 flex-1 bg-gradient-to-r from-primary/20 to-transparent rounded-full"></div>
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            title="Gérer les Dépenses"
            description="Examiner et approuver les demandes de dépenses"
            icon={Receipt}
            href="/app/expenses"
            gradient="bg-gradient-to-br from-blue-500 to-violet-600"
            delay={0}
          />
          <QuickActionCard
            title="Voir le Budget"
            description="Vérifier l'allocation budgétaire et les dépenses"
            icon={Wallet}
            href="/app/poles"
            gradient="bg-gradient-to-br from-emerald-500 to-green-600"
            delay={100}
          />
          <QuickActionCard
            title="Gérer les Événements"
            description="Créer et organiser des événements"
            icon={Calendar}
            href="/app/events"
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            delay={200}
          />
          <QuickActionCard
            title="Membres de l'Équipe"
            description="Voir et gérer les membres de l'équipe"
            icon={Users}
            href="/app/users"
            gradient="bg-gradient-to-br from-purple-500 to-pink-600"
            delay={300}
          />
        </div>
      </div>
    </div>
  )
}

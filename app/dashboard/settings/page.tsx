'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { usePermissions } from '@/hooks/usePermissions'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { Edit, Trash2, Plus, Save, Sun, Moon, Monitor, Check, DollarSign, Bell, Users, Shield, Lock, Mail, Calendar, Globe, Download, History } from 'lucide-react'
import { ExportMenu } from '@/components/export-menu'
import { exportMonthlyReportPDF } from '@/lib/export-utils'
import { useTheme } from '@/hooks/useTheme'

interface List {
  id: string
  name: string
  description: string
}

interface Pole {
  id: string
  name: string
  description?: string
  color: string
  allocatedBudget: number
  spentAmount: number
}

interface PoleFormData {
  name: string
  description: string
  color: string
  allocatedBudget: string
}

export default function SettingsPage() {
  const [list, setList] = useState<List | null>(null)
  const [listForm, setListForm] = useState({ name: '', description: '' })
  const [poles, setPoles] = useState<Pole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPolesLoading, setIsPolesLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPole, setEditingPole] = useState<Pole | null>(null)
  const [poleFormData, setPoleFormData] = useState<PoleFormData>({
    name: '',
    description: '',
    color: '#3b82f6',
    allocatedBudget: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [poleJustSaved, setPoleJustSaved] = useState(false)
  const [isListSaving, setIsListSaving] = useState(false)

  // Financial settings state
  const [financeSettings, setFinanceSettings] = useState({
    approvalThreshold: '100.00',
    fiscalYearStart: '2024-09-01',
    fiscalYearEnd: '2025-08-31',
  })
  const [isFinanceSaving, setIsFinanceSaving] = useState(false)
  const [financeJustSaved, setFinanceJustSaved] = useState(false)

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNewExpense: true,
    emailValidation: true,
    emailNewEvent: true,
    emailEventReminder: true,
    inAppAll: true,
    inAppSound: false,
    reportFrequency: 'monthly',
  })
  const [isNotificationSaving, setIsNotificationSaving] = useState(false)
  const [notificationJustSaved, setNotificationJustSaved] = useState(false)

  // User settings state
  const [userSettings, setUserSettings] = useState({
    openRegistration: false,
    emailValidation: true,
    manualApproval: true,
    defaultRole: 'MEMBER',
  })
  const [isUserSaving, setIsUserSaving] = useState(false)
  const [userJustSaved, setUserJustSaved] = useState(false)

  const { canEdit, canDelete } = usePermissions()
  const { toast } = useToast()
  const { theme, setTheme, actualTheme } = useTheme()

  useEffect(() => {
    fetchList()
    fetchPoles()
    loadSettings()
  }, [])

  const loadSettings = () => {
    // Load financial settings
    const savedFinanceSettings = localStorage.getItem('financeSettings')
    if (savedFinanceSettings) {
      setFinanceSettings(JSON.parse(savedFinanceSettings))
    }

    // Load notification settings
    const savedNotificationSettings = localStorage.getItem('notificationSettings')
    if (savedNotificationSettings) {
      setNotificationSettings(JSON.parse(savedNotificationSettings))
    }

    // Load user settings
    const savedUserSettings = localStorage.getItem('userSettings')
    if (savedUserSettings) {
      setUserSettings(JSON.parse(savedUserSettings))
    }
  }

  const fetchList = async () => {
    try {
      setIsLoading(true)
      // Assuming we have a way to get the current list ID
      // For now, we'll fetch from a general endpoint
      const response = await fetch('/api/lists/current')
      if (!response.ok) throw new Error('Failed to fetch list')
      const data = await response.json()
      setList(data)
      setListForm({
        name: data.name,
        description: data.description || '',
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les informations de la liste',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPoles = async () => {
    try {
      setIsPolesLoading(true)
      const response = await fetch('/api/poles')
      if (!response.ok) throw new Error('Failed to fetch poles')
      const data = await response.json()
      setPoles(data)
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les pôles',
        variant: 'destructive',
      })
    } finally {
      setIsPolesLoading(false)
    }
  }

  const handleSaveList = async () => {
    if (!list) return

    if (!listForm.name) {
      toast({
        title: 'Erreur',
        description: 'Le nom de la liste est requis',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsListSaving(true)
      const response = await fetch(`/api/lists/${list.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listForm),
      })

      if (!response.ok) throw new Error('Failed to update list')

      toast({
        title: 'Succès',
        description: 'Liste mise à jour avec succès',
        variant: 'success',
      })

      fetchList()
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la liste',
        variant: 'destructive',
      })
    } finally {
      setIsListSaving(false)
    }
  }

  const handleOpenPoleDialog = (pole?: Pole) => {
    if (pole) {
      setEditingPole(pole)
      setPoleFormData({
        name: pole.name,
        description: pole.description || '',
        color: pole.color,
        allocatedBudget: pole.allocatedBudget.toString(),
      })
    } else {
      setEditingPole(null)
      setPoleFormData({
        name: '',
        description: '',
        color: '#3b82f6',
        allocatedBudget: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleClosePoleDialog = () => {
    setIsDialogOpen(false)
    setEditingPole(null)
    setPoleFormData({
      name: '',
      description: '',
      color: '#3b82f6',
      allocatedBudget: '',
    })
  }

  const handleSubmitPole = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!poleFormData.name || !poleFormData.allocatedBudget) {
      toast({
        title: 'Erreur',
        description: 'Le nom et le budget alloué sont requis',
        variant: 'destructive',
      })
      return
    }

    const budget = parseFloat(poleFormData.allocatedBudget)
    if (isNaN(budget) || budget < 0) {
      toast({
        title: 'Erreur',
        description: 'Le budget doit être un nombre positif',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSaving(true)
      const url = editingPole ? `/api/poles/${editingPole.id}` : '/api/poles'
      const method = editingPole ? 'PUT' : 'POST'

      const body = {
        name: poleFormData.name,
        description: poleFormData.description || undefined,
        color: poleFormData.color,
        allocatedBudget: budget,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error('Failed to save pole')

      toast({
        title: 'Succès',
        description: editingPole
          ? 'Pôle mis à jour avec succès'
          : 'Pôle créé avec succès',
        variant: 'success',
      })

      setPoleJustSaved(true)
      setTimeout(() => {
        setPoleJustSaved(false)
        handleClosePoleDialog()
        fetchPoles()
      }, 1000)
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le pôle',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePole = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce pôle ?')) return

    try {
      const response = await fetch(`/api/poles/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete pole')

      toast({
        title: 'Succès',
        description: 'Pôle supprimé avec succès',
        variant: 'success',
      })

      fetchPoles()
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le pôle',
        variant: 'destructive',
      })
    }
  }

  // Save financial settings
  const handleSaveFinanceSettings = () => {
    try {
      setIsFinanceSaving(true)
      localStorage.setItem('financeSettings', JSON.stringify(financeSettings))
      toast({
        title: 'Succès',
        description: 'Paramètres financiers enregistrés avec succès',
        variant: 'success',
      })
      setFinanceJustSaved(true)
      setTimeout(() => setFinanceJustSaved(false), 1000)
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer les paramètres financiers',
        variant: 'destructive',
      })
    } finally {
      setIsFinanceSaving(false)
    }
  }

  // Save notification settings
  const handleSaveNotificationSettings = () => {
    try {
      setIsNotificationSaving(true)
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings))
      toast({
        title: 'Succès',
        description: 'Préférences de notifications enregistrées avec succès',
        variant: 'success',
      })
      setNotificationJustSaved(true)
      setTimeout(() => setNotificationJustSaved(false), 1000)
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer les préférences de notifications',
        variant: 'destructive',
      })
    } finally {
      setIsNotificationSaving(false)
    }
  }

  // Save user settings
  const handleSaveUserSettings = () => {
    try {
      setIsUserSaving(true)
      localStorage.setItem('userSettings', JSON.stringify(userSettings))
      toast({
        title: 'Succès',
        description: 'Paramètres utilisateurs enregistrés avec succès',
        variant: 'success',
      })
      setUserJustSaved(true)
      setTimeout(() => setUserJustSaved(false), 1000)
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer les paramètres utilisateurs',
        variant: 'destructive',
      })
    } finally {
      setIsUserSaving(false)
    }
  }

  const calculateBudgetProgress = (spent: number, allocated: number) => {
    if (allocated === 0) return 0
    return Math.min((spent / allocated) * 100, 100)
  }

  // Export monthly report handler
  const handleExportMonthlyReport = async () => {
    try {
      // Fetch expenses for current month
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const expensesResponse = await fetch('/api/expenses')
      const allExpenses = await expensesResponse.json()

      // Filter expenses for current month
      const monthExpenses = allExpenses.filter((expense: any) => {
        const expenseDate = new Date(expense.requestedAt)
        return expenseDate >= firstDay && expenseDate <= lastDay
      })

      // Fetch events for current month
      const eventsResponse = await fetch('/api/events')
      const allEvents = await eventsResponse.json()

      const monthEvents = allEvents.filter((event: any) => {
        const eventDate = new Date(event.date)
        return eventDate >= firstDay && eventDate <= lastDay
      })

      // Sort expenses by amount for top expenses
      const topExpenses = [...monthExpenses].sort((a, b) => b.amount - a.amount)

      // Calculate totals
      const totalBudget = poles.reduce((sum, pole) => sum + pole.allocatedBudget, 0)
      const totalSpent = poles.reduce((sum, pole) => sum + pole.spentAmount, 0)

      // Prepare poles data
      const polesData = poles.map(pole => ({
        name: pole.name,
        allocatedBudget: pole.allocatedBudget,
        spentAmount: pole.spentAmount,
        remaining: pole.allocatedBudget - pole.spentAmount,
      }))

      // Generate report
      exportMonthlyReportPDF(
        {
          totalBudget,
          totalSpent,
          totalEvents: monthEvents.length,
          poles: polesData,
          events: monthEvents,
          topExpenses,
        },
        list?.name || 'CampusFlow'
      )

      toast({
        title: 'Succès',
        description: 'Rapport mensuel généré avec succès',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le rapport mensuel',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez les paramètres de votre liste et vos pôles
          </p>
        </div>
        <ExportMenu
          onExportMonthlyReport={handleExportMonthlyReport}
          showMonthlyReport={true}
        />
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full">
          <TabsTrigger value="list">Informations</TabsTrigger>
          <TabsTrigger value="poles">Pôles</TabsTrigger>
          <TabsTrigger value="finance">Financier</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
        </TabsList>

        {/* Tab 1: List Information */}
        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de la liste</CardTitle>
              <CardDescription>
                Modifiez le nom et la description de votre liste
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <p className="text-muted-foreground">Chargement...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="list-name">
                      Nom de la liste <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="list-name"
                      value={listForm.name}
                      onChange={(e) =>
                        setListForm({ ...listForm, name: e.target.value })
                      }
                      placeholder="Nom de votre liste"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="list-description">Description</Label>
                    <Textarea
                      id="list-description"
                      value={listForm.description}
                      onChange={(e) =>
                        setListForm({ ...listForm, description: e.target.value })
                      }
                      placeholder="Description de votre liste"
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveList}
                      disabled={isListSaving || !canEdit}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isListSaving ? 'Enregistrement...' : 'Sauvegarder'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Poles Management */}
        <TabsContent value="poles" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestion des pôles</CardTitle>
                <CardDescription>
                  Gérez les pôles et leurs budgets
                </CardDescription>
              </div>
              <Button onClick={() => handleOpenPoleDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau pôle
              </Button>
            </CardHeader>
            <CardContent>
              {isPolesLoading ? (
                <div className="flex justify-center items-center h-32">
                  <p className="text-muted-foreground">Chargement...</p>
                </div>
              ) : poles.length === 0 ? (
                <div className="flex justify-center items-center h-32">
                  <p className="text-muted-foreground">Aucun pôle trouvé</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Couleur</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Budget alloué</TableHead>
                      <TableHead>Dépensé</TableHead>
                      <TableHead>Restant</TableHead>
                      <TableHead>Progression</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {poles.map((pole) => {
                      const remaining = pole.allocatedBudget - pole.spentAmount
                      const progress = calculateBudgetProgress(
                        pole.spentAmount,
                        pole.allocatedBudget
                      )
                      return (
                        <TableRow key={pole.id}>
                          <TableCell>
                            <div
                              className="w-8 h-8 rounded-full border-2 border-gray-300"
                              style={{ backgroundColor: pole.color }}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {pole.name}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {pole.description || '-'}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(pole.allocatedBudget)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(pole.spentAmount)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                remaining < 0
                                  ? 'text-destructive font-semibold'
                                  : ''
                              }
                            >
                              {formatCurrency(remaining)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Progress value={progress} className="h-2" />
                              <p className="text-xs text-muted-foreground">
                                {progress.toFixed(0)}%
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenPoleDialog(pole)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePole(pole.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Appearance */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Apparence</CardTitle>
              <CardDescription>
                Personnalisez l'apparence de l'interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Thème de l'interface</Label>
                <p className="text-sm text-muted-foreground">
                  Choisissez le thème qui correspond à vos préférences
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {/* Light Theme Card */}
                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    theme === 'light'
                      ? 'ring-2 ring-primary ring-offset-2'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setTheme('light')}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/20">
                        <Sun className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      {theme === 'light' && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">Clair</h3>
                      <p className="text-sm text-muted-foreground">
                        Interface lumineuse et classique
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Dark Theme Card */}
                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    theme === 'dark'
                      ? 'ring-2 ring-primary ring-offset-2'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setTheme('dark')}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                        <Moon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      {theme === 'dark' && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">Sombre</h3>
                      <p className="text-sm text-muted-foreground">
                        Interface sombre pour réduire la fatigue oculaire
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* System Theme Card */}
                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    theme === 'system'
                      ? 'ring-2 ring-primary ring-offset-2'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setTheme('system')}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900/20">
                        <Monitor className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      {theme === 'system' && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">Système</h3>
                      <p className="text-sm text-muted-foreground">
                        S'adapte automatiquement aux préférences système
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                    <span className="text-xs">💡</span>
                  </div>
                  <p className="text-sm font-medium">Thème actuel</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {theme === 'system'
                    ? `Mode système (actuellement ${actualTheme === 'dark' ? 'sombre' : 'clair'})`
                    : theme === 'dark'
                    ? 'Mode sombre activé'
                    : 'Mode clair activé'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Finance Settings */}
        <TabsContent value="finance" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <CardTitle>Paramètres Financiers</CardTitle>
              </div>
              <CardDescription>
                Configurez les règles financières et les seuils d'approbation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Approval Threshold */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="approval-threshold">
                    Seuil d'approbation automatique (€)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Les dépenses inférieures à ce montant peuvent être approuvées automatiquement
                  </p>
                </div>
                <Input
                  id="approval-threshold"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="100.00"
                  value={financeSettings.approvalThreshold}
                  onChange={(e) => setFinanceSettings({...financeSettings, approvalThreshold: e.target.value})}
                />
              </div>

              <div className="border-t pt-6 space-y-4">
                <div>
                  <Label>Exercice fiscal</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Définissez la période de l'exercice fiscal annuel
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fiscal-year-start">Début</Label>
                    <Input
                      id="fiscal-year-start"
                      type="date"
                      value={financeSettings.fiscalYearStart}
                      onChange={(e) => setFinanceSettings({...financeSettings, fiscalYearStart: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fiscal-year-end">Fin</Label>
                    <Input
                      id="fiscal-year-end"
                      type="date"
                      value={financeSettings.fiscalYearEnd}
                      onChange={(e) => setFinanceSettings({...financeSettings, fiscalYearEnd: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div>
                  <Label>Catégories de dépenses</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gérez les catégories personnalisées pour vos dépenses
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {['Événement', 'Matériel', 'Communication', 'Formation', 'Déplacement', 'Autre'].map(
                      (category) => (
                        <div
                          key={category}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                        >
                          {category}
                          <button className="hover:text-destructive transition-colors">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une catégorie
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveFinanceSettings}
                  disabled={isFinanceSaving}
                  className={financeJustSaved ? 'animate-flash-green' : ''}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isFinanceSaving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Configurez vos préférences de notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <Label className="text-base font-semibold">Notifications par email</Label>
                </div>
                <div className="space-y-3 ml-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Nouvelle demande de dépense</p>
                      <p className="text-xs text-muted-foreground">
                        Recevoir un email lors d'une nouvelle demande
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNewExpense}
                      onChange={(e) => setNotificationSettings({...notificationSettings, emailNewExpense: e.target.checked})}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Validation de dépense</p>
                      <p className="text-xs text-muted-foreground">
                        Recevoir un email lors de la validation
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailValidation}
                      onChange={(e) => setNotificationSettings({...notificationSettings, emailValidation: e.target.checked})}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Nouvel événement</p>
                      <p className="text-xs text-muted-foreground">
                        Recevoir un email lors de la création d'un événement
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNewEvent}
                      onChange={(e) => setNotificationSettings({...notificationSettings, emailNewEvent: e.target.checked})}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Rappels d'événements</p>
                      <p className="text-xs text-muted-foreground">
                        Recevoir des rappels 24h avant un événement
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailEventReminder}
                      onChange={(e) => setNotificationSettings({...notificationSettings, emailEventReminder: e.target.checked})}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <Label className="text-base font-semibold">Notifications dans l'application</Label>
                </div>
                <div className="space-y-3 ml-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Toutes les notifications</p>
                      <p className="text-xs text-muted-foreground">
                        Afficher toutes les notifications dans l'app
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.inAppAll}
                      onChange={(e) => setNotificationSettings({...notificationSettings, inAppAll: e.target.checked})}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Sons de notification</p>
                      <p className="text-xs text-muted-foreground">
                        Jouer un son lors de nouvelles notifications
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.inAppSound}
                      onChange={(e) => setNotificationSettings({...notificationSettings, inAppSound: e.target.checked})}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <Label className="text-base font-semibold">Rapports automatiques</Label>
                </div>
                <div className="space-y-3 ml-6">
                  <div className="space-y-2">
                    <Label htmlFor="report-frequency">Fréquence des rapports</Label>
                    <select
                      id="report-frequency"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      value={notificationSettings.reportFrequency}
                      onChange={(e) => setNotificationSettings({...notificationSettings, reportFrequency: e.target.value})}
                    >
                      <option value="none">Aucun</option>
                      <option value="weekly">Hebdomadaire</option>
                      <option value="monthly">Mensuel</option>
                      <option value="quarterly">Trimestriel</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveNotificationSettings}
                  disabled={isNotificationSaving}
                  className={notificationJustSaved ? 'animate-flash-green' : ''}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isNotificationSaving ? 'Enregistrement...' : 'Enregistrer les préférences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Users Management */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>Gestion des Utilisateurs</CardTitle>
                </div>
                <CardDescription>
                  Gérez les membres et leurs rôles dans l'organisation
                </CardDescription>
              </div>
              <Button disabled={!canEdit}>
                <Plus className="mr-2 h-4 w-4" />
                Inviter un membre
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  La gestion détaillée des utilisateurs est disponible dans le module Membres.
                  Ici vous pouvez configurer les paramètres généraux d'accès.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Paramètres d'inscription</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Contrôlez qui peut rejoindre votre organisation
                  </p>
                </div>
                <div className="space-y-3 ml-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Inscription ouverte</p>
                      <p className="text-xs text-muted-foreground">
                        Permettre aux nouveaux utilisateurs de s'inscrire librement
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={userSettings.openRegistration}
                      onChange={(e) => setUserSettings({...userSettings, openRegistration: e.target.checked})}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Validation par email requise</p>
                      <p className="text-xs text-muted-foreground">
                        Les nouveaux utilisateurs doivent valider leur email
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={userSettings.emailValidation}
                      onChange={(e) => setUserSettings({...userSettings, emailValidation: e.target.checked})}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Approbation manuelle</p>
                      <p className="text-xs text-muted-foreground">
                        Un administrateur doit approuver chaque nouveau membre
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={userSettings.manualApproval}
                      onChange={(e) => setUserSettings({...userSettings, manualApproval: e.target.checked})}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div>
                  <Label className="text-base font-semibold">Rôles par défaut</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Rôle attribué automatiquement aux nouveaux membres
                  </p>
                </div>
                <select
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  value={userSettings.defaultRole}
                  onChange={(e) => setUserSettings({...userSettings, defaultRole: e.target.value})}
                >
                  <option value="MEMBER">Membre</option>
                  <option value="POLE_LEADER">Chef de pôle</option>
                  <option value="SECRETARY">Secrétaire</option>
                </select>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveUserSettings}
                  disabled={!canEdit || isUserSaving}
                  className={userJustSaved ? 'animate-flash-green' : ''}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isUserSaving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 7: Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Sécurité</CardTitle>
              </div>
              <CardDescription>
                Paramètres de sécurité et de connexion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <Label className="text-base font-semibold">Mot de passe</Label>
                </div>
                <div className="ml-6 space-y-3">
                  <Button variant="outline">
                    Changer mon mot de passe
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <Label className="text-base font-semibold">Authentification à deux facteurs</Label>
                </div>
                <div className="ml-6 space-y-3">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">
                      L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte.
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    <Lock className="mr-2 h-4 w-4" />
                    Activer 2FA (Bientôt disponible)
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <Label className="text-base font-semibold">Sessions actives</Label>
                </div>
                <div className="ml-6 space-y-3">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium">Session actuelle</p>
                        <p className="text-xs text-muted-foreground">
                          macOS • Chrome • Paris, France
                        </p>
                      </div>
                      <span className="text-xs text-green-600 font-medium">Actif</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dernière activité: Aujourd'hui à 14:32
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="text-destructive">
                    Déconnecter toutes les autres sessions
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <Label className="text-base font-semibold">Historique de connexion</Label>
                </div>
                <div className="ml-6 space-y-2">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span>Aujourd'hui, 14:32</span>
                      <span className="text-muted-foreground">macOS • Chrome</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>Hier, 09:15</span>
                      <span className="text-muted-foreground">iOS • Safari</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>30 Oct, 18:45</span>
                      <span className="text-muted-foreground">macOS • Chrome</span>
                    </div>
                  </div>
                  <Button variant="link" size="sm" className="px-0">
                    Voir tout l'historique
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div>
                  <Label className="text-base font-semibold">Politique de mot de passe</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Définissez les exigences de sécurité pour les mots de passe
                  </p>
                </div>
                <div className="space-y-3 ml-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Longueur minimale (8 caractères)</p>
                    </div>
                    <input type="checkbox" defaultChecked disabled className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Caractères spéciaux requis</p>
                    </div>
                    <input type="checkbox" defaultChecked disabled className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Chiffres requis</p>
                    </div>
                    <input type="checkbox" defaultChecked disabled className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pole Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingPole ? 'Modifier le pôle' : 'Nouveau pôle'}
            </DialogTitle>
            <DialogDescription>
              {editingPole
                ? 'Modifiez les informations du pôle'
                : 'Créez un nouveau pôle pour organiser votre budget'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPole}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="pole-name">
                  Nom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pole-name"
                  value={poleFormData.name}
                  onChange={(e) =>
                    setPoleFormData({ ...poleFormData, name: e.target.value })
                  }
                  placeholder="Nom du pôle"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pole-description">Description</Label>
                <Textarea
                  id="pole-description"
                  value={poleFormData.description}
                  onChange={(e) =>
                    setPoleFormData({
                      ...poleFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Description du pôle"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pole-color">Couleur</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="pole-color"
                    type="color"
                    value={poleFormData.color}
                    onChange={(e) =>
                      setPoleFormData({ ...poleFormData, color: e.target.value })
                    }
                    className="h-10 w-20 cursor-pointer"
                  />
                  <Input
                    value={poleFormData.color}
                    onChange={(e) =>
                      setPoleFormData({ ...poleFormData, color: e.target.value })
                    }
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pole-budget">
                  Budget alloué (€) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pole-budget"
                  type="number"
                  step="0.01"
                  min="0"
                  value={poleFormData.allocatedBudget}
                  onChange={(e) =>
                    setPoleFormData({
                      ...poleFormData,
                      allocatedBudget: e.target.value,
                    })
                  }
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClosePoleDialog}
                disabled={isSaving}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className={poleJustSaved ? 'animate-flash-green' : ''}
              >
                {isSaving
                  ? 'Enregistrement...'
                  : editingPole
                  ? 'Mettre à jour'
                  : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

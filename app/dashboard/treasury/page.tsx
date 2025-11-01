'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Check, X, Eye, DollarSign, Clock, AlertCircle, Trash2, Upload, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePermissions } from '@/hooks/usePermissions'
import { ExportMenu } from '@/components/export-menu'
import { exportExpensesToExcel, exportExpensesToPDF } from '@/lib/export-utils'

// Types
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
}

interface Pole {
  id: string
  name: string
  color: string
  allocatedBudget: number
  spentAmount: number
}

interface Supplier {
  id: string
  name: string
  category: string
  contact?: string
}

interface Event {
  id: string
  name: string
  date: string
  status: string
}

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID'
  notes?: string
  receipt?: string
  requestedAt: string
  validatedAt?: string
  paidAt?: string
  user: User
  pole: Pole
  supplier?: Supplier
  event?: Event
  validator?: User
}

interface ExpenseFormData {
  description: string
  amount: string
  category: string
  poleId: string
  supplierId: string
  eventId: string
  notes: string
}

const categories = [
  'Fournitures',
  'Transport',
  'Communication',
  'Nourriture',
  'Autre',
]

const statusColors: Record<string, 'default' | 'warning' | 'success' | 'destructive' | 'info'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
  PAID: 'info',
}

const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  APPROVED: 'Approuvé',
  REJECTED: 'Rejeté',
  PAID: 'Payé',
}

export default function TreasuryPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [poles, setPoles] = useState<Pole[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [poleFilter, setPoleFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    amount: '',
    category: '',
    poleId: '',
    supplierId: '',
    eventId: '',
    notes: '',
  })

  // Permissions
  const { canApprove, canDelete, isLoading: permissionsLoading } = usePermissions()

  // Session
  const [session, setSession] = useState<User | null>(null)

  // Fetch session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/session')
        if (response.ok) {
          const data = await response.json()
          setSession(data)
          console.log('Session chargée:', data)
        }
      } catch (err) {
        console.error('Failed to fetch session:', err)
      }
    }
    fetchSession()
  }, [])

  // Debug permissions
  useEffect(() => {
    if (!permissionsLoading && session) {
      console.log('Permissions:', {
        role: session.role,
        canApprove,
        message: canApprove
          ? 'Vous pouvez approuver/refuser des dépenses'
          : 'Seuls le PRESIDENT, VICE_PRESIDENT et TREASURER peuvent approuver'
      })
    }
  }, [canApprove, permissionsLoading, session])

  // Fetch data
  useEffect(() => {
    fetchExpenses()
    fetchPoles()
    fetchSuppliers()
    fetchEvents()
  }, [statusFilter, poleFilter])

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter)
      }
      if (poleFilter !== 'ALL') {
        params.append('poleId', poleFilter)
      }
      if (session?.listId) {
        params.append('listId', session.listId)
      }

      const response = await fetch(`/api/expenses?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch expenses')
      const data = await response.json()
      setExpenses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses')
    } finally {
      setLoading(false)
    }
  }

  const fetchPoles = async () => {
    try {
      const response = await fetch('/api/poles')
      if (!response.ok) throw new Error('Failed to fetch poles')
      const data = await response.json()
      setPoles(data)
    } catch (err) {
      console.error('Failed to fetch poles:', err)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      if (!response.ok) throw new Error('Failed to fetch suppliers')
      const data = await response.json()
      setSuppliers(data)
    } catch (err) {
      console.error('Failed to fetch suppliers:', err)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (!response.ok) throw new Error('Failed to fetch events')
      const data = await response.json()
      setEvents(data)
    } catch (err) {
      console.error('Failed to fetch events:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    try {
      setSubmitting(true)
      setError(null)

      // Upload file if exists
      let receiptUrl: string | undefined
      if (uploadedFile) {
        setUploading(true)
        const uploadFormData = new FormData()
        uploadFormData.append('files', uploadedFile)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        })

        if (!uploadResponse.ok) {
          throw new Error('Échec de l\'upload du justificatif')
        }

        const uploadData = await uploadResponse.json()
        receiptUrl = uploadData.files[0]?.fileUrl
        setUploading(false)
      }

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formData.description,
          amount: parseFloat(formData.amount),
          category: formData.category,
          poleId: formData.poleId,
          supplierId: formData.supplierId && formData.supplierId !== 'none' ? formData.supplierId : undefined,
          eventId: formData.eventId && formData.eventId !== 'none' ? formData.eventId : undefined,
          notes: formData.notes || undefined,
          receipt: receiptUrl,
          userId: session.id,
          listId: session.listId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create expense')
      }

      setJustSaved(true)
      setTimeout(() => {
        setJustSaved(false)
        setIsDialogOpen(false)
        resetForm()
        setUploadedFile(null)
      }, 1000)
      await fetchExpenses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense')
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  const handleApprove = async (expenseId: string) => {
    if (!session) return

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPROVED',
          validatedBy: session.id,
        }),
      })

      if (!response.ok) throw new Error('Failed to approve expense')
      await fetchExpenses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve expense')
    }
  }

  const handleReject = async (expenseId: string) => {
    if (!session) return

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REJECTED',
          validatedBy: session.id,
        }),
      })

      if (!response.ok) throw new Error('Failed to reject expense')
      await fetchExpenses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject expense')
    }
  }

  const handleMarkPaid = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'PAID',
        }),
      })

      if (!response.ok) throw new Error('Failed to mark expense as paid')
      await fetchExpenses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark expense as paid')
    }
  }

  const handleDelete = async (expenseId: string, expenseDescription: string) => {
    // Confirmation avant suppression
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la dépense "${expenseDescription}" ?\n\n` +
      `Cette action est irréversible et annulera la comptabilité associée.`
    )

    if (!confirmed) return

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete expense')

      await fetchExpenses()

      // Afficher un message de succès (si vous utilisez un système de toasts)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense')
    }
  }

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      poleId: '',
      supplierId: '',
      eventId: '',
      notes: '',
    })
    setUploadedFile(null)
  }

  // Calculate stats
  const totalBudget = poles.reduce((sum, pole) => sum + pole.allocatedBudget, 0)
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.requestedAt)
    const now = new Date()
    return (
      expenseDate.getMonth() === now.getMonth() &&
      expenseDate.getFullYear() === now.getFullYear() &&
      (expense.status === 'APPROVED' || expense.status === 'PAID')
    )
  }).reduce((sum, expense) => sum + expense.amount, 0)
  const pendingCount = expenses.filter(e => e.status === 'PENDING').length

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        expense.description.toLowerCase().includes(query) ||
        expense.user.name.toLowerCase().includes(query) ||
        expense.pole.name.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Export handlers
  const handleExportExcel = () => {
    const users = Array.from(new Set(expenses.map(e => e.user))).filter(
      (user, index, self) => self.findIndex(u => u.id === user.id) === index
    )
    exportExpensesToExcel(filteredExpenses, poles, users)
  }

  const handleExportPDF = () => {
    const users = Array.from(new Set(expenses.map(e => e.user))).filter(
      (user, index, self) => self.findIndex(u => u.id === user.id) === index
    )
    const listName = session?.listName || 'CampusFlow'
    exportExpensesToPDF(filteredExpenses, poles, users, listName)
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Trésorerie</h2>
          <p className="text-muted-foreground">
            Gérez les dépenses et le budget de votre association
          </p>
        </div>
        <div className="flex gap-2">
          <ExportMenu
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
          />
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle dépense
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBudget.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">
              Budget alloué aux pôles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépenses du mois</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthExpenses.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">
              Total des dépenses approuvées ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Dépenses en attente d&apos;approbation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="APPROVED">Approuvé</SelectItem>
                  <SelectItem value="REJECTED">Rejeté</SelectItem>
                  <SelectItem value="PAID">Payé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pôle</Label>
              <Select value={poleFilter} onValueChange={setPoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les pôles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous</SelectItem>
                  {poles.map(pole => (
                    <SelectItem key={pole.id} value={pole.id}>
                      {pole.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Recherche</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dépenses</CardTitle>
          <CardDescription>
            Liste de toutes les dépenses de votre association
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {!canApprove && !permissionsLoading && session && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-blue-50 dark:bg-blue-950/20 p-3 text-sm text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
              <AlertCircle className="h-4 w-4" />
              <div>
                <strong>Information:</strong> Vous êtes connecté en tant que <strong>{session.role}</strong>.
                Seuls les rôles <strong>PRESIDENT</strong>, <strong>VICE_PRESIDENT</strong> et <strong>TREASURER</strong> peuvent
                approuver ou refuser des dépenses.
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Chargement...</div>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Aucune dépense trouvée</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Pôle</TableHead>
                  <TableHead>Demandeur</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Justificatif</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {expense.description}
                    </TableCell>
                    <TableCell>{expense.amount.toFixed(2)} €</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: expense.pole.color,
                          color: '#fff',
                        }}
                      >
                        {expense.pole.name}
                      </Badge>
                    </TableCell>
                    <TableCell>{expense.user.name}</TableCell>
                    <TableCell>
                      {new Date(expense.requestedAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[expense.status]}>
                        {statusLabels[expense.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {expense.receipt ? (
                        <a
                          href={expense.receipt}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <FileText className="h-3 w-3" />
                          Voir
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canApprove && expense.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(expense.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(expense.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {canApprove && expense.status === 'APPROVED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkPaid(expense.id)}
                          >
                            Marquer payé
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(expense.id, expense.description)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Expense Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle dépense</DialogTitle>
            <DialogDescription>
              Créez une nouvelle demande de dépense pour votre association
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">
                  Montant (€) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">
                  Catégorie <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pole">
                  Pôle <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.poleId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, poleId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un pôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {poles.map((pole) => (
                      <SelectItem key={pole.id} value={pole.id}>
                        {pole.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="supplier">Fournisseur (optionnel)</Label>
                <Select
                  value={formData.supplierId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, supplierId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un fournisseur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="event">Événement (optionnel)</Label>
                <Select
                  value={formData.eventId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, eventId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un événement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="receipt">Justificatif (optionnel)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="receipt"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setUploadedFile(file)
                      }
                    }}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                  {uploadedFile && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {uploadedFile.name}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Images (JPG, PNG, WebP) ou PDF - Max 10MB
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={submitting || uploading}
                className={justSaved ? 'animate-flash-green' : ''}
              >
                {uploading ? 'Upload en cours...' : submitting ? 'Création...' : 'Créer la dépense'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

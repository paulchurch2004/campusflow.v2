'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Package,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface InventoryItem {
  id: string
  name: string
  description?: string
  category: string
  quantity: number
  unit: string
  location?: string
  threshold?: number
  supplierId?: string
  unitPrice?: number
  totalValue?: number
  lastRestocked?: string
  expiryDate?: string
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED'
  notes?: string
  createdAt: string
  supplier?: {
    id: string
    name: string
    contact?: string
    email?: string
  }
}

interface Supplier {
  id: string
  name: string
}

const categories = [
  { value: 'matériel', label: 'Matériel' },
  { value: 'nourriture', label: 'Nourriture' },
  { value: 'boisson', label: 'Boisson' },
  { value: 'décoration', label: 'Décoration' },
  { value: 'électronique', label: 'Électronique' },
  { value: 'papeterie', label: 'Papeterie' },
  { value: 'autre', label: 'Autre' },
]

const units = [
  { value: 'unité', label: 'Unité' },
  { value: 'kg', label: 'Kilogramme (kg)' },
  { value: 'g', label: 'Gramme (g)' },
  { value: 'L', label: 'Litre (L)' },
  { value: 'mL', label: 'Millilitre (mL)' },
  { value: 'm', label: 'Mètre (m)' },
  { value: 'cm', label: 'Centimètre (cm)' },
  { value: 'boîte', label: 'Boîte' },
  { value: 'paquet', label: 'Paquet' },
]

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity: '',
    unit: 'unité',
    location: '',
    threshold: '',
    supplierId: 'none',
    unitPrice: '',
    lastRestocked: '',
    expiryDate: '',
    notes: '',
  })

  useEffect(() => {
    fetchItems()
    fetchSuppliers()
  }, [])

  useEffect(() => {
    let filtered = items

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((item) => item.category === categoryFilter)
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    setFilteredItems(filtered)
  }, [items, searchQuery, categoryFilter, statusFilter])

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/inventory')
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Failed to fetch inventory items:', error)
      toast.error('Erreur lors du chargement de l\'inventaire')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data)
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
    }
  }

  const handleOpenDialog = (item?: InventoryItem) => {
    if (item) {
      setIsEditing(true)
      setCurrentItem(item)
      setFormData({
        name: item.name,
        description: item.description || '',
        category: item.category,
        quantity: item.quantity.toString(),
        unit: item.unit,
        location: item.location || '',
        threshold: item.threshold?.toString() || '',
        supplierId: item.supplierId || 'none',
        unitPrice: item.unitPrice?.toString() || '',
        lastRestocked: item.lastRestocked ? format(new Date(item.lastRestocked), 'yyyy-MM-dd') : '',
        expiryDate: item.expiryDate ? format(new Date(item.expiryDate), 'yyyy-MM-dd') : '',
        notes: item.notes || '',
      })
    } else {
      setIsEditing(false)
      setCurrentItem(null)
      setFormData({
        name: '',
        description: '',
        category: '',
        quantity: '',
        unit: 'unité',
        location: '',
        threshold: '',
        supplierId: 'none',
        unitPrice: '',
        lastRestocked: '',
        expiryDate: '',
        notes: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = isEditing ? `/api/inventory/${currentItem?.id}` : '/api/inventory'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          category: formData.category,
          quantity: parseInt(formData.quantity),
          unit: formData.unit,
          location: formData.location || null,
          threshold: formData.threshold ? parseInt(formData.threshold) : null,
          supplierId: formData.supplierId && formData.supplierId !== 'none' ? formData.supplierId : null,
          unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : null,
          lastRestocked: formData.lastRestocked || null,
          expiryDate: formData.expiryDate || null,
          notes: formData.notes || null,
        }),
      })

      if (response.ok) {
        toast.success(isEditing ? 'Article modifié avec succès' : 'Article ajouté avec succès')
        setIsDialogOpen(false)
        fetchItems()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Une erreur est survenue')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return
    }

    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Article supprimé avec succès')
        fetchItems()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const getStatusBadge = (status: string, quantity: number, threshold?: number) => {
    switch (status) {
      case 'OUT_OF_STOCK':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rupture
          </Badge>
        )
      case 'LOW_STOCK':
        return (
          <Badge variant="outline" className="flex items-center gap-1 border-amber-500 text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            Stock bas
          </Badge>
        )
      case 'EXPIRED':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Expiré
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-600">
            <CheckCircle className="h-3 w-3" />
            En stock
          </Badge>
        )
    }
  }

  const stats = {
    total: items.length,
    inStock: items.filter((i) => i.status === 'IN_STOCK').length,
    lowStock: items.filter((i) => i.status === 'LOW_STOCK').length,
    outOfStock: items.filter((i) => i.status === 'OUT_OF_STOCK').length,
    totalValue: items.reduce((acc, item) => acc + (item.totalValue || 0), 0),
  }

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de l'inventaire...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventaire</h1>
          <p className="mt-2 text-muted-foreground">
            Gérez vos stocks et surplus de matériel
          </p>
        </div>

        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un article
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">En stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Stock bas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.lowStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rupture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalValue.toFixed(2)} €
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Liste d'inventaire</CardTitle>
          <CardDescription>
            Recherchez et filtrez vos articles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="IN_STOCK">En stock</SelectItem>
                <SelectItem value="LOW_STOCK">Stock bas</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Rupture</SelectItem>
                <SelectItem value="EXPIRED">Expiré</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                          ? 'Aucun article trouvé avec ces filtres'
                          : 'Aucun article dans l\'inventaire'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-xs">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {item.quantity} {item.unit}
                        </span>
                        {item.threshold && (
                          <p className="text-xs text-muted-foreground">
                            Seuil: {item.threshold}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{item.location || '-'}</TableCell>
                      <TableCell>
                        {item.supplier ? (
                          <div>
                            <p className="text-sm">{item.supplier.name}</p>
                            {item.supplier.contact && (
                              <p className="text-xs text-muted-foreground">
                                {item.supplier.contact}
                              </p>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {item.totalValue ? (
                          <div>
                            <p className="font-medium">{item.totalValue.toFixed(2)} €</p>
                            {item.unitPrice && (
                              <p className="text-xs text-muted-foreground">
                                {item.unitPrice.toFixed(2)} € / {item.unit}
                              </p>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item.status, item.quantity, item.threshold)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Modifier l\'article' : 'Ajouter un article'}
            </DialogTitle>
            <DialogDescription>
              Renseignez les informations de l'article d'inventaire
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nom de l'article <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Catégorie <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    Quantité <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unité</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="threshold">Seuil d'alerte</Label>
                  <Input
                    id="threshold"
                    type="number"
                    placeholder="Quantité min."
                    value={formData.threshold}
                    onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Lieu de stockage</Label>
                  <Input
                    id="location"
                    placeholder="Ex: Salle 201, Bureau..."
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplierId">Fournisseur</Label>
                  <Select
                    value={formData.supplierId}
                    onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Prix unitaire (€)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastRestocked">Dernier réapprovisionnement</Label>
                  <Input
                    id="lastRestocked"
                    type="date"
                    value={formData.lastRestocked}
                    onChange={(e) =>
                      setFormData({ ...formData, lastRestocked: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Date d'expiration</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Informations supplémentaires..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

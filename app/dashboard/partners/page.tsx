'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Plus, Search } from 'lucide-react'
import { useSocketEvent, SOCKET_EVENTS } from '@/contexts/SocketContext'

interface Partner {
  id: string
  name: string
  description?: string
  category: string
  contact?: string
  email?: string
  phone?: string
  website?: string
  logo?: string
  status: string
  createdAt: string
}

interface PartnerFormData {
  name: string
  description: string
  category: string
  contact: string
  email: string
  phone: string
  website: string
  logo: string
  status: string
}

const CATEGORY_OPTIONS = [
  { value: 'ENTREPRISE', label: 'Entreprise' },
  { value: 'ASSOCIATION', label: 'Association' },
  { value: 'INSTITUTION', label: 'Institution' },
  { value: 'COMMERCE', label: 'Commerce' },
]

const CATEGORY_LABELS: Record<string, string> = {
  ENTREPRISE: 'Entreprise',
  ASSOCIATION: 'Association',
  INSTITUTION: 'Institution',
  COMMERCE: 'Commerce',
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [userListId, setUserListId] = useState<string | null>(null)
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    description: '',
    category: 'ENTREPRISE',
    contact: '',
    email: '',
    phone: '',
    website: '',
    logo: '',
    status: 'active',
  })

  useEffect(() => {
    fetchUserSession()
    fetchPartners()
  }, [])

  // Socket.io: Écouter les mises à jour en temps réel
  useSocketEvent(SOCKET_EVENTS.PARTNER_CREATED, (newPartner: Partner) => {
    console.log('📥 Nouveau partenaire ajouté:', newPartner)
    setPartners((prev) => [newPartner, ...prev])
    toast.success(`Nouveau partenaire: ${newPartner.name}`)
  })

  useSocketEvent(SOCKET_EVENTS.PARTNER_UPDATED, (updatedPartner: Partner) => {
    console.log('📝 Partenaire mis à jour:', updatedPartner)
    setPartners((prev) =>
      prev.map((partner) =>
        partner.id === updatedPartner.id ? updatedPartner : partner
      )
    )
  })

  useSocketEvent(SOCKET_EVENTS.PARTNER_DELETED, (data: { id: string }) => {
    console.log('🗑️ Partenaire supprimé:', data.id)
    setPartners((prev) => prev.filter((partner) => partner.id !== data.id))
    toast.success('Partenaire supprimé')
  })

  const fetchUserSession = async () => {
    try {
      const response = await fetch('/api/session')
      if (response.ok) {
        const user = await response.json()
        setUserListId(user.listId || 'default-list')
      }
    } catch (error) {
      console.error('Error fetching user session:', error)
      setUserListId('default-list')
    }
  }

  const fetchPartners = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/partners')
      if (!response.ok) throw new Error('Failed to fetch partners')
      const data = await response.json()
      setPartners(data)
    } catch (error) {
      toast.error('Erreur lors du chargement des partenaires')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (partner?: Partner) => {
    if (partner) {
      setEditingPartner(partner)
      setFormData({
        name: partner.name,
        description: partner.description || '',
        category: partner.category,
        contact: partner.contact || '',
        email: partner.email || '',
        phone: partner.phone || '',
        website: partner.website || '',
        logo: partner.logo || '',
        status: partner.status,
      })
    } else {
      setEditingPartner(null)
      setFormData({
        name: '',
        description: '',
        category: 'ENTREPRISE',
        contact: '',
        email: '',
        phone: '',
        website: '',
        logo: '',
        status: 'active',
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingPartner(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.category) {
      toast.error('Le nom et la catégorie sont obligatoires')
      return
    }

    setIsSaving(true)
    try {
      const url = editingPartner ? `/api/partners/${editingPartner.id}` : '/api/partners'
      const method = editingPartner ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          category: formData.category,
          contact: formData.contact || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          website: formData.website || undefined,
          logo: formData.logo || undefined,
          status: formData.status,
          listId: userListId || 'default-list',
        }),
      })

      if (!response.ok) throw new Error('Failed to save partner')

      toast.success(editingPartner ? 'Partenaire mis à jour' : 'Partenaire créé')
      setJustSaved(true)
      setTimeout(() => {
        setJustSaved(false)
        handleCloseDialog()
        fetchPartners()
      }, 1000)
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (partnerId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) return

    try {
      const response = await fetch(`/api/partners/${partnerId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete partner')

      toast.success('Partenaire supprimé')
      fetchPartners()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
      console.error(error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const filteredPartners = partners
    .filter(partner => categoryFilter === 'ALL' || partner.category === categoryFilter)
    .filter(partner =>
      searchQuery === '' ||
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.contact?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Partenaires</h1>
          <p className="text-muted-foreground">
            Gérez vos partenaires et collaborations
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau partenaire
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={categoryFilter === 'ALL' ? 'default' : 'outline'}
            onClick={() => setCategoryFilter('ALL')}
          >
            Tous
          </Button>
          {CATEGORY_OPTIONS.map(category => (
            <Button
              key={category.value}
              variant={categoryFilter === category.value ? 'default' : 'outline'}
              onClick={() => setCategoryFilter(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, contact ou email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : filteredPartners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">Aucun partenaire trouvé</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partenaire</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners.map(partner => (
                <TableRow key={partner.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {partner.logo && (
                          <AvatarImage src={partner.logo} alt={partner.name} />
                        )}
                        <AvatarFallback>
                          {getInitials(partner.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{partner.name}</p>
                        {partner.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {partner.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {CATEGORY_LABELS[partner.category] || partner.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {partner.contact || '-'}
                  </TableCell>
                  <TableCell>
                    {partner.email ? (
                      <a
                        href={`mailto:${partner.email}`}
                        className="text-primary hover:underline"
                      >
                        {partner.email}
                      </a>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={partner.status === 'active' ? 'success' : 'secondary'}>
                      {partner.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(partner)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(partner.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPartner ? 'Modifier le partenaire' : 'Nouveau partenaire'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations du partenaire
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Nom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Décrivez le partenaire..."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">
                  Catégorie <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={value => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="Nom du contact"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@exemple.fr"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://exemple.fr"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="logo">URL du logo</Label>
                <Input
                  id="logo"
                  type="url"
                  value={formData.logo}
                  onChange={e => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://exemple.fr/logo.png"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={value => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSaving}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className={justSaved ? 'animate-flash-green' : ''}
              >
                {isSaving ? 'Enregistrement...' : editingPartner ? 'Mettre à jour' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

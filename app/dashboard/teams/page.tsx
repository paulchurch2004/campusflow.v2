'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { usePermissions } from '@/hooks/usePermissions'
import { useToast } from '@/hooks/use-toast'
import { Edit, Trash2, Plus, Search } from 'lucide-react'
import { useSocketEvent, SOCKET_EVENTS } from '@/contexts/SocketContext'

type Role = 'PRESIDENT' | 'VICE_PRESIDENT' | 'TREASURER' | 'SECRETARY' | 'POLE_LEADER' | 'MEMBER' | 'RTI' | 'COMMUNICATION' | 'DEMARCHAGE' | 'ANIMATION' | 'EVENEMENT' | 'LOGISTIQUE' | 'POLE_LEADER_COM' | 'POLE_LEADER_LOG' | 'POLE_LEADER_EVENT' | 'POLE_LEADER_ANIMATION' | 'POLE_LEADER_DEMARCHAGE' | 'POLE_LEADER_RTI'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: Role
}

interface MemberFormData {
  name: string
  email: string
  phone: string
  password: string
  role: Role
}

const roleLabels: Record<Role, string> = {
  PRESIDENT: 'Président',
  VICE_PRESIDENT: 'Vice-président',
  TREASURER: 'Trésorier',
  SECRETARY: 'Secrétaire',
  POLE_LEADER: 'Chef de pôle',
  MEMBER: 'Membre',
  RTI: 'RTI',
  COMMUNICATION: 'Communication',
  DEMARCHAGE: 'Démarchage',
  ANIMATION: 'Animation',
  EVENEMENT: 'Événement',
  LOGISTIQUE: 'Logistique',
  POLE_LEADER_COM: 'Chef de pôle Communication',
  POLE_LEADER_LOG: 'Chef de pôle Logistique',
  POLE_LEADER_EVENT: 'Chef de pôle Événement',
  POLE_LEADER_ANIMATION: 'Chef de pôle Animation',
  POLE_LEADER_DEMARCHAGE: 'Chef de pôle Démarchage',
  POLE_LEADER_RTI: 'Chef de pôle RTI',
}

const roleColors: Record<Role, string> = {
  PRESIDENT: 'bg-purple-500',
  VICE_PRESIDENT: 'bg-blue-500',
  TREASURER: 'bg-green-500',
  SECRETARY: 'bg-yellow-500',
  POLE_LEADER: 'bg-orange-500',
  MEMBER: 'bg-gray-500',
  RTI: 'bg-indigo-500',
  COMMUNICATION: 'bg-pink-500',
  DEMARCHAGE: 'bg-teal-500',
  ANIMATION: 'bg-rose-500',
  EVENEMENT: 'bg-violet-500',
  LOGISTIQUE: 'bg-cyan-500',
  POLE_LEADER_COM: 'bg-pink-600',
  POLE_LEADER_LOG: 'bg-cyan-600',
  POLE_LEADER_EVENT: 'bg-violet-600',
  POLE_LEADER_ANIMATION: 'bg-rose-600',
  POLE_LEADER_DEMARCHAGE: 'bg-teal-600',
  POLE_LEADER_RTI: 'bg-indigo-600',
}

export default function TeamsPage() {
  const [members, setMembers] = useState<User[]>([])
  const [filteredMembers, setFilteredMembers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL')
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'MEMBER',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const { canEdit, canDelete } = usePermissions()
  const { toast } = useToast()

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [members, searchQuery, roleFilter])

  // Socket.io: Écouter les mises à jour en temps réel
  useSocketEvent(SOCKET_EVENTS.TEAM_MEMBER_ADDED, (newMember: User) => {
    console.log('📥 Nouveau membre ajouté:', newMember)
    setMembers((prev) => [...prev, newMember])
    toast({
      title: 'Nouveau membre',
      description: `${newMember.name} a été ajouté à l'équipe`,
    })
  })

  useSocketEvent(SOCKET_EVENTS.TEAM_MEMBER_UPDATED, (updatedMember: User) => {
    console.log('📝 Membre mis à jour:', updatedMember)
    setMembers((prev) =>
      prev.map((member) =>
        member.id === updatedMember.id ? updatedMember : member
      )
    )
  })

  useSocketEvent(SOCKET_EVENTS.TEAM_MEMBER_REMOVED, (data: { id: string }) => {
    console.log('🗑️ Membre supprimé:', data.id)
    setMembers((prev) => prev.filter((member) => member.id !== data.id))
    toast({
      title: 'Membre supprimé',
      description: 'Un membre a été retiré de l\'équipe',
    })
  })

  const fetchMembers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Failed to fetch members')
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les membres',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterMembers = () => {
    let filtered = members

    if (roleFilter !== 'ALL') {
      filtered = filtered.filter((member) => member.role === roleFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query)
      )
    }

    setFilteredMembers(filtered)
  }

  const handleOpenDialog = (member?: User) => {
    if (member) {
      setEditingMember(member)
      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone || '',
        password: '',
        role: member.role,
      })
    } else {
      setEditingMember(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'MEMBER',
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingMember(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'MEMBER',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email) {
      toast({
        title: 'Erreur',
        description: 'Le nom et l\'email sont requis',
        variant: 'destructive',
      })
      return
    }

    if (!editingMember && !formData.password) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe est requis pour un nouveau membre',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSaving(true)
      const url = editingMember ? `/api/users/${editingMember.id}` : '/api/users'
      const method = editingMember ? 'PUT' : 'POST'

      const body: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        role: formData.role,
      }

      if (formData.password) {
        body.password = formData.password
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error('Failed to save member')

      toast({
        title: 'Succès',
        description: editingMember
          ? 'Membre mis à jour avec succès'
          : 'Membre ajouté avec succès',
        variant: 'success',
      })

      setJustSaved(true)
      setTimeout(() => {
        setJustSaved(false)
        handleCloseDialog()
        fetchMembers()
      }, 1000)
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le membre',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) return

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete member')

      toast({
        title: 'Succès',
        description: 'Membre supprimé avec succès',
        variant: 'success',
      })

      fetchMembers()
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le membre',
        variant: 'destructive',
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Équipe</h1>
          <p className="text-muted-foreground">
            Gérez les membres de votre équipe
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un membre
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(value) => setRoleFilter(value as Role | 'ALL')}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les rôles</SelectItem>
            <SelectItem value="PRESIDENT">Président</SelectItem>
            <SelectItem value="VICE_PRESIDENT">Vice-président</SelectItem>
            <SelectItem value="TREASURER">Trésorier</SelectItem>
            <SelectItem value="SECRETARY">Secrétaire</SelectItem>
            <SelectItem value="POLE_LEADER">Chef de pôle</SelectItem>
            <SelectItem value="RTI">RTI</SelectItem>
            <SelectItem value="COMMUNICATION">Communication</SelectItem>
            <SelectItem value="DEMARCHAGE">Démarchage</SelectItem>
            <SelectItem value="ANIMATION">Animation</SelectItem>
            <SelectItem value="EVENEMENT">Événement</SelectItem>
            <SelectItem value="LOGISTIQUE">Logistique</SelectItem>
            <SelectItem value="POLE_LEADER_COM">Chef de pôle Communication</SelectItem>
            <SelectItem value="POLE_LEADER_LOG">Chef de pôle Logistique</SelectItem>
            <SelectItem value="POLE_LEADER_EVENT">Chef de pôle Événement</SelectItem>
            <SelectItem value="POLE_LEADER_ANIMATION">Chef de pôle Animation</SelectItem>
            <SelectItem value="POLE_LEADER_DEMARCHAGE">Chef de pôle Démarchage</SelectItem>
            <SelectItem value="POLE_LEADER_RTI">Chef de pôle RTI</SelectItem>
            <SelectItem value="MEMBER">Membre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Aucun membre trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={roleColors[member.role]}>
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <Badge className={`${roleColors[member.role]} text-white mt-1`}>
                      {roleLabels[member.role]}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Email: </span>
                  <span className="break-all">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Tél: </span>
                    <span>{member.phone}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(member)}
                    className="flex-1"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(member.id)}
                    className="flex-1"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Member Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? 'Modifier le membre' : 'Ajouter un membre'}
            </DialogTitle>
            <DialogDescription>
              {editingMember
                ? 'Modifiez les informations du membre'
                : 'Ajoutez un nouveau membre à votre équipe'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Jean Dupont"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="jean.dupont@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Mot de passe{' '}
                  {!editingMember && (
                    <span className="text-destructive">*</span>
                  )}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={
                    editingMember
                      ? 'Laisser vide pour ne pas changer'
                      : 'Mot de passe'
                  }
                  required={!editingMember}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">
                  Rôle <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value as Role })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESIDENT">Président</SelectItem>
                    <SelectItem value="VICE_PRESIDENT">
                      Vice-président
                    </SelectItem>
                    <SelectItem value="TREASURER">Trésorier</SelectItem>
                    <SelectItem value="SECRETARY">Secrétaire</SelectItem>
                    <SelectItem value="POLE_LEADER">Chef de pôle</SelectItem>
                    <SelectItem value="RTI">RTI</SelectItem>
                    <SelectItem value="COMMUNICATION">Communication</SelectItem>
                    <SelectItem value="DEMARCHAGE">Démarchage</SelectItem>
                    <SelectItem value="ANIMATION">Animation</SelectItem>
                    <SelectItem value="EVENEMENT">Événement</SelectItem>
                    <SelectItem value="LOGISTIQUE">Logistique</SelectItem>
                    <SelectItem value="POLE_LEADER_COM">Chef de pôle Communication</SelectItem>
                    <SelectItem value="POLE_LEADER_LOG">Chef de pôle Logistique</SelectItem>
                    <SelectItem value="POLE_LEADER_EVENT">Chef de pôle Événement</SelectItem>
                    <SelectItem value="POLE_LEADER_ANIMATION">Chef de pôle Animation</SelectItem>
                    <SelectItem value="POLE_LEADER_DEMARCHAGE">Chef de pôle Démarchage</SelectItem>
                    <SelectItem value="POLE_LEADER_RTI">Chef de pôle RTI</SelectItem>
                    <SelectItem value="MEMBER">Membre</SelectItem>
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
                {isSaving
                  ? 'Enregistrement...'
                  : editingMember
                  ? 'Mettre à jour'
                  : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Download,
  Trash2,
  Filter,
  Search,
  Plus,
  File,
  FileImage,
  Calendar,
  User,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileUpload } from '@/components/file-upload'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Document {
  id: string
  name: string
  fileName: string
  fileUrl: string
  mimeType: string
  fileSize: number
  category: string
  description?: string
  createdAt: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  expense?: {
    id: string
    description: string
    amount: number
  }
  event?: {
    id: string
    name: string
    date: string
  }
  partner?: {
    id: string
    name: string
  }
}

interface User {
  id: string
  listId: string
}

const categoryLabels: Record<string, string> = {
  invoice: 'Facture',
  contract: 'Contrat',
  photo: 'Photo',
  other: 'Autre',
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return FileImage
  return FileText
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUser()
    fetchDocuments()
  }, [])

  useEffect(() => {
    filterDocuments()
  }, [documents, searchQuery, categoryFilter])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/session')
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/documents')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Erreur lors du chargement des documents')
    } finally {
      setLoading(false)
    }
  }

  const filterDocuments = () => {
    let filtered = documents

    if (searchQuery) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((doc) => doc.category === categoryFilter)
    }

    setFilteredDocuments(filtered)
  }

  const handleUploadComplete = async (uploadedFiles: any[]) => {
    if (!user) return

    try {
      for (const file of uploadedFiles) {
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...file,
            category: 'other',
            listId: user.listId,
            uploadedBy: user.id,
          }),
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la création du document')
        }
      }

      toast.success('Documents créés avec succès')
      setIsUploadOpen(false)
      fetchDocuments()
    } catch (error) {
      console.error('Error creating documents:', error)
      toast.error('Erreur lors de la création des documents')
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Document supprimé avec succès')
        fetchDocuments()
      } else {
        throw new Error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Erreur lors de la suppression du document')
    }
  }

  const handleDownload = (document: Document) => {
    window.open(document.fileUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Gérez tous vos fichiers et documents
          </p>
        </div>

        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter des documents
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter des documents</DialogTitle>
              <DialogDescription>
                Uploadez vos fichiers (max 10MB par fichier)
              </DialogDescription>
            </DialogHeader>
            <FileUpload onUploadComplete={handleUploadComplete} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
              <File className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{documents.length}</p>
              <p className="text-xs text-muted-foreground">Total documents</p>
            </div>
          </div>
        </Card>

        {Object.entries(categoryLabels).slice(0, 3).map(([key, label]) => {
          const count = documents.filter((doc) => doc.category === key).length
          return (
            <Card key={key} className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{label}s</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <File className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Aucun document trouvé</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery || categoryFilter !== 'all'
              ? 'Essayez de modifier vos filtres'
              : 'Commencez par ajouter des documents'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredDocuments.map((document, index) => {
              const Icon = getFileIcon(document.mimeType)
              return (
                <motion.div
                  key={document.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group overflow-hidden transition-all hover:shadow-lg">
                    {/* Preview */}
                    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                      {document.mimeType.startsWith('image/') ? (
                        <img
                          src={document.fileUrl}
                          alt={document.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Icon className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}

                      {/* Actions Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownload(document)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDelete(document.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="font-semibold truncate">{document.name}</h3>
                        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {categoryLabels[document.category]}
                        </span>
                      </div>

                      {document.description && (
                        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                          {document.description}
                        </p>
                      )}

                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>{document.user.name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(document.createdAt), 'dd MMM yyyy', {
                              locale: fr,
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <File className="h-3 w-3" />
                          <span>{formatFileSize(document.fileSize)}</span>
                        </div>

                        {document.expense && (
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <ExternalLink className="h-3 w-3" />
                            <span>
                              Dépense: {document.expense.description} (
                              {document.expense.amount}€)
                            </span>
                          </div>
                        )}

                        {document.event && (
                          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                            <ExternalLink className="h-3 w-3" />
                            <span>Événement: {document.event.name}</span>
                          </div>
                        )}

                        {document.partner && (
                          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                            <ExternalLink className="h-3 w-3" />
                            <span>Partenaire: {document.partner.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

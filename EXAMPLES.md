# Exemples d'utilisation - Documents & Notifications

## Upload de fichiers

### Exemple 1: Upload simple dans un formulaire

```tsx
'use client'

import { useState } from 'react'
import { FileUpload } from '@/components/file-upload'
import { toast } from 'sonner'

export function MyForm() {
  const [user, setUser] = useState(null)

  const handleUpload = async (uploadedFiles) => {
    try {
      for (const file of uploadedFiles) {
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...file,
            category: 'invoice',
            listId: user.listId,
            uploadedBy: user.id,
          }),
        })

        if (!response.ok) throw new Error('Erreur upload')
      }

      toast.success('Documents uploadés avec succès')
    } catch (error) {
      toast.error('Erreur lors de l\'upload')
    }
  }

  return (
    <div>
      <h2>Ajouter des factures</h2>
      <FileUpload onUploadComplete={handleUpload} />
    </div>
  )
}
```

### Exemple 2: Upload lié à une dépense

```tsx
'use client'

import { FileUpload } from '@/components/file-upload'

export function ExpenseForm({ expense, user }) {
  const handleDocumentUpload = async (files) => {
    for (const file of files) {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          fileName: file.fileName,
          fileUrl: file.fileUrl,
          mimeType: file.mimeType,
          fileSize: file.fileSize,
          category: 'invoice',
          description: `Facture pour ${expense.description}`,
          expenseId: expense.id,
          listId: user.listId,
          uploadedBy: user.id,
        }),
      })
    }
  }

  return (
    <div>
      <h3>Ajouter des justificatifs</h3>
      <FileUpload
        onUploadComplete={handleDocumentUpload}
        maxFiles={3}
        accept={['image/jpeg', 'image/png', 'application/pdf']}
      />
    </div>
  )
}
```

### Exemple 3: Upload avec preview personnalisé

```tsx
'use client'

import { useState } from 'react'
import { FileUpload } from '@/components/file-upload'

export function EventPhotos({ event }) {
  const [documents, setDocuments] = useState([])

  const handleUpload = async (files) => {
    const newDocs = await Promise.all(
      files.map(file =>
        fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...file,
            category: 'photo',
            eventId: event.id,
            listId: event.listId,
            uploadedBy: user.id,
          }),
        }).then(r => r.json())
      )
    )
    setDocuments(prev => [...prev, ...newDocs])
  }

  return (
    <div>
      <FileUpload onUploadComplete={handleUpload} />

      <div className="grid grid-cols-3 gap-4 mt-4">
        {documents.map(doc => (
          <img
            key={doc.id}
            src={doc.fileUrl}
            alt={doc.name}
            className="rounded-lg"
          />
        ))}
      </div>
    </div>
  )
}
```

## Notifications

### Exemple 1: Créer une notification simple

```tsx
import { createNotification } from '@/lib/notifications'

// Dans votre API route
export async function POST(request: NextRequest) {
  // ... logique de création ...

  await createNotification({
    type: 'success',
    title: 'Opération réussie',
    message: 'Votre action a été effectuée avec succès',
    userId: user.id,
  })

  return NextResponse.json({ success: true })
}
```

### Exemple 2: Notifier lors d'une création de dépense

```tsx
import { notifyTreasurers } from '@/lib/notifications'

// Dans /app/api/expenses/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { description, amount, userId, listId } = body

  const expense = await prisma.expense.create({
    data: { ...body },
    include: { user: true }
  })

  // Notifier les trésoriers
  await notifyTreasurers(listId, {
    type: 'expense',
    title: 'Nouvelle dépense à valider',
    message: `${expense.user.name} a créé une dépense de ${amount}€`,
    relatedId: expense.id,
    relatedType: 'expense',
  })

  return NextResponse.json(expense)
}
```

### Exemple 3: Notifier lors de la validation d'une dépense

```tsx
import { createExpenseNotification } from '@/lib/notifications'

// Dans /app/api/expenses/[id]/route.ts
export async function PUT(request: NextRequest, { params }) {
  const body = await request.json()
  const { status } = body

  const expense = await prisma.expense.update({
    where: { id: params.id },
    data: { status },
    include: { user: true }
  })

  // Notifier selon le nouveau statut
  if (status === 'APPROVED') {
    await createExpenseNotification(expense, 'approved', expense.userId)
  } else if (status === 'REJECTED') {
    await createExpenseNotification(expense, 'rejected', expense.userId)
  }

  return NextResponse.json(expense)
}
```

### Exemple 4: Notifier tous les membres pour un événement

```tsx
import { notifyAllMembers } from '@/lib/notifications'

// Dans /app/api/events/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, listId } = body

  const event = await prisma.event.create({
    data: { ...body }
  })

  // Notifier tous les membres
  await notifyAllMembers(listId, {
    type: 'event',
    title: 'Nouvel événement',
    message: `L'événement "${name}" vient d'être créé`,
    relatedId: event.id,
    relatedType: 'event',
  })

  return NextResponse.json(event)
}
```

### Exemple 5: Notification avec lien personnalisé

```tsx
import { createNotification } from '@/lib/notifications'

// Notification pour un commentaire
await createNotification({
  type: 'comment',
  title: 'Nouveau commentaire',
  message: `${user.name} a commenté votre publication`,
  userId: targetUserId,
  relatedId: post.id,
  relatedType: 'post', // Personnalisez selon votre besoin
})

// Le NotificationCenter gère automatiquement le lien
// Ajoutez un case dans getNotificationLink() si besoin
```

### Exemple 6: Utiliser le hook dans un composant

```tsx
'use client'

import { useNotifications } from '@/hooks/useNotifications'
import { useEffect, useState } from 'react'

export function MyComponent() {
  const [user, setUser] = useState(null)

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    deleteNotification,
  } = useNotifications(user?.id)

  useEffect(() => {
    // Afficher un toast pour les nouvelles notifications
    if (unreadCount > 0 && !loading) {
      // Logique personnalisée
    }
  }, [unreadCount, loading])

  return (
    <div>
      <h3>Vous avez {unreadCount} notifications</h3>
      {notifications.map(notif => (
        <div key={notif.id}>
          <p>{notif.message}</p>
          <button onClick={() => markAsRead(notif.id)}>
            Marquer comme lu
          </button>
        </div>
      ))}
    </div>
  )
}
```

## Récupération de documents

### Exemple 1: Récupérer tous les documents d'une dépense

```tsx
'use client'

import { useEffect, useState } from 'react'

export function ExpenseDocuments({ expenseId }) {
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    fetch(`/api/documents?expenseId=${expenseId}`)
      .then(r => r.json())
      .then(setDocuments)
  }, [expenseId])

  return (
    <div>
      <h3>Documents attachés</h3>
      {documents.map(doc => (
        <a
          key={doc.id}
          href={doc.fileUrl}
          target="_blank"
          className="flex items-center gap-2"
        >
          {doc.name} ({doc.fileSize} bytes)
        </a>
      ))}
    </div>
  )
}
```

### Exemple 2: Supprimer un document

```tsx
const handleDelete = async (documentId) => {
  if (!confirm('Supprimer ce document?')) return

  try {
    const response = await fetch(`/api/documents/${documentId}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      toast.success('Document supprimé')
      // Rafraîchir la liste
      fetchDocuments()
    }
  } catch (error) {
    toast.error('Erreur lors de la suppression')
  }
}
```

## Patterns avancés

### Pattern 1: Upload avec validation métier

```tsx
const handleUpload = async (files) => {
  // Validation côté client
  const totalSize = files.reduce((acc, f) => acc + f.fileSize, 0)
  if (totalSize > 50 * 1024 * 1024) {
    toast.error('Total trop grand (max 50MB)')
    return
  }

  // Upload
  for (const file of files) {
    await createDocument(file)
  }
}
```

### Pattern 2: Notification en masse avec filtrage

```tsx
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

// Notifier uniquement les membres d'un pôle spécifique
async function notifyPoleMembers(poleId: string, notification) {
  const pole = await prisma.pole.findUnique({
    where: { id: poleId },
    include: {
      list: {
        include: {
          members: {
            // Filtrer par rôle si besoin
            where: { role: { in: ['POLE_LEADER', 'MEMBER'] } }
          }
        }
      }
    }
  })

  const promises = pole.list.members.map(member =>
    createNotification({
      ...notification,
      userId: member.id,
    })
  )

  return Promise.all(promises)
}
```

### Pattern 3: Gestion d'erreur complète

```tsx
const uploadWithErrorHandling = async (files) => {
  const results = []
  const errors = []

  for (const file of files) {
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: JSON.stringify({...file, ...metadata})
      })

      if (response.ok) {
        results.push(await response.json())
      } else {
        const error = await response.json()
        errors.push({ file: file.name, error: error.message })
      }
    } catch (err) {
      errors.push({ file: file.name, error: err.message })
    }
  }

  if (results.length > 0) {
    toast.success(`${results.length} fichiers uploadés`)
  }

  if (errors.length > 0) {
    console.error('Upload errors:', errors)
    toast.error(`${errors.length} fichiers ont échoué`)
  }

  return { results, errors }
}
```

## Bonnes pratiques

### Upload
1. Toujours valider la taille et le type côté serveur
2. Générer des noms de fichiers uniques
3. Vérifier les permissions de l'utilisateur
4. Gérer les erreurs proprement
5. Afficher un feedback visuel

### Notifications
1. Éviter le spam (grouper les notifications similaires)
2. Utiliser des messages clairs et concis
3. Toujours inclure relatedId et relatedType
4. Nettoyer les anciennes notifications régulièrement
5. Permettre aux utilisateurs de configurer leurs préférences

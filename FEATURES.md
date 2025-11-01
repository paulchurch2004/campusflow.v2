# Nouvelles fonctionnalités CampusFlow

## 1. Système d'upload de fichiers

### Modèle de données
Le modèle `Document` a été ajouté au schéma Prisma avec les champs suivants:
- `id`, `name`, `fileName`, `fileUrl`, `mimeType`, `fileSize`
- `category`: "invoice", "contract", "photo", "other"
- `description`: Description optionnelle
- Relations: `expense`, `event`, `partner`, `list`, `user`

### API Routes

#### Upload de fichiers
- **POST** `/api/upload`
  - Accepte FormData avec des fichiers
  - Taille max: 10MB par fichier
  - Formats acceptés: Images, PDF, Word, Excel, CSV
  - Retourne les informations des fichiers uploadés

#### Gestion des documents
- **GET** `/api/documents`
  - Query params: `listId`, `category`, `expenseId`, `eventId`, `partnerId`
  - Retourne la liste des documents avec relations

- **POST** `/api/documents`
  - Crée une entrée document dans la base de données
  - Champs requis: `name`, `fileName`, `fileUrl`, `mimeType`, `fileSize`, `category`, `listId`, `uploadedBy`

- **GET** `/api/documents/[id]`
  - Récupère un document spécifique avec toutes ses relations

- **DELETE** `/api/documents/[id]`
  - Supprime le document de la base de données ET le fichier physique

### Composant FileUpload
`/components/file-upload.tsx`

Fonctionnalités:
- Drag & drop zone
- Bouton de parcours de fichiers
- Preview des images avant upload
- Barre de progression
- Support multi-fichiers
- Validation automatique (taille, type)
- Messages d'erreur et de succès
- Animations fluides

Utilisation:
```tsx
import { FileUpload } from '@/components/file-upload'

<FileUpload
  onUploadComplete={(files) => {
    // Traiter les fichiers uploadés
  }}
  maxFiles={5}
  maxSize={10 * 1024 * 1024}
/>
```

### Page de gestion
`/app/dashboard/documents/page.tsx`

Fonctionnalités:
- Grille de documents avec previews
- Recherche par nom/description
- Filtrage par catégorie
- Statistiques (total, par catégorie)
- Actions: télécharger, supprimer
- Liens vers ressources liées (dépense, événement, partenaire)

### Intégration recommandée

#### Dans ExpenseForm
```tsx
<FileUpload
  onUploadComplete={async (files) => {
    for (const file of files) {
      await fetch('/api/documents', {
        method: 'POST',
        body: JSON.stringify({
          ...file,
          category: 'invoice',
          expenseId: expense.id,
          listId: user.listId,
          uploadedBy: user.id,
        })
      })
    }
  }}
/>
```

#### Dans EventForm
```tsx
<FileUpload
  onUploadComplete={async (files) => {
    for (const file of files) {
      await fetch('/api/documents', {
        method: 'POST',
        body: JSON.stringify({
          ...file,
          category: 'photo',
          eventId: event.id,
          listId: user.listId,
          uploadedBy: user.id,
        })
      })
    }
  }}
/>
```

---

## 2. Centre de notifications

### Modèle de données
Le modèle `Notification` existe déjà avec:
- `type`, `title`, `message`, `read`
- `userId`, `relatedId`, `relatedType`
- `createdAt`

### API Routes améliorée
`/app/api/notifications/route.ts`

- **GET** `/api/notifications?userId={userId}`
  - Récupère les notifications d'un utilisateur
  - Triées par: non lues d'abord, puis plus récentes

- **POST** `/api/notifications`
  - Crée une nouvelle notification
  - Champs requis: `type`, `title`, `message`, `userId`

- **PUT** `/api/notifications`
  - Marque une notification comme lue/non lue
  - Body: `{ id, read: true/false }`

- **DELETE** `/api/notifications`
  - Supprime une notification
  - Body: `{ id }`

### Hook useNotifications
`/hooks/useNotifications.ts`

Fonctionnalités:
- Polling automatique toutes les 30s
- Gestion du state: notifications, unreadCount, loading, error
- Fonctions: `markAsRead`, `markAllAsRead`, `deleteNotification`, `createNotification`, `refetch`

Utilisation:
```tsx
import { useNotifications } from '@/hooks/useNotifications'

const {
  notifications,
  unreadCount,
  loading,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = useNotifications(userId)
```

### Composant NotificationCenter
`/components/notification-center.tsx`

Fonctionnalités:
- Bell icon avec badge de count
- Dropdown avec liste de notifications
- Notifications non lues en surbrillance
- Actions: marquer comme lu, supprimer
- Liens vers ressources liées
- Animations et transitions fluides
- Icons colorés par type de notification
- Timestamps relatifs (il y a 5 min)

Types de notifications:
- `expense`: Dépenses (vert)
- `event`: Événements (violet)
- `comment`: Commentaires (bleu)
- `success`: Succès (vert)
- `warning`: Avertissement (orange)
- `info`: Information (bleu)

### Intégration
Le NotificationCenter est intégré dans la sidebar:
```tsx
import { NotificationCenter } from '@/components/notification-center'

// Dans le header/sidebar
<NotificationCenter />
```

### Helpers de notifications
`/lib/notifications.ts`

Fonctions utilitaires:
- `createNotification`: Crée une notification générique
- `createExpenseNotification`: Notifications de dépenses (created, approved, rejected, paid)
- `createEventNotification`: Notifications d'événements (created, updated, cancelled)
- `createCommentNotification`: Notifications de commentaires
- `notifyTreasurers`: Notifie tous les trésoriers d'une liste
- `notifyAllMembers`: Notifie tous les membres d'une liste

Utilisation:
```tsx
import { createExpenseNotification, notifyTreasurers } from '@/lib/notifications'

// Notifier lors de l'approbation d'une dépense
await createExpenseNotification(expense, 'approved', expense.userId)

// Notifier les trésoriers d'une nouvelle dépense
await notifyTreasurers(listId, {
  type: 'expense',
  title: 'Nouvelle dépense',
  message: 'Une nouvelle dépense nécessite votre validation',
  relatedId: expense.id,
  relatedType: 'expense',
})
```

### Notifications automatiques implémentées

#### Dans l'API Expenses
1. **Création de dépense** → Notifie les trésoriers
2. **Approbation** → Notifie le demandeur
3. **Rejet** → Notifie le demandeur
4. **Paiement** → Notifie le demandeur

Pour ajouter plus de notifications:
1. Identifiez l'action (création événement, nouveau commentaire, etc.)
2. Importez la fonction appropriée de `/lib/notifications.ts`
3. Appelez-la après l'action réussie dans votre API route

Exemple:
```tsx
// Dans /app/api/events/route.ts
import { notifyAllMembers } from '@/lib/notifications'

// Après création de l'événement
await notifyAllMembers(listId, {
  type: 'event',
  title: 'Nouvel événement',
  message: `L'événement "${event.name}" a été créé`,
  relatedId: event.id,
  relatedType: 'event',
})
```

---

## Migration de la base de données

Après avoir ajouté ces fonctionnalités, exécutez:

```bash
npx prisma migrate dev --name add-documents-model
npx prisma generate
```

---

## Notes techniques

### Sécurité
- Validation des types de fichiers côté serveur
- Limite de taille stricte (10MB)
- Sanitisation des noms de fichiers
- Vérification des permissions utilisateur recommandée

### Performance
- Polling intelligent (30s pour les notifications)
- Lazy loading des previews d'images
- Pagination recommandée pour grandes listes de documents
- Indexation DB sur userId pour les notifications

### UX
- Animations fluides avec Framer Motion
- Feedback immédiat sur toutes les actions
- Messages d'erreur clairs
- States de loading visuels
- Support mobile complet

---

## Prochaines améliorations possibles

### Upload de fichiers
- [ ] Compression automatique des images
- [ ] Génération de thumbnails
- [ ] Upload vers cloud storage (S3, Cloudinary)
- [ ] Édition de métadonnées
- [ ] Partage de documents
- [ ] Versioning de documents

### Notifications
- [ ] Notifications push (avec service worker)
- [ ] Sons de notification personnalisables
- [ ] Préférences de notification par utilisateur
- [ ] Résumé quotidien par email
- [ ] Notifications de groupe
- [ ] Marquage en masse

---

## Support

Pour toute question ou problème:
1. Vérifiez que Prisma est à jour: `npx prisma generate`
2. Vérifiez les logs serveur pour les erreurs
3. Consultez la documentation des composants dans le code

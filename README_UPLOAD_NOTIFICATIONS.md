# Upload de Fichiers & Centre de Notifications - CampusFlow

## Résumé rapide

Deux fonctionnalités majeures ont été implémentées:

1. **Système d'upload et gestion de documents** - Drag & drop, preview, stockage local
2. **Centre de notifications en temps réel** - Polling, actions, types multiples

## Installation et configuration

### 1. Migration de la base de données

```bash
# Générer et appliquer la migration
npx prisma migrate dev --name add_documents_and_notifications

# Générer le client Prisma
npx prisma generate
```

### 2. Créer le dossier uploads

Le dossier a déjà été créé: `/public/uploads/`

## Utilisation rapide

### Upload de fichiers

```tsx
import { FileUpload } from '@/components/file-upload'

<FileUpload
  onUploadComplete={(files) => {
    // Traiter les fichiers uploadés
    console.log(files)
  }}
  maxFiles={5}
  maxSize={10 * 1024 * 1024} // 10MB
/>
```

### Centre de notifications

```tsx
import { NotificationCenter } from '@/components/notification-center'

// Dans votre layout/header
<NotificationCenter />
```

### Créer une notification

```tsx
import { createNotification } from '@/lib/notifications'

await createNotification({
  type: 'expense',
  title: 'Nouvelle dépense',
  message: 'Une dépense nécessite votre validation',
  userId: treasurerId,
  relatedId: expense.id,
  relatedType: 'expense',
})
```

## Structure des fichiers

```
├── app/api/
│   ├── upload/route.ts                 # API upload
│   ├── documents/route.ts              # API documents
│   ├── documents/[id]/route.ts         # API document individuel
│   └── notifications/route.ts          # API notifications
├── components/
│   ├── file-upload.tsx                 # Composant upload
│   └── notification-center.tsx         # Centre notifications
├── hooks/
│   └── useNotifications.ts             # Hook notifications
├── lib/
│   └── notifications.ts                # Helpers notifications
└── app/dashboard/
    └── documents/page.tsx              # Page gestion documents
```

## Fonctionnalités clés

### Upload de fichiers
- ✅ Drag & drop multi-fichiers
- ✅ Preview des images
- ✅ Barre de progression
- ✅ Validation taille/type
- ✅ Stockage local
- ✅ Interface de gestion complète

### Notifications
- ✅ Badge avec count
- ✅ Dropdown avec liste
- ✅ Polling automatique (30s)
- ✅ Marquer comme lu
- ✅ Supprimer
- ✅ Liens vers ressources
- ✅ Types colorés

## Notifications automatiques implémentées

| Action | Notification | Destinataire |
|--------|--------------|-------------|
| Nouvelle dépense | "Nouvelle dépense à valider" | Trésoriers |
| Dépense approuvée | "Dépense approuvée" | Demandeur |
| Dépense rejetée | "Dépense rejetée" | Demandeur |
| Dépense payée | "Dépense payée" | Demandeur |

## Documentation complète

- `FEATURES.md` - Documentation technique complète
- `MIGRATION_GUIDE.md` - Guide de migration
- `EXAMPLES.md` - Exemples de code

## Support

Pour toute question, consultez la documentation ou le code source commenté.

---

**Date:** 2025-10-31
**Version:** 1.0.0
**Status:** Production Ready

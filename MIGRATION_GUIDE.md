# Guide de migration - Documents & Notifications

## Étape 1: Mise à jour du schéma Prisma

Le fichier `/prisma/schema.prisma` a été mis à jour avec:

1. **Nouveau modèle Document** avec les relations vers:
   - List
   - User (uploadedBy)
   - Expense (optionnel)
   - Event (optionnel)
   - Partner (optionnel)

2. **Ajout de relations dans les modèles existants**:
   - `List.documents`
   - `User.documents`
   - `Expense.documents`
   - `Event.documents`
   - `Partner.documents`

## Étape 2: Générer et appliquer la migration

```bash
# Générer la migration
npx prisma migrate dev --name add_documents_and_improve_notifications

# Si vous rencontrez des problèmes, vous pouvez utiliser:
npx prisma db push

# Générer le client Prisma
npx prisma generate
```

## Étape 3: Vérifier la migration

```bash
# Ouvrir Prisma Studio pour vérifier
npx prisma studio
```

Vérifiez que:
- La table `documents` existe
- Les relations sont correctement créées
- Les index sont en place

## Étape 4: Créer le dossier uploads

Le dossier `/public/uploads/` a déjà été créé avec un fichier `.gitkeep`.

Permissions recommandées:
```bash
chmod 755 public/uploads
```

## Étape 5: Tester les fonctionnalités

### Test de l'upload de fichiers

1. Accédez à `/dashboard/documents`
2. Cliquez sur "Ajouter des documents"
3. Uploadez un fichier (image, PDF, etc.)
4. Vérifiez que:
   - Le fichier apparaît dans la grille
   - Le fichier physique est dans `/public/uploads/`
   - L'entrée existe dans la table `documents`

### Test des notifications

1. Créez une dépense
2. Vérifiez qu'une notification apparaît pour le trésorier
3. Approuvez/rejetez la dépense
4. Vérifiez qu'une notification apparaît pour le demandeur
5. Testez:
   - Marquer comme lu
   - Supprimer
   - Marquer tout comme lu

## Étape 6: Configuration optionnelle

### Augmenter la limite d'upload Next.js

Dans `next.config.js` (si nécessaire):
```js
module.exports = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}
```

### Configuration Vercel (si déployé)

Ajouter dans `vercel.json`:
```json
{
  "functions": {
    "app/api/upload/route.ts": {
      "maxDuration": 30
    }
  }
}
```

## Structure des fichiers créés/modifiés

### Nouveaux fichiers
```
/app/api/upload/route.ts                 # API upload de fichiers
/app/api/documents/route.ts              # API CRUD documents
/app/api/documents/[id]/route.ts         # API document individuel
/app/api/notifications/route.ts          # API notifications améliorée
/app/dashboard/documents/page.tsx        # Page gestion documents
/components/file-upload.tsx              # Composant upload
/components/notification-center.tsx      # Centre de notifications
/hooks/useNotifications.ts               # Hook notifications
/lib/notifications.ts                    # Helpers notifications
/public/uploads/.gitkeep                 # Dossier uploads
```

### Fichiers modifiés
```
/prisma/schema.prisma                    # Ajout modèle Document
/components/dashboard/sidebar.tsx        # Ajout NotificationCenter
/app/api/expenses/route.ts               # Ajout notifications
/app/api/expenses/[id]/route.ts          # Ajout notifications
/.gitignore                              # Ignore uploads
```

## Rollback (si nécessaire)

Si vous devez annuler la migration:

```bash
# Revenir à la migration précédente
npx prisma migrate resolve --rolled-back <migration-name>

# Ou réinitialiser complètement (ATTENTION: perte de données!)
npx prisma migrate reset
```

## Prochaines étapes recommandées

1. **Ajouter des notifications pour les événements**
   - Dans `/app/api/events/route.ts`
   - Utiliser `notifyAllMembers()` lors de la création

2. **Ajouter l'upload dans les formulaires**
   - ExpenseForm: upload de factures
   - EventForm: upload de photos/affiches
   - PartnerForm: upload de logo/contrat

3. **Améliorer la sécurité**
   - Vérifier les permissions avant upload
   - Vérifier les permissions avant suppression
   - Scanner les fichiers (antivirus)

4. **Optimisations**
   - Compression des images
   - Génération de thumbnails
   - Upload vers cloud storage

## Support

En cas de problème:

1. Vérifier les logs serveur
2. Vérifier que Prisma est à jour: `npx prisma -v`
3. Vérifier les permissions du dossier uploads
4. Consulter `FEATURES.md` pour la documentation complète

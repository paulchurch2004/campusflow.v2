# Guide Rapide - Fonctionnalités Événements

## Installation et Configuration

### 1. Installation des dépendances
Les dépendances sont déjà installées. Si nécessaire, réinstaller avec :
```bash
npm install
```

### 2. Migration de la base de données
La migration a déjà été appliquée. Si besoin de régénérer :
```bash
npx prisma db push
npx prisma generate
```

### 3. Lancer le projet
```bash
npm run dev
```

---

## Accéder aux nouvelles fonctionnalités

### Calendrier
- **URL** : `/dashboard/calendar`
- **Menu** : Sidebar > Calendrier
- **Fonctionnalités** :
  - Vue mensuelle, hebdomadaire, agenda
  - Filtrage par pôle
  - Clic sur événement pour détails
  - Double-clic pour créer événement

### Scanner de billets
- **URL** : `/dashboard/scan`
- **Utilisation** :
  1. Saisir le code QR dans le champ
  2. Appuyer sur "Valider" ou Entrée
  3. Le système affiche le résultat instantanément

### Check-in événement
- **URL** : `/dashboard/events/[id]/checkin`
- **Accès** : Depuis la page calendrier > clic sur événement > "Voir check-in"
- **Features** :
  - Stats en temps réel
  - Timeline des arrivées
  - Liste présents/absents
  - Export CSV

### Gestion des billets
- **URL** : `/dashboard/events/[id]/tickets`
- **Accès** : Depuis la page calendrier > clic sur événement > "Voir les billets"
- **Actions** :
  - Générer QR codes
  - Télécharger PDF
  - Envoyer par email
  - Imprimer tous les billets
  - Export Excel

---

## Scénario d'utilisation complet

### Étape 1 : Créer un événement
1. Aller dans `/dashboard/events`
2. Cliquer "Nouvel événement"
3. Remplir les informations :
   - Nom
   - Date et heure
   - Lieu
   - Capacité (ex: 100 personnes)
   - Prix du billet (ou 0 pour gratuit)
   - Pôle associé
4. Publier l'événement

### Étape 2 : Créer des billets
Utiliser l'API pour créer des billets :
```typescript
// POST /api/tickets
{
  "userId": "user_id_here",
  "eventId": "event_id_here",
  "listId": "list_id_here",
  "price": 5.00,
  "status": "CONFIRMED",
  "paymentStatus": "COMPLETED"
}
```

### Étape 3 : Générer les QR codes
1. Aller dans `/dashboard/events/[id]/tickets`
2. Les QR codes se génèrent automatiquement
3. Ou cliquer "Générer" pour chaque billet

### Étape 4 : Distribuer les billets
Options :
- **Email** : Cliquer sur l'icône email pour chaque participant
- **PDF** : Télécharger le PDF du billet
- **Impression** : Imprimer tous les billets en une fois

### Étape 5 : Scanner à l'entrée (jour J)
1. Ouvrir `/dashboard/scan` sur une tablette/PC
2. Pour chaque participant :
   - Scanner le QR code avec un lecteur
   - Ou saisir manuellement le code
   - Validation instantanée avec feedback visuel

### Étape 6 : Suivre en temps réel
1. Ouvrir `/dashboard/events/[id]/checkin` sur un autre écran
2. Voir les stats se mettre à jour en direct :
   - Nombre de présents
   - Taux de présence
   - Timeline des arrivées
3. Exporter les données à la fin

---

## Formats de données

### QR Code
Format : `ticketId:hash16`
Exemple : `cm3abc123def:a1b2c3d4e5f6g7h8`

### Statuts des billets
- `RESERVED` : Réservé mais non payé
- `CONFIRMED` : Confirmé et payé
- `CANCELLED` : Annulé
- `USED` : Déjà scanné à l'entrée

### Statuts des événements
- `DRAFT` : Brouillon (non visible publiquement)
- `PUBLISHED` : Publié (visible et réservable)
- `CANCELLED` : Annulé
- `COMPLETED` : Terminé

---

## API Endpoints

### Tickets
```typescript
// Récupérer tous les billets d'un événement
GET /api/tickets?eventId=[eventId]

// Créer un billet
POST /api/tickets
Body: { userId, eventId, listId, price }

// Générer QR code
POST /api/tickets/[ticketId]/qrcode

// Vérifier validité
GET /api/tickets/[ticketId]/validate

// Valider un billet
POST /api/tickets/[ticketId]/validate
Body: { validatedBy }
```

### Événements
```typescript
// Récupérer tous les événements
GET /api/events

// Récupérer un événement
GET /api/events/[eventId]

// Créer un événement
POST /api/events

// Modifier un événement
PATCH /api/events/[eventId]

// Supprimer un événement
DELETE /api/events/[eventId]
```

---

## Sécurité

### Points clés
1. Tous les endpoints nécessitent une authentification
2. Les QR codes ne peuvent pas être falsifiés (hash cryptographique)
3. Un billet ne peut être validé qu'une seule fois
4. L'historique complet est tracé (qui, quand, où)

### Validation des billets
La validation se fait en 2 étapes :
1. **Vérification** : Le billet est-il valide ?
   - Pas déjà utilisé
   - Pas annulé
   - Événement pas annulé
2. **Validation** : Marquer comme USED
   - Enregistrer timestamp
   - Enregistrer validateur
   - Impossible de re-valider

---

## Dépannage

### Le calendrier ne s'affiche pas
- Vérifier que `react-big-calendar` est installé
- Vérifier que les styles CSS sont chargés
- Vérifier la console pour les erreurs

### Les QR codes ne se génèrent pas
- Vérifier que le ticket existe en base
- Vérifier les logs de l'API
- Essayer de regénérer manuellement

### Le scanner ne fonctionne pas
- Vérifier le format du QR code (ticketId:hash)
- Vérifier que le ticket existe
- Vérifier la connexion à la base de données

### Les stats ne se mettent pas à jour
- La page check-in se rafraîchit toutes les 5 secondes
- Vérifier la connexion réseau
- Recharger la page manuellement

---

## Prochaines étapes recommandées

1. **Tester avec des données réelles** :
   - Créer un événement de test
   - Créer quelques billets
   - Tester le scan et la validation

2. **Personnaliser les emails** :
   - Créer un template d'email
   - Configurer SendGrid ou autre service

3. **Améliorer les PDF** :
   - Utiliser jsPDF pour de beaux billets
   - Ajouter le logo de l'association
   - Personnaliser le design

4. **Scanner caméra mobile** :
   - Implémenter jsQR ou @zxing/library
   - Tester sur mobile
   - Optimiser la détection

5. **Mode hors-ligne** :
   - Implémenter Service Worker
   - Stocker temporairement les validations
   - Sync quand la connexion revient

---

## Support

Pour toute question ou problème :
1. Consulter la documentation complète dans `FEATURES_EVENTS.md`
2. Vérifier les logs serveur et console
3. Vérifier l'état de la base de données avec Prisma Studio :
   ```bash
   npx prisma studio
   ```

Bon événement ! 🎉

# Fonctionnalités Événements - CampusFlow

Ce document décrit les nouvelles fonctionnalités implémentées pour la gestion des événements dans CampusFlow.

## 1. CALENDRIER VISUEL

### A. Installation
Les dépendances suivantes ont été installées :
- `react-big-calendar` : Composant calendrier React
- `date-fns` : Manipulation des dates
- `@types/react-big-calendar` : Types TypeScript

### B. Page Calendrier (`/app/dashboard/calendar/page.tsx`)
Fonctionnalités :
- **Vue calendrier mensuel** avec tous les événements
- **Vue agenda** affichant une liste chronologique
- **Vue semaine** pour un aperçu détaillé
- **Toggle entre les vues** via la toolbar
- **Clic sur événement** : Ouvre un modal avec les détails
- **Double-clic sur une date** : Redirige vers la création d'événement avec date pré-remplie
- **Filtrage par pôle** : Select dropdown pour filtrer les événements

Statistiques affichées :
- Total événements
- Événements publiés
- Brouillons
- Billets vendus

### C. Composant Calendar (`/components/calendar-view.tsx`)
Caractéristiques :
- Wrapper personnalisé de react-big-calendar
- Styling custom intégré au design system
- **Couleurs par pôle** : Chaque événement utilise la couleur de son pôle
- **Tooltips au survol** : Affichage rapide des informations
- **Badge status** : DRAFT, PUBLISHED, CANCELLED affichés visuellement
- **Badge "Complet"** : Quand la capacité est atteinte
- **Affichage nombre de participants**

### D. Navigation
Le lien "Calendrier" a été ajouté dans la sidebar sous la section "Gestion" avec :
- Icône Calendar
- Couleur indigo
- Navigation vers `/dashboard/calendar`

### E. Features
- **Bouton "Aujourd'hui"** : Retour rapide à la date actuelle
- **Navigation mois précédent/suivant** : Boutons dans la toolbar
- **Affichage responsive** : Adapté mobile/desktop
- **Localisation française** : Tous les textes en français
- **Auto-refresh** : Les données sont rechargées depuis l'API

---

## 2. QR CODES POUR ÉVÉNEMENTS

### A. Installation
Dépendances installées :
- `qrcode.react` : Génération de QR codes
- `react-to-print` : Impression de documents

### B. Base de données
Le schéma Prisma a été mis à jour pour le modèle `Ticket` :
```prisma
model Ticket {
  // ... autres champs
  qrCode        String?   @unique  // QR code unique du billet
  usedAt        DateTime?           // Date/heure de validation
  validatedBy   String?             // ID de qui a validé
}
```

### C. Génération QR Code
**Format sécurisé** : `{ticketId}:{hash16caractères}`
- Le hash est généré avec SHA256 à partir de :
  - ticketId
  - eventId
  - userId
  - timestamp

**Utilitaires** (`/lib/qrcode.ts`) :
- `generateSecureQRCode()` : Génère un code sécurisé
- `verifyQRCode()` : Vérifie l'intégrité
- `parseTicketIdFromQRCode()` : Extrait le ticketId

### D. API Routes

#### `/app/api/tickets/[id]/qrcode/route.ts`
- **POST** : Génère et enregistre le QR code pour un billet
- **GET** : Récupère le QR code existant

#### `/app/api/tickets/[id]/validate/route.ts`
- **POST** : Valide un billet (marque comme USED)
  - Vérifie que le billet n'est pas déjà utilisé
  - Vérifie que le billet n'est pas annulé
  - Vérifie que l'événement n'est pas annulé
  - Enregistre la date/heure de validation
  - Enregistre qui a validé

- **GET** : Vérifie la validité sans valider
  - Retourne l'état du billet
  - Informations participant et événement

### E. Page Scan (`/app/dashboard/scan/page.tsx`)
Interface de scan en temps réel :
- **Saisie manuelle** du code QR
- **Placeholder caméra** (pour implémentation mobile future)
- **Validation instantanée** avec feedback visuel et sonore
- **Affichage résultat** :
  - Succès : Bordure verte, icône de validation
  - Erreur : Bordure rouge, icône d'erreur, message explicatif
- **Informations participant** :
  - Nom et email
  - Événement et date
  - Lieu
  - Heure d'utilisation si déjà scanné
- **Compteurs** :
  - Scans aujourd'hui
  - Dernière validation
  - Statut en ligne
- **Prévention réutilisation** : Impossible de valider 2 fois

### F. Page Check-in (`/app/dashboard/events/[id]/checkin/page.tsx`)
Vue temps réel des entrées :
- **Statistiques en direct** :
  - Total participants
  - Présents
  - Absents
  - Taux de présence (%)

- **Timeline des arrivées** :
  - Graphique à barres par heure
  - Animation des données

- **Liste participants** :
  - Nom, contact, statut, heure d'arrivée
  - Badge présent/absent
  - Recherche en temps réel

- **Auto-refresh** : Mise à jour toutes les 5 secondes

- **Export CSV** :
  - Nom, email, téléphone, statut, heure arrivée
  - Téléchargement direct

### G. Page Tickets (`/app/dashboard/events/[id]/tickets/page.tsx`)
Gestion complète des billets :

**Statistiques** :
- Total billets vendus
- Billets confirmés
- Billets utilisés
- Revenus générés

**Liste des billets** :
- Tableau complet avec :
  - Participant (nom, email)
  - Contact (téléphone)
  - Prix
  - Statut (badge coloré)
  - QR code (aperçu miniature)

**Actions par billet** :
- **Télécharger PDF** : Génère un billet PDF
- **Envoyer par email** : Envoi automatique du billet
- **Générer QR code** : Si pas encore généré

**Exports** :
- **Export Excel/CSV** : Tous les billets
- **Impression multiple** : Tous les QR codes d'un coup
  - Format optimisé pour impression
  - 2 billets par page
  - Inclut QR code, nom, date, lieu

### H. Composants réutilisables

#### `TicketCard` (`/components/ticket-card.tsx`)
Carte de billet réutilisable avec :
- QR code intégré
- Informations participant
- Détails événement
- Badge statut
- Mode imprimable

#### `QRScanner` (`/components/qr-scanner.tsx`)
Composant scanner (préparé pour caméra) :
- Interface caméra
- Cadre de scan
- Gestion permissions
- Feedback visuel

---

## Sécurité

### Prévention des abus
1. **QR code unique** : Hash cryptographique non réversible
2. **Validation une seule fois** : État USED enregistré en base
3. **Timestamp de validation** : Traçabilité complète
4. **Vérification événement** : Impossible de scanner un billet pour un événement annulé
5. **Authentication requise** : Toutes les routes protégées par session

### Validation du côté serveur
- Toutes les vérifications se font côté serveur
- Les QR codes ne peuvent pas être forgés
- L'historique complet est conservé

---

## Utilisation

### 1. Créer un événement
1. Aller dans Événements
2. Créer un nouvel événement avec capacité
3. Publier l'événement

### 2. Vendre des billets
Les billets sont créés via l'API `/api/tickets` avec :
- userId
- eventId
- price

### 3. Générer les QR codes
Les QR codes sont générés automatiquement :
- À la création du billet (optionnel)
- Lors de la consultation de la page Tickets
- Ou manuellement via l'API

### 4. Scanner à l'entrée
1. Aller dans `/dashboard/scan`
2. Saisir ou scanner le code QR
3. Le système valide instantanément
4. Feedback visuel et sonore

### 5. Suivre en temps réel
1. Ouvrir `/dashboard/events/[id]/checkin`
2. Voir les arrivées en direct
3. Timeline et statistiques mises à jour automatiquement
4. Exporter les données si besoin

---

## Améliorations futures possibles

1. **Scanner caméra mobile** : Implémenter jsQR ou @zxing/library
2. **PDF personnalisés** : Utiliser jsPDF pour générer de beaux billets
3. **Email automatique** : Intégration avec SendGrid ou Resend
4. **Notifications push** : Alertes en temps réel pour les organisateurs
5. **Analytics avancés** : Graphiques de présence, pics d'affluence
6. **Mode hors-ligne** : Scanner même sans connexion (avec sync ultérieure)
7. **Multi-validation** : Plusieurs points d'entrée simultanés
8. **Badges imprimables** : Pour les participants sur place

---

## Structure des fichiers

```
/app/dashboard/
  calendar/
    page.tsx                    # Page calendrier principal
  scan/
    page.tsx                    # Scanner de QR codes
  events/
    [id]/
      checkin/
        page.tsx               # Check-in temps réel
      tickets/
        page.tsx               # Gestion billets

/app/api/
  tickets/
    [id]/
      validate/
        route.ts               # Validation de billets
      qrcode/
        route.ts               # Génération QR codes

/components/
  calendar-view.tsx            # Composant calendrier
  ticket-card.tsx              # Carte billet
  qr-scanner.tsx               # Scanner QR (placeholder)

/lib/
  qrcode.ts                    # Utilitaires QR codes
```

---

## Technologies utilisées

- **React Big Calendar** : Calendrier interactif
- **date-fns** : Manipulation dates
- **qrcode.react** : Génération QR codes
- **react-to-print** : Impression
- **Framer Motion** : Animations fluides
- **Prisma** : ORM base de données
- **Next.js 15** : Framework React
- **TypeScript** : Typage fort
- **Tailwind CSS** : Styling

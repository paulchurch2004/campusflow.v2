# Système d'Export de Données - CampusFlow

## Vue d'ensemble

CampusFlow dispose maintenant d'un système complet d'export de données en PDF et Excel pour faciliter la génération de rapports et le suivi financier.

## Packages installés

- **jspdf** (^2.5.2) : Génération de documents PDF
- **jspdf-autotable** (^3.8.4) : Création de tables dans les PDF
- **xlsx** (^0.18.5) : Export au format Excel

## Fichiers créés

### 1. `/lib/export-utils.ts`

Bibliothèque d'utilitaires contenant toutes les fonctions d'export :

#### Fonctions disponibles :

**`exportExpensesToExcel(expenses, poles, users)`**
- Exporte la liste des dépenses au format Excel (.xlsx)
- Colonnes : Date, Description, Montant, Catégorie, Pôle, Demandeur, Status
- Formatage automatique des dates en français
- Montants en euros (€)
- Ligne de total en bas du fichier
- Largeurs de colonnes optimisées
- Nom du fichier : `depenses_YYYY-MM-DD.xlsx`

**`exportExpensesToPDF(expenses, poles, users, listName)`**
- Génère un rapport PDF des dépenses
- Header avec logo/titre personnalisable
- Date de génération
- Table formatée avec toutes les dépenses
- Section récapitulative avec totaux par statut :
  - En attente
  - Approuvé
  - Payé
  - Rejeté
- Total général
- Numéros de page dans le footer
- Nom du fichier : `rapport_depenses_YYYY-MM-DD.pdf`

**`exportMonthlyReportPDF(data, listName)`**
- Rapport mensuel complet au format PDF
- **Section 1 : Statistiques globales**
  - Budget total
  - Dépenses totales
  - Budget restant
  - Nombre d'événements

- **Section 2 : Budget par pôle**
  - Table avec budget alloué, dépensé, restant
  - Pourcentage d'utilisation

- **Section 3 : Événements du mois**
  - Liste des événements avec dates, lieux, prix

- **Section 4 : Top 10 dépenses**
  - Classement des dépenses les plus importantes

- Nom du fichier : `rapport_mensuel_YYYY-MM.pdf`

**`exportEventPDF(event, tickets, expenses, listName)`**
- Bilan détaillé d'un événement
- **Informations de l'événement**
  - Nom, date, lieu, description
  - Statut et pôle associé

- **Statistiques**
  - Nombre de participants
  - Taux de remplissage (capacité)

- **Bilan financier**
  - Revenus billetterie
  - Dépenses totales
  - Bilan (bénéfice/perte) avec code couleur

- **Liste des participants**
  - Nom, email, prix payé, date d'achat

- **Dépenses liées**
  - Toutes les dépenses associées à l'événement

- Nom du fichier : `bilan_evenement_[nom]_YYYY-MM-DD.pdf`

**`exportEventsToExcel(events)`**
- Exporte la liste des événements au format Excel
- Colonnes : Nom, Date, Lieu, Prix du billet, Capacité, Pôle, Status, Participants
- Nom du fichier : `evenements_YYYY-MM-DD.xlsx`

**`exportEventsToPDF(events, listName)`**
- Génère un rapport PDF de tous les événements
- Table formatée avec toutes les informations
- Nom du fichier : `rapport_evenements_YYYY-MM-DD.pdf`

### 2. `/components/export-menu.tsx`

Composant React dropdown menu réutilisable pour l'export :

**Props :**
```typescript
interface ExportMenuProps {
  onExportExcel?: () => void          // Callback export Excel
  onExportPDF?: () => void            // Callback export PDF
  onExportMonthlyReport?: () => void  // Callback rapport mensuel
  showMonthlyReport?: boolean         // Afficher l'option rapport mensuel
  variant?: 'default' | 'outline' | 'ghost'  // Style du bouton
  size?: 'default' | 'sm' | 'lg' | 'icon'    // Taille du bouton
}
```

**Utilisation :**
```tsx
<ExportMenu
  onExportExcel={handleExportExcel}
  onExportPDF={handleExportPDF}
  onExportMonthlyReport={handleMonthlyReport}
  showMonthlyReport={true}
/>
```

### 3. `/types/jspdf-autotable.d.ts`

Déclarations TypeScript pour le package jspdf-autotable.

## Intégrations

### 1. Page Treasury (`/app/dashboard/treasury/page.tsx`)

**Fonctionnalités ajoutées :**
- Bouton d'export dans le header (à côté de "Nouvelle dépense")
- Export Excel : Liste complète des dépenses filtrées
- Export PDF : Rapport formaté des dépenses avec totaux

**Handlers implémentés :**
```tsx
const handleExportExcel = () => {
  const users = Array.from(new Set(expenses.map(e => e.user)))
  exportExpensesToExcel(filteredExpenses, poles, users)
}

const handleExportPDF = () => {
  const users = Array.from(new Set(expenses.map(e => e.user)))
  const listName = session?.listName || 'CampusFlow'
  exportExpensesToPDF(filteredExpenses, poles, users, listName)
}
```

### 2. Page Events (`/app/dashboard/events/page.tsx`)

**Fonctionnalités ajoutées :**
- Bouton d'export dans le header (à côté de "Nouvel événement")
- Export Excel : Liste des événements avec statistiques
- Export PDF : Rapport formaté des événements

**Handlers implémentés :**
```tsx
const handleExportExcel = () => {
  exportEventsToExcel(filteredEvents)
}

const handleExportPDF = () => {
  exportEventsToPDF(filteredEvents, 'CampusFlow')
}
```

### 3. Page Settings (`/app/dashboard/settings/page.tsx`)

**Fonctionnalités ajoutées :**
- Bouton d'export dans le header
- **Rapport mensuel PDF** : Génère un rapport complet du mois en cours avec :
  - Statistiques globales (budget, dépenses)
  - Répartition par pôle
  - Événements du mois
  - Top 10 dépenses

**Handler implémenté :**
```tsx
const handleExportMonthlyReport = async () => {
  // Récupère les données du mois en cours
  // Filtre les dépenses et événements
  // Génère le rapport PDF complet
  exportMonthlyReportPDF({
    totalBudget,
    totalSpent,
    totalEvents,
    poles: polesData,
    events: monthEvents,
    topExpenses,
  }, listName)
}
```

## Formatage des données

### Dates
Toutes les dates sont formatées en français :
- Format court : `31/10/2025`
- Format long : `31 octobre 2025`
- Format avec heure : `31 octobre 2025 à 14:30`

### Montants
Tous les montants sont formatés en euros avec le symbole € :
- Exemple : `1 234,56 €`
- Utilise `Intl.NumberFormat` avec la locale `fr-FR`

### Statuts
Tous les statuts sont traduits en français :
- `PENDING` → "En attente"
- `APPROVED` → "Approuvé"
- `REJECTED` → "Rejeté"
- `PAID` → "Payé"
- `DRAFT` → "Brouillon"
- `PUBLISHED` → "Publié"
- `CANCELLED` → "Annulé"
- `COMPLETED` → "Terminé"

## Style des PDF

### Couleurs
- Header des tables : Bleu (`#3b82f6`)
- Thème : Rayures alternées (`striped`)
- Texte : Noir pour contenu, vert/rouge pour bilan financier

### Police
- Helvetica (incluse par défaut dans jsPDF)
- Taille : 8-22pt selon les sections

### Mise en page
- Marges : 14mm de chaque côté
- Largeur de page : A4 (210mm)
- Hauteur de page : A4 (297mm)
- Footer avec numéros de page centrés

## Fonctionnalités clés

✅ Export Excel avec formatage automatique
✅ Export PDF avec mise en page professionnelle
✅ Rapports mensuels complets
✅ Bilans d'événements détaillés
✅ Dates en français
✅ Montants en euros
✅ Totaux et statistiques calculés automatiquement
✅ Numérotation des pages
✅ Noms de fichiers avec dates automatiques
✅ Composant réutilisable
✅ TypeScript avec types complets

## Exemples d'utilisation

### Export simple de dépenses
```tsx
import { exportExpensesToExcel } from '@/lib/export-utils'

// Dans votre composant
const handleExport = () => {
  exportExpensesToExcel(expenses, poles, users)
}
```

### Rapport mensuel personnalisé
```tsx
import { exportMonthlyReportPDF } from '@/lib/export-utils'

const data = {
  totalBudget: 10000,
  totalSpent: 7500,
  totalEvents: 12,
  poles: [...],
  events: [...],
  topExpenses: [...]
}

exportMonthlyReportPDF(data, 'Mon BDE')
```

### Menu d'export complet
```tsx
import { ExportMenu } from '@/components/export-menu'

<ExportMenu
  onExportExcel={() => exportExpensesToExcel(data)}
  onExportPDF={() => exportExpensesToPDF(data)}
  onExportMonthlyReport={() => exportMonthlyReportPDF(data)}
  showMonthlyReport={true}
/>
```

## Notes techniques

- Les exports sont générés côté client (dans le navigateur)
- Les fichiers sont téléchargés automatiquement via l'API File Download
- Aucune donnée n'est envoyée à un serveur externe
- Compatible avec tous les navigateurs modernes
- Performance optimisée pour de grandes listes de données

## Maintenance future

Pour ajouter de nouveaux types d'export :

1. Créer une nouvelle fonction dans `/lib/export-utils.ts`
2. Ajouter les types TypeScript appropriés
3. Ajouter l'option dans le composant `ExportMenu`
4. Implémenter le handler dans la page concernée

## Support

Pour toute question ou problème :
- Vérifier que les packages sont bien installés : `npm list jspdf jspdf-autotable xlsx`
- Vérifier la console du navigateur pour les erreurs JavaScript
- S'assurer que les données passées aux fonctions sont au bon format

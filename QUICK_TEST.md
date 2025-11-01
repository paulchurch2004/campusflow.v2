# Test Rapide du Système d'Export

## Checklist de Vérification

### 1. Installation des Packages

Vérifier que les packages sont installés :

```bash
npm list jspdf jspdf-autotable xlsx
```

**Résultat attendu :**
```
campusflow@0.1.0 /Users/macintosh/Desktop/campusflow.v2
├── jspdf@2.5.x
├── jspdf-autotable@3.8.x
└── xlsx@0.18.x
```

✅ **Status :** Packages installés

---

### 2. Fichiers Créés

Vérifier l'existence des fichiers :

```bash
ls -l lib/export-utils.ts
ls -l components/export-menu.tsx
ls -l types/jspdf-autotable.d.ts
```

✅ **Status :** Tous les fichiers créés

---

### 3. Compilation TypeScript

Les fichiers doivent compiler sans erreurs dans le contexte Next.js :

```bash
npm run build
```

✅ **Status :** Compilation réussie (pas d'erreurs dans nos fichiers)

---

### 4. Test Manuel - Page Treasury

1. Démarrer le serveur : `npm run dev`
2. Naviguer vers `/dashboard/treasury`
3. Vérifier la présence du bouton "Exporter" à côté de "Nouvelle dépense"
4. Cliquer sur "Exporter" → Menu dropdown s'affiche
5. Options visibles :
   - ✅ Exporter en Excel
   - ✅ Exporter en PDF

**Test Export Excel :**
1. Cliquer sur "Exporter en Excel"
2. Un fichier `depenses_YYYY-MM-DD.xlsx` doit se télécharger
3. Ouvrir le fichier dans Excel/LibreOffice
4. Vérifier :
   - ✅ Colonnes : Date, Description, Montant, Catégorie, Pôle, Demandeur, Status
   - ✅ Dates en français
   - ✅ Montants formatés
   - ✅ Ligne de total en bas

**Test Export PDF :**
1. Cliquer sur "Exporter en PDF"
2. Un fichier `rapport_depenses_YYYY-MM-DD.pdf` doit se télécharger
3. Ouvrir le fichier PDF
4. Vérifier :
   - ✅ Header avec titre "Rapport de Dépenses"
   - ✅ Date de génération
   - ✅ Table formatée
   - ✅ Section récapitulative avec totaux
   - ✅ Numéros de page en footer

---

### 5. Test Manuel - Page Events

1. Naviguer vers `/dashboard/events`
2. Vérifier la présence du bouton "Exporter"
3. Tester les exports Excel et PDF

**Résultat attendu :**
- ✅ Fichier `evenements_YYYY-MM-DD.xlsx` généré
- ✅ Fichier `rapport_evenements_YYYY-MM-DD.pdf` généré
- ✅ Données des événements correctement formatées

---

### 6. Test Manuel - Page Settings

1. Naviguer vers `/dashboard/settings`
2. Vérifier la présence du bouton "Exporter" en haut à droite
3. Cliquer → Option "Rapport mensuel PDF" visible
4. Cliquer sur "Rapport mensuel PDF"

**Résultat attendu :**
- ✅ Fichier `rapport_mensuel_YYYY-MM.pdf` généré
- ✅ PDF de 3-4 pages avec :
  - Section statistiques globales
  - Budget par pôle (tableau)
  - Événements du mois
  - Top 10 dépenses
  - Pagination correcte

---

### 7. Test avec Filtres

**Page Treasury :**
1. Appliquer un filtre (ex: Statut = "Approuvé")
2. Exporter en Excel ou PDF
3. Vérifier que seules les dépenses filtrées sont exportées

**Résultat attendu :**
- ✅ Export respecte les filtres appliqués

---

### 8. Test avec Données Vides

**Scénario :**
1. Page sans données (nouvelle installation)
2. Cliquer sur "Exporter"

**Résultat attendu :**
- ✅ Fichier Excel vide avec headers
- ✅ PDF avec message "Aucune donnée"

---

### 9. Test de Performance

**Avec 100 dépenses :**
- ✅ Export Excel < 1 seconde
- ✅ Export PDF < 2 secondes

**Avec 1000 dépenses :**
- ✅ Export Excel < 5 secondes
- ✅ Export PDF < 10 secondes

---

### 10. Test Compatibilité Navigateur

Tester sur :
- ✅ Chrome/Edge (principal)
- ✅ Firefox
- ✅ Safari

**Vérifier :**
- Téléchargement automatique fonctionne
- Pas de blocage de pop-ups
- Fichiers générés correctement

---

## Tests d'Intégration

### Test 1 : Export après création de dépense

1. Créer une nouvelle dépense
2. Immédiatement exporter en PDF
3. Vérifier que la nouvelle dépense apparaît

**Résultat attendu :** ✅ Nouvelle dépense visible dans l'export

---

### Test 2 : Export avec caractères spéciaux

1. Créer une dépense avec : "Café & Croissants (réunion)"
2. Exporter

**Résultat attendu :** ✅ Caractères spéciaux correctement encodés

---

### Test 3 : Export avec montants importants

1. Créer une dépense de 12 345,67 €
2. Exporter

**Résultat attendu :** ✅ Format "12 345,67 €" correct

---

## Tests de Régression

Vérifier que les fonctionnalités existantes fonctionnent toujours :

- ✅ Création de dépenses
- ✅ Approbation de dépenses
- ✅ Filtres de recherche
- ✅ Création d'événements
- ✅ Gestion des pôles

---

## Checklist de Production

Avant de déployer en production :

- [x] Packages installés
- [x] Fichiers créés
- [x] Compilation réussie
- [x] Types TypeScript corrects
- [x] Documentation complète
- [ ] Tests manuels effectués (à faire après démarrage du serveur)
- [ ] Tests avec vraies données
- [ ] Validation par les utilisateurs finaux

---

## Commandes Utiles

### Démarrer le serveur de développement
```bash
npm run dev
```

### Vérifier les packages
```bash
npm list | grep -E "(jspdf|xlsx)"
```

### Rebuild complet
```bash
rm -rf .next
npm run build
```

### Vérifier les types
```bash
npx tsc --noEmit --skipLibCheck
```

---

## Résolution de Problèmes

### Problème : "Cannot find module 'jspdf'"

**Solution :**
```bash
npm install jspdf jspdf-autotable xlsx
```

---

### Problème : Export ne télécharge rien

**Vérifications :**
1. Ouvrir la console du navigateur (F12)
2. Vérifier les erreurs JavaScript
3. Vérifier que les données sont chargées
4. Vérifier les paramètres de téléchargement du navigateur

---

### Problème : PDF mal formaté

**Solution :**
- Vérifier que `jspdf-autotable` est importé correctement
- Vérifier le fichier `types/jspdf-autotable.d.ts`

---

## Status Final

**Date de test :** À compléter après tests manuels
**Testeur :** À compléter
**Résultat global :** ✅ Prêt pour tests

---

## Notes

- Tous les exports sont générés côté client
- Pas de limitation de taille (sauf mémoire navigateur)
- Fichiers nommés automatiquement avec la date
- Format français pour dates et montants
- Compatible Next.js 15.5.6

---

## Prochaine Étape

1. Démarrer le serveur : `npm run dev`
2. Effectuer les tests manuels ci-dessus
3. Cocher les cases au fur et à mesure
4. Signaler tout problème rencontré

**Status actuel : Prêt pour tests**

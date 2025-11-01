# Guide d'Utilisation - Système d'Export CampusFlow

## Où trouver les boutons d'export ?

### 1. Page Trésorerie (`/dashboard/treasury`)

**Emplacement :** Header de la page, à gauche du bouton "Nouvelle dépense"

**Options disponibles :**
- 📊 **Exporter en Excel** : Télécharge un fichier `.xlsx` avec toutes les dépenses filtrées
- 📄 **Exporter en PDF** : Génère un rapport PDF formaté avec totaux et statistiques

**Données exportées :**
- Toutes les dépenses actuellement affichées (respecte les filtres appliqués)
- Colonnes : Date, Description, Montant, Catégorie, Pôle, Demandeur, Status
- Total général en bas

**Comment utiliser :**
1. Appliquez vos filtres (statut, pôle, recherche) si nécessaire
2. Cliquez sur le bouton "Exporter"
3. Choisissez le format souhaité (Excel ou PDF)
4. Le fichier se télécharge automatiquement

**Nom du fichier généré :**
- Excel : `depenses_2025-10-31.xlsx`
- PDF : `rapport_depenses_2025-10-31.pdf`

---

### 2. Page Événements (`/dashboard/events`)

**Emplacement :** Header de la page, à gauche du bouton "Nouvel événement"

**Options disponibles :**
- 📊 **Exporter en Excel** : Télécharge un fichier `.xlsx` avec tous les événements filtrés
- 📄 **Exporter en PDF** : Génère un rapport PDF des événements

**Données exportées :**
- Tous les événements actuellement affichés (respecte le filtre de statut)
- Colonnes : Nom, Date, Lieu, Prix du billet, Capacité, Pôle, Status, Participants
- Statistiques de participation si disponibles

**Comment utiliser :**
1. Filtrez par statut si nécessaire (Tous, Brouillon, Publié, etc.)
2. Cliquez sur "Exporter"
3. Choisissez Excel ou PDF
4. Le fichier se télécharge automatiquement

**Nom du fichier généré :**
- Excel : `evenements_2025-10-31.xlsx`
- PDF : `rapport_evenements_2025-10-31.pdf`

---

### 3. Page Paramètres (`/dashboard/settings`)

**Emplacement :** Header de la page, en haut à droite

**Option disponible :**
- 📅 **Rapport mensuel PDF** : Génère un rapport complet du mois en cours

**Données exportées :**
Le rapport mensuel contient :

**Section 1 : Statistiques Globales**
- Budget total de tous les pôles
- Dépenses totales du mois
- Budget restant
- Nombre d'événements du mois

**Section 2 : Budget par Pôle**
- Tableau détaillé pour chaque pôle :
  - Budget alloué
  - Montant dépensé
  - Montant restant
  - Pourcentage d'utilisation

**Section 3 : Événements du Mois**
- Liste de tous les événements du mois en cours
- Informations : nom, date, lieu, prix, statut

**Section 4 : Top 10 Dépenses**
- Classement des 10 dépenses les plus importantes
- Détails : date, description, montant, pôle, statut

**Comment utiliser :**
1. Assurez-vous d'avoir des pôles configurés
2. Cliquez sur "Exporter"
3. Sélectionnez "Rapport mensuel PDF"
4. Le rapport complet se génère et se télécharge

**Nom du fichier généré :**
- `rapport_mensuel_2025-10.pdf`

---

## Fonctionnalités Avancées

### Filtres et Exports

Les exports respectent **toujours** les filtres appliqués sur la page :

**Page Trésorerie :**
- Filtre par statut (En attente, Approuvé, Payé, Rejeté)
- Filtre par pôle
- Recherche par texte

**Page Événements :**
- Filtre par statut (Tous, Brouillon, Publié, Annulé, Terminé)

> **💡 Astuce :** Utilisez les filtres avant d'exporter pour générer des rapports ciblés !

---

## Exemples de Cas d'Usage

### 📊 Cas 1 : Rapport de dépenses pour une réunion de bureau

**Objectif :** Présenter toutes les dépenses approuvées du mois

**Étapes :**
1. Aller sur `/dashboard/treasury`
2. Filtrer par statut : "Approuvé"
3. Cliquer sur "Exporter" → "Exporter en PDF"
4. Présenter le PDF lors de la réunion

---

### 📊 Cas 2 : Comptabilité mensuelle

**Objectif :** Fournir un fichier Excel au comptable

**Étapes :**
1. Aller sur `/dashboard/treasury`
2. S'assurer qu'aucun filtre n'est appliqué (pour avoir toutes les dépenses)
3. Cliquer sur "Exporter" → "Exporter en Excel"
4. Envoyer le fichier `.xlsx` au comptable

---

### 📊 Cas 3 : Bilan mensuel pour le conseil d'administration

**Objectif :** Rapport complet avec statistiques et graphiques

**Étapes :**
1. Aller sur `/dashboard/settings`
2. Cliquer sur "Exporter" → "Rapport mensuel PDF"
3. Le rapport de 3-4 pages se génère avec toutes les stats
4. Envoyer le PDF aux membres du CA

---

### 📊 Cas 4 : Communication externe sur les événements

**Objectif :** Liste des événements publics à partager

**Étapes :**
1. Aller sur `/dashboard/events`
2. Filtrer par statut : "Publié"
3. Cliquer sur "Exporter" → "Exporter en Excel"
4. Partager la liste avec les partenaires

---

### 📊 Cas 5 : Audit d'un pôle spécifique

**Objectif :** Vérifier toutes les dépenses d'un pôle

**Étapes :**
1. Aller sur `/dashboard/treasury`
2. Filtrer par le pôle concerné
3. Cliquer sur "Exporter" → "Exporter en PDF"
4. Analyser le rapport pour audit

---

## Format des Fichiers

### Excel (.xlsx)

**Avantages :**
- ✅ Éditable après export
- ✅ Compatible avec Excel, LibreOffice, Google Sheets
- ✅ Facile à manipuler pour des calculs supplémentaires
- ✅ Format idéal pour les comptables

**Contenu :**
- Feuille unique avec toutes les données
- En-têtes de colonnes formatés
- Largeurs de colonnes optimisées
- Ligne de total automatique

---

### PDF (.pdf)

**Avantages :**
- ✅ Format professionnel
- ✅ Non modifiable (idéal pour archivage)
- ✅ Mise en page soignée
- ✅ Prêt à imprimer ou partager
- ✅ Compatible avec tous les lecteurs PDF

**Contenu :**
- Header avec titre et date de génération
- Tables formatées avec en-têtes en bleu
- Sections de statistiques et totaux
- Numéros de page en footer
- Design professionnel

---

## Personnalisation

### Changer le nom de l'organisation

Le nom qui apparaît dans les rapports PDF provient de :
- Session utilisateur (`session.listName`)
- Par défaut : "CampusFlow"

Pour modifier :
```typescript
// Dans les handlers d'export
const listName = session?.listName || 'Votre Nom BDE'
exportExpensesToPDF(expenses, poles, users, listName)
```

---

## Résolution de Problèmes

### ❌ Le bouton "Exporter" ne fait rien

**Solutions :**
1. Vérifier que vous avez des données à exporter
2. Ouvrir la console du navigateur (F12) pour voir les erreurs
3. Vérifier que les packages sont installés : `npm list jspdf xlsx`

---

### ❌ Le fichier se télécharge mais est vide

**Solutions :**
1. Vérifier que les filtres ne masquent pas toutes les données
2. S'assurer que les données sont chargées (pas de "Chargement..." affiché)

---

### ❌ Erreur "Cannot read property..."

**Solutions :**
1. Recharger la page
2. Vérifier que les données sont bien chargées depuis l'API
3. Vérifier la console pour des erreurs réseau

---

## Support Navigateurs

✅ Chrome / Edge (recommandé)
✅ Firefox
✅ Safari
✅ Opera

**Note :** Certains navigateurs peuvent bloquer les téléchargements automatiques. Autorisez les pop-ups si nécessaire.

---

## Questions Fréquentes

### Q : Puis-je exporter des données d'un mois précédent ?

**R :** Actuellement, le rapport mensuel exporte uniquement le mois en cours. Pour des périodes personnalisées, utilisez les filtres de la page Trésorerie et exportez en Excel/PDF.

---

### Q : Les montants sont-ils toujours en euros ?

**R :** Oui, tous les montants sont formatés en euros (€) avec le format français (virgule comme séparateur décimal).

---

### Q : Puis-je modifier le format du PDF après génération ?

**R :** Non, les PDF sont générés avec un format fixe. Pour des modifications, utilisez l'export Excel qui est éditable.

---

### Q : Y a-t-il une limite au nombre de lignes exportées ?

**R :** Non, vous pouvez exporter autant de lignes que nécessaire. Pour de très grandes quantités (>1000 lignes), le traitement peut prendre quelques secondes.

---

### Q : Les données sont-elles envoyées sur un serveur externe ?

**R :** Non, tous les exports sont générés côté client (dans votre navigateur). Aucune donnée n'est envoyée à un serveur externe pour le traitement.

---

## Améliorations Futures (Roadmap)

Fonctionnalités prévues :

- [ ] Export d'un bilan d'événement individuel avec liste des participants
- [ ] Choix de la période pour les rapports mensuels
- [ ] Graphiques dans les PDF
- [ ] Export en format CSV
- [ ] Envoi automatique par email
- [ ] Planification d'exports récurrents
- [ ] Templates personnalisables
- [ ] Export multi-devises

---

## Contact

Pour toute question ou suggestion d'amélioration, contactez l'équipe de développement CampusFlow.

**Dernière mise à jour :** 31 octobre 2025

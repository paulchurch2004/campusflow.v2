# CampusFlow - Application de Gestion BDE

Application web complète de gestion pour Bureau Des Élèves (BDE) développée avec Next.js 15, React, TypeScript, et PostgreSQL.

## Caractéristiques

- **Gestion de Trésorerie** : Suivi des dépenses, validation automatique, gestion des budgets par pôle
- **Événements** : Création et gestion d'événements avec billetterie
- **Partenaires** : Gestion des partenariats et contacts
- **Équipe** : Gestion des membres avec rôles et permissions
- **Tableau de bord** : Vue d'ensemble avec statistiques en temps réel

## Stack Technique

- **Frontend** : Next.js 15 (App Router), React 18, TypeScript
- **UI** : Tailwind CSS, Shadcn/ui, Lucide Icons
- **Backend** : Next.js API Routes
- **Base de données** : PostgreSQL (Neon)
- **ORM** : Prisma 5.22.0
- **Authentification** : Custom (bcryptjs)
- **Notifications** : Sonner

## Installation

1. **Cloner le projet**
```bash
cd /path/to/campusflow.v2
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration**

Le fichier `.env.local` est déjà configuré avec la base de données Neon :
```
DATABASE_URL="postgresql://neondb_owner:npg_bTyr8Mu3eoKh@ep-rapid-cake-ag04qu43-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

4. **Initialiser la base de données**
```bash
# Pousser le schema Prisma
npx prisma db push

# Générer le client Prisma
npx prisma generate

# Seed la base de données avec les données initiales
npx tsx scripts/create-admin.ts
```

5. **Lancer le serveur de développement**
```bash
# Recommandé: nettoie les serveurs zombies avant de lancer
npm run dev:clean

# Ou lancer normalement (attention aux serveurs multiples)
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

> ⚠️ **Important:** Utilisez toujours `npm run dev:clean` pour éviter l'accumulation de serveurs zombies qui ralentissent l'application. Consultez [GUIDE_DEVELOPPEMENT.md](GUIDE_DEVELOPPEMENT.md) pour plus d'informations.

## Comptes de Test

Après avoir exécuté le script de seed, vous pouvez vous connecter avec :

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| paul.church@kedgebs.com | 123456 | TREASURER |
| liviodignat06@gmail.com | 123456 | PRESIDENT |
| luiis.grn18@gmail.com | 123456 | POLE_LEADER |

## Structure du Projet

```
campusflow.v2/
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/              # Authentification (login, logout)
│   │   ├── expenses/          # Gestion des dépenses
│   │   ├── events/            # Gestion des événements
│   │   ├── partners/          # Gestion des partenaires
│   │   ├── poles/             # Gestion des pôles
│   │   ├── users/             # Gestion des utilisateurs
│   │   └── ...
│   ├── dashboard/             # Pages du dashboard
│   │   ├── treasury/          # Trésorerie
│   │   ├── events/            # Événements
│   │   ├── partners/          # Partenaires
│   │   ├── teams/             # Équipe
│   │   └── settings/          # Paramètres
│   ├── login/                 # Page de connexion
│   ├── signup/                # Page d'inscription
│   └── layout.tsx             # Layout racine
├── components/
│   ├── ui/                    # Composants UI (Shadcn)
│   ├── dashboard/             # Composants dashboard (Sidebar)
│   └── forms/                 # Formulaires
├── hooks/                     # Hooks React personnalisés
│   ├── usePermissions.ts
│   └── useRealtimeUpdates.ts
├── lib/
│   ├── prisma.ts              # Client Prisma
│   └── utils.ts               # Utilitaires
├── prisma/
│   └── schema.prisma          # Schéma de base de données
└── scripts/
    ├── create-admin.ts        # Script de seed complet
    └── seed-test-accounts.ts  # Script de seed utilisateurs
```

## Fonctionnalités Principales

### Trésorerie
- Création de dépenses avec validation automatique (< 100€)
- Workflow d'approbation (PENDING → APPROVED → PAID)
- Filtrage par status, pôle, recherche
- Statistiques de budget par pôle
- Gestion des fournisseurs

### Événements
- Création d'événements avec billetterie
- Statuts : Draft, Published, Cancelled, Completed
- Association aux pôles
- Gestion de capacité et prix des billets

### Partenaires
- Gestion des partenariats
- Catégories : Entreprise, Association, Institution, Commerce
- Informations de contact complètes

### Équipe
- Gestion des membres avec 6 rôles différents
- Système de permissions basé sur les rôles
- Profils utilisateurs avec avatars

### Paramètres
- Gestion de l'information de la liste BDE
- Création et gestion des pôles
- Attribution des budgets par pôle
- Suivi des dépenses par pôle

## Permissions

Les rôles et leurs permissions :

- **PRESIDENT** : Tous les droits
- **VICE_PRESIDENT** : Tous les droits
- **TREASURER** : Validation de dépenses, gestion financière
- **SECRETARY** : Création et édition limitées
- **POLE_LEADER** : Gestion de son pôle
- **MEMBER** : Consultation, création de dépenses

## Scripts Utiles

```bash
# Développement
npm run dev:clean          # ⭐ RECOMMANDÉ: Nettoie et lance le serveur
npm run dev                # Lancer normalement (attention aux zombies)

# Build production
npm run build
npm run start

# Prisma
npx prisma studio          # Interface graphique DB
npx prisma generate        # Générer client
npx prisma db push         # Pousser schema
npx prisma migrate dev     # Créer migration

# Scripts custom
npx tsx scripts/create-admin.ts          # Seed complet
npx tsx scripts/seed-test-accounts.ts    # Seed utilisateurs uniquement

# Débogage
ps aux | grep "next-server"              # Voir les serveurs actifs
killall -9 node                          # Tuer tous les serveurs zombies
```

> 💡 **Astuce:** Consultez le [Guide de Développement](GUIDE_DEVELOPPEMENT.md) pour comprendre comment éviter les problèmes de performance liés aux serveurs zombies.

## Améliorations Futures

- [ ] Gestion documentaire (upload de fichiers)
- [ ] Rapports automatiques (génération PDF/Excel)
- [ ] Templates de dépenses récurrentes
- [ ] Recherche avancée avec filtres sauvegardés
- [ ] WebSockets pour le temps réel
- [ ] Notifications email
- [ ] Export de données
- [ ] Tests unitaires et E2E
- [ ] Application mobile (React Native)

## Technologies

- **Next.js 15** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utility-first
- **Shadcn/ui** - Composants UI accessibles
- **Prisma** - ORM moderne pour Node.js
- **PostgreSQL** - Base de données relationnelle
- **Neon** - Base de données serverless PostgreSQL
- **Sonner** - Notifications toast
- **Lucide Icons** - Bibliothèque d'icônes
- **bcryptjs** - Hachage de mots de passe
- **date-fns** - Manipulation de dates

## Support

Pour toute question ou problème, consultez la documentation ou créez une issue sur le projet.

## Licence

Ce projet est développé pour un usage éducatif et associatif.

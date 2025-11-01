# Guide de déploiement - CampusFlow

## 📋 Prérequis

- Un compte GitHub (pour lier votre repository)
- Un compte Railway.app ou Render.com
- Votre base de données Neon PostgreSQL (déjà configurée)

## 🚀 Déploiement sur Railway

### Étape 1: Préparer le repository Git

```bash
# Initialiser git si ce n'est pas déjà fait
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - CampusFlow ready for deployment"

# Créer un repository sur GitHub et le lier
git remote add origin https://github.com/votre-username/campusflow.git
git branch -M main
git push -u origin main
```

### Étape 2: Créer un projet sur Railway

1. Allez sur https://railway.app
2. Cliquez sur "Start a New Project"
3. Sélectionnez "Deploy from GitHub repo"
4. Autorisez Railway à accéder à votre GitHub
5. Sélectionnez votre repository CampusFlow

### Étape 3: Configurer les variables d'environnement

Dans Railway, allez dans l'onglet "Variables" et ajoutez:

```
DATABASE_URL=postgresql://neondb_owner:npg_bTyr8Mu3eoKh@ep-rapid-cake-ag04qu43-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_URL=https://votre-app.up.railway.app
NEXTAUTH_SECRET=RpSOQWsoyLnh0MZyU+Yr7VpiZeGtvxLjNSVFEYu4pb0=
NEXT_PUBLIC_SITE_URL=https://votre-app.up.railway.app
NODE_ENV=production
```

**Important**: Remplacez `votre-app` par l'URL que Railway vous donnera après le premier déploiement.

### Étape 4: Configurer le build

Railway détectera automatiquement votre projet Next.js. Vérifiez que:

- **Build Command**: `npm run build && npx prisma generate`
- **Start Command**: `npm start`
- **Install Command**: `npm install`

### Étape 5: Mettre à jour les URLs

1. Une fois le premier déploiement terminé, Railway vous donnera une URL (ex: `https://campusflow-production.up.railway.app`)
2. Retournez dans "Variables" et mettez à jour:
   - `NEXTAUTH_URL` avec votre nouvelle URL
   - `NEXT_PUBLIC_SITE_URL` avec votre nouvelle URL
3. Railway redéploiera automatiquement

### Étape 6: Migrer la base de données

Railway exécutera automatiquement `npx prisma generate` lors du build. Si vous avez des migrations à effectuer:

```bash
# En local, pour créer une migration
npx prisma migrate dev --name init

# Puis commitez et pushez
git add .
git commit -m "Add database migrations"
git push
```

## 🔧 Configuration supplémentaire

### Domaine personnalisé (optionnel)

1. Dans Railway, allez dans "Settings"
2. Cliquez sur "Add Custom Domain"
3. Ajoutez votre domaine et suivez les instructions DNS

### Logs et monitoring

- Railway fournit des logs en temps réel
- Cliquez sur "Deployments" pour voir l'historique
- Utilisez "Metrics" pour surveiller l'utilisation CPU/RAM

## 🐛 Dépannage

### L'application ne démarre pas

Vérifiez les logs dans Railway et assurez-vous que:
- Toutes les variables d'environnement sont correctes
- La DATABASE_URL est valide
- Le port est bien configuré (Railway le définit automatiquement)

### Socket.io ne fonctionne pas

Assurez-vous que `NEXT_PUBLIC_SITE_URL` pointe vers l'URL publique Railway et non localhost.

### Erreurs de base de données

Vérifiez que:
- La base de données Neon est accessible
- `npx prisma generate` s'est exécuté correctement pendant le build
- Les migrations sont à jour

## 📱 Partager avec votre équipe

Une fois déployé, partagez simplement l'URL Railway avec votre équipe:

```
https://votre-app.up.railway.app
```

Ils pourront:
- Se créer un compte
- Se connecter
- Utiliser toutes les fonctionnalités en temps réel avec Socket.io
- Voir les mises à jour en direct

## 🔄 Mises à jour futures

Pour déployer des mises à jour:

```bash
# Faites vos modifications
git add .
git commit -m "Description des changements"
git push
```

Railway détectera automatiquement les changements et redéploiera!

# 🚀 Guide de Développement - CampusFlow

## ⚠️ Problèmes Courants et Solutions

### 🐛 Serveurs Zombies Next.js

#### Symptômes
- Application très lente
- CPU à 100%
- Plusieurs ports occupés (3000, 3001, 3002, etc.)
- Message "Port 3000 is in use, using port 3001 instead"

#### Cause
Lancement multiple de `npm run dev` sans arrêter les anciens serveurs. Chaque nouveau serveur prend un nouveau port et consomme des ressources.

#### Solution Immédiate
```bash
# 1. Tuer tous les serveurs Next.js
killall -9 node

# 2. Nettoyer le cache
rm -rf .next

# 3. Relancer proprement
npm run dev
```

#### Solution Recommandée
**Utilisez toujours `npm run dev:clean` au lieu de `npm run dev`**

```bash
npm run dev:clean
```

Ce script automatique:
- ✅ Tue tous les anciens serveurs
- ✅ Nettoie le cache Next.js
- ✅ Lance UN SEUL serveur propre
- ✅ Empêche les accumulations de processus zombies

---

## 📋 Commandes Utiles

### Développement
```bash
# Démarrage propre (RECOMMANDÉ)
npm run dev:clean

# Démarrage normal (utiliser avec précaution)
npm run dev

# Build production
npm run build

# Lancer en production
npm run start
```

### Base de données
```bash
# Voir la BDD dans un navigateur
npx prisma studio

# Mettre à jour le schéma
npx prisma db push

# Générer le client Prisma
npx prisma generate

# Réinitialiser les données de test
npx tsx scripts/create-admin.ts
```

### Débogage
```bash
# Voir tous les processus Next.js
ps aux | grep "next-server"

# Compter les processus Next.js actifs
ps aux | grep "next-server" | grep -v grep | wc -l

# Tuer UN processus spécifique par son PID
kill -9 [PID]

# Tuer TOUS les processus Node.js (dangereux!)
killall -9 node
```

---

## 🎯 Bonnes Pratiques

### ✅ À FAIRE

1. **Toujours utiliser `npm run dev:clean`** pour démarrer
2. **Arrêter le serveur proprement** avec `Ctrl+C` avant de relancer
3. **Vérifier qu'un seul serveur tourne**:
   ```bash
   ps aux | grep "next-server" | grep -v grep
   # Devrait retourner 1 seule ligne
   ```
4. **Fermer le terminal complètement** si vous arrêtez de développer
5. **Utiliser un seul terminal** pour le serveur de dev

### ❌ À ÉVITER

1. ❌ **Ne JAMAIS lancer `npm run dev` plusieurs fois** sans arrêter l'ancien
2. ❌ **Ne PAS fermer le terminal** sans arrêter le serveur (`Ctrl+C` d'abord)
3. ❌ **Ne PAS ignorer** le message "Port is in use" - c'est un signe de serveur zombie
4. ❌ **Ne PAS utiliser** plusieurs terminaux avec `npm run dev` en même temps
5. ❌ **Ne PAS laisser tourner** le serveur quand vous ne développez pas

---

## 🔧 Configuration Recommandée

### VS Code - Raccourci Clavier (optionnel)

Ajoutez dans `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Dev Clean",
      "type": "shell",
      "command": "npm run dev:clean",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

Raccourci: `Cmd+Shift+P` → "Tasks: Run Task" → "Dev Clean"

---

## 📊 Monitoring des Performances

### Vérifier la Santé du Serveur

```bash
# Voir la consommation CPU/RAM des processus Next.js
ps aux | grep "next-server" | awk '{print $3, $4, $11, $12}'
# Affiche: %CPU %RAM Commande

# Si CPU > 50% ou RAM > 1GB pendant plus de 5 minutes → Redémarrer
```

### Signes d'Alerte

| Symptôme | Cause Probable | Solution |
|----------|---------------|----------|
| CPU > 70% | Boucle infinie de recompilation | `npm run dev:clean` |
| RAM > 2GB | Fuite mémoire / Serveurs multiples | `killall -9 node` |
| Port 300X | Serveur sur port non-standard | Vérifier serveurs zombies |
| Temps de réponse > 5s | Cache corrompu | `rm -rf .next && npm run dev` |

---

## 🆘 En Cas de Problème

### L'application ne démarre pas
```bash
# 1. Nettoyer complètement
killall -9 node
rm -rf .next
rm -rf node_modules/.cache

# 2. Relancer
npm run dev:clean
```

### L'application est lente
```bash
# 1. Vérifier les serveurs zombies
ps aux | grep "next-server"

# 2. Si plus d'un serveur → Tuer tout
killall -9 node

# 3. Relancer proprement
npm run dev:clean
```

### Erreur "Port in use"
```bash
# Trouver ce qui utilise le port 3000
lsof -ti:3000

# Tuer le processus
kill -9 $(lsof -ti:3000)

# Ou tuer tous les serveurs
killall -9 node
```

---

## 📝 Checklist Avant de Commencer à Développer

- [ ] Fermer tous les anciens terminaux
- [ ] Vérifier qu'aucun serveur Next.js ne tourne: `ps aux | grep next-server`
- [ ] Lancer avec `npm run dev:clean` (PAS `npm run dev`)
- [ ] Attendre "Ready in X.Xs" avant d'ouvrir le navigateur
- [ ] Vérifier que l'application est sur `http://localhost:3000` (pas 3001, 3002...)

## 📝 Checklist Avant d'Arrêter de Développer

- [ ] Faire `Ctrl+C` dans le terminal du serveur
- [ ] Attendre que le processus s'arrête complètement
- [ ] Fermer le terminal
- [ ] (Optionnel) Vérifier: `ps aux | grep next-server` → devrait être vide

---

## 🎓 Pour Aller Plus Loin

### Comprendre les Processus Next.js

Quand vous lancez `npm run dev`, Next.js crée en réalité **plusieurs processus**:
1. **node** (process parent) - Gère le CLI npm
2. **next-server** (process principal) - Serveur de développement
3. **next-server** (workers) - Compilation et hot-reload

C'est pourquoi il est important de tuer **proprement** avec `killall` plutôt que de fermer juste le terminal.

### Pourquoi Plusieurs Serveurs Causent des Problèmes

- Chaque serveur consomme 200-500MB de RAM
- Chaque serveur surveille les fichiers (file watching)
- Les recompilations se font en parallèle sur tous les serveurs
- Conflit de cache entre les serveurs
- **Résultat:** CPU surchargé, RAM saturée, application lente

---

**🎯 Règle d'or: Toujours utiliser `npm run dev:clean` !**

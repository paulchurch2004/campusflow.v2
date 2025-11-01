#!/bin/bash

echo "🧹 Nettoyage des serveurs Next.js zombies..."

# Tuer tous les processus Next.js
pkill -9 -f "next-server" 2>/dev/null || true
pkill -9 -f "node.*next dev" 2>/dev/null || true

# Attendre que les processus soient bien terminés
sleep 1

# Vérifier s'il reste des processus
REMAINING=$(ps aux | grep -E "next-server|node.*next dev" | grep -v grep | wc -l)

if [ "$REMAINING" -gt 0 ]; then
  echo "⚠️  Il reste $REMAINING processus Next.js"
  ps aux | grep -E "next-server|node.*next dev" | grep -v grep
  echo "❌ Arrêt forcé..."
  killall -9 node 2>/dev/null || true
  sleep 1
fi

echo "✅ Nettoyage terminé"
echo ""
echo "🚀 Démarrage du serveur propre..."
echo ""

# Nettoyer le cache Next.js
rm -rf .next

# Lancer le serveur
npm run dev

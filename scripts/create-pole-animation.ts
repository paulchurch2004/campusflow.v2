import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Récupérer la liste par défaut
    const list = await prisma.list.findFirst()

    if (!list) {
      console.error('Aucune liste trouvée. Veuillez d\'abord créer une liste.')
      return
    }

    // Vérifier si le pôle Animation existe déjà
    const existingPole = await prisma.pole.findFirst({
      where: {
        name: 'Animation',
        listId: list.id,
      },
    })

    if (existingPole) {
      console.log('Le pôle Animation existe déjà!')
      console.log(existingPole)
      return
    }

    // Créer le pôle Animation
    const pole = await prisma.pole.create({
      data: {
        name: 'Animation',
        description: 'Pôle en charge des animations et des activités récréatives',
        color: '#ff6b6b',
        allocatedBudget: 8000,
        spentAmount: 0,
        listId: list.id,
      },
    })

    console.log('✅ Pôle Animation créé avec succès!')
    console.log('📋 Détails:')
    console.log('  - Nom:', pole.name)
    console.log('  - Couleur:', pole.color)
    console.log('  - Budget alloué:', pole.allocatedBudget, '€')
    console.log('  - Dépensé:', pole.spentAmount, '€')
    console.log('  - ID:', pole.id)
  } catch (error) {
    console.error('❌ Erreur lors de la création du pôle:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

const POLES_DATA = [
  { name: 'Communication', color: '#3b82f6', budget: 5000 },
  { name: 'Événements', color: '#10b981', budget: 10000 },
  { name: 'Partenariats', color: '#f59e0b', budget: 3000 },
  { name: 'Logistique', color: '#ef4444', budget: 4000 },
  { name: 'Trésorerie', color: '#8b5cf6', budget: 2000 },
  { name: 'Bureau', color: '#ec4899', budget: 6000 },
]

const TEST_USERS = [
  {
    name: 'Paul Church',
    email: 'paul.church@kedgebs.com',
    role: 'TREASURER',
  },
  {
    name: 'Livio Dignat-Esposito-Maschio',
    email: 'liviodignat06@gmail.com',
    role: 'PRESIDENT',
  },
  {
    name: 'Louis Guerin',
    email: 'luiis.grn18@gmail.com',
    role: 'POLE_LEADER',
  },
]

async function main() {
  try {
    console.log('🚀 Starting database initialization...\n')

    // Create default BDE list
    console.log('📋 Creating default BDE list...')
    const defaultList = await prisma.list.upsert({
      where: { id: 'default-list' },
      update: {},
      create: {
        id: 'default-list',
        name: 'Ma Liste BDE',
        description: 'Default BDE list for CampusFlow',
      },
    })
    console.log(`✅ Default list created: "${defaultList.name}" (ID: ${defaultList.id})\n`)

    // Create poles
    console.log('🎨 Creating poles...')
    const createdPoles = []
    for (const pole of POLES_DATA) {
      const createdPole = await prisma.pole.create({
        data: {
          name: pole.name,
          color: pole.color,
          allocatedBudget: pole.budget,
          listId: defaultList.id,
        },
      })
      createdPoles.push(createdPole)
      console.log(
        `  ✓ ${pole.name} (Budget: €${pole.budget}, Color: ${pole.color})`
      )
    }
    console.log(`✅ ${createdPoles.length} poles created\n`)

    // Hash password
    const hashedPassword = await bcrypt.hash('123456', 10)

    // Create test users
    console.log('👥 Creating test users...')
    const createdUsers = []
    for (const user of TEST_USERS) {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      })

      if (existingUser) {
        console.log(`  ℹ User already exists: ${user.name} (${user.email})`)
        createdUsers.push(existingUser)
      } else {
        const createdUser = await prisma.user.create({
          data: {
            name: user.name,
            email: user.email,
            password: hashedPassword,
            role: user.role as any,
            listId: defaultList.id,
          },
        })
        createdUsers.push(createdUser)
        console.log(`  ✓ ${user.name} (${user.role}) - ${user.email}`)
      }
    }
    console.log(`✅ ${createdUsers.length} users ready\n`)

    // Summary
    console.log('═══════════════════════════════════════════════')
    console.log('✨ Database initialization complete!')
    console.log('═══════════════════════════════════════════════')
    console.log(`
Summary:
  • List: ${defaultList.name}
  • Poles: ${createdPoles.length} created
  • Users: ${createdUsers.length} created

Test user credentials (password: 123456):
  • paul.church@kedgebs.com (TREASURER)
  • liviodignat06@gmail.com (PRESIDENT)
  • luiis.grn18@gmail.com (POLE_LEADER)
    `)
  } catch (error) {
    console.error('❌ Error during database initialization:')
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

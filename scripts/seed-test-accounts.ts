import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

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
    console.log('🚀 Seeding test user accounts...\n')

    // Get default list
    const defaultList = await prisma.list.findUnique({
      where: { id: 'default-list' },
    })

    if (!defaultList) {
      console.error('❌ Error: Default list not found!')
      console.error('Please run create-admin.ts first to initialize the database.')
      process.exit(1)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('123456', 10)

    // Create or update test users
    console.log('👥 Processing test user accounts...')
    const results = []

    for (const user of TEST_USERS) {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      })

      if (existingUser) {
        console.log(`  ℹ Already exists: ${user.name} (${user.email})`)
        results.push({ status: 'existing', user: existingUser })
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
        console.log(`  ✓ Created: ${user.name} (${user.role})`)
        results.push({ status: 'created', user: createdUser })
      }
    }

    // Summary
    const created = results.filter((r) => r.status === 'created').length
    const existing = results.filter((r) => r.status === 'existing').length

    console.log('\n═══════════════════════════════════════════════')
    console.log('✨ Test account seeding complete!')
    console.log('═══════════════════════════════════════════════')
    console.log(`
Results:
  • Created: ${created}
  • Already existing: ${existing}
  • Total: ${results.length}

Test user credentials (password: 123456):
  • paul.church@kedgebs.com (TREASURER)
  • liviodignat06@gmail.com (PRESIDENT)
  • luiis.grn18@gmail.com (POLE_LEADER)
    `)
  } catch (error) {
    console.error('❌ Error during test account seeding:')
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

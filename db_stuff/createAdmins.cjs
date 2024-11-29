const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmins() {
  try {
    const admins = []

    // Create 50 admin records
    for (let i = 1; i <= 50; i++) {
      const hashedPassword = await bcrypt.hash('password123', 10)

      admins.push({
        email: `admin${i}@example.com`,
        password: hashedPassword,
        name: `Admin User ${i}`,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    // Bulk insert all admin records
    const result = await prisma.admin.createMany({
      data: admins,
      skipDuplicates: true,
    })

    console.log(`Successfully created ${result.count} admin users`)
  } catch (error) {
    console.error('Error creating admin users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmins().catch(error => {
  console.error(error)
  process.exit(1)
})

import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../server/server.js'

const prisma = new PrismaClient()

async function main() {
  // Create initial users
  const password1 = await hashPassword('secret')
  const password2 = await hashPassword('secret2')

  await prisma.user.upsert({
    where: { email: 'test@email.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'test@email.com',
      passwordHash: password1,
    },
  })

  await prisma.user.upsert({
    where: { email: 'bob@email.com' },
    update: {},
    create: {
      name: 'Bob Cat',
      email: 'bob@email.com',
      passwordHash: password2,
    },
  })

  console.log('Database has been seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

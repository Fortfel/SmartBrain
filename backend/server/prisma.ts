import { PrismaClient } from '@prisma/client'

/**
 * Create a singleton Prisma client instance
 */
const prisma = new PrismaClient()

export default prisma

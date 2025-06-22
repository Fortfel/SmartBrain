import { type Prisma, PrismaClient } from '@prisma/client'

const clientOptions = {
  log: [
    { level: 'warn' as const, emit: 'event' as const },
    { level: 'error' as const, emit: 'event' as const },
  ],
}

/**
 * Prisma client singleton with extended logging
 */
class PrismaService {
  private static instance: PrismaService | undefined
  private readonly client: PrismaClient<typeof clientOptions>

  private constructor() {
    this.client = new PrismaClient(clientOptions)

    // Set up logging
    this.setupLogging()
  }

  /**
   * Get the Prisma client instance
   */
  public get prisma(): PrismaClient {
    return this.client
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService()
    }
    return PrismaService.instance
  }

  /**
   * Connect to the database
   */
  public async connect(): Promise<void> {
    try {
      await this.client.$connect()
      console.log('Connected to the database successfully')
    } catch (error) {
      console.error('Failed to connect to the database:', error)
      throw error
    }
  }

  /**
   * Disconnect from the database
   */
  public async disconnect(): Promise<void> {
    await this.client.$disconnect()
  }

  /**
   * Set up Prisma client logging
   */
  private setupLogging(): void {
    this.client.$on('warn', (e: Prisma.LogEvent) => {
      console.warn('Prisma warning:', e)
    })

    this.client.$on('error', (e: Prisma.LogEvent) => {
      console.error('Prisma error:', e)
    })

    // Add query logging in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      this.client.$use(async (params, next) => {
        const before = Date.now()
        const result = await next(params) // eslint-disable-line
        const after = Date.now()
        console.log(`Query ${params.model || 'unknown'}.${params.action} took ${(after - before).toString()}ms`)
        return result // eslint-disable-line
      })
    }
  }
}

// Export the Prisma client instance
const prismaService = PrismaService.getInstance()
const prisma = prismaService.prisma

export default prisma
export { prismaService }

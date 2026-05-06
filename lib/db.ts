import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL || ''

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
  }

  const parsed = new URL(connectionString)

  const adapter = new PrismaPg({
    host: parsed.hostname,
    port: parseInt(parsed.port),
    database: parsed.pathname.slice(1),
    user: parsed.username,
    password: parsed.password,
    ssl: { rejectUnauthorized: false },
  })

  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

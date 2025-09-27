import { PrismaClient } from '@prisma/client'

declare global {
  // Allow global `var` declarations
  var prisma: PrismaClient | undefined
}

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
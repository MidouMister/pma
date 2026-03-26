// =====================================================
// PMA Database - Prisma singleton with adapter
// =====================================================

import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

/**
 * Global Prisma client instance
 * This is a singleton to prevent multiple connections in development
 */
declare global {
  var prisma: PrismaClient | undefined
}

/**
 * Create a new Prisma client with pg adapter
 */
function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set")
  }

  // Create adapter with connection string
  const adapter = new PrismaPg({ connectionString: databaseUrl })

  // Create and return client
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })
}

/**
 * Get the Prisma client instance
 * This ensures we only create one client across the application
 */
export const prisma = globalThis.prisma ?? createPrismaClient()

// In development, persist the client across hot reloads
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}

/**
 * Disconnect from the database
 * Use this in serverless environments or when shutting down
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect()
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}

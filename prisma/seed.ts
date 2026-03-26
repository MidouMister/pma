import "dotenv/config"
import { Prisma, PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

// URL encode the password to handle special characters like spaces
const rawUrl = process.env.DIRECT_URL!
const encodedUrl = rawUrl.replace(
  /:([^:@]+)@/,
  (_, password) => `:${encodeURIComponent(password)}@`
)

const adapter = new PrismaPg({
  connectionString: encodedUrl,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database...")

  // Seed Plans based on PMA PRD specifications
  const plansData = [
    {
      name: "Starter",
      maxUnits: 1,
      maxProjects: 5,
      maxTasksPerProject: 20,
      maxMembers: 10,
      priceDA: new Prisma.Decimal(0),
    },
    {
      name: "Pro",
      maxUnits: 5,
      maxProjects: 30,
      maxTasksPerProject: 200,
      maxMembers: 50,
      priceDA: new Prisma.Decimal(50000),
    },
    {
      name: "Premium",
      maxUnits: null, // Unlimited
      maxProjects: null, // Unlimited
      maxTasksPerProject: null, // Unlimited
      maxMembers: null, // Unlimited
      priceDA: new Prisma.Decimal(150000),
    },
  ]

  for (const p of plansData) {
    const plan = await prisma.plan.upsert({
      where: { name: p.name },
      update: {
        maxUnits: p.maxUnits,
        maxProjects: p.maxProjects,
        maxTasksPerProject: p.maxTasksPerProject,
        maxMembers: p.maxMembers,
        priceDA: p.priceDA,
      },
      create: p,
    })
    console.log(`✅ Upserted plan: ${plan.name} (${plan.id})`)
  }

  console.log("✅ Seeding complete!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

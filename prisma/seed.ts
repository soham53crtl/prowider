import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  const services = ['Service 1', 'Service 2', 'Service 3']
  for (const name of services) {
    await prisma.service.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  console.log('✓ Services seeded')

  for (let i = 1; i <= 8; i++) {
    await prisma.provider.upsert({
      where: { name: `Provider ${i}` },
      update: {},
      create: { name: `Provider ${i}`, monthlyQuota: 10, leadsReceived: 0 },
    })
  }
  console.log('✓ Providers seeded')

  const allServices = await prisma.service.findMany()
  for (const service of allServices) {
    await prisma.allocationState.upsert({
      where: { serviceId: service.id },
      update: {},
      create: { serviceId: service.id, nextIndex: 0 },
    })
  }
  console.log('✓ AllocationState seeded')

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

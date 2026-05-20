import { defineConfig } from 'prisma/config'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  migrate: {
    async adapter(env: Record<string, string | undefined>) {
      const pool = new pg.Pool({ connectionString: env.DATABASE_URL })
      return new PrismaPg(pool)
    },
  },
})

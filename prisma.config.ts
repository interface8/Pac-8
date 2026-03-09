import 'dotenv/config'
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: `tsx prisma/seed.ts`,
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});

// import "dotenv/config";
// import { defineConfig, env } from "prisma/config";

// export default defineConfig({
//   schema: "prisma/schema.prisma",
//   migrate: {
//     async adapter() {
//       const url = process.env.DATABASE_URL!;
//       const { PrismaPg } = await import("@prisma/adapter-pg");
//       return new PrismaPg({ connectionString: url });
//     },
//   },
// });

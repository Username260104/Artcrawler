import { defineConfig } from "prisma/config";

loadDotenvIfAvailable();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: process.env.DATABASE_URL
  }
});

function loadDotenvIfAvailable() {
  if (typeof process.loadEnvFile !== "function") {
    return;
  }

  try {
    process.loadEnvFile(".env");
  } catch {
    // A local .env file is optional in CI and Vercel.
  }
}

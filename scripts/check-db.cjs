const { loadEnvConfig } = require("@next/env");
const { PrismaClient } = require("@prisma/client");
const { tableCounts } = require("./database-state.cjs");
loadEnvConfig(process.cwd());

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing");
  const db = new PrismaClient();
  try {
    await db.$queryRaw`SELECT 1`;
    await tableCounts(db);
    console.log(
      "Database connection and all five application tables are available.",
    );
  } catch (error) {
    const reasons = {
      P1000: "Database credentials rejected",
      P1001: "Database unreachable; check project status and pooler settings",
      P1002: "Database timed out",
      P1011: "Database TLS error",
      P2021: "Application tables are missing",
      P2022: "Database schema does not match the application",
    };
    throw new Error(
      reasons[error.code || error.errorCode] ||
        "Database check failed; inspect the service logs (credentials are not printed)",
    );
  } finally {
    await db.$disconnect();
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

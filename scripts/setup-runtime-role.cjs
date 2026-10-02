const { loadEnvConfig } = require("@next/env");
const { spawnSync } = require("node:child_process");
const { readFileSync, writeFileSync } = require("node:fs");
const { randomBytes, createHash } = require("node:crypto");
const { PrismaClient } = require("@prisma/client");
loadEnvConfig(process.cwd());

async function main() {
  const backup = process.argv[2];
  const receipt = JSON.parse(readFileSync(backup + ".json", "utf8"));
  if (
    !receipt.restoreTested ||
    createHash("sha256").update(readFileSync(backup)).digest("hex") !==
      receipt.sha256
  )
    throw new Error("A verified backup is required.");
  const owner = new URL(process.env.DIRECT_URL);
  if (
    owner.hostname !== "aws-0-us-west-2.pooler.supabase.com" ||
    owner.username !== "postgres.ulgmlibyimuuumpftxcq"
  )
    throw new Error("Unexpected database destination.");
  const password = randomBytes(32).toString("base64url");
  const session = new URL(owner);
  session.username = "common_app.ulgmlibyimuuumpftxcq";
  session.password = password;
  session.port = "5432";
  const transaction = new URL(session);
  transaction.port = "6543";
  transaction.searchParams.set("pgbouncer", "true");
  // Private recovery file written before mutation; never print credentials.
  writeFileSync(
    ".env.runtime.local",
    `DATABASE_URL=${transaction.href}\nRUNTIME_SESSION_URL=${session.href}\n`,
    { flag: "wx" },
  );
  const sql = readFileSync("docs/runtime-role.sql", "utf8").replace(
    "COMMIT;",
    `ALTER ROLE common_app LOGIN PASSWORD '${password}';\nCOMMIT;`,
  );
  const result = spawnSync(
    "C:/Program Files/PostgreSQL/18/bin/psql.exe",
    ["--no-password", "-v", "ON_ERROR_STOP=1"],
    {
      input: sql,
      encoding: "utf8",
      timeout: 60000,
      env: {
        ...process.env,
        PGHOST: owner.hostname,
        PGPORT: owner.port,
        PGDATABASE: "postgres",
        PGUSER: decodeURIComponent(owner.username),
        PGPASSWORD: decodeURIComponent(owner.password),
        PGSSLMODE: "require",
      },
    },
  );
  if (result.status !== 0)
    throw new Error(
      "Role setup failed; preserve the private file and inspect permissions.",
    );
  for (const url of [session, transaction]) {
    const db = new PrismaClient({ datasources: { db: { url: url.href } } });
    try {
      const [role] =
        await db.$queryRaw`SELECT current_user AS name, rolbypassrls, rolcreatedb, rolcreaterole FROM pg_roles WHERE rolname=current_user`;
      if (
        role.name !== "common_app" ||
        role.rolbypassrls ||
        role.rolcreatedb ||
        role.rolcreaterole
      )
        throw new Error("Runtime role is too privileged.");
      await db.post.count();
      await db
        .$transaction(async (tx) => {
          await tx.user.create({
            data: {
              id: "runtime-check-" + randomBytes(8).toString("hex"),
              userName: "runtime-check-" + randomBytes(8).toString("hex"),
              email: "",
              firstName: "",
              lastName: "",
            },
          });
          throw new Error("rollback-check");
        })
        .catch((error) => {
          if (error.message !== "rollback-check") throw error;
        });
      const [rights] =
        await db.$queryRaw`SELECT has_schema_privilege(current_user,'public','CREATE') AS ddl, has_table_privilege(current_user,'public."_prisma_migrations"','SELECT') AS history`;
      if (rights.ddl || rights.history)
        throw new Error("Runtime permissions are too broad.");
    } finally {
      await db.$disconnect();
    }
  }
  console.log(
    "Runtime credentials verified through both poolers; private values saved in .env.runtime.local. Production deployment still uses its previous credentials.",
  );
}
main().catch(() => {
  console.error(
    "Runtime setup failed. Credentials suppressed; production deployment variables were not changed.",
  );
  process.exitCode = 1;
});

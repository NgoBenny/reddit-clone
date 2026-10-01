const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { resolve, join, sep } = require("node:path");
const { PrismaClient } = require("@prisma/client");
const url = "postgresql://browser_test@127.0.0.1:55440/feature_migration_test";
async function main() {
  const file = resolve(process.argv[2] || "");
  assert.ok(
    file.startsWith(resolve(".backups") + sep) && file.endsWith(".dump"),
    "Use a private local backup",
  );
  const bin = process.env.PG_BIN || "C:/Program Files/PostgreSQL/18/bin";
  const run = (name, args) => {
    const r = spawnSync(join(bin, name + ".exe"), args, {
      stdio: "ignore",
      timeout: 120000,
    });
    assert.equal(r.status, 0, name + " failed");
  };
  const connection = [
    "-h",
    "127.0.0.1",
    "-p",
    "55440",
    "-U",
    "browser_test",
    "-d",
    "postgres",
  ];
  run("psql", [
    ...connection,
    "-v",
    "ON_ERROR_STOP=1",
    "-c",
    "CREATE DATABASE feature_migration_test",
  ]);
  const db = new PrismaClient({ datasources: { db: { url } } });
  try {
    connection[7] = "feature_migration_test";
    run("psql", [
      ...connection,
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      "DROP SCHEMA public",
    ]);
    run("pg_restore", [
      ...connection,
      "--no-owner",
      "--no-acl",
      "--exit-on-error",
      "--single-transaction",
      file,
    ]);
    const counts = () =>
      Promise.all([
        db.user.count(),
        db.subreddit.count(),
        db.post.count(),
        db.vote.count(),
        db.comment.count(),
      ]);
    const before = await counts();
    const env = { ...process.env, DATABASE_URL: url, DIRECT_URL: url };
    const migration = spawnSync(
      process.execPath,
      ["node_modules/prisma/build/index.js", "migrate", "deploy"],
      { env, stdio: "pipe", timeout: 120000 },
    );
    assert.equal(migration.status, 0, "Migration failed on recovered schema");
    assert.deepEqual(await counts(), before);
    const tables =
      await db.$queryRaw`SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
    assert.equal(tables.length, 9);
    assert.ok(tables.every((t) => t.rowsecurity));
    const diff = spawnSync(
      process.execPath,
      [
        "node_modules/prisma/build/index.js",
        "migrate",
        "diff",
        "--from-url",
        url,
        "--to-schema-datamodel",
        "prisma/schema.prisma",
        "--exit-code",
      ],
      { env, stdio: "pipe", timeout: 120000 },
    );
    assert.equal(diff.status, 0, "Migrated schema differs from model");
    console.log(
      "Recovered-backup migration passed: original row counts preserved, nine RLS tables, no schema drift.",
    );
  } finally {
    await db.$disconnect();
    connection[7] = "postgres";
    run("psql", [
      ...connection,
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      "DROP DATABASE feature_migration_test",
    ]);
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

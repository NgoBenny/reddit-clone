const { loadEnvConfig } = require("@next/env");
const { PrismaClient } = require("@prisma/client");
const { spawnSync } = require("node:child_process");
const { readFileSync, writeFileSync } = require("node:fs");
const { createHash } = require("node:crypto");

loadEnvConfig(process.cwd());

async function main() {
  const file = process.argv[2];
  if (!file || !process.env.DIRECT_URL) throw new Error("Usage: npm run db:baseline -- BACKUP.dump (requires DIRECT_URL in .env.local).");
  const receipt = JSON.parse(readFileSync(file + ".json", "utf8"));
  const age = Date.now() - Date.parse(receipt.createdAt);
  if (createHash("sha256").update(readFileSync(file)).digest("hex") !== receipt.sha256 ||
      !receipt.archiveReadable || !receipt.restoreTested || !receipt.baselineMatched || !Number.isFinite(age) || age < 0 || age > 86400000) {
    throw new Error("A checked backup less than 24 hours old is required.");
  }
  const db = new PrismaClient({ datasources: { db: { url: process.env.DIRECT_URL } } });
  const run = (args) => {
    const result = spawnSync(process.execPath, [require.resolve("prisma/build/index.js"), ...args], {
      env: { ...process.env, DATABASE_URL: process.env.DIRECT_URL }, encoding: "utf8", timeout: 120000,
    });
    // Prisma diagnostics can contain connection strings; do not forward them.
    if (result.error || result.status !== 0) throw new Error(`Prisma ${args.slice(0, 2).join(' ')} failed; no further steps were run.`);
  };
  try {
    run(["migrate", "diff", "--from-schema-datasource", "prisma/schema.prisma", "--to-schema-datamodel", "prisma/schema.prisma", "--exit-code"]);
    const security = await db.$queryRaw`SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('User', 'Subreddit', 'Post', 'Vote', 'Comment')`;
    if (security.length !== 5 || security.some((table) => !table.rowsecurity)) throw new Error("All five existing application tables must have RLS enabled before baselining.");
    const counts = () => Promise.all([db.user.count(), db.subreddit.count(), db.post.count(), db.vote.count(), db.comment.count()]);
    const before = await counts();
    const history = await db.$queryRaw`SELECT to_regclass('public._prisma_migrations')::text AS name`;
    if (history[0].name) throw new Error("Migration history already exists; inspect it rather than baselining again.");
    run(["migrate", "resolve", "--applied", "0_init"]);
    run(["migrate", "status"]);
    const after = await counts();
    writeFileSync(file + ".baseline.json", JSON.stringify({ checkedAt: new Date().toISOString(), migration: "0_init", schemaMatched: true, rlsEnabled: true, countsBefore: before, countsAfter: after }, null, 2));
    console.log("Baseline recorded; existing tables were not recreated. Migration status is current.");
    if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error("Row counts changed during verification; check for concurrent writes.");
  } finally { await db.$disconnect(); }
}

if (require.main === module) {
  main().catch(() => { console.error("Baseline stopped. Check the connection, backup, existing migration history, schema drift and RLS. Credentials are not printed."); process.exitCode = 1; });
}
module.exports = { main };

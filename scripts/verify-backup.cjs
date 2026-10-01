const { loadEnvConfig } = require("@next/env");
const { PrismaClient } = require("@prisma/client");
const { spawnSync } = require("node:child_process");
const { readFileSync, writeFileSync, mkdtempSync, rmSync } = require("node:fs");
const { resolve, join } = require("node:path");
const { createHash } = require("node:crypto");
loadEnvConfig(process.cwd());

async function main() {
  const file = resolve(process.argv[2] || "");
  const receipt = JSON.parse(readFileSync(file + ".json", "utf8"));
  if (!process.env.DIRECT_URL || createHash("sha256").update(readFileSync(file)).digest("hex") !== receipt.sha256) throw new Error("Connection or checked backup missing.");
  const bin = process.env.PG_BIN || "C:/Program Files/PostgreSQL/18/bin";
  const cluster = mkdtempSync(join(resolve(".backups"), "restore-check-"));
  const port = "55439";
  const localUrl = `postgresql://restore_check@127.0.0.1:${port}/postgres`;
  const run = (tool, args, env = process.env) => {
    const result = spawnSync(join(bin, tool + ".exe"), args, { env, stdio: "ignore", timeout: 120000 });
    if (result.error || result.status !== 0) throw new Error(`${tool} verification failed; details suppressed to protect backup data.`);
  };
  // Isolated, short-lived loopback server. Never connects a restore to Supabase.
  run("initdb", ["-D", cluster, "-U", "restore_check", "--auth=trust", "--encoding=UTF8", "--no-locale"]);
  let started = false;
  const local = new PrismaClient({ datasources: { db: { url: localUrl } } });
  const live = new PrismaClient({ datasources: { db: { url: process.env.DIRECT_URL } } });
  try {
    run("pg_ctl", ["-D", cluster, "-l", join(cluster, "server.log"), "-o", `-h 127.0.0.1 -p ${port}`, "-w", "start"]);
    started = true;
    const connection = ["-h", "127.0.0.1", "-p", port, "-U", "restore_check", "-d", "postgres"];
    // initdb creates public; the archive restores its own schema into this empty local database.
    run("psql", [...connection, "-v", "ON_ERROR_STOP=1", "-c", "DROP SCHEMA public"]);
    run("pg_restore", [...connection, "--no-owner", "--no-acl", "--exit-on-error", "--single-transaction", file]);
    const counts = (db) => Promise.all([db.user.count(), db.subreddit.count(), db.post.count(), db.vote.count(), db.comment.count()]);
    const restoredCounts = await counts(local);
    const liveCounts = await counts(live);
    if (JSON.stringify(restoredCounts) !== JSON.stringify(liveCounts)) throw new Error("Restored counts differ from live counts; check for concurrent writes.");
    const security = await local.$queryRaw`SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('User', 'Subreddit', 'Post', 'Vote', 'Comment')`;
    if (security.length !== 5 || security.some((table) => !table.rowsecurity)) throw new Error("Restored RLS settings differ.");
    // Compare an actual execution of the baseline with the restored backup.
    run("psql", [...connection, "-v", "ON_ERROR_STOP=1", "-c", "CREATE DATABASE baseline_check"]);
    run("psql", [...connection.slice(0, -1), "baseline_check", "-v", "ON_ERROR_STOP=1", "--single-transaction", "-f", "prisma/migrations/0_init/migration.sql"]);
    const diff = spawnSync(process.execPath, [require.resolve("prisma/build/index.js"), "migrate", "diff", "--from-url", localUrl, "--to-url", localUrl.replace("/postgres", "/baseline_check"), "--exit-code"], { encoding: "utf8", timeout: 120000 });
    if (diff.error || diff.status !== 0) throw new Error("Executed baseline differs from restored schema.");
    writeFileSync(file + ".json", JSON.stringify({ ...receipt, restoreTested: true, verifiedAt: new Date().toISOString(), restoredCounts, liveCounts, rlsEnabled: true, baselineMatched: true }, null, 2));
    console.log("Isolated restore passed: row counts, RLS, constraints and executed baseline match.");
    console.log(`Counts (User, Subreddit, Post, Vote, Comment): ${restoredCounts.join(', ')}`);
  } finally {
    await Promise.all([local.$disconnect(), live.$disconnect()]);
    if (started) {
      run("pg_ctl", ["-D", cluster, "-m", "fast", "-w", "stop"]);
      const backupRoot = resolve(".backups");
      if (resolve(cluster).startsWith(backupRoot + require("node:path").sep)) rmSync(cluster, { recursive: true });
    }
  }
}
main().catch(() => { console.error("Restore verification failed. Check the backup, connection, local PostgreSQL tools, schema and counts. Credentials and user data are not printed."); process.exitCode = 1; });

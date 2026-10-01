const { loadEnvConfig } = require("@next/env");
const { spawnSync } = require("node:child_process");
const { mkdirSync, readFileSync, writeFileSync, renameSync } = require("node:fs");
const { resolve, join } = require("node:path");
const { createHash } = require("node:crypto");

loadEnvConfig(process.cwd());

function main() {
  if (!process.env.DIRECT_URL) throw new Error("Save DIRECT_URL in .env.local first.");
  const url = new URL(process.env.DIRECT_URL);
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || url.port === '6543') {
    throw new Error("Use the PostgreSQL session pooler (5432) or direct connection, not transaction pooling.");
  }
  const bin = process.env.PG_BIN || "C:/Program Files/PostgreSQL/18/bin";
  const directory = resolve(process.argv[2] || ".backups");
  mkdirSync(directory, { recursive: true });
  const file = join(directory, `reddit-${new Date().toISOString().replace(/[:.]/g, '-')}.dump`);
  const env = { ...process.env, PGHOST: url.hostname, PGPORT: url.port || "5432",
    PGDATABASE: decodeURIComponent(url.pathname.slice(1)), PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password), PGSSLMODE: "require", PGCONNECT_TIMEOUT: "20" };
  // Credentials go only to the child environment, never command arguments or logs.
  const dump = spawnSync(join(bin, "pg_dump.exe"), ["--no-password", "--format=custom", "--schema=public", "--no-owner", "--no-acl", "--file", file + ".partial"], { env, encoding: "utf8", timeout: 300000 });
  if (dump.error || dump.status !== 0) throw new Error("Backup failed; check credentials, connection and PostgreSQL tools. Partial files are not valid backups.");
  const list = spawnSync(join(bin, "pg_restore.exe"), ["--list", file + ".partial"], { encoding: "utf8" });
  if (list.error || list.status !== 0) throw new Error("Backup archive could not be read.");
  for (const table of ["User", "Subreddit", "Post", "Vote", "Comment"]) {
    if (!list.stdout.includes(`TABLE DATA public ${table} `)) throw new Error(`Backup is missing ${table} data.`);
  }
  renameSync(file + ".partial", file);
  const sha256 = createHash("sha256").update(readFileSync(file)).digest("hex");
  writeFileSync(file + ".json", JSON.stringify({ createdAt: new Date().toISOString(), scope: "public schema only; excludes Kinde users and UploadThing files", sha256, archiveReadable: true, restoreTested: false }, null, 2));
  console.log(`Backup saved and archive checked: ${file}`);
  console.log("A successful restore into an isolated database is still required to prove recoverability.");
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { main };

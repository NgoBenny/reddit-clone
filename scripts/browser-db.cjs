const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(".backups");
const cluster = path.join(root, "browser-test-db");
const url = "postgresql://browser_test@127.0.0.1:55440/postgres";
function run(tool, args) {
  const r = spawnSync(
    path.join(
      process.env.PG_BIN || "C:/Program Files/PostgreSQL/18/bin",
      tool + ".exe",
    ),
    args,
    { stdio: "ignore", timeout: 120000 },
  );
  if (r.error || r.status)
    throw new Error(`${tool} failed in isolated browser database`);
}
async function main() {
  if (process.argv[2] === "stop") {
    run("pg_ctl", ["-D", cluster, "-m", "fast", "-w", "stop"]);
    return;
  }
  if (process.argv[2] !== "start") throw new Error("Use start or stop");
  if (fs.existsSync(cluster))
    throw new Error(
      "Test cluster already exists; preserve it and check its status before starting again",
    );
  fs.mkdirSync(root, { recursive: true });
  run("initdb", [
    "-D",
    cluster,
    "-U",
    "browser_test",
    "--auth=trust",
    "--encoding=UTF8",
    "--no-locale",
  ]);
  run("pg_ctl", [
    "-D",
    cluster,
    "-l",
    path.join(cluster, "server.log"),
    "-o",
    "-h 127.0.0.1 -p 55440",
    "-w",
    "start",
  ]);
  try {
    const env = { ...process.env, DATABASE_URL: url, DIRECT_URL: url };
    const migration = spawnSync(
      process.execPath,
      ["node_modules/prisma/build/index.js", "migrate", "deploy"],
      { env, stdio: "inherit", timeout: 120000 },
    );
    if (migration.status) throw new Error("Local migration failed");
    const checks = spawnSync(
      process.execPath,
      ["tests/features-integration.cjs"],
      {
        env: { ...env, FEATURE_TEST_URL: url },
        stdio: "inherit",
        timeout: 120000,
      },
    );
    if (checks.status) throw new Error("Local feature checks failed");
    console.log(
      "Isolated browser database ready on loopback port 55440. Production was not changed.",
    );
  } catch (error) {
    run("pg_ctl", ["-D", cluster, "-m", "fast", "-w", "stop"]);
    throw error;
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

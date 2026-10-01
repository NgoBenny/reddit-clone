const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { createHash } = require("node:crypto");
const vm = require("node:vm");

async function check({ drift = false, rls = true, existing = false, age = 0 } = {}) {
  const commands = [];
  const data = Buffer.from("test backup");
  const receipt = { archiveReadable: true, restoreTested: true, baselineMatched: true, createdAt: new Date(Date.now() - age).toISOString(),
    sha256: createHash("sha256").update(data).digest("hex") };
  const count = async () => 7;
  class PrismaClient {
    user = { count }; subreddit = { count }; post = { count }; vote = { count }; comment = { count };
    async $disconnect() {}
    async $queryRaw(sql) {
      if (sql[0].includes("pg_tables")) return Array.from({ length: 5 }, () => ({ rowsecurity: rls }));
      return [{ name: existing ? "_prisma_migrations" : null }];
    }
  }
  const mockRequire = (name) => ({
    "@next/env": { loadEnvConfig() {} }, "@prisma/client": { PrismaClient },
    "node:child_process": { spawnSync(_executable, args) { commands.push(args); return { status: drift ? 2 : 0 }; } },
    "node:fs": { readFileSync(file) { return file.endsWith(".json") ? JSON.stringify(receipt) : data; }, writeFileSync() {} },
    "node:crypto": require("node:crypto"),
  })[name];
  mockRequire.resolve = () => "prisma-cli";
  const mod = { exports: {} };
  vm.runInNewContext(readFileSync("scripts/baseline-db.cjs", "utf8"), {
    require: mockRequire, module: mod, console: { log() {} },
    process: { cwd: () => process.cwd(), argv: ["node", "baseline", "test.dump"], execPath: "node", env: { DIRECT_URL: "private" } },
  });
  let failed = false;
  try { await mod.exports.main(); } catch { failed = true; }
  return { failed, resolved: commands.some((args) => args.includes("resolve")) };
}

(async () => {
  for (const options of [{ drift: true }, { rls: false }, { existing: true }, { age: 86400001 }]) {
    const result = await check(options);
    assert.equal(result.failed, true);
    assert.equal(result.resolved, false, "Unsafe databases must never be marked baselined");
  }
  assert.deepEqual(await check(), { failed: false, resolved: true });
  console.log("Database baseline guards passed (drift, RLS, history, stale backup).");
})().catch((error) => { console.error(error); process.exitCode = 1; });

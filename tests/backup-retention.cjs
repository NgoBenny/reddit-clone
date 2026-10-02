const assert = require("node:assert/strict");
const { candidates } = require("../scripts/prune-backups.cjs");
const now = Date.parse("2026-10-02T23:30:00Z");
const old = { file: "old", createdAt: "2026-08-01", archiveReadable: true };
const verified = {
  ...old,
  file: "verified",
  restoreTested: true,
  verifiedAt: "2026-08-02",
};
const fresh = {
  file: "fresh",
  createdAt: "2026-10-02T23:00:00Z",
  archiveReadable: true,
};
assert.deepEqual(candidates([old, verified, fresh], fresh, now), [old]);
assert.throws(() => candidates([old, fresh], fresh, now));
assert.throws(() => candidates([old, verified], old, now));
assert.throws(() =>
  candidates([old, verified, fresh], { ...fresh, archiveReadable: false }, now),
);
console.log(
  "Retention guards passed: fresh backup required, verified archive protected, stale routine archives only.",
);

const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");

function candidates(backups, fresh, now = Date.now()) {
  if (
    !fresh.archiveReadable ||
    now - Date.parse(fresh.createdAt) > 86400000 ||
    Date.parse(fresh.createdAt) > now
  )
    throw new Error("A successful backup from the last 24 hours is required.");
  const verified = backups
    .filter((b) => b.restoreTested)
    .sort((a, b) => Date.parse(b.verifiedAt) - Date.parse(a.verifiedAt))[0];
  if (!verified)
    throw new Error("Keep backups until an isolated restore has passed.");
  return backups.filter(
    (b) =>
      b.file !== fresh.file &&
      b.file !== verified.file &&
      Date.parse(b.createdAt) < now - 30 * 86400000,
  );
}

function main() {
  const root = path.resolve(".backups");
  const freshPath = path.resolve(process.argv[2] || "");
  if (path.dirname(freshPath) !== root)
    throw new Error("Fresh archive must be in .backups.");
  const backups = fs
    .readdirSync(root)
    .filter((name) => /^reddit-\d{4}-\d{2}-\d{2}T[\d-]+Z\.dump$/.test(name))
    .map((file) => {
      const archive = path.join(root, file);
      if (
        !fs.lstatSync(archive).isFile() ||
        fs.lstatSync(archive).isSymbolicLink()
      )
        throw new Error("Unexpected archive type.");
      const receipt = JSON.parse(fs.readFileSync(archive + ".json", "utf8"));
      if (
        !receipt.archiveReadable ||
        !Number.isFinite(Date.parse(receipt.createdAt)) ||
        (receipt.restoreTested &&
          !Number.isFinite(Date.parse(receipt.verifiedAt))) ||
        createHash("sha256").update(fs.readFileSync(archive)).digest("hex") !==
          receipt.sha256
      )
        throw new Error("Invalid archive or receipt; preserve all backups.");
      return { ...receipt, file };
    });
  const fresh = backups.find((b) => path.join(root, b.file) === freshPath);
  if (!fresh) throw new Error("Fresh backup receipt missing.");
  const selected = candidates(backups, fresh);
  for (const b of selected) {
    if (process.argv.includes("--apply")) {
      fs.unlinkSync(path.join(root, b.file));
      fs.unlinkSync(path.join(root, b.file + ".json"));
    }
  }
  console.log(
    `${process.argv.includes("--apply") ? "Pruned" : "Eligible"}: ${selected.length} routine backups older than 30 days. Original recovery files, unknown files and newest restore-tested archive preserved.`,
  );
}
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { candidates };

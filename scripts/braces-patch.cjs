const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");

const root = path.resolve(__dirname, "..");
const digest = (source) => createHash("sha256").update(source).digest("hex");
const spec = require("./braces-patch.json");

function verifyPatch({ apply = false } = {}) {
  const lock = JSON.parse(
    fs.readFileSync(path.join(root, "package-lock.json")),
  );
  const packages = Object.entries(lock.packages).filter(([name]) =>
    name.endsWith("node_modules/braces"),
  );
  if (!packages.length)
    throw new Error("Review braces mitigation: dependency graph changed");
  for (const [name, info] of packages) {
    if (info.version !== "3.0.3")
      throw new Error("Review braces mitigation: version changed");
    const directory = path.resolve(root, name);
    if (!directory.startsWith(root + path.sep))
      throw new Error("Invalid dependency path");
    const installed = JSON.parse(
      fs.readFileSync(path.join(directory, "package.json")),
    );
    if (installed.name !== "braces" || installed.version !== info.version) {
      throw new Error("Installed braces does not match the lockfile");
    }
    for (const [file, patch] of Object.entries(spec.files)) {
      const target = path.join(directory, file);
      let source = fs.readFileSync(target, "utf8").replace(/\r\n/g, "\n");
      if (digest(source) === patch.patched) continue;
      if (!apply || digest(source) !== patch.original) {
        throw new Error(
          `Braces depth protection missing or unexpected source: ${name}/${file}`,
        );
      }
      for (const [before, after] of patch.replacements) {
        if (source.split(before).length !== 2)
          throw new Error("Ambiguous braces patch");
        source = source.replace(before, after);
      }
      if (digest(source) !== patch.patched)
        throw new Error("Braces patch checksum mismatch");
      fs.writeFileSync(target, source);
    }
  }
  return packages.map(([name]) => name);
}

if (require.main === module) {
  verifyPatch({ apply: !process.argv.includes("--check") });
  console.log("Verified braces parser and AST depth protection");
}
module.exports = { verifyPatch };

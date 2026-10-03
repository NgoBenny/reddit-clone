const { spawnSync } = require("node:child_process");
const { testProtection } = require("../tests/braces-security.cjs");
const mitigation = require("./braces-patch.json");

// Keep npm's full advisory feed authoritative; only the tested, time-limited
// braces mitigation may satisfy this gate while upstream has no release.
function main() {
  testProtection();
  if (!process.env.npm_execpath)
    throw new Error("Run via npm run audit:security");
  const result = spawnSync(
    process.execPath,
    [process.env.npm_execpath, "audit", "--json", "--audit-level=high"],
    {
      encoding: "utf8",
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
    },
  );
  if (result.error || ![0, 1].includes(result.status)) {
    throw new Error(
      "npm audit could not complete; dependency security is unverified",
    );
  }
  const report = JSON.parse(result.stdout);
  const mitigated = assessReport(report);
  if (mitigated) {
    console.log(
      `npm still reports ${mitigation.advisory}; verified local depth guards mitigate it. Review expires ${mitigation.expires}.`,
    );
  }
  console.log(
    "Dependency gate passed: no unmitigated high/critical audit findings",
  );
}

function assessReport(report, now = Date.now()) {
  if (report.error || !report.vulnerabilities || !report.metadata) {
    throw new Error(
      "Unexpected npm audit response; dependency security is unverified",
    );
  }
  const findings = report.vulnerabilities;
  const advisory = `https://github.com/advisories/${mitigation.advisory}`;
  function covered(name, visited = new Set()) {
    if (visited.has(name)) return false;
    const item = findings[name];
    if (!item || !item.via.length) return false;
    const next = new Set([...visited, name]);
    return item.via.every((via) =>
      typeof via === "string"
        ? covered(via, next)
        : name === "braces" && via.name === "braces" && via.url === advisory,
    );
  }
  const blocked = Object.entries(findings)
    .filter(
      ([name, item]) =>
        ["high", "critical"].includes(item.severity) && !covered(name),
    )
    .map(([name]) => name);
  if (blocked.length)
    throw new Error(
      `Unmitigated high/critical audit findings: ${blocked.join(", ")}`,
    );
  if (Object.keys(findings).some((name) => covered(name))) {
    if (now >= Date.parse(mitigation.expires)) {
      throw new Error(
        "Braces mitigation review expired; review upstream before releasing",
      );
    }
    return true;
  }
  return false;
}
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { assessReport };

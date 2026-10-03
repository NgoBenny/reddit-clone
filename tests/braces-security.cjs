const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { verifyPatch } = require("../scripts/braces-patch.cjs");

function testProtection() {
  for (const location of verifyPatch()) {
    // Run attack cases in a bounded child so a regression cannot hang CI.
    const result = spawnSync(
      process.execPath,
      [__filename, path.resolve(location)],
      {
        timeout: 10000,
        encoding: "utf8",
      },
    );
    assert.equal(result.status, 0, result.stderr || String(result.error));
  }
  console.log("Braces attack cases rejected; normal glob patterns preserved");
}

if (process.argv[2]) {
  const braces = require(process.argv[2]);
  assert.deepEqual(braces.expand("app/**/*.{ts,tsx}"), [
    "app/**/*.ts",
    "app/**/*.tsx",
  ]);
  assert.deepEqual(braces.expand("{a,{b,c}}"), ["a", "b", "c"]);
  assert.deepEqual(braces.expand("{1..3}"), ["1", "2", "3"]);
  assert.equal(braces.compile("a/{b,c}/d"), "a/(b|c)/d");
  assert.equal(braces.stringify(braces.parse("a/{b,c}/d")), "a/{b,c}/d");
  const rejected = (fn) =>
    assert.throws(
      fn,
      (error) =>
        error instanceof SyntaxError &&
        /safe nesting depth/.test(error.message),
    );
  for (const [open, close] of [
    ["{", "}"],
    ["(", ")"],
    ["({", "})"],
  ]) {
    const attack = open.repeat(2000) + "a,b" + close.repeat(2000);
    for (const method of ["parse", "compile", "expand", "stringify"]) {
      rejected(() => braces[method](attack));
    }
  }
  for (const method of ["compile", "expand", "stringify"]) {
    let ast = { type: "text", value: "a" };
    for (let i = 0; i < 6000; i++) ast = { type: "root", nodes: [ast] };
    rejected(() => braces[method](ast));
  }
} else if (require.main === module) {
  testProtection();
}
module.exports = { testProtection };

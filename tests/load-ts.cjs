const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

// Load actual TypeScript with external services replaced for focused checks.
function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2017,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    exports: module.exports,
    module,
    require: (name) => (name in mocks ? mocks[name] : require(name)),
    console,
    URL,
  });
  return module.exports;
}
module.exports = { load };

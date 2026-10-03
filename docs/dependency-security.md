# Temporary braces depth protection

On October 3, 2026, the npm registry's latest braces release is 3.0.3.
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
affects that version and has no patched upstream release. Tailwind's file
scanning and Next's ESLint tooling bring it into this repository. The reported
eight high findings include packages inheriting the same underlying advisory.
Upgrading Tailwind alone does not remove the linting dependency chain.

Our application does not pass user posts or search terms into braces. Nonetheless,
build and lint tools use it. Postinstall applies a local patch with SHA-256 checks
of both upstream and patched source. The parser rejects brace/parenthesis nesting
before it exceeds 127 levels; compile, expand and stringify reject AST nesting
over 128 levels, including caller-supplied ASTs. This changes only excessively
nested patterns, not the application's ordinary glob patterns. Prebuild verifies
the protection. Installs with scripts disabled must explicitly run
`node scripts/braces-patch.cjs` before using the tools.

`npm run audit:security` still executes npm's native JSON audit. It first verifies
every lockfile-listed braces installation and runs bounded child-process attack
tests. It recognizes only this exact advisory and transitive findings caused
solely by it. New advisories, missing protection, changed versions, audit failures
and expiration fail the gate. Raw `npm audit` continues to report the upstream
vulnerability: we are mitigating it locally, not claiming the registry package
has been fixed. No dependency advisory is hidden by renaming a package.

The review expires **October 17, 2026 UTC**. Before then, check upstream for a
patched release, update the lockfile, remove this local patch and exception, and
return CI to plain `npm audit --audit-level=high`. If no release exists, a fresh
security review is required; do not automatically extend the date.

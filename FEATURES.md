# Community features

Posts and comments now have author editing/deletion. Deleted bodies are cleared; threads remain as tombstones and retained rows still count toward rate limits. Community creators review reports and remove content. Reporting is deduplicated per reporter/target and limited to 20 new reports per hour.

Members can join/leave communities, use a joined-community home feed, search post titles/text, choose New or net-score Top with past-day/week/all-time filters, save posts privately, and browse public post/comment profiles. Replies nest up to ten levels. Comments/replies from another member create private in-app notifications; reading them clears the badge. Community creators configure rules and up to 20 flair labels.

The server derives every acting user from Kinde. Ownership checks are applied to writes as well as screens. New tables have default-deny RLS; privileged server Prisma access still requires these checks. Saved content and notification queries are scoped to the current user. Search SQL uses bound parameters and literal wildcard escaping.

## Validation on October 1, 2026

- Real Kinde login/logout and 31 Playwright browser checks against a local PostgreSQL database: all ten features, cancellation/confirmation, other-author edit denial, other-community moderation denial, guest write denial, and mobile/desktop layouts. Fictional-member comments were created through the actual server actions to test notification delivery and moderation; no production content was written.
- Repeatable `npm run test:browser` covers public search/sorting/profiles and authentication redirects with Playwright/Edge. Signed-in feature checks were run through Codex's browser Playwright controls; the smoke script does not automate third-party credentials.
- `npm test` and `npm run test:features` cover real PostgreSQL writes, ownership/field tampering, duplicate joins/saves/reports, cross-user notification privacy, reply preservation, SQL input, and rate-limit preservation after deletion. GitHub CI runs the feature suite against its own PostgreSQL service.
- The additive migration was applied to an isolated restoration of the fresh production backup. Original counts stayed unchanged, all nine tables retained RLS, and Prisma detected no schema drift.
- Production build and the Playwright smoke test against the production bundle passed. Dependency audit: zero vulnerabilities. One existing avatar image optimization warning remains. Restore verification also passed for an archive containing the new feature tables and migration history.

## Local testing

On Windows with PostgreSQL 18 installed, run `node scripts/browser-db.cjs start`. It creates a private loopback database on port 55440, applies migrations and seeds/checks fictional data. It refuses to replace an existing cluster. `test:features` resets this isolated database's content and is strictly guarded to this exact connection:

```
postgresql://browser_test@127.0.0.1:55440/postgres
```

Set `DATABASE_URL`, `DIRECT_URL` and `FEATURE_TEST_URL` to that connection in the shell, rather than overwriting private production credentials. For the dev server also set `KINDE_SITE_URL=http://localhost:3000`, `KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/api/auth/creation`, and `KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000`. Keep Kinde credentials in the ignored `.env.local`. Start `npm run dev`; sign in normally. Run `npm run test:browser` with Microsoft Edge installed, or set `PLAYWRIGHT_CHANNEL=chromium` after `npx playwright install chromium`. Stop the dev server and run `node scripts/browser-db.cjs stop` afterward.

## Release order

Production has not received the feature migration. Preview deployments using the same database also need this migration before their screens can run.

1. Take and verify a new backup with the existing private backup scripts.
2. With the production session-pooler `DIRECT_URL` and runtime `DATABASE_URL` loaded privately, run `npx prisma migrate deploy` from this reviewed revision. Do not use `db push`, `migrate reset`, or rerun the baseline resolver. This migration adds columns/tables, backfills searchable text, and enables RLS; it does not recreate existing tables.
3. Deploy this revision. The older deployment remains compatible with the additive schema during rollout. If needed, roll back the application deployment and retain the new schema/data.
4. Check login, posting, replies, notifications and moderation in the released app. Backup restore verification now reconstructs the migrations recorded in each archive, including older baseline-only archives.

Notifications refresh on navigation/reload; push/email delivery and invited moderator roles are outside this release. Search uses ILIKE and a post loads its whole reply tree; add indexed search/root-thread pagination when measured volume warrants it.

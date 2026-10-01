# Database recovery and migrations

## Private connection

Save the current project's **session pooler** connection string in `.env.local`
as `DIRECT_URL`, using port 5432 and a URL-encoded password. The file is ignored
by Git. Do not commit credentials or database exports. Production runtime uses
the transaction pooler; backup and migration commands use the session pooler.

## Fresh backups

With Node 24 and PostgreSQL client tools installed:

```powershell
npm run db:backup
```

Exports the complete `public` schema and its data to `.backups`, including
migration history once present. Archives use PostgreSQL custom format. A
timestamped JSON receipt records SHA-256 and confirms that `pg_restore` can read
the archive and find all five application tables' data. A failed dump retains
only a `.partial` file; it must never be treated as a usable backup.

`PG_BIN` can override the Windows PostgreSQL 18 tools directory. An optional
output directory can be supplied with `npm run db:backup -- DIRECTORY`.
These exports contain private user data. Keep a protected copy outside this
computer; backups here alone do not protect against device loss. Nothing is
automatically deleted.

Archive readability is not a restore test. On Windows, run:

```powershell
npm run db:verify-backup -- .backups/reddit-TIMESTAMP.dump
```

This starts an isolated, short-lived PostgreSQL server on loopback port 55439,
restores the archive, checks counts against the live database and checks RLS.
It executes the baseline in another empty local database and compares schemas.
The temporary server is stopped and its data directory removed after testing.
No restore is sent to Supabase. If port 55439 is occupied, the test fails safely.

Alternatively, restore into a **separate empty test
database**, never production, using `pg_restore --no-owner --no-acl
--exit-on-error --single-transaction`, then check all five tables' counts, foreign
keys and RLS settings. Keep passwords in environment variables or private
password prompts, not command arguments. These backups exclude Kinde accounts,
UploadThing image files, and Supabase's system schemas.

Supabase paid plans provide managed daily backups. On Free, arrange recurring
exports and periodically repeat an isolated restore test. A backup routine is
only configured when its scheduler or managed backups have been verified;
having this script alone does not establish one.

## One-time baseline of the restored production database

`prisma/migrations/0_init/migration.sql` represents the existing application
schema and its five RLS settings. **Do not execute this SQL against the restored
database**, where those tables already exist.

After taking and successfully restore-testing a fresh backup:

```powershell
npm run db:baseline -- .backups/reddit-TIMESTAMP.dump
```

The command refuses stale or corrupted backups, checks that the live schema
matches `schema.prisma`, requires RLS on all application tables, and refuses an
existing migration history. Only then does `prisma migrate resolve --applied
0_init` record the baseline. It checks migration status and row counts afterward
and writes a receipt alongside the backup. Prisma schema comparison does not
cover every PostgreSQL feature; RLS is checked separately.

## Subsequent schema changes

Create migrations against an isolated development database. Test them against
an isolated restored backup before production. Take a fresh production backup,
then explicitly run `prisma migrate deploy` using the production session
connection. Never run `migrate reset`, `db push --accept-data-loss`, or
`migrate dev` on production. Builds deliberately do not run migrations.

References: [Prisma baselining](https://docs.prisma.io/docs/orm/v6/prisma-migrate/workflows/baselining),
[Supabase backups](https://supabase.com/docs/guides/platform/backups).

## Verified recovery checkpoint — September 30, 2026

The fresh production export was successfully restored locally. Counts matched:
6 users, 8 communities, 14 posts, 3 votes and 8 comments. RLS was enabled on all
five application tables; executing the baseline reproduced the restored schema.
Production `0_init` was marked applied, migration status was current, and row
counts were unchanged. A second export includes the migration history.

The Codex heartbeat **Back up Reddit clone database** is active daily at 7 PM
America/Los_Angeles, with an isolated restore check on Sundays and failure-only
notifications. It requires this computer and Codex to be available. `.backups`
and `.env.local` stay out of Git. Supabase-managed backups have not been enabled;
the retained 2024 recovery archive remains a separate recovery copy.

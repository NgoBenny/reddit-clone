# Reddit clone audit and revival

Audited September 30, 2026. Repository: [NgoBenny/reddit-clone](https://github.com/NgoBenny/reddit-clone), starting commit `dd0f2fc`. This is the Next.js/Prisma project; the account also has a separate `redditclone` repository.

## Is it recoverable?

Yes. The source contains a working small discussion application, and GitHub's Vercel deployment status is successful. The reported production error is a runtime failure in `prisma.post.count()`: Prisma cannot reach `aws-0-us-west-1.pooler.supabase.com:6543`. The owner confirmed that the Supabase project is paused, then clarified that restoration has not started and asked about hosted versus local backup recovery. This explains the reported database outage; it does not establish expired credentials. The original deployment still displayed digest `4017352080` during browser checks.

Prisma here is an ORM that connects directly to PostgreSQL using `DATABASE_URL`. There is no Prisma API key or Supabase JavaScript SDK in this application. Supabase hosts the database; Kinde handles authentication; UploadThing stores images. Restoring Supabase can recover the existing deployment without a code release, provided its connection settings remain valid.

## Stack

| Layer | Original repository | Repair branch |
| --- | --- | --- |
| Application | Next.js 14.2.3 App Router, React 18, TypeScript | Next.js 15.5.27, React 18.3.1; asynchronous route props updated |
| Runtime | No Node version specified | Node 22.x specified for Vercel and local setup |
| UI | Tailwind CSS 3, shadcn/Radix, Lucide, next-themes | Existing UI retained; feed/post layouts work at narrow widths |
| Database | PostgreSQL, Prisma/client 5.13.0 | Same schema and Prisma version; no production schema changes |
| Login | Kinde Next.js SDK 2.2.5 in the original lockfile | Compatible SDK update to 2.13.1 |
| Editing | Tiptap 2; renderer configured only for paragraphs/text | Patched Tiptap 3; safe rendering for existing StarterKit formatting |
| Images | UploadThing 6, Next Image | UploadThing 6 retained; Sharp installed for Next image processing |
| Hosting | Vercel | Existing Vercel project retained |

Next.js 14 is outside the currently supported release lines. See the [Next.js support policy](https://nextjs.org/support-policy). The 15.x maintenance release keeps this revival smaller than a move to Next.js 16/React 19. Keep applying security patches; pinned versions are not a permanent security guarantee.

## Existing features

- Kinde registration/login/logout and local user provisioning.
- Unique usernames and account settings.
- Community creation and creator-facing description editing.
- Rich-text and image posts, post detail pages, and comments.
- Upvotes/downvotes, pagination, and light/dark themes.
- Share links and authenticated image uploads.

## Findings and fixes

| Priority | Finding | Repair |
| --- | --- | --- |
| P0 | Paused Supabase makes the home feed fail on the server | Hosted restoration still required; added a connection/table diagnostic and environment template |
| P0 | Description editing only checks login; a forged action can edit another owner's community | Database update filters by both community name and authenticated creator ID |
| P0 | Old dependency tree has 51 npm audit findings, including a critical Next.js finding | Framework/auth/editor updates, compatible dependency patches, and lockfile refreshed |
| P1 | Vote read/write steps race and permit duplicate votes | Serializable transaction with bounded conflict retries; removes duplicates for that user/post on its next vote action |
| P1 | Vote colors use independent local booleans; switching votes can highlight both, reload loses selection | Buttons derive selection from the authenticated user's database vote |
| P1 | Voting only invalidates the home page | All pages refresh after voting; comments refresh detail and feed counts |
| P1 | Posting always links to `un1on`, even inside other communities | Community pages use their own name; home links to a searchable, paginated directory |
| P1 | Arbitrary page query values become negative/NaN Prisma offsets | Shared page parser falls back to page 1 for invalid or excessive input |
| P1 | Unknown community renders undefined links/date instead of a 404 | Calls Next.js `notFound()` |
| P1 | Community posts have no ordering | Newest-first ordering with an ID tie-breaker |
| P1 | Server actions trust browser validation and hidden fields | Validates names, titles, comments, descriptions, vote directions, image hosts, and bounded rich-text documents |
| P1 | Rich-text renderer omits headings/marks/lists; bundled renderer includes an old React copy | Small React renderer supports the editor's existing node types, escapes text, and never spreads stored attributes into the DOM |
| P1 | Post-login route hardcodes the production domain and read/create provisioning can race | Uses configured site origin and a user upsert |
| P2 | Failed comments/uploads/clipboard writes give poor feedback | Toast errors; failed comment submission retains the draft |
| P2 | Image tab advertises video although uploader accepts images only | Label changed to Image, with instructions for publishing |
| P2 | Layout assumes desktop percentage columns | Responsive columns and constrained post content |
| P2 | Empty feed, shared pagination keys, boilerplate metadata, default crash screen | Empty state, unique keys, pagination labels, app metadata, retry screens |

The connection error remains a service issue until the project is restored. Error screens improve recovery feedback but cannot reconnect a paused database. No fake feed or authentication bypass was added.

## Features still missing, in recommended order

1. **Operate safely:** baseline Prisma migrations against the existing database, back up data, add database uniqueness for `(postId, userId)` after reviewing historical duplicates, and index feed/filter/join columns. Make required author/post relations non-null only after an orphan-data review. Add deployment smoke checks and uptime monitoring. The current schema has no migration history, and several relations are nullable.
2. **Content ownership and moderation:** allow authors to edit/remove their posts and comments; add reporting, moderator roles/actions, configurable community rules, and server-side rate limits for posting/commenting/voting. The visible rules currently are text, not enforced policy. Avoid launching broadly before abuse controls are ready.
3. **Community membership:** join/leave communities, membership counts, and a feed of subscribed communities. There is no membership model today.
4. **Discovery:** post search, user profiles/activity, and explicit New/Top sorting. Community search is added in this repair. Use PostgreSQL search/aggregation before adding a separate search service.
5. **Discussion:** nested replies and comment votes, with bounded thread rendering and pagination for large discussions. Post pages currently fetch every comment and every vote.
6. **Convenience:** saved posts, notifications for replies, image replacement/removal in the composer, direct publishing from the image tab, relative timestamps, and more complete keyboard/form accessibility.

Not every Reddit feature is necessary. Chats, realtime feeds, video transcoding, recommendation systems, and a new backend are deferred until the basic application is healthy and usage justifies them.

## Restore the existing deployment

1. In Supabase, restore the original project and wait until it is active. Refresh the existing Vercel URL. If it works, the immediate outage is resolved.
2. If it still fails, inspect a new Vercel runtime log. Compare **Connect → Transaction pooler** with `DATABASE_URL` in Vercel's Production environment. Copy the current host, database user, and URL-encoded password. For this Prisma 5 application, use port 6543 and `pgbouncer=true`; the environment example includes conservative connection and TLS settings. Use the exact host from your dashboard, not an assumed region/hostname.
3. Set `DIRECT_URL` to the current session pooler on port 5432, or a direct connection when the execution environment supports it. Keep schema commands away from the transaction pooler. See [Supabase's Prisma connection guide](https://supabase.com/docs/guides/database/prisma).
4. Verify all Kinde environment variables from `.env.example`. Production site/logout URLs use your Vercel domain. The post-login URL must end in `/api/auth/creation` so the local user row exists before posting. Kinde's allowed callback is `https://YOUR_DOMAIN/api/auth/kinde_callback`; configure the matching logout redirect. Give preview deployments their own correctly allowed callback/origin, or test authentication on a stable staging domain.
5. Keep the existing UploadThing v6 app ID/secret valid. Test an image upload after login. Changing to UploadThing v7 requires a separate credential/API migration.
6. For the repair release, set the Vercel root directory to the repository root and Node to 22.x. Use `npm ci` and `npm run build`, then verify a preview before promoting it. New environment settings require a new deployment to take effect.
7. After restoration, verify browsing, login, community creation, owned description updates, text/image posting, vote toggle/switch, comments, and logout. Compare fresh runtime logs if anything fails.

### When the original project only offers a downloadable backup

Restore into a **new hosted Supabase project** to revive Vercel. A local restore is useful for inspecting or recovering data, but it does not give the deployed application a hosted database. Follow the [dashboard backup restore guide](https://supabase.com/docs/guides/platform/migrating-within-supabase/dashboard-restore) for a logical dashboard backup; the [local restore guide](https://supabase.com/docs/guides/local-development/restoring-downloaded-backup) explains the separate local workflow. Identify the backup format before choosing the import tool.

Download and keep the old backup, create an empty new project, and import the backup using its **session pooler on port 5432**. Do not import into a project already holding important data. Verify that `User`, `Subreddit`, `Post`, `Vote`, and `Comment` and their records were recovered. Then update Vercel's `DATABASE_URL` and `DIRECT_URL` to the new project's settings and redeploy. Kinde and UploadThing remain separate services; this code does not use Supabase Auth or Supabase Storage. Keep the old backup until browsing and signed-in operations work against the restored project.

No passwords or connection strings were obtained during the audit. Do not send them in chat or add them to Git. If the original project cannot be restored, investigate its available backup/export before creating a replacement database. Do not run `prisma migrate reset` or a destructive schema sync against surviving production data.

## Local setup and validation

```sh
# Node 22.x
npm ci
# Copy .env.example to .env.local and fill in your own service settings.
npm run db:check
npm test
npx tsc --noEmit
npm run lint
npm run build
npm run dev
```

`db:check` only reads the database and checks all five tables. It does not print credentials or change the schema. The regression check runs the real validation/rendering/action code with external services stubbed; it covers denied ownership, authentication, vote toggling/duplicate repair/conflict retry, invalid inputs, and escaped rich text. It is not a live database concurrency or OAuth test.

| Verification | Result |
| --- | --- |
| Production build | Passed on Node 22.23.3 with temporary fake Kinde build values; all routes compiled |
| Type checking | Passed, including asynchronous Next.js 15 route props |
| Regression check | Passed |
| Lint | Passed with two existing warnings for unoptimized avatar `<img>` elements |
| Dependency audit | Zero known vulnerabilities after updates, including patched Sharp/PostCSS overrides |
| Live site | Still fails with the original digest; owner has not restored the database yet |
| Live DB/OAuth/uploads | Not verified; no service credentials available locally |

The successful build uses fake auth configuration only to compile routes, and does not validate real Kinde login. No fake credentials were saved to a production configuration. Full signed-in end-to-end checks require a restored database and valid Kinde/UploadThing configuration. The repair has no schema migration requirement and does not modify the production database.

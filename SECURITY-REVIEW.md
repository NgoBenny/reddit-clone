# Security checklist review — October 1, 2026

The screenshot is a useful checklist, not a guarantee of security. Existing
protections were verified rather than implemented again. New code below needs
its PR merged and deployed; Vercel bot logging was published separately.

| # | Check | Finding and action |
|---|---|---|
| 1 | Hide API keys | Database, Kinde secret and UploadThing secret are server-only environment variables. No public-prefixed secrets in application code. `.env.local` and backups are Git-ignored. |
| 2 | Purge Git secrets | Targeted credential-pattern scan of 24 reachable commits found no matches; no private env/key files in tracked history. This is a scoped scan, not proof that every possible secret is absent. No history rewrite is justified by these results. |
| 3 | Public DB key | Not applicable: browser clients do not access Supabase directly. Prisma uses server-only PostgreSQL credentials; replacing them with a public API key would break the architecture. |
| 4 | RLS | Verified enabled on all five live application tables. The privileged Prisma role bypasses RLS, so server-side authorization remains essential. No browser-access policies were added. |
| 5 | Encrypt sensitive data | HTTPS is enforced; the private database URL requests TLS. Local backup archives themselves are not encrypted. Disk/backup encryption is unverified. Strict validation of the pooler's certificate with Node's default roots failed with SELF_SIGNED_CERT_IN_CHAIN; configure the appropriate Supabase CA before claiming verified database-server identity. No validation bypass was added. Field encryption of public post content would obstruct normal search/rendering without addressing these storage concerns. |
| 6 | Server auth | Existing shared server-action login guard and upload middleware enforce authentication. |
| 7 | Record access | Existing username writes use the authenticated ID; community-description writes also require creator ownership. Public posts/comments are intentionally readable. Edit/delete endpoints do not exist yet and must enforce ownership when added. |
| 8 | Field tampering | Existing writes explicitly select accepted fields; ownership is derived from the session, not submitted user IDs. |
| 9 | Session cookies | Installed Kinde SDK sets HttpOnly, SameSite=Lax and Secure in production. Reuse those settings; no custom session system. |
| 10 | Password hashing | Kinde/social providers handle credentials; this application stores no user passwords. Kinde documents bcrypt for password-based accounts. No second password database is needed. |
| 11 | Login rate limits | Kinde documents hosted-login throttling and temporary failed-attempt lockouts. Local login routes start that hosted flow; no duplicate authentication limiter added. Additionally, this PR limits creation to 3 posts/minute, 10 comments/minute and 2 communities/hour per account. |
| 12 | Bots | Vercel platform DDoS protection already exists. Bot Protection was Off; changed to Log and published. Log records matching requests without blocking them. Challenge mode is deferred until legitimate automated callbacks have been checked. Creation limits reduce spam but do not replace bot challenges or upload/vote flood limits. |
| 13 | Query parameters | Existing Prisma queries are parameterized. New PostgreSQL advisory-lock SQL binds its user/action key with a tagged query. |
| 14 | Input validation | Existing text lengths, names, pagination, rich-text structure/depth and image URLs are validated server-side. Added raster-image MIME allowlist to authenticated upload middleware. MIME metadata alone is not full binary-content inspection. |
| 15 | Escape content | Existing React text rendering escapes content; rich-text renderer allowlists tags/marks and never spreads stored attributes into the DOM. |
| 16 | Upload restrictions | Existing login requirement, image-only endpoint, one file and 16 MB limit retained. JPEG, PNG, WebP and GIF now allowed explicitly; SVG/HTML/executable MIME types rejected. |
| 17 | Response minimization | Existing Prisma select projections retain needed fields. Feed queries now fetch comment counts instead of all comment IDs; unused upload user-ID response and upload logs removed. |
| 18 | Headers | Added nosniff, frame denial, referrer/permissions policies and baseline CSP. Disabled X-Powered-By. Existing Vercel HSTS retained. CSP restricts framing/base URLs/objects; it is not a full nonce-based script policy. |
| 19 | HTTPS | Live HTTP request redirected to HTTPS (308); HTTPS returned 200 with Vercel HSTS. No redundant redirect middleware added. |
| 20 | Dependencies | npm audit reported zero vulnerabilities. Added GitHub CI regression and dependency checks on PRs/main/manual runs; high/critical advisories fail the check. |

## Rate-limit design and validation

Creation checks and writes run inside the same PostgreSQL transaction. A
transaction-scoped advisory lock serializes each account/action across server
instances. ReadCommitted ensures the count sees earlier committed writes.
Limits count retained rows; a separate counter will be needed when content
deletion is introduced. No schema changes or in-memory serverless counters.

An isolated local backup restoration tested 15 concurrent comment requests:
exactly 10 succeeded and 5 were rejected. Production records were not written.
Unit regression checks cover limit boundaries, auth, ownership, uploads,
headers, rendering and form behavior. Production build/type checks passed,
with the existing two image-optimization warnings.

To repeat the isolated database test on Windows:

```powershell
npm run db:verify-backup -- .backups/reddit-TIMESTAMP.dump --security-test
```

## Provider references and remaining operational checks

- [Kinde security controls](https://docs.kinde.com/get-started/learn-about-kinde/kinde-product-security/): hosted authentication, hashing and throttling.
- [Vercel bot management](https://vercel.com/docs/bot-management): logging/challenge modes; logging does not block bots.
- [Supabase SSL configuration](https://supabase.com/docs/guides/platform/ssl-enforcement): certificate/CA configuration.
- Verify encrypted storage for `.env.local` and private backup exports, and retain a protected external backup copy.
- Configure the appropriate database CA and strict certificate verification, then verify both local and Vercel connections before changing production URLs.
- Evaluate bot Challenge mode with UploadThing/auth flows, then enforce it if those integrations remain functional.

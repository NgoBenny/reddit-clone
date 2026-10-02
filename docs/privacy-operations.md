# Privacy and provider operations

Operator: Benny Ngo, Santa Clara, California. Approved public contact: bkvngo@gmail.com.

## Account requests

The contact page supports access, correction and deletion requests. This is a manual operator workflow, not automatic account erasure. Verify ownership through the existing account identity; never ask for a password or login code. Do not disclose an account export based only on an emailed username.

For a verified request, inventory the User record, authored Posts/Comments, Votes, Memberships, SavedPosts, Reports and Notifications. Review community ownership before unlinking its owner. Remove identifying content/associations as appropriate while preserving other users' conversations. Kinde identities and UploadThing files are separate and must also be addressed. Historical duplicate email/name/avatar fields need to be included. Newly created app profiles no longer duplicate Kinde contact details.

Backups are Git-ignored and local. The approved retention policy keeps routine archives for 30 days and always preserves original recovery files and the newest successfully restore-tested archive. `scripts/prune-backups.cjs NEW_ARCHIVE --apply` runs only after a successful fresh backup; invalid receipts/checksums stop pruning. Weekly isolated restores verify recoverability. The routine requires this computer and Codex to be available. An independent protected off-device copy remains an operator task; no backup was uploaded elsewhere.

Keep a private register of completed erasures (identity references, completion date and affected systems) outside Git. Before any recovery becomes accessible to users, replay those erasures across the restored database and confirm provider deletions separately, then verify the result. Never restore over production as a shortcut. Record completion and any legitimate retention reason privately. Do not put requester details or exports in GitHub issues or logs.

## Kinde settings after policy deployment

On October 2, 2026, the live business links were saved as `https://reddit-clone-ashen.vercel.app/terms` and `https://reddit-clone-ashen.vercel.app/privacy`. The hosted Common registration page displayed both links and its policy notice. No account was created during this verification. The explicit acceptance checkbox remains unavailable on the current plan. Update these URLs if the canonical production address changes.

Set business Terms of use URL to the deployed `/terms` and Privacy policy URL to `/privacy`. Review the sign-up page copy to state: “Common is for users aged 13 or older who meet the minimum age required where they live. Review the Terms and Privacy Policy before joining.” Link the policies visibly. Verify this in the hosted registration experience. A link is notice, not proof of affirmative agreement or parental consent. Kinde’s explicit policy-acceptance checkbox was disabled on the current plan; do not purchase a plan or claim recorded consent without approval.

Kinde owns passwords, email verification, reset link expiry, authentication throttling and session controls. Verify tenant settings and provider behavior for password changes, forced session revocation, account lockout and generic errors. App cookie flags are HttpOnly, Secure in production, SameSite=Lax. Social providers have independent sessions.

## Database runtime permissions

The owner connection is `postgres` with BYPASSRLS/CREATEDB/CREATEROLE; retain it only in DIRECT_URL for approved schema administration. On October 2, 2026, after a fresh verified backup, `docs/runtime-role.sql` was applied through `scripts/setup-runtime-role.cjs`. The server-only common_app role was tested through both Supabase poolers: application reads and rollback-only writes worked; schema creation/migration history privileges were absent and role administration/BYPASSRLS were disabled. Unused anon/authenticated table grants were revoked. Its credentials are in private `.env.runtime.local`, never Git. The operator saved the runtime DATABASE_URL in Vercel; production redeployment `dpl_9eMGtZw6HHwB6vZiFGTAUNfoqHvq` reached READY. Live discovery/policy pages returned 200, signed-in Save/Unsave persisted and was reverted, notifications loaded, and database connection metadata confirmed common_app connections. DIRECT_URL remains unchanged. Server actions enforce per-user authorization: RLS permits the trusted server role, not end users.

Post-hardening backup restore also passed with role-referencing RLS policies. The verifier creates a local NOLOGIN common_app placeholder without production credentials. After a real recovery, reapply the reviewed runtime grants/policies and set new credentials privately before allowing application traffic; the public-schema dump deliberately does not contain role passwords or provider files.

## Licenses and user content

Common glyphs are original SVG geometry. Inter uses its SIL Open Font License; Lucide uses ISC. Preserve upstream notices. Uploaded content belongs to its authors or rightsholders; old image posts are not automatically licensed by being in a backup. Use the contact/copyright workflow to resolve concerns; do not delete user content during an audit without authorization.

## California and teen audience

Do not describe the project as universally legally compliant. Assess applicable California privacy requirements and thresholds using actual business facts. Under-13 actual knowledge and child-directed use require a separate COPPA assessment; saying “13+” alone is not a parental-consent mechanism. For teens, avoid DOB collection, advertising profiles or optional analytics without a justified purpose and reviewed consent approach. A new paid service, targeted advertising or children's service requires policy and product reassessment.

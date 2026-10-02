# Privacy and provider operations

Operator: Benny Ngo, Santa Clara, California. Approved public contact: bkvngo@gmail.com.

## Account requests

The contact page supports access, correction and deletion requests. This is a manual operator workflow, not automatic account erasure. Verify ownership through the existing account identity; never ask for a password or login code. Do not disclose an account export based only on an emailed username.

For a verified request, inventory the User record, authored Posts/Comments, Votes, Memberships, SavedPosts, Reports and Notifications. Review community ownership before unlinking its owner. Remove identifying content/associations as appropriate while preserving other users' conversations. Kinde identities and UploadThing files are separate and must also be addressed. Historical duplicate email/name/avatar fields need to be included. Newly created app profiles no longer duplicate Kinde contact details.

Backups are Git-ignored and local. Existing backup automation deliberately does not delete archives. A documented retention period, protected off-device copy and replay of completed erasures after restore remain operator decisions; do not claim a fixed retention period until enforced. Record completion and any legitimate retention reason privately. Do not put requester details or exports in GitHub issues or logs.

## Kinde settings after policy deployment

Set business Terms of use URL to the deployed `/terms` and Privacy policy URL to `/privacy`. Review the sign-up page copy to state: “Common is for users aged 13 or older who meet the minimum age required where they live. Review the Terms and Privacy Policy before joining.” Link the policies visibly. Verify this in the hosted registration experience. A link is notice, not proof of affirmative agreement or parental consent. Kinde’s explicit policy-acceptance checkbox was disabled on the current plan; do not purchase a plan or claim recorded consent without approval.

Kinde owns passwords, email verification, reset link expiry, authentication throttling and session controls. Verify tenant settings and provider behavior for password changes, forced session revocation, account lockout and generic errors. App cookie flags are HttpOnly, Secure in production, SameSite=Lax. Social providers have independent sessions.

## Database runtime permissions

The checked owner connection is `postgres` with BYPASSRLS/CREATEDB/CREATEROLE; this is appropriate for schema administration, not least-privilege runtime use. `docs/runtime-role.sql` prepares a narrower server-only DML role and revokes unused public Data API grants. It is NOT automatically executed. Set its password privately, test using the session pooler, then update only the production DATABASE_URL and redeploy. Keep DIRECT_URL with the owner for approved migrations. Confirm the runtime account cannot create/alter/drop tables, change roles or read migration history. Server actions still enforce per-user authorization: RLS permits the trusted server role, not end users.

## Licenses and user content

Common glyphs are original SVG geometry. Inter uses its SIL Open Font License; Lucide uses ISC. Preserve upstream notices. Uploaded content belongs to its authors or rightsholders; old image posts are not automatically licensed by being in a backup. Use the contact/copyright workflow to resolve concerns; do not delete user content during an audit without authorization.

## California and teen audience

Do not describe the project as universally legally compliant. Assess applicable California privacy requirements and thresholds using actual business facts. Under-13 actual knowledge and child-directed use require a separate COPPA assessment; saying “13+” alone is not a parental-consent mechanism. For teens, avoid DOB collection, advertising profiles or optional analytics without a justified purpose and reviewed consent approach. A new paid service, targeted advertising or children's service requires policy and product reassessment.

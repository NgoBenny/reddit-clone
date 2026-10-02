export const metadata = {
  title: "Contact and data requests",
  description:
    "Contact Common’s operator about access, correction, deletion, copyright and accessibility.",
};

export default function ContactPage() {
  return (
    <>
      <h1>Contact &amp; data requests</h1>
      <p>Common is operated by Benny Ngo, based in Santa Clara, California.</p>
      <p>
        <a href="mailto:bkvngo@gmail.com">Email bkvngo@gmail.com</a> for
        support, privacy, accessibility, copyright or moderation concerns.
      </p>
      <h2>Request a copy, correction or deletion</h2>
      <p>
        Tell us whether you want an account data copy, a correction or deletion,
        and include your Common username and the email associated with your
        account. Do not include passwords, access tokens or verification codes.
        We will verify ownership before sharing or deleting private account
        data.
      </p>
      <p>
        An account request may cover application records in Supabase,
        authentication records in Kinde, uploaded files in UploadThing and
        recovery copies. Deleting individual posts does not complete account
        erasure. See our <a href="/privacy">privacy policy</a> for current
        retention limitations.
      </p>
      <h2>Report content</h2>
      <p>
        Use the report control on a post or comment to contact its community
        moderator. For a copyright request, include the content URL and explain
        your ownership or authority. For a suspected under-13 account, contact
        the operator without posting the child’s information publicly.
      </p>
    </>
  );
}

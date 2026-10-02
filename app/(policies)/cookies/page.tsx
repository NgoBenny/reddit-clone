export const metadata = {
  title: "Cookies and browser storage",
  description:
    "Authentication cookies, theme preferences and tracking choices on Common.",
};

export default function CookiesPage() {
  return (
    <>
      <h1>Cookies and browser storage</h1>
      <p>Updated October 2, 2026.</p>
      <h2>Sign-in and security</h2>
      <p>
        Kinde’s authentication integration uses cookies for the login
        transaction, session and tokens. Production authentication cookies are
        HttpOnly, Secure and SameSite=Lax. They support signing in, staying
        signed in and protecting the login flow. Kinde and your social sign-in
        provider also use storage on their own domains.
      </p>
      <h2>Theme preference</h2>
      <p>
        Your chosen light, dark or system theme is saved in your browser’s local
        storage. It is a display preference, not an advertising identifier. You
        can change it using the theme menu or clear it using your browser’s
        site-data settings.
      </p>
      <h2>Tracking</h2>
      <p>
        Common does not currently install advertising or optional audience
        analytics cookies. There is no “accept all” banner because there are no
        optional tracking categories to accept. If optional tracking is added,
        it needs a separate consent assessment and controls before it runs.
      </p>
      <p>
        Hosting, authentication and image services may process operational logs
        or set cookies needed for their services. Blocking authentication
        cookies can prevent sign-in. Questions:{" "}
        <a href="/contact">contact the operator</a>.
      </p>
    </>
  );
}

import Link from "next/link";

export function LegalLinks() {
  return (
    <nav
      aria-label="Policies and contact"
      className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"
    >
      <Link
        className="inline-flex min-h-11 items-center underline"
        href="/privacy"
      >
        Privacy
      </Link>
      <Link
        className="inline-flex min-h-11 items-center underline"
        href="/terms"
      >
        Terms
      </Link>
      <Link
        className="inline-flex min-h-11 items-center underline"
        href="/cookies"
      >
        Cookies
      </Link>
      <Link
        className="inline-flex min-h-11 items-center underline"
        href="/contact"
      >
        Contact & data requests
      </Link>
    </nav>
  );
}

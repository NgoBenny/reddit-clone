import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-single py-12">
      <h1 className="text-3xl font-semibold">This page couldn’t be found</h1>
      <p className="mt-3 text-muted-foreground">
        The address may be incorrect, or this community or post may no longer be
        available.
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link
          className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-primary-foreground"
          href="/"
        >
          Explore conversations
        </Link>
        <Link
          className="inline-flex min-h-11 items-center text-primary underline"
          href="/communities"
        >
          Browse communities
        </Link>
      </div>
    </main>
  );
}

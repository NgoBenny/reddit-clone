"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-xl px-5 py-16">
      <h1 className="text-2xl font-semibold">We couldn’t load this page</h1>
      <p className="my-4 text-muted-foreground">Please try again in a moment.</p>
      {error.digest && <p className="mb-4 text-sm">Reference: {error.digest}</p>}
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}

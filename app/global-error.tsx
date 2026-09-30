"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en"><body>
      <main style={{ maxWidth: 600, margin: "80px auto", padding: 24 }}>
        <h1>We couldn’t load the site</h1>
        <p>Please try again in a moment.</p>
        <button onClick={reset}>Try again</button>
      </main>
    </body></html>
  );
}

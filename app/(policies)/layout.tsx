import type { ReactNode } from "react";

export default function PolicyLayout({ children }: { children: ReactNode }) {
  return (
    <main className="page-single">
      <article className="prose max-w-none dark:prose-invert prose-a:text-primary">
        {children}
      </article>
    </main>
  );
}

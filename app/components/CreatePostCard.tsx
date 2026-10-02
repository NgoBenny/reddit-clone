import { PenLine, ImagePlus } from "lucide-react";
import Link from "next/link";

export function CreatePostCard({ subName }: { subName?: string }) {
  const href = subName
    ? `/r/${encodeURIComponent(subName)}/create`
    : "/communities?compose=1";
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-card p-3">
      <PenLine
        className="ml-1 h-5 w-5 shrink-0 text-primary"
        aria-hidden="true"
      />
      <Link
        href={href}
        className="flex min-h-11 min-w-0 flex-1 items-center rounded-xl px-2 text-sm text-muted-foreground hover:bg-muted hover:text-primary"
      >
        {subName
          ? "Share something with this community"
          : "Start a conversation"}
      </Link>
      <Link
        href={href}
        aria-label="Create an image post"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
      >
        <ImagePlus className="h-5 w-5" />
      </Link>
    </div>
  );
}

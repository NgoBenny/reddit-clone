import { MessagesSquare } from "lucide-react";

export function Brand() {
  return (
    <span className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <MessagesSquare className="h-5 w-5" aria-hidden="true" />
      </span>
      Common
    </span>
  );
}

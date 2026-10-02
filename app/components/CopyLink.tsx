"use client";

import { useToast } from "@/components/ui/use-toast";
import { Share } from "lucide-react";

export function CopyLink({ id }: { id: string }) {
  const { toast } = useToast();
  async function copytoClipboard() {
    try {
      await navigator.clipboard.writeText(`${location.origin}/post/${id}`);
      toast({ title: "Success", description: "Copied link to clipboard" });
    } catch {
      toast({ title: "Couldn’t copy link", description: `${location.origin}/post/${id}`, variant: "destructive" });
    }
  }
  return (
    <button type="button" className="flex min-h-11 items-center gap-x-1.5 rounded-xl px-2 hover:bg-muted" onClick={copytoClipboard}>
      <Share className="h-4 w-4 text-muted-foreground" />
      <p className="text-muted-foreground font-medium text-xs sm:text-sm">
        Share
      </p>
    </button>
  );
}

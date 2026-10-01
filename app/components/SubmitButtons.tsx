"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { ArrowBigDown, ArrowBigUp, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export function SubmitButton({ text, className, size }: {
  text: string;
  className?: string;
  size?: ButtonProps["size"];
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={className} size={size}>
      {pending && <Loader2 className={cn("mr-2 animate-spin", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />}
      {pending ? "Please wait" : text}
    </Button>
  );
}

export function VoteButton({ direction, active = false }: {
  direction: "UP" | "DOWN";
  active?: boolean;
}) {
  const { pending } = useFormStatus();
  const Icon = direction === "UP" ? ArrowBigUp : ArrowBigDown;
  return (
    <Button variant="ghost" size={pending ? "icon" : "sm"} type="submit"
      disabled={pending} aria-label={direction === "UP" ? "upvote" : "downvote"}
      aria-pressed={active}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : (
        <Icon className={cn("h-5 w-5 text-zinc-700 dark:text-white", active &&
          (direction === "UP" ? "!text-red-500 fill-red-500" : "!text-blue-500 fill-blue-500"))} />
      )}
    </Button>
  );
}

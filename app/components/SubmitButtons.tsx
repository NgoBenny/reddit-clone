"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { ArrowBigDown, ArrowBigUp, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function SubmitButton({
  text,
  className,
  size,
  variant,
  pressed,
  icon,
  disabled,
}: {
  text: string;
  className?: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  pressed?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className={cn("min-h-11 gap-2", className)}
      size={size}
      variant={variant}
      aria-pressed={pressed}
    >
      {pending && (
        <Loader2
          className={cn(
            "mr-2 animate-spin",
            size === "sm" ? "h-3 w-3" : "h-4 w-4",
          )}
        />
      )}
      {!pending && icon}
      {pending ? "Please wait" : text}
    </Button>
  );
}

export function VoteButton({
  direction,
  active = false,
}: {
  direction: "UP" | "DOWN";
  active?: boolean;
}) {
  const { pending } = useFormStatus();
  const Icon = direction === "UP" ? ArrowBigUp : ArrowBigDown;
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-11 w-11"
      type="submit"
      disabled={pending}
      aria-label={direction === "UP" ? "upvote" : "downvote"}
      aria-pressed={active}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon
          className={cn(
            "h-5 w-5 text-muted-foreground",
            active && "text-primary fill-primary/20",
          )}
        />
      )}
    </Button>
  );
}

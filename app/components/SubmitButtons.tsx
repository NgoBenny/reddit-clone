"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowBigDown,
  ArrowBigUp,
  ArrowDown,
  ArrowUp,
  Loader2,
} from "lucide-react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </Button>
      ) : (
        <Button type="submit">{text}</Button>
      )}
    </>
  );
}

export function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button className="mt-2 w-full" disabled size="sm">
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          Please wait
        </Button>
      ) : (
        <Button size="sm" className="mt-2 w-full" type="submit">
          Save
        </Button>
      )}
    </>
  );
}

export function UpVote({ active = false }: { active?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button variant="ghost" size="icon" disabled>
          <Loader2 className="h-4 w-4 animate-spin" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          type="submit"
          aria-label="upvote"
          aria-pressed={active}
        >
          <ArrowBigUp
            className={cn("h-5 w-5 text-zinc-700 dark:text-white", {
              "!text-red-500 fill-red-500": active,
            })}
          />
        </Button>
      )}
    </>
  );
}

export function DownVote({ active = false }: { active?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button variant="ghost" size="icon" disabled>
          <Loader2 className="h-4 w-4 animate-spin" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          type="submit"
          aria-label="downvote"
          aria-pressed={active}
        >
          <ArrowBigDown
            className={cn("h-5 w-5 text-zinc-700 dark:text-white", {
              "!text-blue-500 fill-blue-500": active,
            })}
          />
        </Button>
      )}
    </>
  );
}

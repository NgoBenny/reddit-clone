"use client";
import { useRef, type ReactNode } from "react";
import { unstable_rethrow } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export function ActionForm({
  action,
  children,
  confirm,
  success,
  className,
}: {
  action: (form: FormData) => Promise<unknown>;
  children: ReactNode;
  confirm?: string;
  success?: string;
  className?: string;
}) {
  const { toast } = useToast();
  const ref = useRef<HTMLFormElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const confirmed = useRef(false);
  return (
    <form
      ref={ref}
      className={className}
      onSubmit={(event) => {
        if (confirm && !confirmed.current) {
          event.preventDefault();
          dialog.current?.showModal();
        }
      }}
      action={async (form) => {
        try {
          await action(form);
          const details = ref.current?.closest("details");
          if (details) details.open = false;
          if (success) toast({ title: success });
        } catch (error) {
          unstable_rethrow(error);
          toast({
            title: "Couldn’t save changes",
            description:
              "Check your input and access, then try again. Your draft is kept.",
            variant: "destructive",
          });
        } finally {
          confirmed.current = false;
        }
      }}
    >
      {children}
      {confirm && (
        <dialog
          ref={dialog}
          aria-label="Confirm action"
          className="max-w-sm rounded border bg-background p-5 text-foreground backdrop:bg-black/60"
        >
          <p>{confirm}</p>
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              className="rounded border px-3 py-2"
              onClick={() => dialog.current?.close()}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded bg-destructive px-3 py-2 text-destructive-foreground"
              onClick={() => {
                confirmed.current = true;
                dialog.current?.close();
                ref.current?.requestSubmit();
              }}
            >
              Confirm
            </button>
          </div>
        </dialog>
      )}
    </form>
  );
}

"use client";

import { createCommunity } from "@/app/actions";
import { SubmitButton } from "@/app/components/SubmitButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useFormState } from "react-dom";

import { useActionToast } from "@/app/components/useActionToast";

const initialState = {
  message: "",
  status: "",
};

export default function SubredditPage() {
  const [state, formAction] = useFormState(createCommunity, initialState);
  useActionToast(state);
  return (
    <div className="max-w-[1000px] mx-auto flex flex-col mt-4">
      <form action={formAction}>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Create Community
        </h1>
        <Separator className="my-4" />
        <Label htmlFor="community-name" className="text-lg">
          Name
        </Label>
        <p className="text-muted-foreground">
          Once you pick a name, it can't be changed!
        </p>

        <div className="relative mt-3">
          <p className="absolute left-0 w-8 flex items-center justify-center h-full text-muted-foreground">
            r/
          </p>
          <Input
            id="community-name"
            pattern="[a-zA-Z0-9_\-]{2,21}"
            name="name"
            required
            className="pl-6"
            minLength={2}
            maxLength={21}
          />
        </div>
        <p className="mt-1 text-destructive">{state.message}</p>

        <div className="w-full flex mt-3.5 gap-x-5 justify-end">
          <Button variant="secondary" asChild>
            <Link href="/">Cancel</Link>
          </Button>
          <SubmitButton text="Create Community" />
        </div>
      </form>
    </div>
  );
}

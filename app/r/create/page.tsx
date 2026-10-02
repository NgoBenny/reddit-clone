"use client";

import { createCommunity } from "@/app/actions";
import { SubmitButton } from "@/app/components/SubmitButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ActionForm } from "@/app/components/ActionForm";
import { useState } from "react";

const initialState = {
  message: "",
  status: "",
};

export default function SubredditPage() {
  const [name, setName] = useState("");
  return (
    <main className="page-single">
      <ActionForm
        action={createCommunity.bind(null, initialState)}
        className="rounded-2xl border bg-card p-5 sm:p-8"
      >
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
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="pl-6"
            minLength={2}
            maxLength={21}
          />
        </div>

        <div className="w-full flex mt-3.5 gap-x-5 justify-end">
          <Button variant="secondary" asChild>
            <Link href="/">Cancel</Link>
          </Button>
          <SubmitButton text="Create Community" />
        </div>
      </ActionForm>
    </main>
  );
}

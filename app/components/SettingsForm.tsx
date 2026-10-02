"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { updateUsername } from "../actions";
import { SubmitButton } from "./SubmitButtons";
import { ActionForm } from "./ActionForm";
import { useState } from "react";

const initialState = {
  message: "",
  status: "",
};

export function SettingsForm({
  username,
}: {
  username: string | null | undefined;
}) {
  const [draft, setDraft] = useState(username ?? "");
  return (
    <ActionForm
      action={updateUsername.bind(null, initialState)}
      className="rounded-2xl border bg-card p-5 sm:p-8"
    >
      <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>

      <Separator className="my-4" />
      <Label htmlFor="username" className="text-lg">
        Username
      </Label>
      <p className="text-muted-foreground">Change your username here</p>

      <Input
        id="username"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        name="username"
        required
        className="mt-2"
        minLength={2}
        pattern="[a-zA-Z0-9_\-]{2,21}"
        maxLength={21}
      />

      <div className="w-full flex mt-5 gap-x-5 justify-end">
        <Button variant="secondary" asChild type="button">
          <Link href="/">Cancel</Link>
        </Button>
        <SubmitButton text="Change Username" />
      </div>
    </ActionForm>
  );
}

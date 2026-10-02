"use client";

import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "./SubmitButtons";
import { updateSubDescription } from "../actions";
import { ActionForm } from "./ActionForm";
import { useState } from "react";

interface iAppProps {
  subName: string;
  description: string | null | undefined;
}

const initialState = {
  message: "",
  status: "",
};

export function SubDescriptionForm({ description, subName }: iAppProps) {
  const [draft, setDraft] = useState(description ?? "");
  return (
    <ActionForm
      className="mt-3"
      action={updateSubDescription.bind(null, initialState)}
    >
      <input type="hidden" name="subName" value={subName} />
      <Textarea
        aria-label="Community description"
        placeholder="Tell people what this community is about"
        maxLength={120}
        name="description"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
      <SubmitButton text="Save" size="sm" className="mt-2 w-full" />
    </ActionForm>
  );
}

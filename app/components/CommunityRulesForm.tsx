"use client";
import { useState } from "react";
import { updateCommunityRules } from "../actions";
import { ActionForm } from "./ActionForm";
import { SubmitButton } from "./SubmitButtons";

export function CommunityRulesForm({name, rules, flairs}: {name:string; rules:string; flairs:string[]}) {
  const [rulesDraft, setRules] = useState(rules);
  const [flairDraft, setFlairs] = useState(flairs.join("\n"));
  return <ActionForm action={updateCommunityRules} success="Rules and flair saved" className="space-y-3 mt-3">
    <input type="hidden" name="subName" value={name} />
    <label className="block text-sm">Rules
      <textarea name="rules" maxLength={5000} value={rulesDraft} onChange={event=>setRules(event.target.value)} className="block w-full border rounded bg-background p-2" />
    </label>
    <label className="block text-sm">Flair labels (one per line)
      <textarea name="flairs" maxLength={800} value={flairDraft} onChange={event=>setFlairs(event.target.value)} className="block w-full border rounded bg-background p-2" />
    </label>
    <SubmitButton text="Save rules and flair" />
  </ActionForm>;
}

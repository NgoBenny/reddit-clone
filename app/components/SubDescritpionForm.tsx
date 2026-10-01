"use client";

import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "./SubmitButtons";
import { updateSubDescription } from "../actions";
import { useFormState } from "react-dom";
import { useState } from "react";

interface iAppProps {
    subName: string;
    description: string | null | undefined;
}

import { useActionToast } from "./useActionToast";

const initialState = {
    message: "",
    status: "",
};

export function SubDescriptionForm({description, subName}: iAppProps) {
    const [state, formAction] = useFormState(updateSubDescription, initialState);
    const [draft, setDraft] = useState(description ?? "");
    useActionToast(state);
    return (
        <form className="mt-3" action={formAction}>
            <input type="hidden" name="subName" value={subName} />
            <Textarea 
                aria-label="Community description"
                placeholder="Create your custom description for your subreddit" 
                maxLength={120} 
                name="description"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
            />
            <SubmitButton text="Save" size="sm" className="mt-2 w-full" />
    </form>
    )
}

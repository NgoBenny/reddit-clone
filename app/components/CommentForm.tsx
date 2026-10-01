"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "./SubmitButtons";
import { createComment } from "../actions";
import { ActionForm } from "./ActionForm";
import { useState } from "react";

interface iAppProps {
  postId: string;
  parentId?: string;
}

export function CommentForm({ postId, parentId }: iAppProps) {
  const [comment, setComment] = useState("");
  return (
    <ActionForm className="mt-5" action={async (form) => {
      const result = await createComment(form);
      if (!result?.error) setComment("");
      return result;
    }}>
      <input type="hidden" name="postId" value={postId}></input>
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <Label htmlFor={`comment-input-${parentId || postId}`}>
        {parentId ? "Your reply" : "Comment here"}
      </Label>
      <Textarea
        id={`comment-input-${parentId || postId}`}
        required
        maxLength={5000}
        placeholder="Add a comment"
        className="w-full mt-1 mb-2"
        name="comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />
      <SubmitButton text={parentId ? "Submit reply" : "Comment"} />
    </ActionForm>
  );
}

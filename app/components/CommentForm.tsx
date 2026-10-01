"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "./SubmitButtons";
import { createComment } from "../actions";
import { useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { unstable_rethrow } from "next/navigation";

interface iAppProps {
  postId: string;
}

export function CommentForm({ postId }: iAppProps) {
  const ref = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  return (
    <form
      className="mt-5"
      action={async (formData) => {
        try {
          const result = await createComment(formData);
          if (result?.error) {
            toast({ title: "Couldn’t add comment", description: result.error, variant: "destructive" });
            return;
          }
          ref.current?.reset();
        } catch (error) {
          unstable_rethrow(error);
          toast({ title: "Couldn’t add comment", description: "Your draft is saved here. Please try again.", variant: "destructive" });
        }
      }}
      ref={ref}
    >
      <input type="hidden" name="postId" value={postId}></input>
      <Label htmlFor={`comment-${postId}`}>Comment here</Label>
      <Textarea
        id={`comment-${postId}`}
        required
        maxLength={5000}
        placeholder="Add a comment"
        className="w-full mt-1 mb-2"
        name="comment"
      />
      <SubmitButton text="Comment" />
    </form>
  );
}

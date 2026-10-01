import Link from "next/link";
import { deleteContent, editComment, reportContent } from "../actions";
import { ActionForm } from "./ActionForm";
import { SubmitButton } from "./SubmitButtons";

export function ContentActions({
  id,
  kind,
  owner,
  text,
}: {
  id: string;
  kind: "post" | "comment";
  owner: boolean;
  text?: string;
}) {
  return (
    <div className="flex flex-wrap items-start gap-3 text-sm my-3">
      {owner && (
        <>
          {kind === "post" ? (
            <Link href={`/post/${id}/edit`} className="text-primary underline">
              Edit post
            </Link>
          ) : (
            <details>
              <summary className="cursor-pointer text-primary">
                Edit comment
              </summary>
              <ActionForm action={editComment} className="space-y-2">
                <input type="hidden" name="id" value={id} />
                <label className="sr-only" htmlFor={`edit-${id}`}>
                  Edit comment text
                </label>
                <textarea
                  id={`edit-${id}`}
                  name="comment"
                  defaultValue={text}
                  required
                  maxLength={5000}
                  className="w-full border rounded bg-background p-2"
                />
                <SubmitButton text="Save comment" size="sm" />
              </ActionForm>
            </details>
          )}
          <ActionForm
            action={deleteContent}
            confirm={`Delete this ${kind}? This cannot be undone; reply threads will remain.`}
          >
            <input type="hidden" name="kind" value={kind} />
            <input type="hidden" name="id" value={id} />
            <SubmitButton text={`Delete ${kind}`} size="sm" />
          </ActionForm>
        </>
      )}
      <details>
        <summary className="cursor-pointer text-muted-foreground">
          Report {kind}
        </summary>
        <ActionForm
          action={reportContent}
          success="Report sent to the community moderator"
          className="space-y-2 mt-2"
        >
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="id" value={id} />
          <label htmlFor={`report-${id}`}>Reason</label>
          <textarea
            id={`report-${id}`}
            name="reason"
            required
            maxLength={500}
            className="block w-full border rounded bg-background p-2"
          />
          <SubmitButton text="Send report" size="sm" />
        </ActionForm>
      </details>
    </div>
  );
}

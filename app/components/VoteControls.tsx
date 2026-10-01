import { Fragment } from "react";
import { handleVote } from "../actions";
import { VoteButton } from "./SubmitButtons";

export function VoteControls({ postId, voteCount, currentVote, className }: {
  postId: string;
  voteCount: number;
  currentVote?: "UP" | "DOWN";
  className: string;
}) {
  return (
    <div className={className}>
      {(["UP", "DOWN"] as const).map((direction) => (
        <Fragment key={direction}>
          <form action={handleVote}>
            <input type="hidden" name="voteDirection" value={direction} />
            <input type="hidden" name="postId" value={postId} />
            <VoteButton direction={direction} active={currentVote === direction} />
          </form>
          {direction === "UP" && voteCount}
        </Fragment>
      ))}
    </div>
  );
}

import Link from "next/link";
import { CommentForm } from "./CommentForm";
import { ContentActions } from "./ContentActions";
type ThreadComment = {
  id: string;
  parentId: string | null;
  text: string;
  userId: string | null;
  deletedAt: Date | null;
  removedAt: Date | null;
  editedAt: Date | null;
  User: { userName: string | null } | null;
};

export function CommentThread({
  comments,
  postId,
  userId,
  canReply,
}: {
  comments: ThreadComment[];
  postId: string;
  userId?: string;
  canReply: boolean;
}) {
  const children = new Map<string | null, ThreadComment[]>();
  for (const comment of comments) {
    if (!children.has(comment.parentId)) children.set(comment.parentId, []);
    children.get(comment.parentId)!.push(comment);
  }
  function thread(parent: string | null, depth = 0): React.ReactNode {
    return children.get(parent)?.map((comment) => (
      <article
        key={comment.id}
        id={`comment-${comment.id}`}
        className="border-l pl-3 my-4 break-words"
      >
        <p className="text-sm font-medium">
          {comment.deletedAt ? (
            "[deleted]"
          ) : comment.removedAt ? (
            "[removed]"
          ) : (
            <Link
              href={`/u/${comment.User?.userName}`}
              className="hover:text-primary"
            >
              u/{comment.User?.userName || "deleted"}
            </Link>
          )}
          {comment.editedAt && !comment.deletedAt && !comment.removedAt && (
            <span className="text-muted-foreground text-xs ml-2">edited</span>
          )}
        </p>
        <p className="text-sm whitespace-pre-wrap my-2">
          {comment.deletedAt
            ? "[deleted]"
            : comment.removedAt
              ? "Removed by moderator"
              : comment.text}
        </p>
        {!comment.deletedAt && !comment.removedAt && (
          <ContentActions
            id={comment.id}
            kind="comment"
            owner={!!userId && userId === comment.userId}
            text={comment.text}
          />
        )}
        {canReply && depth < 9 && (
          <details>
            <summary className="text-sm cursor-pointer text-primary">
              Reply
            </summary>
            <CommentForm postId={postId} parentId={comment.id} />
          </details>
        )}
        <div className={depth < 4 ? "ml-2" : ""}>
          {thread(comment.id, depth + 1)}
        </div>
      </article>
    ));
  }
  return <div id="comments">{thread(null)}</div>;
}

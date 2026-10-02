import { getFeed, type FeedQuery } from "../lib/feed";
import { getVoteSummary } from "../lib/votes";
import { PostCard } from "./PostCard";
import Pagination from "./Pagination";
import Link from "next/link";
import { Bookmark, MessagesSquare } from "lucide-react";
export { FeedFilters } from "./FeedFilters";

export async function PostFeed({
  query,
  ...scope
}: {
  query: FeedQuery;
  subName?: string;
  authorId?: string;
  savedBy?: string;
  userId?: string;
}) {
  const { posts, count } = await getFeed(query, scope);
  const filtered = !!query.q || query.time === "day" || query.time === "week";
  const empty = filtered
    ? {
        title: "No conversations match",
        body: "Try another search or clear your filters.",
        href: scope.subName
          ? `/r/${scope.subName}`
          : scope.savedBy
            ? "/saved"
            : scope.authorId
              ? undefined
              : "/",
        cta: "Clear filters",
      }
    : scope.savedBy
      ? {
          title: "Keep a conversation for later",
          body: "Choose Save on any post. Your saved collection is private to you.",
          href: "/",
          cta: "Explore conversations",
        }
      : query.feed === "home"
        ? {
            title: "Your feed starts with your communities",
            body: "Join a community to see its posts here. If you’ve already joined, start a conversation there.",
            href: "/communities",
            cta: "Find a community",
          }
        : scope.subName
          ? {
              title: "Start the first conversation",
              body: "Share a question, idea or image with this community.",
              href: `/r/${scope.subName}/create`,
              cta: "Create post",
            }
          : {
              title: "No posts here yet",
              body: "Explore communities to find a conversation.",
              href: "/communities",
              cta: "Browse communities",
            };
  return (
    <>
      {!posts.length && (
        <div className="rounded-2xl border bg-card px-6 py-12 text-center">
          {scope.savedBy ? (
            <Bookmark className="mx-auto mb-4 h-8 w-8 text-primary" />
          ) : (
            <MessagesSquare className="mx-auto mb-4 h-8 w-8 text-primary" />
          )}
          <h2 className="text-xl font-semibold">{empty.title}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {empty.body}
          </p>
          {empty.href && (
            <Link
              href={empty.href}
              className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              {empty.cta}
            </Link>
          )}
        </div>
      )}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          id={post.id}
          title={post.title}
          jsonContent={post.textContent}
          bodyText={post.bodyText}
          imageString={post.imageString}
          subName={post.subName || ""}
          userName={post.User?.userName || "deleted"}
          createdAt={post.createdAt}
          flair={post.flair}
          commentAmount={post._count.Comment}
          saved={post.savedBy.length > 0}
          {...getVoteSummary(post.Vote, scope.userId)}
        />
      ))}
      <Pagination totalPages={Math.ceil(count / 10)} />
    </>
  );
}

import { getFeed, type FeedQuery } from "../lib/feed";
import { getVoteSummary } from "../lib/votes";
import { PostCard } from "./PostCard";
import Pagination from "./Pagination";
import Link from "next/link";

export function FeedFilters({
  query,
  home = false,
}: {
  query: FeedQuery;
  home?: boolean;
}) {
  return (
    <form className="flex flex-wrap gap-2 rounded-md border p-3">
      <label className="flex-1 min-w-40 text-sm">
        Search posts
        <input
          name="q"
          defaultValue={typeof query.q === "string" ? query.q : ""}
          maxLength={100}
          placeholder="Search titles and text"
          className="block w-full border rounded bg-background p-2 mt-1"
        />
      </label>
      {home && (
        <label className="text-sm">
          Feed
          <select
            name="feed"
            defaultValue={query.feed === "home" ? "home" : "all"}
            className="block border rounded bg-background p-2 mt-1"
          >
            <option value="all">All communities</option>
            <option value="home">Joined communities</option>
          </select>
        </label>
      )}
      <label className="text-sm">
        Sort
        <select
          name="sort"
          defaultValue={query.sort === "top" ? "top" : "new"}
          className="block border rounded bg-background p-2 mt-1"
        >
          <option value="new">New</option>
          <option value="top">Top</option>
        </select>
      </label>
      <label className="text-sm">
        Time
        <select
          name="time"
          defaultValue={
            ["day", "week"].includes(query.time || "") ? query.time : "all"
          }
          className="block border rounded bg-background p-2 mt-1"
        >
          <option value="all">All time</option>
          <option value="day">Past 24 hours</option>
          <option value="week">Past week</option>
        </select>
      </label>
      <button
        className="self-end rounded bg-primary px-3 py-2 text-primary-foreground"
        type="submit"
      >
        Apply filters
      </button>
    </form>
  );
}

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
  return (
    <>
      {!posts.length && (
        <p className="rounded border p-6 text-muted-foreground">
          No posts match.{" "}
          <Link href="/communities" className="text-primary underline">
            Explore communities
          </Link>{" "}
          or change your filters.
        </p>
      )}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          id={post.id}
          title={post.title}
          jsonContent={post.textContent}
          imageString={post.imageString}
          subName={post.subName || ""}
          userName={post.User?.userName || "deleted"}
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

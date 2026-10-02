import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";
import { CreatePostCard } from "./components/CreatePostCard";
import { FeedFilters, PostFeed } from "./components/PostFeed";
import type { FeedQuery } from "./lib/feed";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<FeedQuery>;
}) {
  const query = await searchParams;
  const user = await getKindeServerSession().getUser();
  return (
    <main className="page-grid">
      <div className="min-w-0 space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">
            {query.feed === "home" ? (
              "Your conversations"
            ) : (
              <>
                <span className="sm:hidden">Explore conversations</span>
                <span className="hidden sm:inline">
                  Discover a different perspective
                </span>
              </>
            )}
          </h1>
          <p className="mt-1 hidden text-sm text-muted-foreground sm:block">
            {query.feed === "home"
              ? "The latest from the communities you’ve joined."
              : "Questions, ideas and stories from across Common."}
          </p>
        </div>
        <FeedFilters key={JSON.stringify(query)} query={query} home />
        <div className="hidden sm:block">
          <CreatePostCard />
        </div>
        {query.feed === "home" && !user ? (
          <Card className="p-6 shadow-none">
            <h2 className="text-xl font-semibold">
              A feed that feels like yours
            </h2>
            <p className="my-3 text-sm text-muted-foreground">
              Sign in and join communities to build your personal feed.
            </p>
            <Link
              href="/api/auth/login?prompt=login"
              className="inline-flex min-h-11 items-center text-primary underline"
            >
              Sign in to see your joined communities
            </Link>
          </Card>
        ) : (
          <PostFeed query={query} userId={user?.id} />
        )}
      </div>
      <aside className="hidden xl:block">
        <Card className="sticky top-24 space-y-4 p-5 shadow-none">
          <Users className="h-7 w-7 text-primary" />
          <h2 className="text-xl font-semibold">Find your people.</h2>
          <p className="text-sm text-muted-foreground">
            Good conversations start with shared interests. Find a community,
            join in, or make room for something new.
          </p>
          <Link
            href="/communities"
            className="flex min-h-11 items-center justify-between text-sm font-medium text-primary"
          >
            Browse communities
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            href="/r/create"
            className="flex min-h-11 items-center justify-center rounded-xl border text-sm font-medium hover:bg-muted"
          >
            Create community
          </Link>
        </Card>
      </aside>
    </main>
  );
}

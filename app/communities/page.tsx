import prisma from "@/app/lib/db";
import { pageNumber } from "@/app/lib/validation";
import Pagination from "@/app/components/Pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Communities({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const query = await searchParams;
  const q = typeof query.q === "string" ? query.q.trim().slice(0, 100) : "";
  const where = { name: { contains: q, mode: "insensitive" as const } };
  const [count, communities] = await prisma.$transaction([
    prisma.subreddit.count({ where }),
    prisma.subreddit.findMany({
      where,
      take: 20,
      skip: (pageNumber(query.page) - 1) * 20,
      orderBy: { name: "asc" },
      select: {
        name: true,
        description: true,
        _count: { select: { posts: true } },
      },
    }),
  ]);
  return (
    <main className="mx-auto max-w-[1000px] px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Find your people
          </p>
          <h1 className="mt-2 text-3xl font-bold">Explore communities</h1>
        </div>
        <Button asChild>
          <Link href="/r/create">Create community</Link>
        </Button>
      </div>
      <form className="my-6 flex gap-3" action="/communities">
        <label className="sr-only" htmlFor="community-search">
          Search communities
        </label>
        <input
          id="community-search"
          name="q"
          defaultValue={q}
          maxLength={100}
          placeholder="Search by community name"
          className="w-full rounded-md border bg-background px-3 py-2"
        />
        <Button type="submit">Search</Button>
      </form>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {communities.map((community) => (
          <Card key={community.name} className="p-5">
            <Link
              href={`/r/${encodeURIComponent(community.name)}`}
              className="text-lg font-semibold hover:text-primary"
            >
              r/{community.name}
            </Link>
            <p className="my-3 text-sm text-muted-foreground">
              {community.description || "A new place to start a conversation."}
            </p>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span>{community._count.posts} posts</span>
              <Link
                className="font-medium text-primary underline"
                href={`/r/${encodeURIComponent(community.name)}/create`}
              >
                Create post
              </Link>
            </div>
          </Card>
        ))}
      </div>
      {communities.length === 0 && (
        <p className="py-10 text-center text-muted-foreground">
          No communities found. Try another search or create one.
        </p>
      )}
      <Pagination totalPages={Math.ceil(count / 20)} />
    </main>
  );
}

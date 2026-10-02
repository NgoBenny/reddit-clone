import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { FeedFilters, PostFeed } from "../components/PostFeed";
import type { FeedQuery } from "../lib/feed";
export default async function Saved({
  searchParams,
}: {
  searchParams: Promise<FeedQuery>;
}) {
  const user = await getKindeServerSession().getUser();
  if (!user) redirect("/api/auth/login");
  const query = await searchParams;
  return (
    <main className="page-single space-y-4">
      <h1 className="text-2xl font-semibold">Saved posts</h1>
      <p className="text-sm text-muted-foreground">
        Your private collection of conversations to come back to.
      </p>
      <FeedFilters key={JSON.stringify(query)} query={query} />
      <PostFeed query={query} savedBy={user.id} userId={user.id} />
    </main>
  );
}

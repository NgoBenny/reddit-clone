import { Card } from "@/components/ui/card";
import Image from "next/image";
import Banner from "../public/banner.png";
import HelloImage from "../public/hero-image.png";
import Link from "next/link";
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
    <main className="max-w-[1000px] mx-auto flex flex-col md:flex-row gap-6 px-4 mt-4 mb-10">
      <div className="w-full md:w-[65%] min-w-0 flex flex-col gap-y-5">
        <CreatePostCard />
        <FeedFilters query={query} home />
        {query.feed === "home" && !user ? (
          <Link href="/api/auth/login" className="text-primary underline">
            Sign in to see your joined communities
          </Link>
        ) : (
          <PostFeed query={query} userId={user?.id} />
        )}
      </div>
      <aside className="w-full md:w-[35%]">
        <Card>
          <Image src={Banner} alt="Community banner" />
          <div className="p-4">
            <div className="flex items-center">
              <Image src={HelloImage} alt="" className="w-10 h-16 -mt-6" />
              <h1 className="font-medium pl-3 text-xl">Home</h1>
            </div>
            <p className="text-muted-foreground my-4 text-sm">
              Join communities to build your own feed, or discover discussions
              from everyone.
            </p>
            <Link
              href="/r/create"
              className="block rounded bg-primary p-2 text-center text-primary-foreground"
            >
              Create Community
            </Link>
          </div>
        </Card>
      </aside>
    </main>
  );
}

import { Card } from "@/components/ui/card";
import Image from "next/image";
import Banner from "../public/banner.png";
import HelloImage from "../public/hero-image.png";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreatePostCard } from "./components/CreatePostCard";
import prisma from "./lib/db";
import { PostCard } from "./components/PostCard";
import { Suspense } from "react";
import { SuspenseCard } from "./components/SuspenseCard";
import Pagination from "./components/Pagination";
import { unstable_noStore as noStore } from "next/cache";
import { pageNumber } from "./lib/validation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

async function getData(searchParam: string) {
  noStore();
  const [count, data] = await prisma.$transaction([
    prisma.post.count(),
    prisma.post.findMany({
      take: 10,
      skip: (pageNumber(searchParam) - 1) * 10,
      select: {
        title: true,
        createdAt: true,
        textContent: true,
        id: true,
        imageString: true,
        Comment: {
          select: {
            id: true,
          },
        },
        User: {
          select: {
            userName: true,
          },
        },
        subName: true,
        Vote: {
          select: {
            userId: true,
            voteType: true,
            postId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return { data, count };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page: string }>;
}) {
  const query = await searchParams;
  return (
    <>
      <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row gap-6 px-4 mt-4 mb-10">
        <div className="w-full md:w-[65%] min-w-0 flex flex-col gap-y-5">
          <CreatePostCard />
          <Suspense fallback={<SuspenseCard />} key={query.page}>
            <ShowItems searchParams={query} />
          </Suspense>
        </div>
        <div className="w-full md:w-[35%]">
          <Card>
            <Image src={Banner} alt="Banner" />
            <div className="p-2 sm:p-4">
              <div className="flex items-center">
                <Image
                  src={HelloImage}
                  alt="HelloImage"
                  className="w-10 h-16 -mt-6"
                />
                <h1 className="font-medium pl-3 text-lg sm:text-xl">Home</h1>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground pt-2 text-center sm:text-left">
                Your Reddit homepage. Check in with your favorite communities
                here!
              </p>
              <Separator className="my-5" />

              <div className="flex flex-col gap-y-3">
                <Button asChild>
                  <Link href={"/r/create"}>Create Community</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

async function ShowItems({ searchParams }: { searchParams: { page: string } }) {
  const { count, data } = await getData(searchParams.page);
  const user = await getKindeServerSession().getUser();
  return (
    <>
      {data.length === 0 && <Card className="p-6 text-center">No posts here yet. <Link className="text-primary underline" href="/communities">Explore communities</Link> to start a discussion.</Card>}
      {data.map((post) => (
        <PostCard
          id={post.id}
          imageString={post.imageString}
          jsonContent={post.textContent}
          subName={post.subName as string}
          title={post.title}
          key={post.id}
          commentAmount={post.Comment.length}
          currentVote={post.Vote.find((vote) => vote.userId === user?.id)?.voteType}
          userName={post.User?.userName as string}
          voteCount={post.Vote.reduce((acc, vote) => {
            if (vote.voteType === "UP") return acc + 1;
            if (vote.voteType === "DOWN") return acc - 1;
            return acc;
          }, 0)}
        />
      ))}

      <Pagination totalPages={Math.ceil(count / 10)} />
    </>
  );
}

import PostComposer from "@/app/components/PostComposer";
import prisma from "@/app/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";
export default async function CreatePost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await getKindeServerSession().getUser())) redirect("/api/auth/login");
  const { id } = await params;
  const community = await prisma.subreddit.findUnique({
    where: { name: id },
    select: { rules: true, flairs: true },
  });
  if (!community) notFound();
  return (
    <PostComposer
      subName={id}
      flairs={community.flairs}
      communityRules={community.rules}
    />
  );
}

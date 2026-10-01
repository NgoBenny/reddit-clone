import { CreatePostCard } from "@/app/components/CreatePostCard";
import { FeedFilters, PostFeed } from "@/app/components/PostFeed";
import { SubDescriptionForm } from "@/app/components/SubDescritpionForm";
import { ActionForm } from "@/app/components/ActionForm";
import { SubmitButton } from "@/app/components/SubmitButtons";
import { setMembership, updateCommunityRules } from "@/app/actions";
import prisma from "@/app/lib/db";
import type { FeedQuery } from "@/app/lib/feed";
import { Card } from "@/components/ui/card";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Community({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<FeedQuery>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const user = await getKindeServerSession().getUser();
  const community = await prisma.subreddit.findUnique({
    where: { name: id },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      userId: true,
      rules: true,
      flairs: true,
      memberships: {
        where: { userId: user?.id || "" },
        select: { userId: true },
      },
      _count: { select: { memberships: true } },
    },
  });
  if (!community) notFound();
  const moderator = user?.id === community.userId;
  return (
    <main className="max-w-[1000px] mx-auto flex flex-col md:flex-row gap-6 px-4 mt-4 mb-10">
      <div className="w-full md:w-[65%] min-w-0 flex flex-col gap-y-5">
        <h1 className="text-xl font-semibold">r/{community.name}</h1>
        <CreatePostCard subName={community.name} />
        <FeedFilters query={query} />
        <PostFeed query={query} subName={community.name} userId={user?.id} />
      </div>
      <aside className="w-full md:w-[35%]">
        <Card className="p-4 space-y-4">
          <h2 className="font-semibold">About Community</h2>
          {moderator ? (
            <SubDescriptionForm
              description={community.description}
              subName={id}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {community.description}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {community._count.memberships} members · Created{" "}
            {community.createdAt.toLocaleDateString("en-US")}
          </p>
          <ActionForm action={setMembership}>
            <input type="hidden" name="subredditId" value={community.id} />
            <input
              type="hidden"
              name="join"
              value={String(!community.memberships.length)}
            />
            <SubmitButton
              text={
                community.memberships.length
                  ? "Leave community"
                  : "Join community"
              }
            />
          </ActionForm>
          <Link
            href={`/r/${id}/create`}
            className="block text-primary underline"
          >
            Create post
          </Link>
          <h2 className="font-semibold">Community rules</h2>
          <p className="text-sm whitespace-pre-wrap break-words">
            {community.rules || "No rules added yet. Be respectful."}
          </p>
          {moderator && (
            <>
              <Link
                href={`/r/${id}/moderation`}
                className="block text-primary underline"
              >
                Review reports
              </Link>
              <details>
                <summary className="cursor-pointer text-sm font-medium">
                  Edit rules and flair
                </summary>
                <ActionForm
                  action={updateCommunityRules}
                  success="Rules and flair saved"
                  className="space-y-3 mt-3"
                >
                  <input type="hidden" name="subName" value={id} />
                  <label className="block text-sm">
                    Rules
                    <textarea
                      name="rules"
                      maxLength={5000}
                      defaultValue={community.rules}
                      className="block w-full border rounded bg-background p-2"
                    />
                  </label>
                  <label className="block text-sm">
                    Flair labels (one per line)
                    <textarea
                      name="flairs"
                      maxLength={800}
                      defaultValue={community.flairs.join("\n")}
                      className="block w-full border rounded bg-background p-2"
                    />
                  </label>
                  <SubmitButton text="Save rules and flair" />
                </ActionForm>
              </details>
            </>
          )}
        </Card>
      </aside>
    </main>
  );
}

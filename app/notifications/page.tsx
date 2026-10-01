import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "../lib/db";
import { pageNumber } from "../lib/validation";
import Pagination from "../components/Pagination";
import { ActionForm } from "../components/ActionForm";
import { SubmitButton } from "../components/SubmitButtons";
import { markNotificationsRead } from "../actions";
export default async function Notifications({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getKindeServerSession().getUser();
  if (!user) redirect("/api/auth/login");
  const query = await searchParams;
  const [count, notices] = await prisma.$transaction([
    prisma.notification.count({ where: { userId: user.id } }),
    prisma.notification.findMany({
      where: { userId: user.id },
      take: 20,
      skip: (pageNumber(query.page) - 1) * 20,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        kind: true,
        readAt: true,
        postId: true,
        commentId: true,
        Post: { select: { title: true, deletedAt: true, removedAt: true } },
      },
    }),
  ]);
  return (
    <main className="max-w-[800px] mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      <ActionForm action={markNotificationsRead}>
        <SubmitButton text="Mark all as read" />
      </ActionForm>
      {!notices.length && <p>No notifications yet.</p>}
      {notices.map((n) => (
        <article
          key={n.id}
          className={`border rounded p-4 ${!n.readAt ? "border-primary" : ""}`}
        >
          <Link href={`/post/${n.postId}#comment-${n.commentId}`}>
            {!n.readAt && <strong>Unread · </strong>}
            {n.kind === "REPLY"
              ? "Someone replied to your comment"
              : "Someone commented on your post"}
            <span className="block text-sm text-muted-foreground">
              {n.Post.deletedAt || n.Post.removedAt
                ? "Content unavailable"
                : n.Post.title}
            </span>
          </Link>
        </article>
      ))}
      <Pagination totalPages={Math.ceil(count / 20)} />
    </main>
  );
}

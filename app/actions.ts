"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import prisma from "./lib/db";
import { Prisma } from "@prisma/client";
import { JSONContent } from "@tiptap/react";
import { revalidatePath } from "next/cache";
import {
  formText,
  validImage,
  validName,
  validRichText,
} from "./lib/validation";

async function requireUser() {
  const user = await getKindeServerSession().getUser();
  if (!user) redirect("/api/auth/login");
  return user;
}

export async function updateUsername(prevState: any, formData: FormData) {
  const user = await requireUser();

  try {
    const username =
      typeof formData.get("username") === "string"
        ? (formData.get("username") as string).trim()
        : "";
    if (!validName(username))
      return {
        message: "Use 2–21 letters, numbers, underscores or hyphens",
        status: "error",
      };
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        userName: username,
      },
    });

    revalidatePath("/", "layout");
    return {
      message: "Updated username successfully",
      status: "green",
    };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return {
          message: "This username already exists",
          status: "error",
        };
      }
    }

    throw e;
  }
}

export async function createCommunity(prevState: any, formData: FormData) {
  const user = await requireUser();

  try {
    const name =
      typeof formData.get("name") === "string"
        ? (formData.get("name") as string).trim()
        : "";
    if (!validName(name) || name === "create")
      return {
        message:
          "Use 2–21 letters, numbers, underscores or hyphens; create is reserved",
        status: "error",
      };

    const data = await prisma.subreddit.create({
      data: {
        name: name,
        userId: user.id,
      },
    });

    return redirect(`/r/${data.name}`);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return {
          message: "This community already exists",
          status: "error",
        };
      }
    }
    throw e;
  }
}

export async function updateSubDescription(prevState: any, formData: FormData) {
  const user = await requireUser();

  try {
    const subName = formText(formData, "subName", 21);
    const description = formData.get("description");
    if (typeof description !== "string" || description.trim().length > 120) {
      return {
        status: "error",
        message: "Description must be at most 120 characters",
      };
    }

    const result = await prisma.subreddit.updateMany({
      where: {
        name: subName,
        userId: user.id,
      },
      data: {
        description: description.trim(),
      },
    });
    if (!result.count)
      return {
        status: "error",
        message: "Only the community creator can edit its description",
      };
    revalidatePath(`/r/${subName}`);

    return {
      status: "green",
      message: "Updated description successfully!",
    };
  } catch (e) {
    return {
      status: "error",
      message: "Failed to update description!",
    };
  }
}

export async function createPost(
  { jsonContent }: { jsonContent: JSONContent | null },
  formData: FormData,
) {
  const user = await requireUser();

  const title = formText(formData, "title", 300);
  const imageUrl = formData.get("imageUrl") as string | null;
  const subName = formText(formData, "subName", 21);
  if (imageUrl && (typeof imageUrl !== "string" || !validImage(imageUrl)))
    throw new Error("Invalid image URL");
  if (
    jsonContent &&
    (jsonContent.type !== "doc" ||
      JSON.stringify(jsonContent).length > 50000 ||
      !validRichText(jsonContent))
  )
    throw new Error("Invalid or oversized post body");

  const data = await prisma.post.create({
    data: {
      title: title,
      imageString: imageUrl || undefined,
      subName: subName,
      userId: user.id,
      textContent: jsonContent ?? undefined,
    },
  });

  revalidatePath("/");
  revalidatePath(`/r/${subName}`);
  return redirect(`/post/${data.id}`);
}

export async function handleVote(formData: FormData) {
  const user = await requireUser();

  const postId = formText(formData, "postId", 100);
  const voteDirection = formData.get("voteDirection");
  if (voteDirection !== "UP" && voteDirection !== "DOWN")
    throw new Error("Invalid vote direction");

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      await prisma.$transaction(
        async (tx) => {
          const where = { postId, userId: user.id };
          const vote = await tx.vote.findFirst({ where });
          // Also repair historical duplicates without deleting other users' votes.
          await tx.vote.deleteMany({ where });
          if (vote?.voteType !== voteDirection) {
            await tx.vote.create({
              data: { ...where, voteType: voteDirection },
            });
          }
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      break;
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        !["P2034", "P2002"].includes(error.code) ||
        attempt === 3
      )
        throw error;
    }
  }
  revalidatePath("/", "layout");
}

export async function createComment(formData: FormData) {
  const user = await requireUser();

  const comment = formText(formData, "comment", 5000);
  const postId = formText(formData, "postId", 100);

  await prisma.comment.create({
    data: {
      text: comment,
      userId: user.id,
      postId: postId,
    },
  });

  revalidatePath(`/post/${postId}`);
  revalidatePath("/", "layout");
}

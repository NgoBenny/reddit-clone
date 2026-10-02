import prisma from "@/app/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";

export async function GET(req: NextRequest) {
  noStore();
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id)
    return NextResponse.redirect(new URL("/api/auth/login", req.url));

  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      // Identity/contact details remain with Kinde; the app does not use copies.
      email: "",
      firstName: "",
      lastName: "",
      userName: `user-${crypto.randomUUID().slice(0, 15)}`,
    },
  });

  return NextResponse.redirect(
    new URL("/", process.env.KINDE_SITE_URL || req.url),
  );
}

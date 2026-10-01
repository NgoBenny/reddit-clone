import Link from "next/link";
import RedditText from "../../public/logo-name.svg";
import redditMobile from "../../public/reddit-full.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { UserDropdown } from "./UserDropdown";
import prisma from "../lib/db";
import { Bell } from "lucide-react";

export async function Navbar() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const [profile, unread] = user
    ? await Promise.all([
        prisma.user.findUnique({
          where: { id: user.id },
          select: { userName: true },
        }),
        prisma.notification.count({ where: { userId: user.id, readAt: null } }),
      ])
    : [null, 0];
  return (
    <nav className="h-[10vh] w-full flex items-center border-b px-5 lg:px-14 justify-between">
      <Link href="/" className="flex items-center gap-x-3">
        <Image src={redditMobile} alt="Reddit" className="h-10 w-fit" />
        <Image
          src={RedditText}
          alt="Reddit"
          className="h-9 w-fit hidden lg:block"
        />
      </Link>

      <div className="flex items-center gap-x-2 sm:gap-x-3.5">
        <Link
          href="/communities"
          className="text-sm font-medium hover:text-primary"
        >
          Communities
        </Link>
        <ThemeToggle />
        {user ? (
          <>
            <Link
              href="/notifications"
              aria-label={`Notifications, ${unread} unread`}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -right-2 -top-2 rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>
            <UserDropdown
              userImage={user.picture}
              userName={profile?.userName}
            />
          </>
        ) : (
          <div className="flex items-center gap-x-4">
            <Button variant="secondary" asChild>
              <RegisterLink>Sign up</RegisterLink>
            </Button>
            <Button asChild>
              <LoginLink>Login</LoginLink>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}

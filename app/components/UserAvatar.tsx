/*

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "lucide-react";
import Image from "next/image";
import { Icons } from "./Icons";
import { User } from "next-auth";

interface iAppProps {
  user: Pick<User, 'name' | 'image'>
}

export function UserAvatar({ user }: iAppProps) {
  return (
    <Avatar>
      {user.image ? (
        <div className="relative aspect-square h-full w-full">
          <Image
            fill
            src={user.image}
            alt="profile picture"
            referrerPolicy="no-referrer"
          ></Image>
        </div>
      ) : (
        <AvatarFallback>
          <span className="sr-only">{user?.name}</span>
          <Icons.user className="h-4 w-4" />
        </AvatarFallback>
      )}
    </Avatar>
  );
}

*/

import { Card } from "@/components/ui/card";
import Image from "next/image";
import pfp from "../../public/pfp.png";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImageDown, Link2 } from "lucide-react";

export function CreatePostCard({ subName }: { subName?: string }) {
  const href = subName ? `/r/${encodeURIComponent(subName)}/create` : "/communities";
  return (
    <Card className="px-4 sm:px-4 py-2 flex flex-col sm:flex-row items-center gap-x-2 sm:gap-x-4">
      <Image src={pfp} alt="pfp" className="h-12 w-fit" />

      <Link href={href} className="w-full rounded-md border px-3 py-2 text-muted-foreground hover:text-primary">
        {subName ? "Create your post" : "Choose a community to post"}
      </Link>

      <div className="flex items-center gap-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={href} aria-label="Create an image post">
            <ImageDown className="w-4 h-4" />
          </Link>
        </Button>

        <Button variant="outline" size="icon" asChild>
          <Link href={href} aria-label="Create a post">
            <Link2 className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

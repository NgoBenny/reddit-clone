import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CopyLink } from "./CopyLink";
import { VoteControls } from "./VoteControls";
import { RenderToJson } from "./RendertoJson";

interface iAppProps {
  title: string;
  jsonContent: any;
  id: string;
  subName: string;
  userName: string;
  imageString: string | null;
  voteCount: number;
  commentAmount: number;
  currentVote?: "UP" | "DOWN";
}

export function PostCard({
  id,
  imageString,
  jsonContent,
  subName,
  title,
  userName,
  voteCount,
  commentAmount,
  currentVote,
}: iAppProps) {
  return (
    <Card className="flex relative overflow-hidden">
      <VoteControls postId={id} voteCount={voteCount} currentVote={currentVote}
        className="flex flex-col items-center gap-y-2 bg-muted p-2" />

      <div className="min-w-0 flex-1 break-words">
        <div className="flex items-center gap-x-2 p-2">
          <Link
            className="font-semibold text-xs sm:text-sm"
            href={`/r/${subName}`}
          >
            r/{subName}
          </Link>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Posted by: <span className="hover:text-primary">u/{userName}</span>
          </p>
        </div>

        <div className="px-2">
          <Link href={`/post/${id}`}>
            <h1 className="font-medium mt-1 text-lg sm:text-xl">{title}</h1>
          </Link>
        </div>

        <div className="overflow-hidden">
          {imageString ? (
            <Image
              src={imageString}
              alt="Post Image"
              width={600}
              height={300}
              className="w-full h-full object-cover"
            />
          ) : jsonContent ? (
            <RenderToJson data={jsonContent} />
          ) : null}
        </div>

        <div className="m-3 flex items-center gap-x-5">
          <div className="flex items-center gap-x-1">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <p className="text-muted-foreground font-medium text-sm sm:text-xs ">
              {commentAmount} Comments
            </p>
          </div>

          <CopyLink id={id} />
        </div>
      </div>
    </Card>
  );
}

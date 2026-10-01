"use client";

import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import pfp from "../../../../public/pfp.png";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TipTabEditor } from "@/app/components/TipTabEditor";
import { SubmitButton } from "@/app/components/SubmitButtons";
import { UploadDropzone } from "@/app/components/Uploadthing";
import { useState } from "react";
import { createPost } from "@/app/actions";
import { useParams, unstable_rethrow } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { JSONContent } from "@tiptap/react";

const rules = [
  {
    id: 1,
    text: "Remember the human",
  },
  {
    id: 2,
    text: "Respect others",
  },
  {
    id: 3,
    text: "Look for the original source of content",
  },
  {
    id: 4,
    text: "Don't duplicate content",
  },
  {
    id: 5,
    text: "Read the community's rules",
  },
];

export default function CreatePostRoute() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<null | string>(null);
  const [json, setJson] = useState<null | JSONContent>(null);
  const [title, setTitle] = useState<null | string>(null);

  async function createPostReddit(formData: FormData) {
    try {
      const result = await createPost({ jsonContent: json }, formData);
      if (result?.error) toast({ title: "Couldn’t create post", description: result.error, variant: "destructive" });
    }
    catch (error) {
      unstable_rethrow(error);
      toast({ title: "Couldn’t create post", description: "Check your title, content, and community, then try again.", variant: "destructive" });
    }
  }
  return (
    <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row gap-6 px-4 mt-4">
      <div className="w-full md:w-[65%] min-w-0 flex flex-col gap-y-5">
        <h1 className="font-semibold">
          Subreddit:{" "}
          <Link href={`/r/${params.id}`} className="text-primary">
            r/{params.id}
          </Link>
        </h1>
        <Tabs defaultValue="post" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="post">
              <Text className="h-4 w-4 mr-2" />
              Post
            </TabsTrigger>
            <TabsTrigger value="image">
              <Video className="h-4 w-4 mr-2" />
              Image
            </TabsTrigger>
          </TabsList>
          <TabsContent value="post">
            <Card>
              <form action={createPostReddit}>
                <input
                  type="hidden"
                  name="imageUrl"
                  value={imageUrl ?? undefined}
                />
                <input type="hidden" name="subName" value={params.id} />
                <CardHeader>
                  <Label htmlFor="post-title">Title</Label>
                  <Input
                    id="post-title"
                    maxLength={300}
                    required
                    name="title"
                    placeholder="Title"
                    value={title ?? ""}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  <TipTabEditor setJson={setJson} json={json} />
                </CardHeader>
                <CardFooter>
                  <SubmitButton text="Create Post" />
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="image">
            <Card>
              <CardHeader>
                {imageUrl === null ? (
                  <UploadDropzone
                    className="ut-button:bg-primary ut-button:ut-readying:bg-primary/50 ut-label:text-primary ut-button:ut-uploading:bg-primary/50 
                  ut-button:ut-uploading:after:bg-primary"
                    endpoint="imageUploader"
                    skipPolling
                    onClientUploadComplete={(res) => {
                      setImageUrl(res[0].url);
                    }}
                    onUploadError={(error: Error) => {
                      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
                    }}
                  />
                ) : (
                  <Image
                    src={imageUrl}
                    alt="uploaded image"
                    width={500}
                    height={400}
                    className="h-80 rounded-lg w-full object-contain"
                  />
                )}
                <p className="text-sm text-muted-foreground">Add your title and publish from the Post tab.</p>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <div className="w-full md:w-[35%]">
        <Card className="flex flex-col p-4">
          <div className="flex items-center gap-x-2">
            <Image className="h-10 w-10" src={pfp} alt="pfp" />
            <h1 className="font-medium">Reddit Posting Rules</h1>
          </div>
          <Separator className="mt-2" />

          <div className="flex flex-col gap-y-5 mt-5">
            {rules.map((item) => (
              <div key={item.id}>
                <p className="text-sm font-medium">
                  {item.id}. {item.text}
                </p>
                <Separator className="mt-2" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

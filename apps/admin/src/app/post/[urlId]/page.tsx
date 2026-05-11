import { client } from "@repo/db/client";
import { notFound, redirect } from "next/navigation";
import { PostEditor } from "../../post-editor";
import { isLoggedIn } from "../../../utils/auth";

export default async function UpdatePostPage({
  params,
}: {
  params: Promise<{ urlId: string }>;
}) {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    redirect("/");
  }

  const { urlId } = await params;
  const post = await client.db.post.findUnique({
    where: { urlId },
  });

  if (!post) {
    notFound();
  }

  return (
    <PostEditor
      heading={post.title}
      postId={post.id}
      initialPost={{
        title: post.title,
        description: post.description,
        content: post.content,
        imageUrl: post.imageUrl,
        tags: post.tags,
        category: post.category ?? "",
      }}
    />
  );
}

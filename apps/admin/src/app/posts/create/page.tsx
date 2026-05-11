import { redirect } from "next/navigation";
import { PostEditor } from "../../post-editor";
import { isLoggedIn } from "../../../utils/auth";

export default async function CreatePostPage() {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    redirect("/");
  }

  return (
    <PostEditor
      eyebrow="New Draft"
      heading="Create Post"
      initialPost={{
        title: "",
        category: "",
        description: "",
        content: "",
        imageUrl: "",
        tags: "",
      }}
    />
  );
}

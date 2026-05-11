import { AppLayout } from "../../../components/Layout/AppLayout";
import { Main } from "../../../components/Main";
import { getActivePosts } from "@/server/posts";

export default async function TagsPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const posts = await getActivePosts({
    tagName: name,
  });

  return (
    <AppLayout>
      <Main posts={posts} />
    </AppLayout>
  );
}

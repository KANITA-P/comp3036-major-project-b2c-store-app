import { getActivePosts } from "@/server/posts";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { Main } from "../../../components/Main";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const posts = await getActivePosts({
    categoryName: name,
  });

  return (
    <AppLayout>
      <Main posts={posts} />
    </AppLayout>
  );
}

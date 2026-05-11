import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { getActivePosts } from "@/server/posts";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const posts = await getActivePosts({
    query: q,
  });

  return (
    <AppLayout query={q}>
      <Main posts={posts} />
    </AppLayout>
  );
}

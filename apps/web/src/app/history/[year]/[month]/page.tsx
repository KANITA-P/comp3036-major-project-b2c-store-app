import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { getActivePosts } from "@/server/posts";

export default async function Page({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year, month } = await params;
  const yearNum = Number(year);
  const monthNum = Number(month);
  const posts = await getActivePosts({
    year: yearNum,
    month: monthNum,
  });

  return (
    <AppLayout>
      <Main posts={posts} />
    </AppLayout>
  );
}

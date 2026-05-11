import { AppLayout } from "../components/Layout/AppLayout";
import { Main } from "../components/Main";
import { getActivePosts } from "../server/posts";
import styles from "./page.module.css";

export default async function Home() {
  const posts = await getActivePosts();

  return (
    <AppLayout>
      <Main posts={posts} className={styles.main} />
    </AppLayout>
  );
}

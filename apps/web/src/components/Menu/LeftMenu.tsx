import Link from "next/link";
import { getActivePosts } from "@/server/posts";
import { CategoryList } from "./CategoryList";
import { HistoryList } from "./HistoryList";
import { TagList } from "./TagList";

export async function LeftMenu() {
  const posts = await getActivePosts();

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <Link
          href="/"
          style={{
            fontSize: "28px",
            fontWeight: 800,
            color: "var(--text)",
            textDecoration: "none",
          }}
        >
          Full-Stack Blog
        </Link>
      </div>

      <nav>
        <ul
          role="list"
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <li>
            <CategoryList posts={posts} />
          </li>
          <li>
            <HistoryList posts={posts} />
          </li>
          <li>
            <TagList posts={posts} />
          </li>
        </ul>
      </nav>
    </div>
  );
}

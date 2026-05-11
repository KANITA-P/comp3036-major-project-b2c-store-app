import type { Post } from "@repo/db/data";
import Link from "next/link";
import { getCategoryNames } from "@/functions/categories";
import { toUrlPath } from "@repo/utils/url";

function getTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags
      .map((tag) => {
        if (typeof tag === "string") return tag;
        if (typeof tag === "object" && tag !== null && "name" in tag) {
          return String((tag as { name: string }).name);
        }
        return null;
      })
      .filter(Boolean) as string[];
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

export function BlogListItem({ post }: { post: Post }) {
  const tags = getTags((post as any).tags);
  const dateValue = (post as any).date ?? (post as any).createdAt;
  const description =
    (post as any).description ??
    (post as any).shortDescription ??
    "";
  const image = (post as any).image ?? (post as any).imageUrl;

  const categoryName = getCategoryNames((post as any).category)[0];

  const href = `/post/${String(
    (post as any).slug ?? (post as any).urlId ?? toUrlPath(post.title)
  )}`;

  return (
    <article
      className="flex flex-row gap-8 mb-6 rounded-2xl p-6"
      data-testid={`blog-post-${post.id}`}
      data-test-id={`blog-post-${post.id}`}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
      }}
    >
      {image ? (
        <img
          src={String(image)}
          alt={post.title}
          className="h-40 w-56 rounded-xl object-cover"
        />
      ) : null}

      <div className="flex flex-1 flex-col gap-3">
        <div
          className="flex gap-4 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          {dateValue ? (
            <span>
              {new Date(String(dateValue)).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          ) : null}

          {categoryName ? (
            <Link href={`/category/${toUrlPath(categoryName)}`}>
              {categoryName}
            </Link>
          ) : null}
        </div>

        <h2 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          <Link
            href={href}
            style={{
              color: "var(--accent)",
              textDecoration: "none",
            }}
          >
            {post.title}
          </Link>
        </h2>

        {description ? (
          <p
            style={{
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            {String(description)}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${toUrlPath(tag)}`}
              style={{
                background: "var(--tag-bg)",
                color: "var(--tag-text)",
                borderRadius: "999px",
                padding: "6px 12px",
                fontSize: "13px",
                fontWeight: 500,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              #{tag}
            </Link>
          ))}
        </div>

        <div
          className="flex justify-between text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          <span>{Number((post as any).views ?? 0)} views</span>
          <span>{Number((post as any).likes ?? 0)} likes</span>
        </div>
      </div>
    </article>
  );
}

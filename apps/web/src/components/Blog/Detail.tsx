import type { Post } from "@repo/db/data";
import { marked } from "marked";
import Link from "next/link";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
    return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  }

  return [];
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export async function BlogDetail({ post }: { post: Post }) {
  const content = await marked.parse(post.content);
  const tags = getTags((post as any).tags);
  const dateValue = (post as any).date ?? (post as any).createdAt;
  const image = (post as any).image ?? (post as any).imageUrl;

  return (
    <article
      data-testid={`blog-post-${post.id}`}
      data-test-id={`blog-post-${post.id}`}
      className="space-y-4"
    >
      {image ? (
        <img
          src={String(image)}
          alt={post.title}
          className="h-72 w-full rounded-lg object-cover"
        />
      ) : null}

      <h1 className="text-3xl font-bold">{post.title}</h1>

      <div className="flex gap-4 text-sm text-gray-500">
        {dateValue ? <span>{formatDate(dateValue)}</span> : null}
        {(post as any).category ? (
          <span>
            {typeof (post as any).category === "string"
              ? (post as any).category
              : (post as any).category.name}
          </span>
        ) : null}
        <span>{Number((post as any).views ?? 0)} views</span>
        <span>{Number((post as any).likes ?? 0)} likes</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm text-blue-600"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
}

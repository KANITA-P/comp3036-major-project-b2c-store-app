import { client } from "@repo/db/client";
import { headers } from "next/headers";
import Link from "next/link";
import { marked } from "marked";
import { AppLayout } from "@/components/Layout/AppLayout";
import { getCategoryNames } from "@/functions/categories";
import { getRequestIp } from "@/utils/request-ip";
import { LikeButton } from "./like-button";

export const dynamic = "force-dynamic";

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

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, "-");
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default async function Page({
  params,
}: {
  params: Promise<{ urlId: string }>;
}) {
  const { urlId } = await params;
  const existingPost = await client.db.post.findUnique({
    where: { urlId },
  });

  if (!existingPost || !existingPost.active) {
    return (
      <AppLayout>
        <div>0 Posts</div>
      </AppLayout>
    );
  }

  await client.db.post.update({
    where: { id: existingPost.id },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  const tags = getTags(existingPost.tags);
  const dateValue = existingPost.date ?? existingPost.createdAt;
  const image = existingPost.imageUrl;
  const description = existingPost.description ?? existingPost.detail ?? "";
  const content = existingPost.content ?? existingPost.detail ?? description;

  const categoryName = getCategoryNames(existingPost.category)[0];
  const contentHtml = await marked.parse(String(content));
  const headerStore = await headers();
  const userIP = getRequestIp(headerStore);
  const likeEntry = await client.db.like.findUnique({
    where: {
      postId_userIP: {
        postId: existingPost.id,
        userIP,
      },
    },
    select: {
      postId: true,
    },
  });

  const href = `/post/${existingPost.urlId}`;

  return (
    <AppLayout>
      <article
        className="flex flex-col gap-6 rounded-2xl p-6"
        data-testid={`blog-post-${existingPost.id}`}
        data-test-id={`blog-post-${existingPost.id}`}
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
        }}
      >
        {image ? (
          <img
            src={String(image)}
            alt={existingPost.title}
            className="h-auto w-full rounded-xl object-cover"
          />
        ) : null}

        <div
          className="flex gap-4 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          {dateValue ? (
            <span>{formatDate(dateValue)}</span>
          ) : null}

          {categoryName ? (
            <Link
              href={`/category/${slugify(categoryName)}`}
              title={`Category / ${categoryName}`}
            >
              {categoryName}
            </Link>
          ) : null}
        </div>

        <Link
          href={href}
          style={{
            color: "var(--accent)",
            textDecoration: "none",
            fontSize: "2rem",
            fontWeight: 700,
            lineHeight: 1.2,
            display: "inline-block",
          }}
        >
          {existingPost.title}
        </Link>

        {description ? (
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
            {String(description)}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${slugify(tag)}`}
              title={`Tag / ${tag}`}
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
          <span>{existingPost.views + 1} views</span>
          <LikeButton
            postId={existingPost.id}
            initialLikes={existingPost.likes}
            initialLiked={Boolean(likeEntry)}
          />
        </div>

        <div
          data-testid="content-markdown"
          data-test-id="content-markdown"
          style={{ color: "var(--text)", lineHeight: 1.7 }}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>
    </AppLayout>
  );
}

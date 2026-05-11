"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";

type AdminPost = {
  id: number;
  title: string;
  content: string;
  urlId: string;
  imageUrl: string;
  date: Date | string;
  category: string;
  tags: string;
  active: boolean;
};

type AdminListProps = {
  posts: AdminPost[];
};

function formatTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => `#${tag.trim()}`)
    .join(", ");
}

export function AdminList({ posts }: AdminListProps) {
  const [items, setItems] = useState(() =>
    posts.map((post) => ({
      ...post,
      date: new Date(post.date),
    })),
  );
  const [contentQuery, setContentQuery] = useState("");
  const [tagQuery, setTagQuery] = useState("");
  const [dateQuery, setDateQuery] = useState("");
  const [visibilityQuery, setVisibilityQuery] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [pendingPostId, setPendingPostId] = useState<number | null>(null);

  const normalizedContentQuery = contentQuery.trim().toLowerCase();
  const normalizedTagQuery = tagQuery.trim().toLowerCase();
  const normalizedDateQuery = dateQuery.replace(/\D/g, "");

  const parsedDate =
    normalizedDateQuery.length === 8
      ? new Date(
        Number(normalizedDateQuery.slice(4, 8)),
        Number(normalizedDateQuery.slice(2, 4)) - 1,
        Number(normalizedDateQuery.slice(0, 2)),
      )
      : null;

  async function togglePost(post: AdminPost) {
    if (pendingPostId === post.id) return;

    setPendingPostId(post.id);

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !post.active }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok || !body) {
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.id === post.id ? { ...item, active: Boolean(body.active) } : item,
        ),
      );
    } finally {
      setPendingPostId(null);
    }
  }

  const filteredPosts = items.filter((post) => {
    const matchesContent =
      !normalizedContentQuery ||
      post.title.toLowerCase().includes(normalizedContentQuery) ||
      post.content.toLowerCase().includes(normalizedContentQuery);

    const matchesTag =
      !normalizedTagQuery ||
      post.tags
        .split(",")
        .some((tag) => tag.trim().toLowerCase().includes(normalizedTagQuery));

    const matchesDate =
      !normalizedDateQuery ||
      !parsedDate ||
      Number.isNaN(parsedDate.getTime()) ||
      post.date >= parsedDate;

    const matchesVisibility =
      visibilityQuery === "all" ||
      (visibilityQuery === "active" && post.active) ||
      (visibilityQuery === "inactive" && !post.active);

    return matchesContent && matchesTag && matchesDate && matchesVisibility;
  });

  const sortedPosts = [...filteredPosts].sort((left, right) => {
    switch (sortBy) {
      case "title-asc":
        return left.title.localeCompare(right.title);
      case "title-desc":
        return right.title.localeCompare(left.title);
      case "date-asc":
        return left.date.getTime() - right.date.getTime();
      case "date-desc":
      default:
        return right.date.getTime() - left.date.getTime();
    }
  });

  return (
    <>
      <section className={styles.filters}>
        <div className={styles.filterGrid}>
          <div className={styles.filterField}>
            <label className={styles.label} htmlFor="filter-content">
              Filter by Content:
            </label>
            <input
              className={styles.input}
              id="filter-content"
              name="filter-content"
              type="text"
              value={contentQuery}
              onChange={(event) => setContentQuery(event.target.value)}
            />
          </div>

          <div className={styles.filterField}>
            <label className={styles.label} htmlFor="filter-tag">
              Filter by Tag:
            </label>
            <input
              className={styles.input}
              id="filter-tag"
              name="filter-tag"
              type="text"
              value={tagQuery}
              onChange={(event) => setTagQuery(event.target.value)}
            />
          </div>

          <div className={styles.filterField}>
            <label className={styles.label} htmlFor="filter-date-created">
              Filter by Date Created:
            </label>
            <input
              className={styles.input}
              id="filter-date-created"
              name="filter-date-created"
              type="text"
              inputMode="numeric"
              value={dateQuery}
              onChange={(event) => setDateQuery(event.target.value)}
            />
          </div>
          <div className={styles.filterField}>
            <label className={styles.label} htmlFor="filter-visibility">
              Filter by Visibility:
            </label>
            <select
              className={styles.input}
              id="filter-visibility"
              name="filter-visibility"
              value={visibilityQuery}
              onChange={(event) => setVisibilityQuery(event.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className={styles.filterField}>
            <label className={styles.label} htmlFor="sort-by">
              Sort By:
            </label>
            <select
              className={styles.input}
              id="sort-by"
              name="sort-by"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="date-asc">Date oldest first</option>
              <option value="date-desc">Date newest first</option>
            </select>
          </div>
        </div>
      </section>

      <section className={styles.list}>
        {sortedPosts.map((post) => (
          <article className={styles.card} key={post.id}>
            {post.imageUrl && (
              <img alt={post.title} className={styles.image} src={post.imageUrl} />
            )}
            <div className={styles.cardBody}>
              <Link className={styles.titleLink} href={`/post/${post.urlId}`}>
                {post.title}
              </Link>
              <p className={styles.meta}>{post.category}</p>
              <p className={styles.meta}>{formatTags(post.tags)}</p>
              <button
                className={styles.statusButton}
                type="button"
                onClick={() => togglePost(post)}
                disabled={pendingPostId === post.id}
                aria-pressed={post.active}
                aria-label={
                  post.active
                    ? `Deactivate post ${post.title}`
                    : `Activate post ${post.title}`
                }
              >
                {post.active ? "Active" : "Inactive"}
              </button>
              <p className={styles.meta}>
                Posted on{" "}
                {post.date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

"use client";

import { useMemo } from "react";
import { categories } from "@/functions/categories";
import type { Post } from "@repo/db/data";
import { toUrlPath } from "@repo/utils/url";
import { SummaryItem } from "./SummaryItem";
import { LinkList } from "./LinkList";

const BASE_CATEGORIES = ["React", "Node", "Mongo", "DevOps"];

export function CategoryList({ posts }: { posts: Post[] }) {
  const items = useMemo(() => {
    const result = categories(posts);

    return BASE_CATEGORIES.map((name) => {
      const found = result.find((item) => item.name === name);
      return { name, count: found?.count ?? 0 };
    });
  }, [posts]);

  return (
    <LinkList title="Categories">
      {items.map((item) => (
        <SummaryItem
          key={item.name}
          name={item.name}
          count={item.count}
          isSelected={false}
          link={`/category/${toUrlPath(item.name)}`}
          title={`Category / ${item.name}`}
        />
      ))}
    </LinkList>
  );
}
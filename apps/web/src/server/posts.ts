import type { Prisma } from "@prisma/client";
import { client } from "@repo/db/client";

type ActivePostFilters = {
  categoryName?: string;
  month?: number;
  query?: string;
  tagName?: string;
  year?: number;
};

function buildTextVariants(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return [];

  const spaced = trimmed.replace(/-/g, " ");
  const hyphenated = trimmed.replace(/\s+/g, "-");
  const titleCase = spaced.replace(/\b\w/g, (character) => character.toUpperCase());

  return [...new Set([trimmed, spaced, hyphenated, titleCase])];
}

function buildWhere(filters: ActivePostFilters): Prisma.PostWhereInput {
  const where: Prisma.PostWhereInput = {
    active: true,
  };

  const query = filters.query?.trim();
  if (query) {
    where.OR = [
      {
        title: {
          contains: query,
        },
      },
      {
        description: {
          contains: query,
        },
      },
      {
        content: {
          contains: query,
        },
      },
    ];
  }

  const categoryName = filters.categoryName?.trim();
  if (categoryName) {
    where.category = {
      in: buildTextVariants(categoryName),
    };
  }

  const tagName = filters.tagName?.trim();
  if (tagName) {
    const existingAnd = Array.isArray(where.AND)
      ? where.AND
      : where.AND
        ? [where.AND]
        : [];

    where.AND = [
      ...existingAnd,
      {
        OR: buildTextVariants(tagName).map((variant) => ({
          tags: {
            contains: variant,
          },
        })),
      },
    ];
  }

  if (filters.year && filters.month) {
    const start = new Date(Date.UTC(filters.year, filters.month - 1, 1));
    const end = new Date(Date.UTC(filters.year, filters.month, 1));

    where.date = {
      gte: start,
      lt: end,
    };
  }

  return where;
}

export async function getActivePosts(filters: ActivePostFilters = {}) {
  const posts = await client.db.post.findMany({
    where: buildWhere(filters),
    orderBy: {
      date: "desc",
    },
    select: {
      id: true,
      urlId: true,
      title: true,
      content: true,
      description: true,
      imageUrl: true,
      date: true,
      category: true,
      views: true,
      likes: true,
      tags: true,
      active: true,
      createdAt: true,
    },
  });

  return posts.map((post) => ({
    ...post,
    category: post.category ?? "",
  }));
}

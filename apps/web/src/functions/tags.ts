import type { Post } from "@repo/db/data";

type TagInput = Pick<Partial<Post>, "tags"> & {
  active?: boolean;
};

function extractTags(raw: unknown): string[] {
  if (!raw) return [];

  // Case 1: Array of tags
  if (Array.isArray(raw)) {
    return raw
      .map((tag) => {
        if (typeof tag === "string") return tag.trim();

        if (typeof tag === "object" && tag !== null) {
          if ("name" in tag) {
            return String((tag as { name: unknown }).name).trim();
          }

          if (
            "tag" in tag &&
            typeof (tag as { tag?: unknown }).tag === "object" &&
            (tag as { tag?: { name?: unknown } }).tag !== null &&
            "name" in ((tag as { tag?: { name?: unknown } }).tag ?? {})
          ) {
            return String((tag as { tag: { name: unknown } }).tag.name).trim();
          }
        }

        return null;
      })
      .filter(Boolean) as string[];
  }

  // Case 2: Comma-separated string
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  return [];
}

export function tags(posts: TagInput[]) {
  const map = new Map<string, number>();

  for (const post of posts) {
    // Skip inactive posts only if explicitly false
    if (post.active === false) continue;

    const tagList = extractTags(post.tags);

    for (const tag of tagList) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }

  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
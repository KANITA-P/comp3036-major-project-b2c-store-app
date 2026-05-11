type CategoryInput = {
  category?: unknown;
  active?: boolean;
};

export function getCategoryNames(category: unknown): string[] {
  if (Array.isArray(category)) {
    return category
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (typeof item === "object" && item !== null && "name" in item) {
          return String((item as { name: string }).name).trim();
        }
        return null;
      })
      .filter(Boolean) as string[];
  }

  if (typeof category === "string") {
    return category
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof category === "object" && category !== null && "name" in category) {
    return [String((category as { name: string }).name).trim()].filter(Boolean);
  }

  return [];
}

export function categories(posts: CategoryInput[]) {
  const map = new Map<string, number>();

  for (const post of posts) {
    if (post.active === false) continue;

    const names = getCategoryNames(post.category);
    for (const name of names) {
      map.set(name, (map.get(name) ?? 0) + 1);
    }
  }

  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
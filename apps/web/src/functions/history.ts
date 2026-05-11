type HistoryPost = {
  active?: boolean;
  date?: Date | string;
  createdAt?: Date | string;
};

export function getPostDate(post: HistoryPost): Date | null {
  const raw = post.date ?? post.createdAt;
  if (!raw) return null;

  const value = raw instanceof Date ? raw : new Date(String(raw));
  if (Number.isNaN(value.getTime())) return null;

  return value;
}

export function history(
  posts: HistoryPost[]
): { year: number; month: number; count: number }[] {
  const map = new Map<string, { year: number; month: number; count: number }>();

  for (const post of posts) {
    if (post.active === false) continue;

    const date = getPostDate(post);
    if (!date) continue;

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month}`;

    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(key, { year, month, count: 1 });
    }
  }

  return [...map.values()].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return b.month - a.month;
  });
}

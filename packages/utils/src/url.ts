export function toUrlPath(path: string) {
  return path
    .toLowerCase()
    .trim()
    // replace non-alphanumeric with hyphen
    .replace(/[^a-z0-9]+/g, "-")
    // replace multiple hyphens with one
    .replace(/-+/g, "-")
    // remove leading/trailing hyphens
    .replace(/^-|-$/g, "");
}
import { type Post } from "@repo/db/data";
import { tags } from "../../functions/tags";
import { LinkList } from "./LinkList";
import { SummaryItem } from "./SummaryItem";
import { toUrlPath } from "@repo/utils/url";

export async function TagList({
  selectedTag,
  posts,
}: {
  selectedTag?: string;
  posts: Post[];
}) {
  const postTags = await tags(posts);

  return (
    <LinkList title="Tags">
      {postTags.map((item) => (
        <SummaryItem
          key={item.name}
          count={item.count}
          name={item.name}
          isSelected={toUrlPath(selectedTag ?? "") === toUrlPath(item.name)}
          link={`/tags/${toUrlPath(item.name)}`}
          title={`Tag / ${item.name}`}
        />
      ))}
    </LinkList>
  );
}
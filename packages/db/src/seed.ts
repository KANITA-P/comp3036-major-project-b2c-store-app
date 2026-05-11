import { client } from "./client.js";
import { posts } from "./data.js";

export async function seed() {
  console.log("🌱 Seeding data");
  await client.db.like.deleteMany();
  await client.db.post.deleteMany();
  for (const post of posts) {
    await client.db.post.create({
      data: {
        title: post.title,
        content: post.content,
        category: post.category,
        description: post.description,
        imageUrl: post.imageUrl,
        tags: post.tags
          .split(",")
          .map((tag: string) => tag.trim())
          .join(","),
        urlId: post.urlId,
        active: post.active,
        date: post.date,
        id: post.id,
        views: post.views,
        likes: post.likes,
      },
    });
    for (let i = 0; i < post.likes; i++) {
      await client.db.like.create({
        data: {
          postId: post.id,
          userIP: `192.168.100.${i}`,
        },
      });
    }
  }
}

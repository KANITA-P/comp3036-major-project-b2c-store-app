import { client } from "@repo/db/client";
import { toUrlPath } from "@repo/utils/url";
import { NextResponse } from "next/server";
import { isLoggedIn } from "../../../utils/auth";

function parsePostBody(body: any) {
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description =
    typeof body?.description === "string" ? body.description.trim() : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl.trim() : "";
  const tags = typeof body?.tags === "string" ? body.tags.trim() : "";
  const category =
    typeof body?.category === "string" ? body.category.trim() : "";

  return {
    title,
    description,
    content,
    imageUrl,
    tags,
    category,
  };
}

async function createUniqueUrlId(title: string) {
  const baseUrlId = toUrlPath(title) || "post";
  let urlId = baseUrlId;
  let suffix = 1;

  while (
    await client.db.post.findUnique({
      where: { urlId },
      select: { id: true },
    })
  ) {
    suffix += 1;
    urlId = `${baseUrlId}-${suffix}`;
  }

  return urlId;
}

export async function POST(request: Request) {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { title, description, content, imageUrl, tags, category } =
    parsePostBody(body);

  if (!title || !description || !content || !imageUrl || !tags) {
    return NextResponse.json({ error: "Invalid post data" }, { status: 400 });
  }

  const urlId = await createUniqueUrlId(title);

  const post = await client.db.post.create({
    data: {
      title,
      urlId,
      description,
      detail: description,
      content,
      imageUrl,
      tags,
      category,
      published: true,
      active: true,
    },
    select: {
      id: true,
      title: true,
      urlId: true,
    },
  });

  return NextResponse.json(post, { status: 201 });
}

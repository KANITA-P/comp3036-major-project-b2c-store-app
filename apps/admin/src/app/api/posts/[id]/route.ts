import { client } from "@repo/db/client";
import { NextResponse } from "next/server";
import { isLoggedIn } from "../../../../utils/auth";

function parsePostId(value: string) {
  const postId = Number(value);

  if (!Number.isInteger(postId) || postId < 1) {
    return null;
  }

  return postId;
}

function hasOwnProperty(value: unknown, property: string) {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.prototype.hasOwnProperty.call(value, property)
  );
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const postId = parsePostId(id);

  if (!postId) {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);

  const existingPost = await client.db.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!existingPost) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (hasOwnProperty(body, "active") && Object.keys(body).length > 1) {
    return NextResponse.json(
      { error: "Active cannot be updated with other post fields" },
      { status: 400 },
    );
  }

  if (typeof body?.active === "boolean") {
    const post = await client.db.post.update({
      where: { id: postId },
      data: { active: body.active },
      select: { id: true, active: true },
    });

    return NextResponse.json(post);
  }

  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description =
    typeof body?.description === "string" ? body.description.trim() : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl.trim() : "";
  const tags = typeof body?.tags === "string" ? body.tags.trim() : "";
  const category =
    typeof body?.category === "string" ? body.category.trim() : "";

  if (!title || !description || !content || !imageUrl || !tags) {
    return NextResponse.json({ error: "Invalid post data" }, { status: 400 });
  }

  const post = await client.db.post.update({
    where: { id: postId },
    data: {
      title,
      description,
      detail: description,
      content,
      imageUrl,
      tags,
      category,
    },
    select: {
      id: true,
      title: true,
      urlId: true,
    },
  });

  return NextResponse.json(post);
}

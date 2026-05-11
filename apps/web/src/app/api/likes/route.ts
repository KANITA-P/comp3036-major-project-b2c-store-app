import { Prisma } from "@prisma/client";
import { client } from "@repo/db/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getRequestIp } from "@/utils/request-ip";

function parsePostId(value: unknown) {
  const postId = Number(value);

  if (!Number.isInteger(postId) || postId < 1) {
    return null;
  }

  return postId;
}

async function getPostFromBody(
  request: Request,
): Promise<
  | { error: NextResponse; postId: null }
  | { error: null; postId: number }
> {
  const body = await request.json().catch(() => null);
  const postId = parsePostId(body?.postId);

  if (!postId) {
    return {
      error: NextResponse.json({ error: "Invalid post ID" }, { status: 400 }),
      postId: null,
    };
  }

  const post = await client.db.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    return {
      error: NextResponse.json({ error: "Post not found" }, { status: 404 }),
      postId: null,
    };
  }

  return { error: null, postId };
}

async function syncLikes(postId: number) {
  const likesCount = await client.db.like.count({
    where: { postId },
  });

  const post = await client.db.post.update({
    where: { id: postId },
    data: { likes: likesCount },
    select: { likes: true },
  });

  return post.likes;
}

export async function POST(request: Request) {
  const postResult = await getPostFromBody(request);

  if (postResult.error) {
    return postResult.error;
  }

  const headerStore = await headers();
  const userIP = getRequestIp(headerStore);

  try {
    await client.db.like.create({
      data: {
        postId: postResult.postId,
        userIP,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const likesCount = await syncLikes(postResult.postId);

      return NextResponse.json({
        liked: true,
        likesCount,
      });
    }

    throw error;
  }

  const likesCount = await syncLikes(postResult.postId);

  return NextResponse.json({
    liked: true,
    likesCount,
  });
}

export async function DELETE(request: Request) {
  const postResult = await getPostFromBody(request);

  if (postResult.error) {
    return postResult.error;
  }

  const headerStore = await headers();
  const userIP = getRequestIp(headerStore);

  await client.db.like.deleteMany({
    where: {
      postId: postResult.postId,
      userIP,
    },
  });

  const likesCount = await syncLikes(postResult.postId);

  return NextResponse.json({
    liked: false,
    likesCount,
  });
}
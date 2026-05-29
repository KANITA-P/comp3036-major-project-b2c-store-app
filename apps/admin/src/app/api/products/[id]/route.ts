import { client } from "@repo/db/client";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { isLoggedIn } from "../../../../utils/auth";

function getStringField(body: unknown, field: string) {
  if (!body || typeof body !== "object" || !(field in body)) {
    return "";
  }

  const value = (body as Record<string, unknown>)[field];
  return typeof value === "string" ? value.trim() : "";
}

function getNumberField(body: unknown, field: string) {
  if (!body || typeof body !== "object" || !(field in body)) {
    return Number.NaN;
  }

  return Number((body as Record<string, unknown>)[field]);
}

function parseProductId(value: string) {
  const productId = Number(value);

  if (!Number.isInteger(productId) || productId < 1) {
    return null;
  }

  return productId;
}

function parseProductBody(body: unknown) {
  return {
    name: getStringField(body, "name"),
    description: getStringField(body, "description"),
    image: getStringField(body, "image"),
    category: getStringField(body, "category"),
    price: getNumberField(body, "price"),
    stock: getNumberField(body, "stock"),
  };
}

async function getOrCreateCategoryId(name: string) {
  const category = await client.db.category.upsert({
    where: { name },
    update: {},
    create: { name },
    select: { id: true },
  });

  return category.id;
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
  const productId = parseProductId(id);

  if (!productId) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const productBody = parseProductBody(body);

  if (
    !productBody.name ||
    !productBody.description ||
    !productBody.image ||
    !productBody.category ||
    !Number.isFinite(productBody.price) ||
    productBody.price <= 0 ||
    !Number.isInteger(productBody.stock) ||
    productBody.stock < 0
  ) {
    return NextResponse.json(
      { error: "Invalid product data" },
      { status: 400 },
    );
  }

  const categoryId = await getOrCreateCategoryId(productBody.category);
  const product = await client.db.product.update({
    where: { id: productId },
    data: {
      name: productBody.name,
      description: productBody.description,
      image: productBody.image,
      price: productBody.price,
      stock: productBody.stock,
      categoryId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const productId = parseProductId(id);

  if (!productId) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  try {
    await client.db.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        { error: "Cannot delete a product with order history" },
        { status: 409 },
      );
    }

    throw error;
  }
}

import { client } from "@repo/db/client";
import { NextResponse } from "next/server";
import { isLoggedIn } from "../../../utils/auth";

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

export async function POST(request: Request) {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
  }

  const categoryId = await getOrCreateCategoryId(productBody.category);
  const product = await client.db.product.create({
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

  return NextResponse.json(product, { status: 201 });
}

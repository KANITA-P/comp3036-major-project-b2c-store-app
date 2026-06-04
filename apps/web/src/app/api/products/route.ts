import { client } from "@repo/db/client";
import { NextResponse } from "next/server";

function toProductResponse(product: {
  id: number;
  name: string;
  description: string;
  price: unknown;
  image: string;
  stock: number;
  category: {
    id: number;
    name: string;
  };
}) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    image: product.image,
    stockQuantity: product.stock,
    category: {
      id: product.category.id,
      name: product.category.name,
    },
  };
}

export async function GET() {
  try {
    const products = await client.db.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(products.map(toProductResponse));
  } catch {
    return NextResponse.json(
      { error: "Unable to load products" },
      { status: 500 },
    );
  }
}

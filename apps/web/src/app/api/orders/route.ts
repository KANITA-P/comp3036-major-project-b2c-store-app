import { client } from "@repo/db/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/auth";

type CartRequestItem = {
  productId: number;
  quantity: number;
};

function parseCartItems(body: unknown): CartRequestItem[] {
  if (!body || typeof body !== "object") return [];

  const items = (body as Record<string, unknown>).items;

  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const value = item as Record<string, unknown>;
      const productId = Number(value.productId);
      const quantity = Number(value.quantity);

      if (
        !Number.isInteger(productId) ||
        productId < 1 ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return null;
      }

      return { productId, quantity };
    })
    .filter((item): item is CartRequestItem => item !== null);
}

function mergeCartItems(items: CartRequestItem[]) {
  const quantityByProductId = new Map<number, number>();

  for (const item of items) {
    quantityByProductId.set(
      item.productId,
      (quantityByProductId.get(item.productId) ?? 0) + item.quantity,
    );
  }

  return Array.from(quantityByProductId, ([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

function toCents(value: unknown) {
  return Math.round(Number(value) * 100);
}

function fromCents(value: number) {
  return (value / 100).toFixed(2);
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsedItems = parseCartItems(body);

  if (!parsedItems.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const cartItems = mergeCartItems(parsedItems);
  const productIds = cartItems.map((item) => item.productId);

  try {
    const order = await client.db.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
        },
      });
      const productById = new Map(
        products.map((product) => [product.id, product]),
      );

      if (products.length !== productIds.length) {
        throw new Error("Invalid cart product");
      }

      const orderItems = cartItems.map((item) => {
        const product = productById.get(item.productId);

        if (!product) {
          throw new Error("Invalid cart product");
        }

        if (product.stock < item.quantity) {
          throw new Error(`${product.name} does not have enough stock`);
        }

        const priceCents = toCents(product.price);
        const subtotalCents = priceCents * item.quantity;

        return {
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          priceAtPurchase: fromCents(priceCents),
          subtotal: fromCents(subtotalCents),
          subtotalCents,
        };
      });
      const totalCents = orderItems.reduce(
        (total, item) => total + item.subtotalCents,
        0,
      );

      const createdOrder = await tx.order.create({
        data: {
          userId: currentUser.id,
          totalAmount: fromCents(totalCents),
          status: "CONFIRMED",
          items: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              priceAtPurchase: item.priceAtPurchase,
              subtotal: item.subtotal,
            })),
          },
        },
        select: {
          id: true,
          totalAmount: true,
          items: {
            select: {
              quantity: true,
            },
          },
        },
      });

      for (const item of cartItems) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updated.count !== 1) {
          throw new Error("Product stock changed. Please review your cart.");
        }
      }

      return createdOrder;
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        total: Number(order.totalAmount),
        count: order.items.reduce((total, item) => total + item.quantity, 0),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to place order";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

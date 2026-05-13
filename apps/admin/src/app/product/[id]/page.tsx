import { client } from "@repo/db/client";
import { notFound, redirect } from "next/navigation";
import { isLoggedIn } from "../../../utils/auth";
import { ProductEditor } from "../../product-editor";

export default async function UpdateProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    redirect("/");
  }

  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId < 1) {
    notFound();
  }

  const product = await client.db.product.findUnique({
    where: { id: productId },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  return (
    <ProductEditor
      eyebrow="Edit Product"
      heading={product.name}
      productId={product.id}
      initialProduct={{
        name: product.name,
        category: product.category.name,
        description: product.description,
        image: product.image,
        price: Number(product.price),
        stock: product.stock,
      }}
    />
  );
}

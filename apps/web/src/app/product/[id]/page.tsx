import { getProductById } from "@/server/products";
import { getCurrentUser } from "@/utils/auth";
import { ProductDetailClient } from "./product-detail-client";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  const productPromise = Number.isInteger(productId)
    ? getProductById(productId)
    : Promise.resolve(null);
  const [product, currentUser] = await Promise.all([
    productPromise,
    getCurrentUser(),
  ]);

  return <ProductDetailClient currentUser={currentUser} product={product} />;
}

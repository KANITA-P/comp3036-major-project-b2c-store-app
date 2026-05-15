import { ProductGrid } from "@/components/ProductGrid";
import { getProducts } from "@/server/products";
import { getCurrentUser } from "@/utils/auth";

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const [products, currentUser] = await Promise.all([
    getProducts({ query: params.q }),
    getCurrentUser(),
  ]);

  return <ProductGrid currentUser={currentUser} products={products} />;
}

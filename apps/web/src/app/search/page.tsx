import { ProductGrid } from "@/components/ProductGrid";
import { getProducts } from "@/server/products";

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const products = await getProducts({ query: params.q });

  return <ProductGrid products={products} />;
}

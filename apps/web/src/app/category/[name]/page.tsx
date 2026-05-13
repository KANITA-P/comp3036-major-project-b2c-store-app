import { ProductGrid } from "@/components/ProductGrid";
import { getProducts } from "@/server/products";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const products = await getProducts({ categoryName: name });

  return <ProductGrid products={products} selectedCategory={name} />;
}

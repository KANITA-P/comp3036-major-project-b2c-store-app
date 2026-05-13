import { ProductGrid } from "@/components/ProductGrid";
import { getProducts } from "@/server/products";

export default async function Home() {
  const products = await getProducts();

  return <ProductGrid products={products} />;
}

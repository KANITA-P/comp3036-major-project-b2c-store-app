import { ProductGrid } from "@/components/ProductGrid";
import { getProducts } from "@/server/products";
import { getCurrentUser } from "@/utils/auth";

export default async function Home() {
  const [products, currentUser] = await Promise.all([
    getProducts(),
    getCurrentUser(),
  ]);

  return <ProductGrid currentUser={currentUser} products={products} />;
}

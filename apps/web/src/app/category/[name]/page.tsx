import { ProductGrid } from "@/components/ProductGrid";
import { getProducts } from "@/server/products";
import { getCurrentUser } from "@/utils/auth";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const [products, currentUser] = await Promise.all([
    getProducts({ categoryName: name }),
    getCurrentUser(),
  ]);

  return (
    <ProductGrid
      currentUser={currentUser}
      products={products}
      selectedCategory={name}
    />
  );
}

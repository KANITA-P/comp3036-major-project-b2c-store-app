import { client } from "@repo/db/client";
import { products as seedProducts } from "@repo/db/data";

export type StoreProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
};

type ProductFilters = {
  categoryName?: string;
  query?: string;
};

function buildTextVariants(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return [];

  const spaced = trimmed.replace(/-/g, " ");
  const titleCase = spaced.replace(/\b\w/g, (character) =>
    character.toUpperCase(),
  );

  return [...new Set([trimmed, spaced, titleCase])];
}

export async function getProducts(filters: ProductFilters = {}) {
  const categoryName = filters.categoryName?.trim();
  const query = filters.query?.trim();

  try {
    const products = await client.db.product.findMany({
      where: {
        ...(categoryName
          ? {
              category: {
                name: {
                  in: buildTextVariants(categoryName),
                },
              },
            }
          : {}),
        ...(query
          ? {
              OR: [
                {
                  name: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  category: {
                    name: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
      },
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      image: product.image,
      stock: product.stock,
      category: product.category.name,
    }));
  } catch {
    const categoryVariants = new Set(
      categoryName
        ? buildTextVariants(categoryName).map((value) => value.toLowerCase())
        : [],
    );
    const normalizedQuery = query?.toLowerCase();

    return seedProducts.filter((product) => {
      const matchesCategory =
        !categoryName || categoryVariants.has(product.category.toLowerCase());
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }
}

export async function getProductById(id: number): Promise<StoreProduct | null> {
  if (!Number.isInteger(id) || id < 1) return null;

  const product = await client.db.product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
    },
  });

  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    image: product.image,
    stock: product.stock,
    category: product.category.name,
  };
}

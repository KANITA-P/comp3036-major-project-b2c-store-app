import { client } from "./client.js";
import { categories, products } from "./data.js";

export async function seed() {
  console.log("Seeding clothing store data");

  for (const name of categories) {
    await client.db.category.upsert({
      where: { name },
      update: { name },
      create: { name },
    });
  }

  const categoryRecords = await client.db.category.findMany();
  const categoryByName = new Map(
    categoryRecords.map((category) => [category.name, category.id]),
  );

  for (const product of products) {
    const categoryId = categoryByName.get(product.category);

    if (!categoryId) {
      throw new Error(`Missing category ${product.category}`);
    }

    await client.db.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        stock: product.stock,
        categoryId,
      },
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        stock: product.stock,
        categoryId,
      },
    });
  }

  console.log(`Seeded ${categories.length} categories and ${products.length} products`);
}

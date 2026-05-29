import bcrypt from "bcryptjs";
import { client } from "./client.js";
import { categories, products } from "./data.js";

function getAdminSeedInput() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email) {
    throw new Error("ADMIN_EMAIL is required to seed the admin user");
  }

  if (!password) {
    throw new Error("ADMIN_PASSWORD is required to seed the admin user");
  }

  return { email, password };
}

export async function seed() {
  console.log("Seeding clothing store data");
  const admin = getAdminSeedInput();
  const hashedPassword = await bcrypt.hash(admin.password, 10);

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

  await client.db.$transaction([
    client.db.user.upsert({
      where: { email: admin.email },
      update: {
        name: "Threadline Admin",
        password: hashedPassword,
        role: "ADMIN",
      },
      create: {
        name: "Threadline Admin",
        email: admin.email,
        password: hashedPassword,
        role: "ADMIN",
      },
    }),
    client.db.user.updateMany({
      where: {
        role: "ADMIN",
        email: {
          not: admin.email,
        },
      },
      data: {
        role: "USER",
      },
    }),
  ]);

  console.log(
    `Seeded ${categories.length} categories, ${products.length} products, and 1 admin user`,
  );
}

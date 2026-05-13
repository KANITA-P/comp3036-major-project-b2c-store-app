import { products } from "@repo/db/data";
import { describe, expect, test } from "vitest";

describe("store seed data", () => {
  test("includes the required clothing categories", () => {
    const categories = new Set(products.map((product) => product.category));

    expect(categories).toEqual(
      new Set(["Jackets", "Hoodies", "Pants", "Accessories"]),
    );
  });

  test("includes at least eight purchasable products", () => {
    expect(products).toHaveLength(8);
    expect(products.every((product) => product.price > 0 && product.stock >= 0)).toBe(
      true,
    );
  });
});

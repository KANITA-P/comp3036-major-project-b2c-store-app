"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import type { StoreProduct } from "@/server/products";
import { CategoryFilter } from "./CategoryFilter";
import { Navbar } from "./Navbar";
import { ProductCard } from "./ProductCard";

type CartLine = StoreProduct & {
  quantity: number;
};

export function ProductGrid({
  products,
  selectedCategory,
}: {
  products: StoreProduct[];
  selectedCategory?: string;
}) {
  const [cart, setCart] = useState<CartLine[]>([]);

  useEffect(() => {
    const storedCart = window.localStorage.getItem("threadline-cart");
    if (!storedCart) return;

    try {
      setCart(JSON.parse(storedCart) as CartLine[]);
    } catch {
      window.localStorage.removeItem("threadline-cart");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("threadline-cart", JSON.stringify(cart));
  }, [cart]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const featuredProduct = products[0];
  const stockedProducts = useMemo(
    () => [...products].sort((left, right) => right.stock - left.stock),
    [products],
  );

  function addToCart(product: StoreProduct) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item,
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-950">
      <Navbar cartCount={cartCount} />

      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-14">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-normal text-neutral-500">
              New season essentials
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black leading-none tracking-normal text-neutral-950 sm:text-6xl">
              Clean layers for everyday movement.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
              Jackets, hoodies, pants, and accessories selected for a practical
              streetwear prototype. Browse the collection and build a quick local
              cart without checkout.
            </p>
            <div className="mt-8">
              <CategoryFilter selectedCategory={selectedCategory} />
            </div>
          </div>

          <div className="relative min-h-96 overflow-hidden rounded-lg bg-neutral-900">
            {featuredProduct ? (
              <>
                <img
                  alt={featuredProduct.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-80"
                  src={featuredProduct.image}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950/85 to-transparent p-6 text-white">
                  <p className="text-sm font-semibold">{featuredProduct.category}</p>
                  <h2 className="mt-2 text-3xl font-black">
                    {featuredProduct.name}
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-neutral-100">
                    {featuredProduct.description}
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8" id="products">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-normal text-neutral-500">
                Storefront
              </p>
              <h2 className="mt-1 text-3xl font-black text-neutral-950">
                Products
              </h2>
            </div>
            <p className="text-sm font-medium text-neutral-500">
              {stockedProducts.length} products available
            </p>
          </div>

          {stockedProducts.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stockedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  onAddToCart={addToCart}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-600">
              No products found.
            </div>
          )}
        </section>

        <aside
          className="mx-auto mb-16 max-w-7xl px-5 lg:px-8"
          id="cart"
          aria-label="Cart preview"
        >
          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-normal text-neutral-500">
                  Cart Preview
                </p>
                <h2 className="mt-1 text-2xl font-black text-neutral-950">
                  {cartCount} item{cartCount === 1 ? "" : "s"} · ${cartTotal.toFixed(2)}
                </h2>
              </div>
              <button
                className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-700 transition hover:border-neutral-950 disabled:cursor-not-allowed disabled:text-neutral-300"
                disabled={!cart.length}
                onClick={clearCart}
                type="button"
              >
                Clear Cart
              </button>
            </div>

            <div className="mt-5 divide-y divide-neutral-200">
              {cart.length ? (
                cart.map((item) => (
                  <div className="flex items-center justify-between gap-4 py-4" key={item.id}>
                    <div>
                      <p className="font-bold text-neutral-950">{item.name}</p>
                      <p className="text-sm text-neutral-500">
                        {item.quantity} x ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-black text-neutral-950">
                      ${(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-4 text-sm text-neutral-500">
                  Your cart is empty. Add products to preview an order.
                </p>
              )}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

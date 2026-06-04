"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { handleProductImageError } from "@/components/ProductCard";
import type { StoreProduct } from "@/server/products";
import type { CustomerSession } from "@/utils/auth";
import { type CartLine, getCartCount, readCart, writeCart } from "@/utils/cart";

export function ProductDetailClient({
  currentUser,
  product,
}: {
  currentUser: CustomerSession | null;
  product: StoreProduct | null;
}) {
  const [cart, setCart] = useState<CartLine[]>([]);

  useEffect(() => {
    setCart(readCart());
  }, []);

  function addToCart() {
    if (!product || product.stock < 1) return;

    const currentCart = readCart();
    const existing = currentCart.find((item) => item.id === product.id);
    const nextCart = existing
      ? currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item,
        )
      : [...currentCart, { ...product, quantity: 1 }];

    writeCart(nextCart);
    setCart(nextCart);
  }

  const cartCount = getCartCount(cart);

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50 text-neutral-950">
        <Navbar cartCount={cartCount} currentUser={currentUser} />
        <main className="mx-auto flex max-w-3xl flex-col items-start px-5 py-16 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-normal text-neutral-500">
            Product unavailable
          </p>
          <h1 className="mt-3 text-4xl font-black text-neutral-950">
            Product not found
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-neutral-600">
            This product may have been removed or the link may be incorrect.
          </p>
          <Link
            className="mt-8 rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-700"
            href="/"
          >
            Back to shop
          </Link>
        </main>
      </div>
    );
  }

  const isSoldOut = product.stock < 1;

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-950">
      <Navbar cartCount={cartCount} currentUser={currentUser} />
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
        <Link
          className="inline-flex text-sm font-bold text-neutral-600 transition hover:text-neutral-950"
          href="/"
        >
          Back to shop
        </Link>

        <section
          className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)] lg:items-start"
          data-test-id="product-detail"
        >
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 shadow-sm">
            <img
              alt={product.name}
              className="aspect-[4/5] h-full w-full object-cover"
              onError={handleProductImageError}
              src={product.image}
            />
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm lg:p-8">
            <p className="text-sm font-bold uppercase tracking-normal text-neutral-500">
              {product.category}
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-neutral-950 sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 text-3xl font-black text-neutral-950">
              ${product.price.toFixed(2)}
            </p>
            <p className="mt-5 leading-8 text-neutral-600">
              {product.description}
            </p>

            <dl className="mt-6 grid gap-4 border-y border-neutral-200 py-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-normal text-neutral-500">
                  Stock
                </dt>
                <dd className="mt-1 font-bold text-neutral-950">
                  {isSoldOut ? "Out of stock" : `${product.stock} in stock`}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-normal text-neutral-500">
                  Size and condition
                </dt>
                <dd className="mt-1 font-bold text-neutral-950">
                  {product.description}
                </dd>
              </div>
            </dl>

            <button
              className="mt-6 w-full rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300 sm:w-auto"
              disabled={isSoldOut}
              onClick={addToCart}
              type="button"
            >
              Add to Cart
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

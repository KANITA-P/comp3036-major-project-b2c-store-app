"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { handleProductImageError } from "@/components/ProductCard";
import type { CustomerSession } from "@/utils/auth";
import {
  type CartLine,
  getCartCount,
  getCartTotal,
  readCart,
  writeCart,
} from "@/utils/cart";

export function CartPageClient({
  currentUser,
}: {
  currentUser: CustomerSession | null;
}) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const cartCount = getCartCount(cart);
  const cartTotal = getCartTotal(cart);

  useEffect(() => {
    setCart(readCart());
  }, []);

  function updateCart(nextCart: CartLine[]) {
    setCart(nextCart);
    writeCart(nextCart);
  }

  function updateQuantity(productId: number, quantity: number) {
    updateCart(
      cart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeItem(productId: number) {
    updateCart(cart.filter((item) => item.id !== productId));
  }

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-950">
      <Navbar cartCount={cartCount} currentUser={currentUser} />

      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-neutral-500">
              Shopping Cart
            </p>
            <h1 className="mt-1 text-4xl font-black tracking-normal">
              Review your pieces
            </h1>
          </div>
          <Link
            className="inline-flex h-10 items-center rounded-full border border-neutral-200 bg-white px-5 text-sm font-bold text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
            href="/"
          >
            Continue shopping
          </Link>
        </div>

        {cart.length ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <section
              aria-label="Cart items"
              className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white shadow-sm"
            >
              {cart.map((item) => (
                <article
                  className="grid gap-4 p-4 sm:grid-cols-[120px_1fr] sm:p-5"
                  data-test-id="cart-line"
                  key={item.id}
                >
                  <div className="aspect-[4/5] overflow-hidden rounded-lg bg-neutral-100">
                    <img
                      alt={item.name}
                      className="h-full w-full object-cover"
                      onError={handleProductImageError}
                      src={item.image}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-normal text-neutral-500">
                        {item.category}
                      </p>
                      <h2 className="mt-1 text-xl font-black">{item.name}</h2>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600">
                        {item.description}
                      </p>
                      <p className="mt-3 text-sm font-bold text-neutral-950">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-4 md:items-end">
                      <div className="flex items-center gap-2">
                        <button
                          aria-label={`Decrease quantity for ${item.name}`}
                          className="grid h-9 w-9 place-items-center rounded-full border border-neutral-200 text-lg font-bold transition hover:border-neutral-950 disabled:cursor-not-allowed disabled:text-neutral-300"
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          type="button"
                        >
                          -
                        </button>
                        <span
                          className="grid h-9 min-w-10 place-items-center rounded-full bg-neutral-100 px-3 text-sm font-bold"
                          aria-label={`Quantity ${item.quantity}`}
                        >
                          {item.quantity}
                        </span>
                        <button
                          aria-label={`Increase quantity for ${item.name}`}
                          className="grid h-9 w-9 place-items-center rounded-full border border-neutral-200 text-lg font-bold transition hover:border-neutral-950 disabled:cursor-not-allowed disabled:text-neutral-300"
                          disabled={item.quantity >= item.stock}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          type="button"
                        >
                          +
                        </button>
                      </div>

                      <p className="text-lg font-black">
                        ${(item.quantity * item.price).toFixed(2)}
                      </p>
                      <button
                        className="text-sm font-bold text-neutral-500 underline transition hover:text-neutral-950"
                        onClick={() => removeItem(item.id)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside
              aria-label="Order summary"
              className="h-fit rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-2xl font-black">Order summary</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Items</span>
                  <span className="font-bold">{cartCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="font-bold">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Delivery</span>
                  <span className="font-bold">Mock only</span>
                </div>
              </div>
              <div className="mt-5 border-t border-neutral-200 pt-5">
                <div className="flex items-center justify-between text-lg font-black">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
              <Link
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full border border-neutral-300 bg-neutral-200 px-5 text-sm font-bold text-neutral-950 transition hover:bg-neutral-300"
                href="/checkout"
              >
                Checkout
              </Link>
            </aside>
          </div>
        ) : (
          <section className="rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-black">Your cart is empty</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-600">
              Add jackets, hoodies, pants, or accessories from the storefront and
              they will appear here before mock checkout.
            </p>
            <Link
              className="mt-6 inline-flex h-11 items-center rounded-full border border-neutral-300 bg-neutral-200 px-6 text-sm font-bold text-neutral-950 transition hover:bg-neutral-300"
              href="/"
            >
              Browse products
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}

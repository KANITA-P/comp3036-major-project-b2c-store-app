"use client";

/* eslint-disable @next/next/no-img-element */

import { useRouter } from "next/navigation";
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

export function CheckoutClient({ currentUser }: { currentUser: CustomerSession }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const cartCount = getCartCount(cart);
  const cartTotal = getCartTotal(cart);

  useEffect(() => {
    setCart(readCart());
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();

    if (!cart.length) {
      setError("Your cart is empty. Add products before checkout.");
      return;
    }

    if (!fullName || !address) {
      setError("Full name and delivery address are required.");
      return;
    }

    setSubmitting(true);
    window.sessionStorage.setItem(
      "threadline-last-order",
      JSON.stringify({
        count: cartCount,
        total: cartTotal,
        placedAt: new Date().toISOString(),
      }),
    );
    writeCart([]);
    router.push("/order-confirmation");
  }

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-950">
      <Navbar cartCount={cartCount} currentUser={currentUser} />

      <main className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_420px] lg:px-8">
        <section>
          <p className="text-sm font-bold uppercase tracking-normal text-neutral-500">
            Mock Checkout
          </p>
          <h1 className="mt-1 text-4xl font-black tracking-normal">
            Complete your purchase
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            This university prototype uses a mock payment only. No real card or
            payment provider is used.
          </p>

          <form
            className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-5">
              <div>
                <label
                  className="text-sm font-bold text-neutral-800"
                  htmlFor="full-name"
                >
                  Full name
                </label>
                <input
                  autoComplete="name"
                  className="mt-2 h-11 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 text-neutral-950 outline-none transition focus:border-neutral-950 focus:bg-white"
                  defaultValue={currentUser.name}
                  id="full-name"
                  name="fullName"
                  type="text"
                />
              </div>

              <div>
                <label
                  className="text-sm font-bold text-neutral-800"
                  htmlFor="delivery-address"
                >
                  Delivery address
                </label>
                <textarea
                  className="mt-2 min-h-28 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-950 outline-none transition focus:border-neutral-950 focus:bg-white"
                  id="delivery-address"
                  name="address"
                />
              </div>

              <div>
                <label
                  className="text-sm font-bold text-neutral-800"
                  htmlFor="payment-method"
                >
                  Payment method
                </label>
                <select
                  className="mt-2 h-11 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 text-neutral-950 outline-none transition focus:border-neutral-950 focus:bg-white"
                  id="payment-method"
                  name="paymentMethod"
                >
                  <option>Mock card ending 4242</option>
                  <option>Mock Pay balance</option>
                </select>
              </div>
            </div>

            {error ? (
              <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            ) : null}

            <button
              className="mt-6 h-11 w-full rounded-full bg-neutral-950 px-5 text-sm font-bold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
              disabled={submitting || !cart.length}
              type="submit"
            >
              {submitting ? "Placing order..." : "Place Order"}
            </button>
          </form>
        </section>

        <aside
          aria-label="Checkout order summary"
          className="h-fit rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-2xl font-black">Order summary</h2>
          {cart.length ? (
            <div className="mt-5 divide-y divide-neutral-200">
              {cart.map((item) => (
                <div className="flex gap-4 py-4" key={item.id}>
                  <div className="h-20 w-16 overflow-hidden rounded-lg bg-neutral-100">
                    <img
                      alt={item.name}
                      className="h-full w-full object-cover"
                      onError={handleProductImageError}
                      src={item.image}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-neutral-950">{item.name}</p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {item.quantity} x ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-black">
                    ${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="flex items-center justify-between pt-5 text-lg font-black">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-lg border border-dashed border-neutral-300 p-5 text-sm leading-6 text-neutral-600">
              Your cart is empty. Return to the storefront to add products before
              mock checkout.
            </p>
          )}
        </aside>
      </main>
    </div>
  );
}

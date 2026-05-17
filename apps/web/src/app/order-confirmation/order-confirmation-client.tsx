"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import type { CustomerSession } from "@/utils/auth";

type LastOrder = {
  count: number;
  total: number;
};

export function OrderConfirmationClient({
  currentUser,
}: {
  currentUser: CustomerSession | null;
}) {
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    const storedOrder = window.sessionStorage.getItem("threadline-last-order");
    if (!storedOrder) return;

    try {
      setLastOrder(JSON.parse(storedOrder) as LastOrder);
    } catch {
      window.sessionStorage.removeItem("threadline-last-order");
    }
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-950">
      <Navbar cartCount={0} currentUser={currentUser} />

      <main className="mx-auto max-w-3xl px-5 py-16 text-center">
        <section className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-normal text-neutral-500">
            Order Confirmed
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-normal">
            Thanks for your mock purchase.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-neutral-600">
            Your mock payment was accepted and your local cart has been cleared.
            This prototype does not create a real payment or shipment.
          </p>

          {lastOrder ? (
            <div className="mx-auto mt-6 grid max-w-sm gap-3 rounded-lg bg-neutral-50 p-5 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Items</span>
                <span className="font-bold">{lastOrder.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total</span>
                <span className="font-bold">${lastOrder.total.toFixed(2)}</span>
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              className="inline-flex h-11 items-center rounded-full border border-neutral-300 bg-neutral-200 px-6 text-sm font-bold text-neutral-950 transition hover:bg-neutral-300"
              href="/"
            >
              Back to store
            </Link>
            <Link
              className="inline-flex h-11 items-center rounded-full border border-neutral-200 bg-white px-6 text-sm font-bold text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
              href="/account/orders"
            >
              View orders
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

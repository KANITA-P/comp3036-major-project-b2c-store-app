"use client";

export function CartButton({ count }: { count: number }) {
  return (
    <a
      className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-950 shadow-sm transition hover:border-neutral-950"
      href="/cart"
      aria-label={`Cart with ${count} items`}
      data-test-id="cart-button"
    >
      <span aria-hidden="true">Cart</span>
      <span className="grid min-h-6 min-w-6 place-items-center rounded-full bg-neutral-950 px-2 text-xs text-white">
        {count}
      </span>
    </a>
  );
}

"use client";

/* eslint-disable @next/next/no-img-element */

import type { StoreProduct } from "@/server/products";

export function ProductCard({
  product,
  onAddToCart,
}: {
  product: StoreProduct;
  onAddToCart: (product: StoreProduct) => void;
}) {
  const isSoldOut = product.stock < 1;

  return (
    <article className="group overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
        <img
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          src={product.image}
        />
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-neutral-500">
              {product.category}
            </p>
            <h3 className="mt-1 text-lg font-bold text-neutral-950">{product.name}</h3>
          </div>
          <p className="shrink-0 text-lg font-black text-neutral-950">
            ${product.price.toFixed(2)}
          </p>
        </div>
        <p className="min-h-12 text-sm leading-6 text-neutral-600">
          {product.description}
        </p>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-neutral-500">
            {isSoldOut ? "Out of stock" : `${product.stock} in stock`}
          </span>
          <button
            className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
            disabled={isSoldOut}
            onClick={() => onAddToCart(product)}
            type="button"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}

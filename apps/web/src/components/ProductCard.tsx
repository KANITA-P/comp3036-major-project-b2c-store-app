"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { SyntheticEvent } from "react";
import type { StoreProduct } from "@/server/products";

export const PRODUCT_IMAGE_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 750'%3E%3Crect width='600' height='750' fill='%23f5f5f4'/%3E%3Cpath d='M185 290h230v170H185z' fill='none' stroke='%23a3a3a3' stroke-width='14'/%3E%3Cpath d='m210 430 70-80 55 60 42-46 52 66' fill='none' stroke='%23a3a3a3' stroke-width='14' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='380' cy='330' r='24' fill='%23a3a3a3'/%3E%3C/svg%3E";

export function handleProductImageError(
  event: SyntheticEvent<HTMLImageElement>,
) {
  event.currentTarget.src = PRODUCT_IMAGE_FALLBACK;
}

export function ProductCard({
  product,
  onAddToCart,
}: {
  product: StoreProduct;
  onAddToCart: (product: StoreProduct) => void;
}) {
  const isSoldOut = product.stock < 1;

  return (
    <article
      className="group overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      data-test-id="product-card"
    >
      <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
        <Link
          aria-label={`View ${product.name}`}
          className="block h-full"
          href={`/product/${product.id}`}
        >
          <img
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={handleProductImageError}
            src={product.image}
          />
        </Link>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-neutral-500">
              {product.category}
            </p>
            <h3 className="mt-1 text-lg font-bold text-neutral-950">
              <Link
                className="transition hover:text-neutral-600"
                href={`/product/${product.id}`}
              >
                {product.name}
              </Link>
            </h3>
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

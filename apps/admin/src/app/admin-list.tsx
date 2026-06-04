"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { SyntheticEvent } from "react";
import { useState } from "react";
import styles from "./page.module.css";

const PRODUCT_IMAGE_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 750'%3E%3Crect width='600' height='750' fill='%23f5f5f4'/%3E%3Cpath d='M185 290h230v170H185z' fill='none' stroke='%23a3a3a3' stroke-width='14'/%3E%3Cpath d='m210 430 70-80 55 60 42-46 52 66' fill='none' stroke='%23a3a3a3' stroke-width='14' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='380' cy='330' r='24' fill='%23a3a3a3'/%3E%3C/svg%3E";

function handleProductImageError(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.src = PRODUCT_IMAGE_FALLBACK;
}

type AdminProduct = {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  category: string;
  createdAt: Date | string;
};

type AdminListProps = {
  products: AdminProduct[];
};

export function AdminList({ products }: AdminListProps) {
  const [items, setItems] = useState(() =>
    products.map((product) => ({
      ...product,
      createdAt: new Date(product.createdAt),
    })),
  );
  const [query, setQuery] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("all");
  const [sortBy, setSortBy] = useState("created-desc");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function deleteProduct(product: AdminProduct) {
    const confirmed = window.confirm(`Delete ${product.name}?`);

    if (!confirmed) return;

    setDeletingId(product.id);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        setError(body?.error ?? "Unable to delete product");
        return;
      }

      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== product.id),
      );
      setMessage(`${product.name} deleted`);
    } finally {
      setDeletingId(null);
    }
  }

  const categories = Array.from(
    new Set(items.map((item) => item.category)),
  ).sort();
  const normalizedQuery = query.trim().toLowerCase();

  const filteredProducts = items.filter((product) => {
    const matchesQuery =
      !normalizedQuery ||
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery);
    const matchesCategory =
      categoryQuery === "all" || product.category === categoryQuery;

    return matchesQuery && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((left, right) => {
    switch (sortBy) {
      case "name-asc":
        return left.name.localeCompare(right.name);
      case "name-desc":
        return right.name.localeCompare(left.name);
      case "stock-asc":
        return left.stock - right.stock;
      case "stock-desc":
        return right.stock - left.stock;
      case "created-desc":
      default:
        return right.createdAt.getTime() - left.createdAt.getTime();
    }
  });

  return (
    <>
      <section className={styles.filters}>
        <div className={styles.filterGrid}>
          <div className={styles.filterField}>
            <label className={styles.label} htmlFor="filter-product">
              Filter by Product
            </label>
            <input
              className={styles.input}
              id="filter-product"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className={styles.filterField}>
            <label className={styles.label} htmlFor="filter-category">
              Filter by Category
            </label>
            <select
              className={styles.input}
              id="filter-category"
              value={categoryQuery}
              onChange={(event) => setCategoryQuery(event.target.value)}
            >
              <option value="all">All</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterField}>
            <label className={styles.label} htmlFor="sort-by">
              Sort By
            </label>
            <select
              className={styles.input}
              id="sort-by"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="created-desc">Newest first</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="stock-asc">Stock low-high</option>
              <option value="stock-desc">Stock high-low</option>
            </select>
          </div>
        </div>
      </section>

      <section className={styles.statusRegion} aria-live="polite">
        {message ? <p className={styles.success}>{message}</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}
      </section>

      <section className={styles.list}>
        {sortedProducts.map((product) => (
          <article
            className={styles.card}
            data-test-id="admin-product-card"
            key={product.id}
          >
            <img
              alt={product.name}
              className={styles.image}
              onError={handleProductImageError}
              src={product.image}
            />
            <div className={styles.cardBody}>
              <Link
                className={styles.titleLink}
                href={`/product/${product.id}`}
              >
                {product.name}
              </Link>
              <p className={styles.meta}>{product.category}</p>
              <p className={styles.meta}>${product.price.toFixed(2)}</p>
              <p className={styles.meta}>{product.stock} in stock</p>
              <p className={styles.meta}>
                Added{" "}
                {product.createdAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <div className={styles.cardActions}>
                <Link
                  className={styles.secondaryLink}
                  href={`/product/${product.id}`}
                >
                  Edit
                </Link>
                <button
                  aria-label={`Delete ${product.name}`}
                  className={styles.dangerButton}
                  disabled={deletingId === product.id}
                  onClick={() => {
                    void deleteProduct(product);
                  }}
                  type="button"
                >
                  {deletingId === product.id ? "Deleting" : "Delete"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

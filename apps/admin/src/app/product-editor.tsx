"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import styles from "./page.module.css";

type EditorProduct = {
  name: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  category: string;
};

type ErrorState = Partial<Record<keyof EditorProduct, string>>;

type ProductEditorProps = {
  initialProduct: EditorProduct;
  heading: string;
  eyebrow?: string;
  productId?: number;
};

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function ProductEditor({
  initialProduct,
  heading,
  eyebrow = "Edit Product",
  productId,
}: ProductEditorProps) {
  const [name, setName] = useState(initialProduct.name);
  const [category, setCategory] = useState(initialProduct.category);
  const [description, setDescription] = useState(initialProduct.description);
  const [image, setImage] = useState(initialProduct.image);
  const [price, setPrice] = useState(String(initialProduct.price || ""));
  const [stock, setStock] = useState(String(initialProduct.stock || ""));
  const [errors, setErrors] = useState<ErrorState>({});
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  function validate() {
    const nextErrors: ErrorState = {};
    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (!name.trim()) nextErrors.name = "Name is required";
    if (!category.trim()) nextErrors.category = "Category is required";
    if (!description.trim()) nextErrors.description = "Description is required";
    if (!image.trim()) nextErrors.image = "Image URL is required";
    else if (!isValidUrl(image.trim())) nextErrors.image = "This is not a valid URL";
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      nextErrors.price = "Price must be greater than zero";
    }
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      nextErrors.stock = "Stock must be a whole number";
    }

    setErrors(nextErrors);
    return nextErrors;
  }

  return (
    <main className={styles.main}>
      <section className={styles.editorCard}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.pageTitle}>{heading}</h1>

        <form
          className={styles.editorForm}
          onSubmit={(event) => {
            event.preventDefault();
            const nextErrors = validate();

            if (Object.keys(nextErrors).length > 0) {
              setFormError("Please fix the errors before saving");
              setFormSuccess("");
              return;
            }

            if (saving) return;

            void (async () => {
              setSaving(true);
              setFormError("");
              setFormSuccess("");

              try {
                const response = await fetch(
                  productId ? `/api/products/${productId}` : "/api/products",
                  {
                    method: productId ? "PATCH" : "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      name: name.trim(),
                      category: category.trim(),
                      description: description.trim(),
                      image: image.trim(),
                      price: Number(price),
                      stock: Number(stock),
                    }),
                  },
                );

                const body = await response.json().catch(() => null);

                if (!response.ok || !body) {
                  setFormError("Unable to save the product");
                  return;
                }

                setFormSuccess("Product saved successfully");
              } finally {
                setSaving(false);
              }
            })();
          }}
        >
          {formError ? <p className={styles.error}>{formError}</p> : null}
          {formSuccess ? <p>{formSuccess}</p> : null}

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="name">
              Name
            </label>
            <input
              className={styles.input}
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {errors.name ? <p className={styles.error}>{errors.name}</p> : null}
          </div>

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="category">
              Category
            </label>
            <input
              className={styles.input}
              id="category"
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
            {errors.category ? (
              <p className={styles.error}>{errors.category}</p>
            ) : null}
          </div>

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="description">
              Description
            </label>
            <textarea
              className={styles.textarea}
              id="description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            {errors.description ? (
              <p className={styles.error}>{errors.description}</p>
            ) : null}
          </div>

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="image">
              Image URL
            </label>
            <input
              className={styles.input}
              id="image"
              type="text"
              value={image}
              onChange={(event) => setImage(event.target.value)}
            />
            {image.trim() && isValidUrl(image.trim()) ? (
              <img
                alt="Preview"
                className={styles.imagePreview}
                src={image.trim()}
              />
            ) : (
              <div className={styles.imagePreviewFallback}>
                Image preview unavailable
              </div>
            )}
            {errors.image ? <p className={styles.error}>{errors.image}</p> : null}
          </div>

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="price">
              Price
            </label>
            <input
              className={styles.input}
              id="price"
              min="0"
              step="0.01"
              type="number"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
            {errors.price ? <p className={styles.error}>{errors.price}</p> : null}
          </div>

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="stock">
              Stock
            </label>
            <input
              className={styles.input}
              id="stock"
              min="0"
              step="1"
              type="number"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
            />
            {errors.stock ? <p className={styles.error}>{errors.stock}</p> : null}
          </div>

          <button className={styles.primaryButton} type="submit" disabled={saving}>
            Save
          </button>
        </form>
      </section>
    </main>
  );
}

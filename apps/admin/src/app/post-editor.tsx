"use client";

import { marked } from "marked";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

type EditorPost = {
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  tags: string;
  category?: string;
};

type ErrorState = {
  title?: string;
  category?: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  tags?: string;
};

type PostEditorProps = {
  initialPost: EditorPost;
  heading: string;
  eyebrow?: string;
  postId?: number;
};

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function PostEditor({
  initialPost,
  heading,
  eyebrow = "Edit Post",
  postId,
}: PostEditorProps) {
  const [title, setTitle] = useState(initialPost.title);
  const [category, setCategory] = useState(initialPost.category ?? "");
  const [description, setDescription] = useState(initialPost.description);
  const [content, setContent] = useState(initialPost.content);
  const [imageUrl, setImageUrl] = useState(initialPost.imageUrl);
  const [tags, setTags] = useState(initialPost.tags);
  const [errors, setErrors] = useState<ErrorState>({});
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const contentSelectionRef = useRef({
    selectionStart: 0,
    selectionEnd: 0,
    shouldRestore: false,
  });

  useEffect(() => {
    if (!showPreview && contentSelectionRef.current.shouldRestore && contentRef.current) {
      const { selectionStart, selectionEnd } = contentSelectionRef.current;
      contentRef.current.focus();
      contentRef.current.setSelectionRange(selectionStart, selectionEnd);
      contentSelectionRef.current.shouldRestore = false;
    }
  }, [showPreview]);

  function validate() {
    const nextErrors: ErrorState = {};

    if (!title.trim()) {
      nextErrors.title = "Title is required";
    }

    if (!description.trim()) {
      nextErrors.description = "Description is required";
    } else if (description.length > 200) {
      nextErrors.description =
        "Description is too long. Maximum is 200 characters";
    }

    if (!content.trim()) {
      nextErrors.content = "Content is required";
    }

    if (!imageUrl.trim()) {
      nextErrors.imageUrl = "Image URL is required";
    } else if (!isValidUrl(imageUrl.trim())) {
      nextErrors.imageUrl = "This is not a valid URL";
    }

    if (
      !tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean).length
    ) {
      nextErrors.tags = "At least one tag is required";
    }

    setErrors(nextErrors);
    return nextErrors;
  }

  const previewHtml = typeof content === "string" ? marked.parse(content) : "";

  function togglePreview() {
    if (!showPreview && contentRef.current) {
      contentSelectionRef.current = {
        selectionStart: contentRef.current.selectionStart ?? 0,
        selectionEnd: contentRef.current.selectionEnd ?? 0,
        shouldRestore: true,
      };
    }

    setShowPreview((current) => !current);
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

            setFormError("");
            setFormSuccess("");

            if (saving) {
              setFormError("Unable to save the post");
              return;
            }

            void (async () => {
              setSaving(true);

              try {
                const response = await fetch(postId ? `/api/posts/${postId}` : "/api/posts", {
                  method: postId ? "PATCH" : "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    title: title.trim(),
                    category: category.trim(),
                    description: description.trim(),
                    content: content.trim(),
                    imageUrl: imageUrl.trim(),
                    tags: tags.trim(),
                  }),
                });

                const body = await response.json().catch(() => null);

                if (!response.ok || !body) {
                  setFormError("Unable to save the post");
                  setFormSuccess("");
                  return;
                }

                setFormSuccess("Post updated successfully");
              } finally {
                setSaving(false);
              }
            })();
          }}
        >
          {formError ? (
            <p className={styles.error} role="alert">
              {formError}
            </p>
          ) : null}

          {formSuccess ? <p>{formSuccess}</p> : null}

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="title">
              Title
            </label>
            <input
              className={styles.input}
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setFormError("");
                setFormSuccess("");
              }}
            />
            {errors.title ? <p className={styles.error}>{errors.title}</p> : null}
          </div>

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="category">
              Category
            </label>
            <input
              className={styles.input}
              id="category"
              name="category"
              type="text"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setFormError("");
                setFormSuccess("");
              }}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="description">
              Description
            </label>
            <textarea
              className={styles.textarea}
              id="description"
              name="description"
              rows={4}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setFormError("");
                setFormSuccess("");
              }}
            />
            {errors.description ? (
              <p className={styles.error}>{errors.description}</p>
            ) : null}
          </div>

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="content">
              Content
            </label>
            <button
              className={styles.previewButton}
              type="button"
              onClick={togglePreview}
            >
              {showPreview ? "Close Preview" : "Preview"}
            </button>
            {showPreview ? (
              <div
                className={styles.preview}
                data-test-id="content-preview"
                data-testid="content-preview"
                dangerouslySetInnerHTML={{
                  __html:
                    typeof previewHtml === "string" ? previewHtml : String(previewHtml),
                }}
              />
            ) : (
              <textarea
                className={styles.textarea}
                id="content"
                name="content"
                ref={contentRef}
                rows={10}
                value={content}
                onChange={(event) => {
                  setContent(event.target.value);
                  setFormError("");
                  setFormSuccess("");
                }}
              />
            )}
            {errors.content ? (
              <p className={styles.error}>{errors.content}</p>
            ) : null}
          </div>

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="image-url">
              Image URL
            </label>
            <input
              className={styles.input}
              id="image-url"
              name="imageUrl"
              type="text"
              value={imageUrl}
              onChange={(event) => {
                setImageUrl(event.target.value);
                setFormError("");
                setFormSuccess("");
              }}
            />
            {imageUrl.trim() ? (
              <img
                alt="Preview"
                className={styles.imagePreview}
                data-test-id="image-preview"
                data-testid="image-preview"
                src={imageUrl.trim()}
              />
            ) : null}
            {!imageUrl.trim() || !isValidUrl(imageUrl.trim()) ? (
              <div className={styles.imagePreviewFallback}>
                Image preview unavailable
              </div>
            ) : null}
            {errors.imageUrl ? (
              <p className={styles.error}>{errors.imageUrl}</p>
            ) : null}
          </div>

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="tags">
              Tags
            </label>
            <input
              className={styles.input}
              id="tags"
              name="tags"
              type="text"
              value={tags}
              onChange={(event) => {
                setTags(event.target.value);
                setFormError("");
                setFormSuccess("");
              }}
            />
            {errors.tags ? <p className={styles.error}>{errors.tags}</p> : null}
          </div>

          <button className={styles.primaryButton} type="submit" disabled={saving}>
            Save
          </button>
        </form>
      </section>
    </main>
  );
}

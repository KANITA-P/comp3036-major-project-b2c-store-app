"use client";

import { useState } from "react";

type LikeButtonProps = {
  initialLiked: boolean;
  initialLikes: number;
  postId: number;
};

export function LikeButton({
  initialLiked,
  initialLikes,
  postId,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [pending, setPending] = useState(false);

  async function updateLike() {
    if (pending) return;

    setPending(true);

    try {
      const response = await fetch("/api/likes", {
        method: liked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok || !body) {
        return;
      }

      setLiked(Boolean(body.liked));
      setLikes(Number(body.likesCount ?? likes));
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="flex items-center gap-3 text-sm"
      style={{ color: "var(--text-secondary)" }}
    >
      <span>{likes} likes</span>
      <button
        type="button"
        data-testid="like-button"
        data-test-id="like-button"
        onClick={updateLike}
        disabled={pending}
        aria-label={liked ? "Unlike post" : "Like post"}
        aria-pressed={liked}
        style={{
          background: "var(--tag-bg)",
          color: "var(--tag-text)",
          border: "1px solid var(--border)",
          borderRadius: "999px",
          padding: "6px 12px",
          fontWeight: 600,
        }}
      >
        {liked ? "Unlike" : "Like"}
      </button>
    </div>
  );
}

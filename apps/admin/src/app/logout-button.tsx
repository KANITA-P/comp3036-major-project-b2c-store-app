"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    if (pending) return;

    setPending(true);

    try {
      await fetch("/api/auth", {
        method: "DELETE",
      });
      window.localStorage.clear();
      window.sessionStorage.clear();
    } finally {
      router.push("/");
      router.refresh();
      setPending(false);
    }
  }

  return (
    <button
      className={className}
      type="button"
      onClick={logout}
      disabled={pending}
    >
      Logout
    </button>
  );
}

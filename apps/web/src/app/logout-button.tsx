"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await fetch("/api/logout", {
        method: "DELETE",
      });
      window.localStorage.clear();
      window.sessionStorage.clear();
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <button
      className="text-sm font-medium text-neutral-600 transition hover:text-neutral-950 disabled:cursor-not-allowed disabled:text-neutral-300"
      disabled={loggingOut}
      onClick={handleLogout}
      type="button"
    >
      Logout
    </button>
  );
}

"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import ThemeSwitch from "../Themes/ThemeSwitcher";

function debounce<T extends (...args: any[]) => any>(fn: T, delay = 300) {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function TopMenu({ query }: { query?: string }) {
  const router = useRouter();

  const handleSearch = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const search = event.target.value.trim();

      if (search) {
        router.push(`/search?q=${encodeURIComponent(search)}`);
      } else {
        router.push("/");
      }
    },
    300,
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1px solid var(--border)",
        background: "var(--panel)",
      }}
    >
      <form
        onSubmit={(event) => event.preventDefault()}
        style={{ margin: 0 }}
      >
        <input
          type="text"
          defaultValue={query ?? ""}
          placeholder="Search"
          onChange={handleSearch}
          aria-label="Search blog posts"
          style={{
            width: "340px",
            height: "44px",
            padding: "0 14px",
            border: "1px solid var(--input-border)",
            borderRadius: "12px",
            background: "var(--input-bg)",
            color: "var(--text)",
            outline: "none",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.08)",
          }}
        />
      </form>

      <ThemeSwitch />
    </div>
  );
}
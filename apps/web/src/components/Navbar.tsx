"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { LogoutButton } from "@/app/logout-button";
import type { CustomerSession } from "@/utils/auth";
import { CartButton } from "./CartButton";

export function Navbar({
  cartCount,
  currentUser,
}: {
  cartCount: number;
  currentUser: CustomerSession | null;
}) {
  const router = useRouter();

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") ?? "").trim();

    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <nav className="flex items-center gap-6">
          <Link className="text-xl font-black tracking-normal text-neutral-950" href="/">
            Threadline
          </Link>
          <Link className="hidden text-sm font-medium text-neutral-600 hover:text-neutral-950 sm:inline" href="/category/jackets">
            Jackets
          </Link>
          <Link className="hidden text-sm font-medium text-neutral-600 hover:text-neutral-950 sm:inline" href="/category/hoodies">
            Hoodies
          </Link>
          <Link className="hidden text-sm font-medium text-neutral-600 hover:text-neutral-950 sm:inline" href="/category/pants">
            Pants
          </Link>
          <Link className="hidden text-sm font-medium text-neutral-600 hover:text-neutral-950 sm:inline" href="/category/accessories">
            Accessories
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <form className="min-w-0 flex-1 sm:w-64" onSubmit={handleSearch}>
            <input
              className="h-10 w-full rounded-full border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white"
              name="q"
              placeholder="Search products"
              type="search"
            />
          </form>
          {currentUser ? (
            <>
              <Link
                className="hidden text-sm font-medium text-neutral-600 hover:text-neutral-950 sm:inline"
                href="/account"
              >
                Account
              </Link>
              <LogoutButton />
            </>
          ) : (
            <div className="hidden items-center gap-3 sm:flex">
              <Link
                className="text-sm font-medium text-neutral-600 hover:text-neutral-950"
                href="/login"
              >
                Login
              </Link>
              <Link
                className="text-sm font-bold text-neutral-950 hover:text-neutral-600"
                href="/register"
              >
                Register
              </Link>
            </div>
          )}
          <CartButton count={cartCount} />
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 border-t border-neutral-200 px-5 py-3 sm:hidden">
        {currentUser ? (
          <>
            <Link
              className="text-sm font-medium text-neutral-600 hover:text-neutral-950"
              href="/account"
            >
              Account
            </Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link
              className="text-sm font-medium text-neutral-600 hover:text-neutral-950"
              href="/login"
            >
              Login
            </Link>
            <Link
              className="text-sm font-bold text-neutral-950 hover:text-neutral-600"
              href="/register"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

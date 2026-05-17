import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "../logout-button";
import { getCurrentUser } from "@/utils/auth";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10 text-neutral-950">
      <section className="mx-auto max-w-3xl rounded-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-normal text-neutral-500">
          Account
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-normal">
          Welcome, {user.name}
        </h1>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-bold text-neutral-500">Email</dt>
            <dd className="mt-1 text-neutral-950">{user.email}</dd>
          </div>
          <div>
            <dt className="font-bold text-neutral-500">Role</dt>
            <dd className="mt-1 text-neutral-950">{user.role}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            className="inline-flex h-10 items-center rounded-full border border-neutral-300 bg-neutral-200 px-5 text-sm font-bold text-neutral-950 transition hover:bg-neutral-300"
            href="/"
          >
            Back to store
          </Link>
          <Link
            className="inline-flex h-10 items-center rounded-full border border-neutral-200 px-5 text-sm font-bold text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
            href="/account/orders"
          >
            View orders
          </Link>
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}

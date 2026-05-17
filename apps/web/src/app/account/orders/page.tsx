import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { getCurrentUser } from "@/utils/auth";

export default async function OrdersPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-950">
      <Navbar cartCount={0} currentUser={currentUser} />

      <main className="mx-auto max-w-4xl px-5 py-10 lg:px-8">
        <section className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-normal text-neutral-500">
            Purchase History
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-normal">
            Your orders
          </h1>

          <div className="mt-8 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
            <h2 className="text-2xl font-black">No saved orders yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
              Completed orders will appear here once backend order storage is
              added in a later iteration. Mock checkout currently confirms the
              purchase on screen and clears the local cart.
            </p>
            <Link
              className="mt-6 inline-flex h-11 items-center rounded-full border border-neutral-300 bg-neutral-200 px-6 text-sm font-bold text-neutral-950 transition hover:bg-neutral-300"
              href="/"
            >
              Browse products
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

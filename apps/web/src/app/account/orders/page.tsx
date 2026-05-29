import { client } from "@repo/db/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { getCurrentUser } from "@/utils/auth";

function formatCurrency(value: unknown) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(Number(value));
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

export default async function OrdersPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const orders = await client.db.order.findMany({
    where: {
      userId: currentUser.id,
    },
    include: {
      items: {
        orderBy: {
          id: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

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

          {orders.length ? (
            <div className="mt-8 grid gap-5">
              {orders.map((order) => (
                <article
                  className="rounded-lg border border-neutral-200 bg-neutral-50 p-5"
                  data-test-id="customer-order"
                  key={order.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 pb-4">
                    <div>
                      <h2 className="text-xl font-black">Order #{order.id}</h2>
                      <p className="mt-1 text-sm text-neutral-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold uppercase tracking-normal text-neutral-500">
                        {order.status}
                      </p>
                      <p className="mt-1 text-lg font-black">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 divide-y divide-neutral-200">
                    {order.items.map((item) => (
                      <div
                        className="grid gap-2 py-4 text-sm sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"
                        key={item.id}
                      >
                        <p className="font-bold text-neutral-950">
                          {item.productName}
                        </p>
                        <p className="text-neutral-600">Qty {item.quantity}</p>
                        <p className="text-neutral-600">
                          {formatCurrency(item.priceAtPurchase)}
                        </p>
                        <p className="font-black">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
              <h2 className="text-2xl font-black">No saved orders yet</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                Completed mock checkout orders will appear here after you place
                an order.
              </p>
              <Link
                className="mt-6 inline-flex h-11 items-center rounded-full border border-neutral-300 bg-neutral-200 px-6 text-sm font-bold text-neutral-950 transition hover:bg-neutral-300"
                href="/"
              >
                Browse products
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

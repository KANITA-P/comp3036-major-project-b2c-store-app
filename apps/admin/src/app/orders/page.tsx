import { client } from "@repo/db/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isLoggedIn } from "../../utils/auth";
import styles from "../page.module.css";
import { ViewStoreLink } from "../view-store-link";

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

export default async function AdminOrdersPage() {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    redirect("/");
  }

  const orders = await client.db.order.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
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
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Purchase Records</p>
          <h1 className={styles.pageTitle}>Customer Orders</h1>
        </div>

        <div className={styles.headerActions}>
          <ViewStoreLink />

          <Link className={styles.secondaryLink} href="/">
            Products
          </Link>
        </div>
      </header>

      <section className={styles.list} aria-label="Customer orders">
        {orders.length ? (
          orders.map((order) => (
            <article
              className={styles.orderCard}
              data-test-id="admin-order-card"
              key={order.id}
            >
              <div className={styles.orderHeader}>
                <div>
                  <h2 className={styles.orderTitle}>Order #{order.id}</h2>
                  <p className={styles.orderMeta}>
                    {order.user.name} · {order.user.email}
                  </p>
                  <p className={styles.orderMeta}>
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className={styles.orderSummary}>
                  <p className={styles.orderStatus}>{order.status}</p>
                  <p className={styles.orderTotal}>
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
              </div>

              <div className={styles.orderItems}>
                {order.items.map((item) => (
                  <div className={styles.orderItem} key={item.id}>
                    <p className={styles.orderItemName}>{item.productName}</p>
                    <p>Qty {item.quantity}</p>
                    <p>{formatCurrency(item.priceAtPurchase)}</p>
                    <p className={styles.orderItemSubtotal}>
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))
        ) : (
          <div className={styles.emptyState}>
            <h2>No customer orders yet</h2>
            <p>Completed mock checkout orders will appear here.</p>
          </div>
        )}
      </section>
    </main>
  );
}

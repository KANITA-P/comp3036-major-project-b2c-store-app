import { CartPageClient } from "./cart-page-client";
import { getCurrentUser } from "@/utils/auth";

export default async function CartPage() {
  const currentUser = await getCurrentUser();

  return <CartPageClient currentUser={currentUser} />;
}

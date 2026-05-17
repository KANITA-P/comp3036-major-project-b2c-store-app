import { OrderConfirmationClient } from "./order-confirmation-client";
import { getCurrentUser } from "@/utils/auth";

export default async function OrderConfirmationPage() {
  const currentUser = await getCurrentUser();

  return <OrderConfirmationClient currentUser={currentUser} />;
}

import { redirect } from "next/navigation";
import { CheckoutClient } from "./checkout-client";
import { getCurrentUser } from "@/utils/auth";

export default async function CheckoutPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return <CheckoutClient currentUser={currentUser} />;
}

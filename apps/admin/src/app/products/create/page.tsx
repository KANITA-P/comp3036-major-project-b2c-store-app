import { redirect } from "next/navigation";
import { isLoggedIn } from "../../../utils/auth";
import { ProductEditor } from "../../product-editor";

export default async function CreateProductPage() {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    redirect("/");
  }

  return (
    <ProductEditor
      eyebrow="New Product"
      heading="Create Product"
      initialProduct={{
        name: "",
        category: "",
        description: "",
        image: "",
        price: 0,
        stock: 0,
      }}
    />
  );
}

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
};

export const categories = ["Jackets", "Hoodies", "Pants", "Accessories"];

export const products: Product[] = [
  {
    id: 1,
    name: "Stormline Shell Jacket",
    description:
      "Size: M. Fit: relaxed shell fit, easy over a hoodie. Condition: Used - Good, light wear on cuffs.",
    price: 189,
    image:
      "https://images.unsplash.com/photo-1721745740020-ed1e8e0d4db8?auto=format&fit=crop&w=1200&q=80",
    stock: 12,
    category: "Jackets",
  },
  {
    id: 2,
    name: "Wool Blend Overshirt",
    description:
      "Size: L. Fit: boxy overshirt, ideal for layering. Condition: Used - Very Good, soft brushed wool blend.",
    price: 149,
    image:
      "https://images.unsplash.com/photo-1517384444713-ec340d75746d?auto=format&fit=crop&w=1200&q=80",
    stock: 9,
    category: "Jackets",
  },
  {
    id: 3,
    name: "Everyday Heavy Hoodie",
    description:
      "Size: M. Fit: slightly oversized with heavyweight fleece. Condition: Used - Good, minor fading from wash.",
    price: 89,
    image:
      "https://images.unsplash.com/photo-1542327534-59a1fe8daf73?auto=format&fit=crop&w=1200&q=80",
    stock: 18,
    category: "Hoodies",
  },
  {
    id: 4,
    name: "Quarter Zip Travel Hoodie",
    description:
      "Size: S. Fit: neat regular fit with stand collar. Condition: Used - Very Good, pockets and zip work well.",
    price: 99,
    image:
      "https://images.unsplash.com/photo-1762232979295-47b301ef9782?auto=format&fit=crop&w=1200&q=80",
    stock: 14,
    category: "Hoodies",
  },
  {
    id: 5,
    name: "Tapered Cargo Pants",
    description:
      "Size: W32 L30. Fit: tapered cargo fit with light stretch. Condition: Used - Good, slight fading on seams.",
    price: 119,
    image:
      "https://images.unsplash.com/photo-1571513392959-b65ff6920b0a?auto=format&fit=crop&w=1200&q=80",
    stock: 11,
    category: "Pants",
  },
  {
    id: 6,
    name: "Wide Leg Utility Trouser",
    description:
      "Size: W30 L31. Fit: wide leg, relaxed through the thigh. Condition: Used - Very Good, crisp drape.",
    price: 129,
    image:
      "https://images.unsplash.com/photo-1767631338127-8cd80ee2f9df?auto=format&fit=crop&w=1200&q=80",
    stock: 7,
    category: "Pants",
  },
  {
    id: 7,
    name: "Rib Knit Beanie",
    description:
      "Size: One size. Fit: stretchy rib knit with fold-over cuff. Condition: Used - Good, clean with light pilling.",
    price: 34,
    image:
      "https://images.unsplash.com/photo-1664289321749-07316ab5e374?auto=format&fit=crop&w=1200&q=80",
    stock: 24,
    category: "Accessories",
  },
  {
    id: 8,
    name: "Canvas Crossbody Bag",
    description:
      "Size: Small crossbody, approx. 24cm x 17cm. Fit: adjustable strap. Condition: Used - Good, light marks on canvas.",
    price: 59,
    image:
      "https://images.unsplash.com/photo-1557597537-dd3365c535a0?auto=format&fit=crop&w=1200&q=80",
    stock: 16,
    category: "Accessories",
  },
];

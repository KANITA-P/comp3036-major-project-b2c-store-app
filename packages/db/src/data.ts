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
    description: "Water-resistant layer with sealed pockets and a relaxed city fit.",
    price: 189,
    image:
      "https://images.unsplash.com/photo-1548883354-94bcfe321cbb?auto=format&fit=crop&w=1200&q=80",
    stock: 12,
    category: "Jackets",
  },
  {
    id: 2,
    name: "Wool Blend Overshirt",
    description: "Warm brushed overshirt cut for layering over tees and knitwear.",
    price: 149,
    image:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80",
    stock: 9,
    category: "Jackets",
  },
  {
    id: 3,
    name: "Everyday Heavy Hoodie",
    description: "Structured cotton fleece hoodie with a soft loopback interior.",
    price: 89,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80",
    stock: 18,
    category: "Hoodies",
  },
  {
    id: 4,
    name: "Quarter Zip Travel Hoodie",
    description: "Compact hoodie with hidden side pockets and a neat stand collar.",
    price: 99,
    image:
      "https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=1200&q=80",
    stock: 14,
    category: "Hoodies",
  },
  {
    id: 5,
    name: "Tapered Cargo Pants",
    description: "Durable twill pants with low-profile cargo storage and stretch.",
    price: 119,
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=80",
    stock: 11,
    category: "Pants",
  },
  {
    id: 6,
    name: "Wide Leg Utility Trouser",
    description: "Clean pleated trouser with a roomy silhouette and crisp drape.",
    price: 129,
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80",
    stock: 7,
    category: "Pants",
  },
  {
    id: 7,
    name: "Rib Knit Beanie",
    description: "Soft recycled yarn beanie with a fold-over cuff and minimal label.",
    price: 34,
    image:
      "https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=1200&q=80",
    stock: 24,
    category: "Accessories",
  },
  {
    id: 8,
    name: "Canvas Crossbody Bag",
    description: "Everyday compact bag with an adjustable strap and secure zip top.",
    price: 59,
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80",
    stock: 16,
    category: "Accessories",
  },
];

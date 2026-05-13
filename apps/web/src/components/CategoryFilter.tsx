import Link from "next/link";

const categories = ["Jackets", "Hoodies", "Pants", "Accessories"];
const basePillClass =
  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors";
const selectedPillClass =
  "border-neutral-300 bg-neutral-200 text-neutral-950 hover:bg-neutral-300 hover:text-neutral-950";
const unselectedPillClass =
  "border-neutral-200 bg-white text-neutral-950 hover:border-neutral-950 hover:bg-neutral-100 hover:text-neutral-950";

function slug(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export function CategoryFilter({ selectedCategory }: { selectedCategory?: string }) {
  const selected = selectedCategory?.toLowerCase();

  return (
    <div className="flex flex-wrap gap-2" aria-label="Product categories">
      <Link
        aria-current={!selected ? "page" : undefined}
        className={`${basePillClass} ${
          !selected ? selectedPillClass : unselectedPillClass
        }`}
        href="/"
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          aria-current={selected === slug(category) ? "page" : undefined}
          className={`${basePillClass} ${
            selected === slug(category)
              ? selectedPillClass
              : unselectedPillClass
          }`}
          href={`/category/${slug(category)}`}
          key={category}
        >
          {category}
        </Link>
      ))}
    </div>
  );
}

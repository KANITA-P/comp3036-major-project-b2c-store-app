import Link from "next/link";

export function SummaryItem({
  name,
  link,
  count,
  isSelected,
  title,
}: {
  name: string;
  link: string;
  count: number;
  isSelected: boolean;
  title?: string;
}) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <Link
        href={link}
        title={title}
        className={isSelected ? "selected" : ""}
        style={{
          display: "flex",
          justifyContent: "space-between",
          textDecoration: "none",
          color: isSelected ? "var(--text)" : "var(--text-secondary)",
          fontWeight: isSelected ? "700" : "500",
          background: isSelected ? "var(--card)" : "transparent",
          padding: "6px 8px",
          borderRadius: "8px",
        }}
      >
        <span>{name}</span>
        <span data-testid="post-count" data-test-id="post-count">
          {count}
        </span>
      </Link>
    </div>
  );
}

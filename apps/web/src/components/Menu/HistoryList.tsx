import Link from "next/link";
import { history } from "@/functions/history";
import { type Post } from "@repo/db/data";
import { LinkList } from "./LinkList";

const months = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function HistoryList({
  selectedYear,
  selectedMonth,
  posts,
}: {
  selectedYear?: string;
  selectedMonth?: string;
  posts: Post[];
}) {
  const historyItems = history(posts);

  return (
    <LinkList title="History">
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {historyItems.map((item) => {
          const isActive =
            selectedYear === String(item.year) &&
            selectedMonth === String(item.month);

          const label = `${months[item.month]}, ${item.year}`;

          return (
            <li
              key={`${item.year}-${item.month}`}
              style={{ marginBottom: "10px" }}
            >
              <Link
                href={`/history/${item.year}/${item.month}`}
                title={`History / ${label}`}
                style={{
                  textDecoration: "none",
                  color: isActive ? "#0f172a" : "#475569",
                  fontWeight: isActive ? "700" : "500",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>{label}</span>
                <span data-testid="post-count" data-test-id="post-count">
                  {item.count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </LinkList>
  );
}

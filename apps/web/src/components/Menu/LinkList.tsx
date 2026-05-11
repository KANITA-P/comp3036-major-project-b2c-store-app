import type { PropsWithChildren } from "react";

export function LinkList({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <section style={{ marginBottom: "28px" }}>
      <h3
        style={{
          marginBottom: "12px",
          fontSize: "14px",
          color: "#94a3b8",
        }}
      >
        {title}
      </h3>

      <div>{children}</div>
    </section>
  );
}
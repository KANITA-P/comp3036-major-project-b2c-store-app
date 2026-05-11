import type { PropsWithChildren } from "react";
import { Content } from "../Content";
import { LeftMenu } from "../Menu/LeftMenu";
import { TopMenu } from "./TopMenu";

export function AppLayout({
  children,
  query,
}: PropsWithChildren<{ query?: string }>) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        minHeight: "100vh",
        background: "var(--background)",
        color: "var(--text)",
      }}
    >
      <div
        style={{
          borderRight: "1px solid var(--border)",
          padding: "20px",
          background: "var(--panel)",
        }}
      >
        <LeftMenu />
      </div>

      <div
        style={{
          background: "var(--background)",
        }}
      >
        <TopMenu query={query} />
        <Content>{children}</Content>
      </div>
    </div>
  );
}
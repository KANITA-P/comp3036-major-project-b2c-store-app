"use client";

import styles from "./page.module.css";

const WEB_URL = (
  process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3001"
).replace(/\/$/, "");

export function ViewStoreLink() {
  return (
    <a className={styles.secondaryLink} href={WEB_URL}>
      View Store
    </a>
  );
}

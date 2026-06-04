"use client";

import styles from "./page.module.css";

export function ViewStoreLink() {
  function clearAdminBrowserStorage() {
    window.localStorage.clear();
    window.sessionStorage.clear();
  }

  return (
    <a
      className={styles.secondaryLink}
      href="/api/storefront-session"
      onClick={clearAdminBrowserStorage}
    >
      View Store
    </a>
  );
}

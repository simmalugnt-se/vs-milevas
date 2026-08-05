import type { ReactNode } from "react";
import styles from "./payload-admin-database-setup-shell.module.css";

/** Minimal document when Payload RootLayout cannot run (empty database). */
export function PayloadAdminDatabaseSetupShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={styles.html}>
      <body className={styles.body}>{children}</body>
    </html>
  );
}

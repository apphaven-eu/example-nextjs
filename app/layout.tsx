import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js Todo | AppHaven",
  description: "A Next.js and PostgreSQL todo example with Server Actions, ready to deploy on AppHaven.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

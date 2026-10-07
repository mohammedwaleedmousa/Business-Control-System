import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Business Control System",
  description: "Internal business management system for Genan Boutique and Flamingo Park.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
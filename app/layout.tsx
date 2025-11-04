import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF Tools - Free Online PDF Editor",
  description: "Free online PDF tools: merge, split, compress, and convert PDFs easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notion | Connected workspace for modern teams",
  description:
    "Bring team knowledge, projects, docs, and AI-assisted workflows into one organized workspace.",

  icons: {
    icon: [
      { url: "notion-svgrepo-com.svg", media: "(prefers-color-scheme: light)" },
      { url: "/notion-svgrepo-com.svg", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DiagLow-Cost | Clinical RAG Assistant",
  description: "Interface mobile-first pour l'assistant RAG DiagLow-Cost.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
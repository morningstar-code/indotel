import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Observatorio de Mejores Prácticas Regulatorias - REGULATEL",
  description: "Observatorio de Mejores Prácticas Regulatorias REGULATEL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}




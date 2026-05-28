import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yachay Investigador",
  description: "Asistente metodológico para Seminario de Investigación I"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

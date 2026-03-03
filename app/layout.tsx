import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SoulLink Tracker",
  description: "Live SoulLink tracker for Pokémon FireRed",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}

import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SoulLink Tracker",
  description: "Live SoulLink tracker for Pokémon FireRed",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-[#120b08] text-zinc-100">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* Fullscreen fill layer */}
          <div
            className="absolute inset-0 bg-cover bg-center blur-sm scale-110 opacity-45"
            style={{
              backgroundImage: "url('/backgrounds/pokemon-landscape.jpg')",
            }}
          />

          {/* Visible framed artwork */}
          <div
            className="absolute inset-0 bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/backgrounds/pokemon-landscape.jpg')",
            }}
          />

          {/* Readability overlay */}
          <div className="absolute inset-0 bg-black/34" />

          {/* Warm center glow */}
          <div className="absolute inset-0 [background:radial-gradient(circle_at_center,rgba(255,215,120,0.12),transparent_34%)]" />

          {/* Soft vignette */}
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,rgba(0,0,0,0)_45%,rgba(0,0,0,0.16)_72%,rgba(0,0,0,0.34)_100%)]" />

          {/* Slight texture */}
          <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22228%22 height=%22228%22 viewBox=%220 0 228 228%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22228%22 height=%22228%22 filter=%22url(%23n)%22 opacity=%220.18%22/></svg>')]" />
        </div>

        <div className="relative min-h-screen max-w-[1200px] mx-auto px-6">
      </body>
    </html>
  );
}

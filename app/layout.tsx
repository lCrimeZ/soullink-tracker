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
      <body className="min-h-screen text-zinc-100 bg-[#120b08]">
        {/* Background */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* Main framed artwork */}
          <div
            className="
              absolute inset-0
              bg-center bg-no-repeat
              bg-[length:min(1200px,90vw)]
              md:bg-[length:auto_100svh]
            "
            style={{
              backgroundImage: "url('/backgrounds/pokemon-landscape.jpg')",
            }}
          />

          {/* Soft dark overlay for readability */}
          <div className="absolute inset-0 bg-black/38" />

          {/* Gentle vignette */}
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.18)_58%,rgba(0,0,0,0.42)_100%)]" />

          {/* Warm gold ambient glow */}
          <div className="absolute inset-0 [background:radial-gradient(circle_at_top,rgba(212,175,55,0.10),transparent_32%)]" />

          {/* Slight texture / atmosphere */}
          <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22228%22 height=%22228%22 viewBox=%220 0 228 228%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22228%22 height=%22228%22 filter=%22url(%23n)%22 opacity=%220.18%22/></svg>')]" />
        </div>

        {/* Content */}
        <div className="relative min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}

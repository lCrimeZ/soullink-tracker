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
          {/* Layer 1: fills the whole screen */}
          <div
            className="absolute inset-0 bg-center bg-cover scale-110 blur-sm opacity-55"
            style={{
              backgroundImage: "url('/backgrounds/pokemon-landscape.jpg')",
            }}
          />

          {/* Layer 2: full framed artwork stays visible */}
          <div
            className="absolute inset-0 bg-center bg-no-repeat bg-contain"
            style={{
              backgroundImage: "url('/backgrounds/pokemon-landscape.jpg')",
            }}
          />

          {/* readability */}
          <div className="absolute inset-0 bg-black/36" />

          {/* focus more on the center */}
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,rgba(255,220,120,0.10),transparent_36%)]" />
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,rgba(0,0,0,0)_48%,rgba(0,0,0,0.18)_72%,rgba(0,0,0,0.34)_100%)]" />

          {/* subtle side darkening */}
          <div className="absolute inset-y-0 left-0 w-[14vw] bg-gradient-to-r from-black/30 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-[14vw] bg-gradient-to-l from-black/30 to-transparent" />

          {/* light texture */}
          <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22228%22 height=%22228%22 viewBox=%220 0 228 228%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22228%22 height=%22228%22 filter=%22url(%23n)%22 opacity=%220.18%22/></svg>')]" />
        </div>

        {/* Content */}
        <div className="relative min-h-screen">{children}</div>
      </body>
    </html>
  );
}

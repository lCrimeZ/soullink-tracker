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
        <div className="fixed inset-0 -z-0 overflow-hidden">
          {/* Main framed artwork */}
          <div
            className="
              absolute inset-0
              bg-center bg-no-repeat
              bg-[length:min(1800px,100vw)]
              lg:bg-[length:min(2000px,100vw)]
              2xl:bg-[length:min(2200px,100vw)]
            "
            style={{
              backgroundImage: "url('/backgrounds/pokemon-landscape.jpg')",
            }}
          />

          {/* Slight scale glow duplicate */}
          <div
            className="
              absolute inset-0
              bg-center bg-no-repeat
              opacity-35 blur-2xl scale-[1.04]
            "
            style={{
              backgroundImage: "url('/backgrounds/pokemon-landscape.jpg')",
              backgroundSize: "min(1400px,95vw)",
            }}
          />

          {/* Soft readability overlay */}
          <div className="absolute inset-0 bg-black/42" />

          {/* Gentle vignette */}
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.12)_52%,rgba(0,0,0,0.38)_100%)]" />

          {/* Warm Ho-Oh glow */}
          <div className="absolute inset-0 [background:radial-gradient(circle_at_center,rgba(255,210,90,0.10),transparent_34%)]" />

          {/* Side darkening */}
          <div className="absolute inset-y-0 left-0 w-[18vw] bg-gradient-to-r from-black/35 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-[18vw] bg-gradient-to-l from-black/35 to-transparent" />

          {/* Slight texture */}
          <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22228%22 height=%22228%22 viewBox=%220 0 228 228%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22228%22 height=%22228%22 filter=%22url(%23n)%22 opacity=%220.18%22/></svg>')]" />
        </div>

        {/* Ho-Oh Sun Flash */}
        <div className="hooh-sun-flash" />

        {/* Ho-Oh Trail */}
        <div className="hooh-trail" />

        {/* Ho-Oh Fly Animation */}
        <div className="hooh-flight">
          <img src="/hooh.png" alt="Ho-Oh" className="hooh-bird" />
        </div>

        {/* Content */}
        <div className="relative min-h-screen">
          <div className="hooh-aura" />

          <div className="content-stage">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

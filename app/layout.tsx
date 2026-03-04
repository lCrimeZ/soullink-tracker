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
      <body
        className="min-h-screen text-zinc-100"
        style={{
          backgroundImage: "url('/backgrounds/pokemon-landscape.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Hintergrund-Layer */}
        <div className="fixed inset-0 -z-10">
          {/* dunkler Overlay + Blur => Lesbarkeit */}
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />

          {/* Pokémon Glow (Blau/Rot) */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-red-500/20" />

          {/* Vignette (Rand abdunkeln => Fokus auf Cards) */}
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.55)_70%,rgba(0,0,0,0.8)_100%)]" />

          {/* leichter Filmgrain Look (super subtil) */}
          <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none [background-image:url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22120%22%20height=%22120%22%3E%3Cfilter%20id=%22n%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.8%22%20numOctaves=%224%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22120%22%20height=%22120%22%20filter=%22url(%23n)%22%20opacity=%220.6%22/%3E%3C/svg%3E')]" />
        </div>
       
        {/* Content Wrapper (nice spacing) */}
        <div className="relative min-h-screen">
          {/* optional: top glow line */}
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/5 to-transparent" />

          {children}
        </div>
      </body>
    </html>
  );
}

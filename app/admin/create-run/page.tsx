"use client";

import { useState } from "react";

export default function CreateRunPage() {
  const [slug, setSlug] = useState("feuerrot-soullink");
  const [title, setTitle] = useState("Feuerrot SoulLink");
  const [p1, setP1] = useState("Spieler 1");
  const [p2, setP2] = useState("Spieler 2");
  const [msg, setMsg] = useState("");

  async function create() {
    setMsg("Erstelle Run…");
    const res = await fetch("/api/admin/create-firered-run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, title, player1: p1, player2: p2 }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(`Fehler: ${data.error ?? "unknown"}`);
    setMsg(`✅ Fertig! Öffne: /run/${data.slug}`);
  }

  return (
    <div className="min-h-screen p-6 text-zinc-100">
      <div className="max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h1 className="text-xl font-semibold">Create FireRed Run (Seeded)</h1>
        <p className="text-sm text-zinc-300 mt-1">
          Erstellt Run + 2 Spieler + Level Caps + Routen + leere Encounters.
        </p>

        <div className="mt-4 grid gap-3">
          <input
            className="rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="slug (a-z0-9-)"
          />
          <input
            className="rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titel"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3"
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              placeholder="Spieler 1"
            />
            <input
              className="rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3"
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              placeholder="Spieler 2"
            />
          </div>

          <button
            onClick={create}
            className="rounded-xl bg-emerald-500/90 hover:bg-emerald-500 px-4 py-3 font-semibold"
          >
            Run erstellen
          </button>
          {msg ? <div className="text-sm text-zinc-200">{msg}</div> : null}
        </div>
      </div>
    </div>
  );
}

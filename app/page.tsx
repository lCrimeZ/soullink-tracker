export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h1 className="text-2xl font-semibold">SoulLink Tracker</h1>
        <p className="text-zinc-300 mt-2">
          Öffne <span className="font-mono">/admin</span> zum Einloggen und danach{" "}
          <span className="font-mono">/admin/create-run</span> um euren Feuerrot-Run zu erstellen.
        </p>
        <p className="text-zinc-400 text-sm mt-4">
          Public read-only: <span className="font-mono">/run/&lt;slug&gt;</span>
        </p>
      </div>
    </div>
  );
}

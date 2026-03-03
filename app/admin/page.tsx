"use client";

import { useActionState } from "react";
import { adminLogin } from "./actions";

export default function AdminPage() {
  const [state, formAction] = useActionState(adminLogin, { ok: false as boolean, error: "" });

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 shadow">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <p className="text-sm text-zinc-300 mt-1">Zum Bearbeiten brauchst du das Admin-Passwort.</p>

        <form action={formAction} className="mt-4 space-y-3">
          <input
            name="password"
            type="password"
            placeholder="Admin Passwort"
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 outline-none"
          />
          {state?.error ? <div className="text-red-300 text-sm">{state.error}</div> : null}
          <button className="w-full rounded-xl bg-emerald-500/90 hover:bg-emerald-500 px-4 py-3 font-semibold">
            Einloggen
          </button>
        </form>

        {state?.ok ? (
          <div className="text-emerald-300 text-sm mt-3">
            Eingeloggt! Weiter: <span className="font-mono">/admin/create-run</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

import { supabaseServerAnon } from "@/lib/supabase-server-anon";

export async function loadRunBySlug(slug: string) {
  const sb = supabaseServerAnon();

  const { data: run, error: rErr } = await sb.from("runs").select("*").eq("slug", slug).single();
  if (rErr || !run) throw new Error(rErr?.message ?? "Run not found");

  const [playersRes, capsRes, routesRes, encRes] = await Promise.all([
    sb.from("players").select("*").eq("run_id", run.id).order("idx"),
    sb.from("level_caps").select("*").eq("run_id", run.id).order("sort"),
    sb.from("routes").select("*").eq("run_id", run.id).order("sort"),
    sb.from("encounters").select("*").eq("run_id", run.id),
  ]);

  if (playersRes.error) throw new Error(playersRes.error.message);
  if (capsRes.error) throw new Error(capsRes.error.message);
  if (routesRes.error) throw new Error(routesRes.error.message);
  if (encRes.error) throw new Error(encRes.error.message);

  return {
    run,
    players: playersRes.data!,
    caps: capsRes.data!,
    routes: routesRes.data!,
    encounters: encRes.data!,
  };
}

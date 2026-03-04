"use client";

import { useState } from "react";
import { RoutesTable } from "@/components/RoutesTable";
import EditEncounterModal from "@/components/EditEncounterModal";
import { Encounter, Player, Route, Cap, Run } from "@/lib/types";

export default function RunClient({
  initial,
  isAdmin,
}: {
  initial: { routes: Route[]; players: Player[]; encounters: Encounter[]; run: Run; caps: Cap[] };
  isAdmin: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<{ e: Encounter; r: Route; p: Player } | null>(null);

  function refresh() {
    window.location.reload();
  }

  return (
    <>
      <RoutesTable
        routes={initial.routes}
        players={initial.players}
        encounters={initial.encounters}
        isAdmin={isAdmin}
        onEdit={(e, r, p) => {
          if (!isAdmin) return;
          setSelected({ e, r, p });
          setModalOpen(true);
        }}
      />
      <EditEncounterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        encounter={selected?.e ?? null}
        route={selected?.r ?? null}
        player={selected?.p ?? null}
        onSaved={refresh}
      />
    </>
  );
}

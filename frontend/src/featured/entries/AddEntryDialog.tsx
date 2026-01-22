import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { getEntries } from "@/api/entries";
import { addEntryToPerson } from "@/api/personEntries";

type Props = {
  personId: string;
  existingPairs: Array<{ entryId: string; role: string | null | undefined }>;
  disabled?: boolean;
};


export function AddEntryDialog({ personId, existingPairs, disabled }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [role, setRole] = useState("autor");

  useMemo(() => {
    const t = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  const entriesQuery = useQuery({
    queryKey: ["entries", debouncedQ],
    queryFn: () => getEntries(debouncedQ),
    enabled: open,
  });

  const addMut = useMutation({
    mutationFn: (entryId: string) => addEntryToPerson(personId, entryId, role),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["personread", personId] });
      setOpen(false);
      setQ("");
      setDebouncedQ("");
      setRole("autor");
    },
  });

  const existing = new Set(
    existingPairs.map(p => `${p.entryId}::${(p.role ?? "").trim()}`)
  );

  const roleKey = (role ?? "").trim();
  const filtered = (entriesQuery.data ?? []).filter(e => !existing.has(`${e.id}::${roleKey}`));


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled}>
          Add entry
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>Add entry</DialogTitle>
          <DialogDescription className="sr-only">
            Vyhledej entry a kliknutím ji přiřaď osobě s rolí.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Role (např. autor, subjekt, svědek...)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

          <Input
            placeholder="Hledej entry (q)..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          {entriesQuery.isLoading && <div className="text-sm">Načítám…</div>}
          {entriesQuery.isError && (
            <div className="text-sm text-red-600">Chyba při načítání entries.</div>
          )}

          {entriesQuery.data && (
            <div className="max-h-72 overflow-auto space-y-2">
              {filtered.map((e) => (
                <Button
                  key={e.id}
                  variant="outline"
                  className="w-full justify-start"
                  disabled={addMut.isPending}
                  onClick={() => addMut.mutate(e.id)}
                >
                  <span className="mr-2 text-muted-foreground">{e.type}</span>
                  {e.title}
                </Button>
              ))}

              {filtered.length === 0 && (
                <div className="text-sm text-muted-foreground">Nic nenalezeno</div>
              )}
            </div>
          )}

          {addMut.isError && (
            <div className="text-sm text-red-600">Nepodařilo se přidat entry.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

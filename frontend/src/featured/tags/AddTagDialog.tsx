import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { listTags } from "@/api/tags";
import { addTagToPerson } from "@/api/personTags";
import { DialogDescription } from "@/components/ui/dialog";

type Props = {
  personId: string;
  existingTagIds: string[];
  disabled?: boolean;
};

type Tag = {
  id: string;
  name: string;
};


export function AddTagDialog({ personId, existingTagIds, disabled }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useMemo(() => {
    const t = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  const tagsQuery = useQuery({
    queryKey: ["tags", debouncedQ],
    queryFn: () => listTags(),
    enabled: open, // hledáme jen když je dialog otevřený
  });

  const addMut = useMutation({
    mutationFn: (tagId: string) => addTagToPerson(personId, tagId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["personread", personId] });
      setOpen(false);
      setQ("");
      setDebouncedQ("");
    },
  });

  const existing = new Set(existingTagIds);
  const filtered = (tagsQuery.data ?? []).filter((t: Tag) => !existing.has(t.id));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled}>Add tag</Button>
      </DialogTrigger>

      <DialogContent className="bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>Add tag</DialogTitle>
          <DialogDescription className="sr-only">
            Vyhledej tag a kliknutím ho přiřaď osobě.
          </DialogDescription>
        </DialogHeader>


        <div className="space-y-3">
          <Input
            placeholder="Hledej tag (q)..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          {tagsQuery.isLoading && <div className="text-sm">Načítám…</div>}
          {tagsQuery.isError && (
            <div className="text-sm text-red-600">Chyba při načítání tagů.</div>
          )}

          {tagsQuery.data && (
            <div className="max-h-72 overflow-auto space-y-2">
              {tagsQuery.data && (
                <div className="max-h-72 overflow-auto space-y-2">
                  {filtered.map((t: Tag) => (
                    <Button
                      key={t.id}
                      variant="outline"
                      className="w-full justify-start"
                      disabled={addMut.isPending}
                      onClick={() => addMut.mutate(t.id)}
                    >
                      {t.name}
                    </Button>
              ))}
                  {filtered.length === 0 && (
                    <div className="text-sm text-muted-foreground">Nic nenalezeno</div>
                  )}
                </div>
              )}

              {tagsQuery.data.length === 0 && (
                <div className="text-sm text-muted-foreground">Nic nenalezeno</div>
              )}
            </div>
          )}

          {addMut.isError && (
            <div className="text-sm text-red-600">
              Nepodařilo se přidat tag.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

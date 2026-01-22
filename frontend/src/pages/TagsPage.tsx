import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { createTag, deleteTag, listTags, updateTag } from "@/api/tags";

export function TagsPage() {
  const qc = useQueryClient();

  const [filter, setFilter] = useState("");
  const [debounced, setDebounced] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useMemo(() => {
    const t = setTimeout(() => setDebounced(filter), 250);
    return () => clearTimeout(t);
  }, [filter]);

  const tagsQ = useQuery({
    queryKey: ["tags"],
    queryFn: () => listTags(),
  });

  const createMut = useMutation({
    mutationFn: () => createTag(newName),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tags"] });
      setCreateOpen(false);
      setNewName("");
    },
  });

  const updateMut = useMutation({
    mutationFn: () => updateTag(editId!, editName),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tags"] });
      setEditId(null);
      setEditName("");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  const filtered =
    tagsQ.data?.filter((t) =>
      t.name.toLowerCase().includes(debounced.trim().toLowerCase())
    ) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Tags</h1>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>New tag</Button>
          </DialogTrigger>
          <DialogContent className="bg-background text-foreground">
            <DialogHeader>
              <DialogTitle>Create tag</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <Input
                placeholder="Tag name…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />

              <Button
                disabled={!newName.trim() || createMut.isPending}
                onClick={() => createMut.mutate()}
              >
                Create
              </Button>

              {createMut.isError && (
                <div className="text-sm text-red-600">
                  Nepodařilo se vytvořit tag (možná už existuje).
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Search</CardTitle>
          <Input
            placeholder="filtr…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </CardHeader>

        <CardContent className="space-y-2">
          {tagsQ.isLoading && <div className="text-sm">Načítám…</div>}
          {tagsQ.isError && (
            <div className="text-sm text-red-600">Chyba při načítání.</div>
          )}

          {!tagsQ.isLoading &&
            filtered.map((t) => {
              const isEditing = editId === t.id;
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 border-b py-2 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      <div className="font-medium truncate">{t.name}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          disabled={!editName.trim() || updateMut.isPending}
                          onClick={() => updateMut.mutate()}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditId(null);
                            setEditName("");
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditId(t.id);
                            setEditName(t.name);
                          }}
                        >
                          Rename
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={deleteMut.isPending}
                          onClick={() => deleteMut.mutate(t.id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

          {tagsQ.data && filtered.length === 0 && (
            <div className="text-sm text-muted-foreground">Nic nenalezeno</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

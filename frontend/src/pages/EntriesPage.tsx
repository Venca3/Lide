import { useMemo, useState } from "react";
import type { PagedResult, EntryDto } from "@/api/entries";
import { Link } from "react-router-dom";
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
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { createEntry, deleteEntry, listEntriesPaged } from "@/api/entries";

export function EntriesPage() {
  const qc = useQueryClient();

  const [filter, setFilter] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(0);
  const size = 20;

  const [createOpen, setCreateOpen] = useState(false);
  const [type, setType] = useState("MEMORY");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [occurredAt, setOccurredAt] = useState(""); // ISO nebo prázdné

  useMemo(() => {
    const t = setTimeout(() => setDebounced(filter), 250);
    return () => clearTimeout(t);
  }, [filter]);

  // reset page to 0 when debounced filter changes
  useMemo(() => {
    setPage(0);
  }, [debounced]);

  const q = useQuery({
    queryKey: ["entries", debounced, page, size],
    queryFn: () => listEntriesPaged(debounced, page, size),
  });

  const createMut = useMutation({
    mutationFn: () =>
      createEntry({
        type,
        title: title.trim() ? title.trim() : null,
        content,
        occurredAt: occurredAt.trim() ? occurredAt.trim() : null,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entries"] });
      setCreateOpen(false);
      setType("MEMORY");
      setTitle("");
      setContent("");
      setOccurredAt("");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteEntry(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entries"] });
    },
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; label: string } | null>(null);

  function performConfirm() {
    if (!confirmTarget) return;
    deleteMut.mutate(confirmTarget.id);
    setConfirmOpen(false);
    setConfirmTarget(null);
  }

  const data = q.data as PagedResult<EntryDto> | undefined;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const filtered = items;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Entries</h1>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>New entry</Button>
          </DialogTrigger>

          <DialogContent className="bg-background text-foreground">
            <DialogHeader>
              <DialogTitle>Create entry</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="type (např. MEMORY)" />
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="title (optional)" />
              <Input
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                placeholder="occurredAt ISO (optional) např. 1989-08-11T16:30:00Z"
              />
              <textarea
                className="min-h-28 w-full rounded-md border bg-transparent p-3 text-sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="content…"
              />

              <Button disabled={!type.trim() || !content.trim() || createMut.isPending} onClick={() => createMut.mutate()}>
                Create
              </Button>

              {createMut.isError && (
                <div className="text-sm text-red-600">Nepodařilo se vytvořit entry.</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Search</CardTitle>
          <Input placeholder="filtr…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </CardHeader>

        <CardContent className="space-y-2">
          {q.isLoading && <div className="text-sm">Načítám…</div>}
          {q.isError && <div className="text-sm text-red-600">Chyba při načítání.</div>}

          {filtered.map((e: EntryDto) => (
            <div key={e.id} className="flex items-center justify-between gap-3 border-b py-2 last:border-b-0">
              <div className="min-w-0">
                <Link to={`/entries/${e.id}`} className="font-medium hover:underline">
                  {e.title || "(no title)"}
                </Link>
                <div className="text-xs text-muted-foreground">
                  {e.type}
                  {e.occurredAt ? ` • ${e.occurredAt}` : ""}
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                disabled={deleteMut.isPending}
                onClick={() => {
                  setConfirmTarget({ id: e.id, label: e.title || "(no title)" });
                  setConfirmOpen(true);
                }}
              >
                Delete
              </Button>
            </div>
          ))}

          {q.data && filtered.length === 0 && (
            <div className="text-sm text-muted-foreground">Nic nenalezeno</div>
          )}
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Smazat entry</DialogTitle>
                <DialogDescription>
                  Opravdu chcete smazat entry '{confirmTarget?.label}'?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
                  Zrušit
                </Button>
                <Button onClick={() => performConfirm()} disabled={deleteMut.isPending}>
                  Smazat
                </Button>
              </DialogFooter>
              <DialogClose />
            </DialogContent>
          </Dialog>

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-muted-foreground">Celkem: {total}</div>
            <div className="flex items-center gap-2">
              <Button size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                Prev
              </Button>
              <div className="text-sm">Stránka {page + 1}</div>
              <Button size="sm" disabled={(page + 1) * size >= total} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

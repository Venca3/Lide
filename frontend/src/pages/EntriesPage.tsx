import { useMemo, useState } from "react";
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
} from "@/components/ui/dialog";

import { createEntry, deleteEntry, listEntries } from "@/api/entries";

export function EntriesPage() {
  const qc = useQueryClient();

  const [filter, setFilter] = useState("");
  const [debounced, setDebounced] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [type, setType] = useState("MEMORY");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [occurredAt, setOccurredAt] = useState(""); // ISO nebo prázdné

  useMemo(() => {
    const t = setTimeout(() => setDebounced(filter), 250);
    return () => clearTimeout(t);
  }, [filter]);

  const q = useQuery({
    queryKey: ["entries"],
    queryFn: () => listEntries(),
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

  const filtered =
    q.data?.filter((e) => {
      const s = debounced.trim().toLowerCase();
      if (!s) return true;
      return (
        e.type.toLowerCase().includes(s) ||
        (e.title ?? "").toLowerCase().includes(s) ||
        (e.content ?? "").toLowerCase().includes(s)
      );
    }) ?? [];

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

          {filtered.map((e) => (
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
                onClick={() => deleteMut.mutate(e.id)}
              >
                Delete
              </Button>
            </div>
          ))}

          {q.data && filtered.length === 0 && (
            <div className="text-sm text-muted-foreground">Nic nenalezeno</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

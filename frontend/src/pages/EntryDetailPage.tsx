import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { deleteEntry, getEntry, updateEntry } from "@/api/entries";

export function EntryDetailPage() {
  const { id } = useParams();
  const entryId = id ?? "";
  const nav = useNavigate();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["entry", entryId],
    queryFn: () => getEntry(entryId),
    enabled: !!entryId,
  });

  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [occurredAt, setOccurredAt] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (q.data) {
      setType(q.data.type ?? "");
      setTitle(q.data.title ?? "");
      setOccurredAt(q.data.occurredAt ?? "");
      setContent(q.data.content ?? "");
    }
  }, [q.data]);

  const saveMut = useMutation({
    mutationFn: () =>
      updateEntry(entryId, {
        type: type.trim() || null,
        title: title.trim() ? title.trim() : null,
        occurredAt: occurredAt.trim() ? occurredAt.trim() : null,
        content: content,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entry", entryId] });
      await qc.invalidateQueries({ queryKey: ["entries"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteEntry(entryId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entries"] });
      nav("/entries");
    },
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  function performDelete() {
    deleteMut.mutate();
    setConfirmOpen(false);
  }

  if (!entryId) return <div>Chybí ID v URL.</div>;
  if (q.isLoading) return <div>Načítám…</div>;
  if (q.isError) return <div className="text-red-600">Chyba při načítání.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{q.data!.title || "(no title)"}</h1>
          <div className="text-sm text-muted-foreground font-mono">{q.data!.id}</div>
        </div>

        <Button variant="outline" asChild>
          <Link to="/entries">Zpět</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="type" />
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="title" />
          <Input value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} placeholder="occurredAt (ISO)" />
          <textarea
            className="min-h-40 w-full rounded-md border bg-transparent p-3 text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="content…"
          />

          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={saveMut.isPending} onClick={() => saveMut.mutate()}>
              Save
            </Button>

            <Button variant="outline" disabled={deleteMut.isPending} onClick={() => setConfirmOpen(true)}>
              Delete
            </Button>
          </div>

          {saveMut.isError && <div className="text-sm text-red-600">Nepodařilo se uložit.</div>}
          {deleteMut.isError && <div className="text-sm text-red-600">Nepodařilo se smazat.</div>}
        </CardContent>
      </Card>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Smazat entry</DialogTitle>
            <DialogDescription>Opravdu chcete smazat entry '{q.data?.title ?? "(no title)"}'?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Zrušit
            </Button>
            <Button onClick={() => performDelete()} disabled={deleteMut.isPending}>
              Smazat
            </Button>
          </DialogFooter>
          <DialogClose />
        </DialogContent>
      </Dialog>
    </div>
  );
}

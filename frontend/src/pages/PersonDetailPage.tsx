import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { getPersonRead } from "@/api/personRead";
import { removeTagFromPerson } from "@/api/personTags";
import { updatePerson } from "@/api/persons";
import { PersonForm, type PersonFormValue } from "@/featured/persons/PersonForm";
import { AddTagDialog } from "@/featured/tags/AddTagDialog";

import { removeEntryFromPerson } from "@/api/personEntries";
import { AddEntryDialog } from "@/featured/entries/AddEntryDialog";


function displayName(p: {
  nickname?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}) {
  return (
    p.nickname ||
    [p.firstName, p.lastName].filter(Boolean).join(" ") ||
    "Person"
  );
}

export function PersonDetailPage() {
  const { id } = useParams();
  const personId = id ?? "";

  const qc = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [formValue, setFormValue] = useState<PersonFormValue>({
    firstName: "",
    lastName: "",
    nickname: "",
    birthDate: "",
    phone: "",
    email: "",
    note: "",
  });

  const q = useQuery({
    queryKey: ["personread", personId],
    queryFn: () => getPersonRead(personId),
    enabled: !!personId,
  });

  const removeTagMut = useMutation({
    mutationFn: (tagId: string) => removeTagFromPerson(personId, tagId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["personread", personId] });
    },
  });

  const removeEntryMut = useMutation({
    mutationFn: (x: { entryId: string; role: string | null | undefined }) =>
      removeEntryFromPerson(personId, x.entryId, x.role),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["personread", personId] });
    },
  });

  const updateMut = useMutation({
    mutationFn: () =>
      updatePerson(personId, {
        firstName: formValue.firstName.trim() || null,
        lastName: formValue.lastName.trim() || null,
        nickname: formValue.nickname.trim() || null,
        birthDate: formValue.birthDate.trim() || null,
        phone: formValue.phone.trim() || null,
        email: formValue.email.trim() || null,
        note: formValue.note.trim() || null,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["personread", personId] });
      setEditMode(false);
    },
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<
    | { type: "tag"; id: string; label: string }
    | { type: "entry"; id: string; label: string; role?: string | null }
    | null
  >(null);

  function performConfirm() {
    if (!confirmTarget) return;
    if (confirmTarget.type === "tag") {
      removeTagMut.mutate(confirmTarget.id);
    } else {
      removeEntryMut.mutate({ entryId: confirmTarget.id, role: confirmTarget.role });
    }
    setConfirmOpen(false);
    setConfirmTarget(null);
  }
  
  useEffect(() => {
    const person = q.data;
    if (!person) return;
    setFormValue({
      firstName: person.firstName ?? "",
      lastName: person.lastName ?? "",
      nickname: person.nickname ?? "",
      birthDate: person.birthDate ?? "",
      phone: person.phone ?? "",
      email: person.email ?? "",
      note: person.note ?? "",
    });
  }, [q.data]);

  if (!personId) return <div>Chybí ID v URL.</div>;
  if (q.isLoading) return <div>Načítám detail…</div>;
  if (q.isError) return <div className="text-red-600">Chyba při načítání detailu.</div>;

  const p = q.data!;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{displayName(p)}</h1>
          <div className="text-sm text-muted-foreground font-mono">{p.id}</div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/persons">Zpět</Link>
          </Button>

          {!editMode ? (
            <Button onClick={() => setEditMode(true)}>Edit</Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button disabled={updateMut.isPending} onClick={() => updateMut.mutate()}>
                Save
              </Button>
              <Button variant="ghost" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* TAGS - jediná sekce */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Tags</CardTitle>
          <AddTagDialog personId={personId} existingTagIds={p.tags.map(t => t.id)} disabled={q.isLoading} />

        </CardHeader>

        <CardContent className="flex flex-wrap gap-2">
          {p.tags.length === 0 && (
            <div className="text-sm text-muted-foreground">Žádné tagy</div>
          )}

          {p.tags.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
            >
              {t.name}
              <button
                className="opacity-70 hover:opacity-100"
                title="Remove"
                onClick={() => {
                  setConfirmTarget({ type: "tag", id: t.id, label: t.name });
                  setConfirmOpen(true);
                }}
                disabled={removeTagMut.isPending}
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
          {removeTagMut.isError ? <div className="text-sm text-red-600">Nepodařilo se odebrat tag.</div> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Entries</CardTitle>
          <AddEntryDialog
            personId={personId}
            existingPairs={p.entries.map(e => ({ entryId: e.id, role: e.role }))}
            disabled={q.isLoading}
          />
        </CardHeader>

        <CardContent className="space-y-2 text-sm">
          {p.entries.length === 0 && (
            <div className="text-muted-foreground">Žádné entries</div>
          )}

          {p.entries.map((e, idx) => (
            <div key={`${e.id}::${e.role ?? ""}::${idx}`} className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium truncate">{e.title}</div>
                <div className="text-muted-foreground">
                  {e.type}
                  {e.role ? ` • role: ${e.role}` : ""}
                  {e.occurredAt ? ` • ${e.occurredAt}` : ""}
                </div>
                {e.content ? <div className="mt-1 whitespace-pre-wrap">{e.content}</div> : null}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={removeEntryMut.isPending}
                  onClick={() => {
                    setConfirmTarget({ type: "entry", id: e.id, label: e.title, role: e.role });
                    setConfirmOpen(true);
                  }}
                >
                  Remove
                </Button>


                <div className="font-mono text-xs text-muted-foreground">
                  {e.id.slice(0, 8)}…
                </div>
              </div>
            </div>
          ))}
          {removeEntryMut.isError ? <div className="text-sm text-red-600">Nepodařilo se odebrat entry.</div> : null}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Relations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-2">
            <div className="font-medium">Outgoing</div>
            {p.relationsOut.length === 0 && (
              <div className="text-muted-foreground">Žádné</div>
            )}
            {p.relationsOut.map((r) => (
              <div key={r.id} className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">
                    {r.type} → {r.otherPersonDisplayName ?? r.toPersonId}
                  </div>
                  <div className="text-muted-foreground">
                    {r.validFrom ?? "?"}
                    {r.validTo ? ` – ${r.validTo}` : ""}
                    {r.note ? ` • ${r.note}` : ""}
                  </div>
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  {r.id.slice(0, 8)}…
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="font-medium">Incoming</div>
            {p.relationsIn.length === 0 && (
              <div className="text-muted-foreground">Žádné</div>
            )}
            {p.relationsIn.map((r) => (
              <div key={r.id} className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">
                    {r.type} ← {r.otherPersonDisplayName ?? r.fromPersonId}
                  </div>
                  <div className="text-muted-foreground">
                    {r.validFrom ?? "?"}
                    {r.validTo ? ` – ${r.validTo}` : ""}
                    {r.note ? ` • ${r.note}` : ""}
                  </div>
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  {r.id.slice(0, 8)}…
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Inline edit form */}
      {editMode ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit</CardTitle>
          </CardHeader>
          <CardContent>
            <PersonForm
              value={formValue}
              onChange={setFormValue}
              onSubmit={() => updateMut.mutate()}
              submitLabel={updateMut.isPending ? "Saving…" : "Save"}
              disabled={updateMut.isPending}
              errorText={updateMut.isError ? "Nepodařilo se uložit." : null}
            />
          </CardContent>
        </Card>
      ) : null}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Smazat položku</DialogTitle>
            <DialogDescription>
              {confirmTarget?.type === "tag"
                ? `Opravdu odebrat tag '${confirmTarget.label}'?`
                : confirmTarget?.type === "entry"
                ? `Opravdu odebrat entry '${confirmTarget.label}'?`
                : "Opravdu provést akci?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Zrušit
            </Button>
            <Button
              onClick={() => performConfirm()}
              disabled={removeTagMut.isPending || removeEntryMut.isPending}
            >
              Smazat
            </Button>
          </DialogFooter>
          <DialogClose />
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";

import { getPersonRead } from "@/api/personRead";
import { removeTagFromPerson } from "@/api/personTags";
import { updatePerson, deletePerson } from "@/api/persons";
import { PersonForm, type PersonFormValue } from "@/featured/persons/PersonForm";
import { DetailPageLayout } from "@/components/layout/DetailPageLayout";
import { RelationshipCard } from "@/components/layout/RelationshipCard";
import { TagItem } from "@/components/layout/TagItem";
import { removeEntryFromPerson } from "@/api/personEntries";
import { listTags } from "@/api/tags";
import { listEntries } from "../api/entries";
import { addTagToPerson } from "@/api/personTags";
import { addEntryToPerson } from "@/api/personEntries";
import { AddRelationshipDialog } from "@/components/layout/AddRelationshipDialog";
import { getPersonDisplayName } from "@/lib/person";


export function PersonDetailPage() {
  const { id } = useParams();
  const personId = id ?? "";
  const nav = useNavigate();

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

  const deleteMut = useMutation({
    mutationFn: () => deletePerson(personId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["persons"] });
      nav("/persons");
    },
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
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

  if (!personId) return <div>Missing ID in URL.</div>;

  const p = q.data;

  // View content - základní informace o osobě
  const viewContent = p ? (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <div className="text-sm text-muted-foreground">First name</div>
          <div>{p.firstName || "-"}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Last name</div>
          <div>{p.lastName || "-"}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Nickname</div>
          <div>{p.nickname || "-"}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Birth date</div>
          <div>{p.birthDate || "-"}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Phone</div>
          <div>{p.phone || "-"}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Email</div>
          <div>{p.email || "-"}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Note</div>
          <div className="whitespace-pre-wrap">{p.note || "-"}</div>
        </div>
      </CardContent>
    </Card>
  ) : null;

  // Edit content - formulář pro editaci
  const editContent = (
    <Card>
      <CardHeader>
        <CardTitle>Edit person</CardTitle>
      </CardHeader>
      <CardContent>
        <PersonForm
          value={formValue}
          onChange={setFormValue}
          onSubmit={() => updateMut.mutate()}
          submitLabel={updateMut.isPending ? "Saving…" : "Save"}
          disabled={updateMut.isPending}
          errorText={updateMut.isError ? "Failed to save." : null}
        />
      </CardContent>
    </Card>
  );

  // Relationship content - tagy, entries, relations
  const relationshipContent = p ? (
    <>
      <RelationshipCard
        title="Tags"
        action={
          <AddRelationshipDialog<{ id: string; name: string; color?: string }>
            personId={personId}
            title="Add Tag"
            buttonLabel="Add Tag"
            placeholder="Search tags…"
            queryKey={["tags"]}
            queryFn={listTags}
            filterFn={(tag, q) => tag.name.toLowerCase().includes(q.toLowerCase())}
            labelFn={(tag) => tag.name}
            getItemId={(tag) => tag.id}
            isItemFiltered={(tag, existingSet) => existingSet.has(tag.id)}
            onAddFn={(tagId) => addTagToPerson(personId, tagId)}
            existing={p.tags.map(t => t.id)}
            disabled={q.isLoading}
          />
        }
        isEmpty={p.tags.length === 0}
        emptyMessage="No tags"
        error={removeTagMut.isError ? "Failed to remove tag." : undefined}
      >
        <div className="flex flex-wrap gap-2">
          {p.tags.map((t) => (
            <TagItem
              key={t.id}
              label={t.name}
              onRemove={() => {
                setConfirmTarget({ type: "tag", id: t.id, label: t.name });
                setConfirmOpen(true);
              }}
              disabled={removeTagMut.isPending}
            />
          ))}
        </div>
      </RelationshipCard>

      <RelationshipCard
        title="Entries"
        action={
          <AddRelationshipDialog<{ id: string; type: string; title: string | null; content: string | null }>
            personId={personId}
            title="Add Entry"
            buttonLabel="Add Entry"
            placeholder="Search entries…"
            extraField={{
              label: "Role",
              placeholder: "Role (e.g., author, subject, witness…)",
              defaultValue: "autor",
            }}
            queryKey={["entries"]}
            queryFn={listEntries}
            filterFn={(entry, q) => {
              const lowerQ = q.toLowerCase();
              return (
                entry.type.toLowerCase().includes(lowerQ) ||
                (entry.title ?? "").toLowerCase().includes(lowerQ) ||
                (entry.content ?? "").toLowerCase().includes(lowerQ)
              );
            }}
            labelFn={(entry) => (
              <>
                <span className="mr-2 text-muted-foreground">{entry.type}</span>
                {entry.title}
              </>
            )}
            getItemId={(entry) => entry.id}
            isItemFiltered={(entry, existingSet, role) => {
              const roleKey = (role ?? "").trim();
              return existingSet.has(`${entry.id}::${roleKey}`);
            }}
            onAddFn={(entryId, role) => addEntryToPerson(personId, entryId, role ?? "autor")}
            existing={p.entries.map(e => `${e.id}::${(e.role ?? "").trim()}`)}
            disabled={q.isLoading}
          />
        }
        isEmpty={p.entries.length === 0}
        emptyMessage="No entries"
        error={removeEntryMut.isError ? "Failed to remove entry." : undefined}
      >
        <div className="space-y-2 text-sm">
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
        </div>
      </RelationshipCard>

      <RelationshipCard
        title="Relations"
        action={<Button size="sm" disabled>Add relation</Button>}
        isEmpty={false}
      >
        <div className="space-y-4 text-sm">
          <div className="space-y-2">
            <div className="font-medium">Outgoing</div>
            {p.relationsOut.length === 0 && (
              <div className="text-muted-foreground">None</div>
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
              <div className="text-muted-foreground">None</div>
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
        </div>
      </RelationshipCard>
    </>
  ) : null;

  return (
    <>
      <DetailPageLayout
        isLoading={q.isLoading}
        isError={q.isError}
        errorMessage="This person may have been deleted or is no longer available."
        title={getPersonDisplayName(p || {})}
        subtitle={p?.id}
        backLink="/persons"
        backLabel="Back"
        isEditing={editMode}
        onEditChange={setEditMode}
        onSave={() => updateMut.mutate()}
        isSavePending={updateMut.isPending}
        saveError={updateMut.isError ? "Failed to save." : undefined}
        viewContent={viewContent}
        editContent={editContent}
        relationshipContent={relationshipContent}
        onDelete={() => deleteMut.mutate()}
        isDeletingPending={deleteMut.isPending}
        deleteConfirmOpen={deleteConfirmOpen}
        onDeleteConfirmOpenChange={setDeleteConfirmOpen}
        deleteConfirmTitle="Delete person"
        deleteConfirmDescription={<>Are you sure you want to delete person '{getPersonDisplayName(p || {})}'? This action cannot be undone.</>}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remove item"
        description={
          confirmTarget?.type === "tag"
            ? `Remove tag '${confirmTarget.label}'?`
            : confirmTarget?.type === "entry"
            ? `Remove entry '${confirmTarget.label}'?`
            : "Are you sure?"
        }
        confirmLabel="Remove"
        confirmVariant="destructive"
        isConfirming={removeTagMut.isPending || removeEntryMut.isPending}
        onConfirm={() => performConfirm()}
      />
    </>
  );
}

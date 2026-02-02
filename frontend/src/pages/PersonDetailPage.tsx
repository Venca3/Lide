import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getPersonRead } from "@/api/personRead";
import { removeTagFromPerson } from "@/api/personTags";
import { updatePerson, deletePerson } from "@/api/persons";
import { PersonForm, type PersonFormValue } from "@/featured/persons/PersonForm";
import { DetailPageLayout } from "@/components/layout/DetailPageLayout";
import { RelationshipCard } from "@/components/layout/RelationshipCard";
import { TagItem } from "@/components/layout/TagItem";
import { removeEntryFromPerson, addEntryToPerson, updateEntryRole } from "@/api/personEntries";
import { listTags } from "@/api/tags";
import { listEntries } from "../api/entries";
import { addTagToPerson } from "@/api/personTags";
import { getPersonDisplayName } from "@/lib/person";
import { createPersonRelation, deletePersonRelation, updatePersonRelation } from "@/api/personRelation";
import { AddPersonRelationDialog } from "@/components/layout/AddPersonRelationDialog";
import { formatDate, formatDateTime } from "@/lib/dateFormat";
import { type EditField } from "@/components/layout/EditDialog";
import { normalizeString } from "@/lib/stringNormalize";


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

  const removeRelationMut = useMutation({
    mutationFn: (relationId: string) => deletePersonRelation(relationId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["personread", personId] });
    },
  });

  const updateRelationMut = useMutation({
    mutationFn: ({ relationId, data }: { relationId: string; data: { type: string; validFrom: string | null; validTo: string | null; note: string | null } }) =>
      updatePersonRelation(relationId, data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["personread", personId] });
    },
  });

  const updateEntryRoleMut = useMutation({
    mutationFn: ({ entryId, oldRole, newRole }: { entryId: string; oldRole: string | null; newRole: string }) =>
      updateEntryRole(personId, entryId, oldRole ?? "autor", newRole),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["personread", personId] });
    },
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tagConfirmOpen, setTagConfirmOpen] = useState(false);
  const [entryConfirmOpen, setEntryConfirmOpen] = useState(false);
  const [relationConfirmOpen, setRelationConfirmOpen] = useState(false);
  const [tagConfirmTarget, setTagConfirmTarget] = useState<{ id: string; label: string } | null>(null);
  const [entryConfirmTarget, setEntryConfirmTarget] = useState<{ id: string; label: string; role?: string | null } | null>(null);
  const [relationConfirmTarget, setRelationConfirmTarget] = useState<{ id: string; label: string } | null>(null);
  
  const [editRelationOpen, setEditRelationOpen] = useState(false);
  const [editRelationTarget, setEditRelationTarget] = useState<{ id: string; type: string; validFrom: string | null; validTo: string | null; note: string | null } | null>(null);
  const [editRelationValues, setEditRelationValues] = useState({ type: "", validFrom: "", validTo: "", note: "" });
  
  const [editEntryRoleOpen, setEditEntryRoleOpen] = useState(false);
  const [editEntryRoleTarget, setEditEntryRoleTarget] = useState<{ id: string; title: string; oldRole: string | null } | null>(null);
  const [editEntryRoleValues, setEditEntryRoleValues] = useState({ role: "" });
  
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
    <>
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
        <div>{formatDate(p.birthDate) || "-"}</div>
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
    </>
  ) : null;

  // Edit content - formulář pro editaci
  const editContent = (
    <PersonForm
      value={formValue}
      onChange={setFormValue}
      onSubmit={() => updateMut.mutate()}
      submitLabel={updateMut.isPending ? "Saving…" : "Save"}
      disabled={updateMut.isPending}
      errorText={updateMut.isError ? "Failed to save." : null}
    />
  );

  // Relationship content - tagy, entries, relations
  const relationshipContent = p ? (
    <div className="space-y-4 mt-4">
      <RelationshipCard
        title="Tags"
        resource={{ singular: "Tag", plural: "Tags" }}
        addDialogProps={{
          invalidateQueryKey: ["personread", personId],
          queryKey: ["tags"],
          queryFn: listTags,
          filterFn: (tag, q) => tag.name.toLowerCase().includes(q.toLowerCase()),
          labelFn: (tag) => tag.name,
          getItemId: (tag) => tag.id,
          isItemFiltered: (tag, existingSet) => existingSet.has(tag.id),
          onAddFn: (tagId) => addTagToPerson(personId, tagId),
          existing: p.tags.map(t => t.id),
          disabled: q.isLoading,
        }}
        isEmpty={p.tags.length === 0}
        error={removeTagMut.isError ? "Failed to remove tag." : undefined}
        confirm={{
          open: tagConfirmOpen,
          onOpenChange: setTagConfirmOpen,
          title: "Remove tag",
          description: tagConfirmTarget
            ? `Remove tag '${tagConfirmTarget.label}'?`
            : "Remove this tag?",
          isConfirming: removeTagMut.isPending,
          onConfirm: () => {
            if (!tagConfirmTarget) return;
            removeTagMut.mutate(tagConfirmTarget.id);
            setTagConfirmTarget(null);
            setTagConfirmOpen(false);
          },
        }}
      >
        <div className="flex flex-wrap gap-2">
          {p.tags.map((t) => (
            <TagItem
              key={t.id}
              label={t.name}
              onRemove={() => {
                setTagConfirmTarget({ id: t.id, label: t.name });
                setTagConfirmOpen(true);
              }}
              disabled={removeTagMut.isPending}
            />
          ))}
        </div>
      </RelationshipCard>

      <RelationshipCard
        title="Entries"
        resource={{ singular: "Entry", plural: "Entries" }}
        addDialogProps={{
          invalidateQueryKey: ["personread", personId],
          extraField: {
            label: "Role",
            placeholder: "Role (e.g., author, subject, witness…)",
            defaultValue: "autor",
          },
          queryKey: ["entries"],
          queryFn: listEntries,
          filterFn: (entry, q) => {
            const lowerQ = q.toLowerCase();
            return (
              entry.type.toLowerCase().includes(lowerQ) ||
              (entry.title ?? "").toLowerCase().includes(lowerQ) ||
              (entry.content ?? "").toLowerCase().includes(lowerQ)
            );
          },
          labelFn: (entry) => (
            <>
              <span className="mr-2 text-muted-foreground">{entry.type}</span>
              {entry.title}
            </>
          ),
          getItemId: (entry) => entry.id,
          isItemFiltered: (entry, existingSet, role) => {
            const roleKey = (role ?? "").trim();
            return existingSet.has(`${entry.id}::${roleKey}`);
          },
          onAddFn: (entryId, role) => addEntryToPerson(personId, entryId, role ?? "autor"),
          existing: p.entries.map(e => `${e.id}::${(e.role ?? "").trim()}`),
          disabled: q.isLoading,
        }}
        isEmpty={p.entries.length === 0}
        error={removeEntryMut.isError ? "Failed to remove entry." : undefined}
        confirm={{
          open: entryConfirmOpen,
          onOpenChange: setEntryConfirmOpen,
          title: "Remove entry",
          description: entryConfirmTarget
            ? `Remove entry '${entryConfirmTarget.label}'?`
            : "Remove this entry?",
          isConfirming: removeEntryMut.isPending,
          onConfirm: () => {
            if (!entryConfirmTarget) return;
            removeEntryMut.mutate({ entryId: entryConfirmTarget.id, role: entryConfirmTarget.role });
            setEntryConfirmTarget(null);
            setEntryConfirmOpen(false);
          },
        }}
        items={p.entries}
        renderItem={(e) => (
          <>
            <div className="font-medium truncate">{e.title}</div>
            <div className="text-muted-foreground">
              {e.type}
              {e.role ? ` • role: ${e.role}` : ""}
              {e.occurredAt ? ` • ${formatDateTime(e.occurredAt)}` : ""}
            </div>
            {e.content ? <div className="mt-1 whitespace-pre-wrap">{e.content}</div> : null}
            <div className="font-mono text-xs text-muted-foreground">
              {e.id.slice(0, 8)}…
            </div>
          </>
        )}
        onEditItem={(e) => {
          setEditEntryRoleTarget({ id: e.id, title: e.title, oldRole: e.role ?? null });
          setEditEntryRoleValues({ role: e.role || "" });
          setEditEntryRoleOpen(true);
        }}
        onRemoveItem={(e) => {
          setEntryConfirmTarget({ id: e.id, label: e.title, role: e.role });
          setEntryConfirmOpen(true);
        }}
        editItemDisabled={() => updateEntryRoleMut.isPending || removeEntryMut.isPending}
        removeItemDisabled={() => removeEntryMut.isPending}
        editDialog={
          editEntryRoleOpen && editEntryRoleTarget
            ? {
                open: editEntryRoleOpen,
                onOpenChange: (open) => {
                  setEditEntryRoleOpen(open);
                  if (!open) setEditEntryRoleTarget(null);
                },
                title: "Edit Entry Role",
                description: `Update the role for "${editEntryRoleTarget.title}"`,
                fields: [
                  { name: "role", label: "Role", placeholder: "e.g., author, subject, witness...", required: true },
                ] as EditField[],
                values: editEntryRoleValues,
                onValuesChange: (field, value) => setEditEntryRoleValues({ ...editEntryRoleValues, [field]: value }),
                onSave: () => {
                  const normalizedRole = normalizeString(editEntryRoleValues.role);
                  if (!normalizedRole) return;
                  updateEntryRoleMut.mutate({
                    entryId: editEntryRoleTarget.id,
                    oldRole: editEntryRoleTarget.oldRole,
                    newRole: normalizedRole,
                  });
                  setEditEntryRoleOpen(false);
                  setEditEntryRoleTarget(null);
                },
                isPending: updateEntryRoleMut.isPending,
                isValid: !!normalizeString(editEntryRoleValues.role),
                errorMessage: updateEntryRoleMut.isError ? "Failed to update role." : undefined,
              }
            : undefined
        }
      />

      {(() => {
        const relationCardProps = {
          error: removeRelationMut.isError ? "Failed to remove relation." : undefined,
          editItemDisabled: () => updateRelationMut.isPending || removeRelationMut.isPending,
          removeItemDisabled: () => removeRelationMut.isPending,
          onEditItem: (r: any) => {
            setEditRelationTarget({
              id: r.id,
              type: r.type,
              validFrom: r.validFrom ?? null,
              validTo: r.validTo ?? null,
              note: r.note ?? null,
            });
            setEditRelationValues({ type: r.type, validFrom: r.validFrom || "", validTo: r.validTo || "", note: r.note || "" });
            setEditRelationOpen(true);
          },
          onRemoveItem: (r: any) => {
            setRelationConfirmTarget({ id: r.id, label: r.label });
            setRelationConfirmOpen(true);
          },
          confirm: {
            open: relationConfirmOpen,
            onOpenChange: setRelationConfirmOpen,
            title: "Remove relation",
            description: relationConfirmTarget
              ? `Remove relation '${relationConfirmTarget.label}'?`
              : "Remove this relation?",
            isConfirming: removeRelationMut.isPending,
            onConfirm: () => {
              if (!relationConfirmTarget) return;
              removeRelationMut.mutate(relationConfirmTarget.id);
              setRelationConfirmTarget(null);
              setRelationConfirmOpen(false);
            },
          },
          editDialog:
            editRelationOpen && editRelationTarget
              ? {
                  open: editRelationOpen,
                  onOpenChange: (open: boolean) => {
                    setEditRelationOpen(open);
                    if (!open) setEditRelationTarget(null);
                  },
                  title: "Edit Relation",
                  description: "Update the relationship details.",
                  fields: [
                    { name: "type", label: "Relation Type", placeholder: "e.g., parent, child, spouse, sibling...", required: true },
                    { name: "validFrom", label: "Valid From", type: "date" },
                    { name: "validTo", label: "Valid To", type: "date" },
                    { name: "note", label: "Note", placeholder: "Optional note" },
                  ] as EditField[],
                  values: editRelationValues,
                  onValuesChange: (field: string, value: string) => setEditRelationValues({ ...editRelationValues, [field]: value }),
                  onSave: () => {
                    const normalizedType = normalizeString(editRelationValues.type);
                    if (!normalizedType) return;
                    updateRelationMut.mutate({
                      relationId: editRelationTarget.id,
                      data: {
                        type: normalizedType,
                        validFrom: editRelationValues.validFrom.trim() || null,
                        validTo: editRelationValues.validTo.trim() || null,
                        note: editRelationValues.note ? normalizeString(editRelationValues.note) : null,
                      },
                    });
                    setEditRelationOpen(false);
                    setEditRelationTarget(null);
                  },
                  isPending: updateRelationMut.isPending,
                  isValid: !!normalizeString(editRelationValues.type),
                  errorMessage: updateRelationMut.isError ? "Failed to update relation." : undefined,
                }
              : undefined,
        };

        return (
          <>
            <RelationshipCard
              title="Relations (Outgoing)"
              action={
                <AddPersonRelationDialog
                  buttonLabel="Add relation"
                  currentPersonId={personId}
                  onAdd={async (toPersonId, type, validFrom, validTo, note) => {
                    await createPersonRelation({
                      fromPersonId: personId,
                      toPersonId,
                      type,
                      validFrom,
                      validTo,
                      note,
                    });
                    await qc.invalidateQueries({ queryKey: ["personread", personId] });
                  }}
                  isPending={false}
                  errorMessage={undefined}
                />
              }
              items={p.relationsOut}
              renderItem={(r) => (
                <>
                  <div className="font-medium">
                    {r.type} → {r.otherPersonDisplayName ?? r.toPersonId}
                  </div>
                  <div className="text-muted-foreground">
                    {formatDate(r.validFrom) ?? "?"}
                    {r.validTo ? ` – ${formatDate(r.validTo)}` : ""}
                    {r.note ? ` • ${r.note}` : ""}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {r.id.slice(0, 8)}…
                  </div>
                </>
              )}
              isEmpty={p.relationsOut.length === 0}
              {...relationCardProps}
              onRemoveItem={(r) => {
                setRelationConfirmTarget({ id: r.id, label: `${r.type} → ${r.otherPersonDisplayName ?? r.toPersonId}` });
                setRelationConfirmOpen(true);
              }}
            />

            <RelationshipCard
              title="Relations (Incoming)"
              action={
                <AddPersonRelationDialog
                  buttonLabel="Add relation"
                  currentPersonId={personId}
                  onAdd={async (toPersonId, type, validFrom, validTo, note) => {
                    await createPersonRelation({
                      fromPersonId: toPersonId,
                      toPersonId: personId,
                      type,
                      validFrom,
                      validTo,
                      note,
                    });
                    await qc.invalidateQueries({ queryKey: ["personread", personId] });
                  }}
                  isPending={false}
                  errorMessage={undefined}
                />
              }
              items={p.relationsIn}
              renderItem={(r) => (
                <>
                  <div className="font-medium">
                    {r.type} ← {r.otherPersonDisplayName ?? r.fromPersonId}
                  </div>
                  <div className="text-muted-foreground">
                    {formatDate(r.validFrom) ?? "?"}
                    {r.validTo ? ` – ${formatDate(r.validTo)}` : ""}
                    {r.note ? ` • ${r.note}` : ""}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {r.id.slice(0, 8)}…
                  </div>
                </>
              )}
              isEmpty={p.relationsIn.length === 0}
              {...relationCardProps}
              onRemoveItem={(r) => {
                setRelationConfirmTarget({ id: r.id, label: `${r.type} ← ${r.otherPersonDisplayName ?? r.fromPersonId}` });
                setRelationConfirmOpen(true);
              }}
            />
          </>
        );
      })()}

    </div>
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
        viewCard
        editCard
        editTitle="Edit person"
        relationshipContent={relationshipContent}
        onDelete={() => deleteMut.mutate()}
        isDeletingPending={deleteMut.isPending}
        deleteConfirmOpen={deleteConfirmOpen}
        onDeleteConfirmOpenChange={setDeleteConfirmOpen}
        deleteConfirmTitle="Delete person"
        deleteConfirmDescription={<>Are you sure you want to delete person '{getPersonDisplayName(p || {})}'? This action cannot be undone.</>}
      />

    </>
  );
}

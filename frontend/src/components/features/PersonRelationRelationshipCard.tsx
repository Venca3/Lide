import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getPersonRead } from "@/api/personRead";
import { listPersonsPaged } from "@/api/persons";
import { createPersonRelation, deletePersonRelation, updatePersonRelation } from "@/api/personRelation";
import { RelationshipCard_new } from "../layout/RelationshipCard_new";
import SearchSelect from "@/components/ui/SearchSelect";
import { Input } from "@/components/ui/input";
import { ENTITIES } from "@/lib/constants";
import { formatDate } from "@/lib/dateFormat";
import { getPersonDisplayName } from "@/lib/person";
import { normalizeString } from "@/lib/stringNormalize";

interface Props {
  personId: string;
  direction: "in" | "out";
}

export function PersonRelationRelationshipCard({ personId, direction }: Props) {
  const qc = useQueryClient();

  const personQ = useQuery({
    queryKey: ["personread", personId],
    queryFn: () => getPersonRead(personId),
  });

  const personsQ = useQuery({
    queryKey: ["persons-all"],
    queryFn: () => listPersonsPaged("", 0, 1000),
  });

  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [addType, setAddType] = useState("");
  const [addValidFrom, setAddValidFrom] = useState("");
  const [addValidTo, setAddValidTo] = useState("");
  const [addNote, setAddNote] = useState("");
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [addError, setAddError] = useState("");

  const [editingRelation, setEditingRelation] = useState<any>(null);
  const [editType, setEditType] = useState("");
  const [editValidFrom, setEditValidFrom] = useState("");
  const [editValidTo, setEditValidTo] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editError, setEditError] = useState("");

  const addMut = useMutation({
    mutationFn: (x: { toPersonId: string; type: string; validFrom: string; validTo: string; note: string }) => {
      const fromId = direction === "out" ? personId : x.toPersonId;
      const toId = direction === "out" ? x.toPersonId : personId;
      return createPersonRelation({
        fromPersonId: fromId,
        toPersonId: toId,
        type: x.type,
        validFrom: x.validFrom || null,
        validTo: x.validTo || null,
        note: x.note || null,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["personread", personId] });
      setSelectedPersonId("");
      setAddType("");
      setAddValidFrom("");
      setAddValidTo("");
      setAddNote("");
      setSearchResetKey((s) => s + 1);
      setAddError("");
    },
  });

  const updateMut = useMutation({
    mutationFn: (x: { relationId: string; type: string; validFrom: string; validTo: string; note: string }) =>
      updatePersonRelation(x.relationId, {
        type: x.type,
        validFrom: x.validFrom || null,
        validTo: x.validTo || null,
        note: x.note || null,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["personread", personId] });
      setEditingRelation(null);
      setEditError("");
    },
  });

  const removeMut = useMutation({
    mutationFn: (relationId: string) => deletePersonRelation(relationId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["personread", personId] });
    },
  });

  const items = direction === "out" ? personQ.data?.relationsOut || [] : personQ.data?.relationsIn || [];

  const handleAddSave = (): boolean => {
    if (!selectedPersonId) {
      setAddError("Please select a person.");
      return false;
    }
    const normalizedType = normalizeString(addType);
    if (!normalizedType) {
      setAddError("Relation type is required.");
      return false;
    }
    addMut.mutate({
      toPersonId: selectedPersonId,
      type: normalizedType,
      validFrom: addValidFrom.trim(),
      validTo: addValidTo.trim(),
      note: addNote.trim(),
    });
    return true;
  };

  const handleAddCancel = () => {
    setSelectedPersonId("");
    setAddType("");
    setAddValidFrom("");
    setAddValidTo("");
    setAddNote("");
    setSearchResetKey((s) => s + 1);
    setAddError("");
  };

  const handleEditSave = (): boolean => {
    const normalizedType = normalizeString(editType);
    if (!normalizedType) {
      setEditError("Relation type is required.");
      return false;
    }
    if (editingRelation) {
      updateMut.mutate({
        relationId: editingRelation.id,
        type: normalizedType,
        validFrom: editValidFrom.trim(),
        validTo: editValidTo.trim(),
        note: editNote.trim(),
      });
      return true;
    }
    return false;
  };

  const addContent = (
    <div className="space-y-4">
      <SearchSelect
        items={personsQ.data?.items || []}
        loading={personsQ.isLoading}
        existingIds={new Set([personId])} // Don't link to self
        getItemId={(p: any) => p.id}
        getItemLabel={(p: any) => getPersonDisplayName(p)}
        filterFn={(p: any, q: string) => getPersonDisplayName(p).toLowerCase().includes(q.toLowerCase())}
        resource={ENTITIES.PERSON}
        selectedId={selectedPersonId}
        onSelect={(id) => {
          setSelectedPersonId(id);
          setAddError("");
        }}
        resetKey={searchResetKey}
      />
      <div>
        <label className="text-sm font-medium">Relation Type</label>
        <Input
          value={addType}
          onChange={(e) => setAddType(e.target.value)}
          placeholder="e.g., parent, child, spouse..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Valid From</label>
          <Input type="date" value={addValidFrom} onChange={(e) => setAddValidFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Valid To</label>
          <Input type="date" value={addValidTo} onChange={(e) => setAddValidTo(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Note</label>
        <Input
          value={addNote}
          onChange={(e) => setAddNote(e.target.value)}
          placeholder="Optional note"
        />
      </div>
      {addError && <div className="text-sm text-red-600">{addError}</div>}
    </div>
  );

  const editContent = editingRelation ? (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Relation Type</label>
        <Input
          value={editType}
          onChange={(e) => setEditType(e.target.value)}
          placeholder="Relation Type"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Valid From</label>
          <Input type="date" value={editValidFrom} onChange={(e) => setEditValidFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Valid To</label>
          <Input type="date" value={editValidTo} onChange={(e) => setEditValidTo(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Note</label>
        <Input
          value={editNote}
          onChange={(e) => setEditNote(e.target.value)}
          placeholder="Optional note"
        />
      </div>
      {editError && <div className="text-sm text-red-600">{editError}</div>}
    </div>
  ) : null;

  const title = direction === "out" ? "Relations (Outgoing)" : "Relations (Incoming)";

  return (
    <RelationshipCard_new
      title={title}
      resource={{ ...ENTITIES.PERSON, plural: title }}
      isEmpty={items.length === 0}
      items={items}
      renderItem={(r: any) => (
        <>
          <div className="font-medium">
            {direction === "out"
              ? `${r.type} → ${r.otherPersonDisplayName ?? r.toPersonId}`
              : `${r.type} ← ${r.otherPersonDisplayName ?? r.fromPersonId}`}
          </div>
          <div className="text-muted-foreground">
            {formatDate(r.validFrom) ?? "?"}
            {r.validTo ? ` – ${formatDate(r.validTo)}` : ""}
            {r.note ? ` • ${r.note}` : ""}
          </div>
        </>
      )}
      displayName={(r: any) =>
        direction === "out"
          ? `${r.type} → ${r.otherPersonDisplayName ?? r.toPersonId}`
          : `${r.type} ← ${r.otherPersonDisplayName ?? r.fromPersonId}`
      }
      onAdd={() => setAddError("")}
      onEdit={(r: any) => {
        setEditingRelation(r);
        setEditType(r.type || "");
        setEditValidFrom(r.validFrom || "");
        setEditValidTo(r.validTo || "");
        setEditNote(r.note || "");
        setEditError("");
      }}
      onRemove={(r: any) => removeMut.mutate(r.id)}
      onAddSave={handleAddSave}
      onAddCancel={handleAddCancel}
      onSave={handleEditSave}
      onCancel={() => {
        setEditingRelation(null);
        setEditError("");
      }}
      addContent={addContent}
      editContent={editContent}
      isSaving={addMut.isPending || updateMut.isPending}
    />
  );
}

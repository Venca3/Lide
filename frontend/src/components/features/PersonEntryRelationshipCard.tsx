import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getPersonRead } from "@/api/personRead";
import { listEntries } from "@/api/entries";
import { addEntryToPerson, removeEntryFromPerson, updateEntryRole } from "@/api/personEntries";
import { RelationshipCard_new } from "../layout/RelationshipCard_new";
import SearchSelect from "@/components/ui/SearchSelect";
import { Input } from "@/components/ui/input";
import { ENTITIES } from "@/lib/constants";
import { formatDateTime } from "@/lib/dateFormat";
import { normalizeString } from "@/lib/stringNormalize";

interface Props {
  personId: string;
}

export function PersonEntryRelationshipCard({ personId }: Props) {
  const qc = useQueryClient();

  const personQ = useQuery({
    queryKey: ["personread", personId],
    queryFn: () => getPersonRead(personId),
  });

  const entriesQ = useQuery({
    queryKey: ["entries"],
    queryFn: listEntries,
  });

  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [addRole, setAddRole] = useState("autor");
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [addError, setAddError] = useState("");

  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [editRole, setEditRole] = useState("");
  const [editError, setEditError] = useState("");

  const addMut = useMutation({
    mutationFn: (x: { entryId: string; role: string }) => addEntryToPerson(personId, x.entryId, x.role),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["personread", personId] });
      setSelectedEntryId("");
      setAddRole("autor");
      setSearchResetKey((s) => s + 1);
      setAddError("");
    },
  });

  const updateMut = useMutation({
    mutationFn: (x: { entryId: string; oldRole: string; newRole: string }) =>
      updateEntryRole(personId, x.entryId, x.oldRole, x.newRole),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["personread", personId] });
      setEditingEntry(null);
      setEditRole("");
      setEditError("");
    },
  });

  const removeMut = useMutation({
    mutationFn: (x: { entryId: string; role: string | null | undefined }) =>
      removeEntryFromPerson(personId, x.entryId, x.role),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["personread", personId] });
    },
  });

  const items = personQ.data?.entries || [];
  // Allow adding the same entry with a different role, so we don't strictly block existingIds
  const existingIds = new Set<string>();

  const handleAddSave = (): boolean => {
    if (!selectedEntryId) {
      setAddError("Please select an entry.");
      return false;
    }
    const normalizedRole = normalizeString(addRole);
    if (!normalizedRole) {
      setAddError("Role is required.");
      return false;
    }
    addMut.mutate({ entryId: selectedEntryId, role: normalizedRole });
    return true;
  };

  const handleAddCancel = () => {
    setSelectedEntryId("");
    setAddRole("autor");
    setSearchResetKey((s) => s + 1);
    setAddError("");
  };

  const handleEditSave = (): boolean => {
    const normalizedRole = normalizeString(editRole);
    if (!normalizedRole) {
      setEditError("Role is required.");
      return false;
    }
    if (editingEntry) {
      if (editingEntry.role === normalizedRole) {
        setEditingEntry(null);
        return true;
      }
      updateMut.mutate({
        entryId: editingEntry.id,
        oldRole: editingEntry.role || "autor",
        newRole: normalizedRole,
      });
      return true;
    }
    return false;
  };

  const addContent = (
    <div className="space-y-4">
      <SearchSelect
        items={entriesQ.data || []}
        loading={entriesQ.isLoading}
        existingIds={existingIds}
        getItemId={(e: any) => e.id}
        getItemLabel={(e: any) => e.title || e.content}
        filterFn={(e: any, q: string) =>
          (e.title || e.content || "").toLowerCase().includes(q.toLowerCase()) ||
          e.type.toLowerCase().includes(q.toLowerCase())
        }
        resource={ENTITIES.ENTRY}
        selectedId={selectedEntryId}
        onSelect={(id) => {
          setSelectedEntryId(id);
          setAddError("");
        }}
        renderSecondary={(e: any) => e.type}
        resetKey={searchResetKey}
      />
      <div>
        <label className="text-sm font-medium">Role</label>
        <Input
          value={addRole}
          onChange={(e) => setAddRole(e.target.value)}
          placeholder="e.g., autor, subject..."
        />
      </div>
      {addError && <div className="text-sm text-red-600">{addError}</div>}
    </div>
  );

  const editContent = editingEntry ? (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Role</label>
        <Input
          value={editRole}
          onChange={(e) => setEditRole(e.target.value)}
          placeholder="Role"
        />
      </div>
      {editError && <div className="text-sm text-red-600">{editError}</div>}
    </div>
  ) : null;

  return (
    <RelationshipCard_new
      resource={ENTITIES.ENTRY}
      isEmpty={items.length === 0}
      items={items}
      renderItem={(e: any) => (
        <>
          <div className="font-medium truncate">{e.title || e.content}</div>
          <div className="text-muted-foreground">
            {e.type}
            {e.role ? ` • role: ${e.role}` : ""}
            {e.occurredAt ? ` • ${formatDateTime(e.occurredAt)}` : ""}
          </div>
        </>
      )}
      displayName={(e: any) => e.title || e.content}
      onAdd={() => setAddError("")}
      onEdit={(e: any) => {
        setEditingEntry(e);
        setEditRole(e.role || "");
        setEditError("");
      }}
      onRemove={(e: any) => removeMut.mutate({ entryId: e.id, role: e.role })}
      onAddSave={handleAddSave}
      onAddCancel={handleAddCancel}
      onSave={handleEditSave}
      onCancel={() => {
        setEditingEntry(null);
        setEditRole("");
        setEditError("");
      }}
      addContent={addContent}
      editContent={editContent}
      isSaving={addMut.isPending || updateMut.isPending}
    />
  );
}

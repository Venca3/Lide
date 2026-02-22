import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { removeEntryFromPerson, updateEntryRole, addEntryToPerson } from "@/api/personEntries";
import { listPersons } from "@/api/persons";
import type { EntryDetailView } from "@/api/entryRead";
import { RelationshipCard_new } from "../layout/RelationshipCard_new";
import { Input } from "@/components/ui/input";
import { normalizeString } from "@/lib/stringNormalize";
import SearchSelect from "@/components/ui/SearchSelect";
import PersonListItem from "@/components/ui/PersonListItem";
import { ENTITIES } from "@/lib/constants";

type Props = {
  entry: EntryDetailView;
};

export function EntryPersonRelationshipCard({ entry }: Props) {
  const qc = useQueryClient();

  const personsQuery = useQuery({
    queryKey: ["persons"],
    queryFn: listPersons,
  });

  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [addRole, setAddRole] = useState("");
  const [addError, setAddError] = useState("");
  const [editingPerson, setEditingPerson] = useState<any>(null);
  const [editRole, setEditRole] = useState("");
  const [editError, setEditError] = useState("");

  const removePersonMut = useMutation({
    mutationFn: (x: { personId: string; role: string | null | undefined }) =>
      removeEntryFromPerson(x.personId, entry.id, x.role),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entry", entry.id] });
    },
  });

  const updateRoleMut = useMutation({
    mutationFn: (x: { personId: string; oldRole: string; newRole: string }) =>
      updateEntryRole(x.personId, entry.id, x.oldRole, x.newRole),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entry", entry.id] });
      setEditingPerson(null);
      setEditRole("");
      setEditError("");
    },
  });

  const addPersonMut = useMutation({
    mutationFn: (x: { personId: string; role: string }) =>
      addEntryToPerson(x.personId, entry.id, x.role),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entry", entry.id] });
      setSelectedPersonId("");
      setSearchResetKey((s) => s + 1);
      setAddRole("");
      setAddError("");
    },
  });

  const getPersonDisplayName = (person: any) => {
    return `${person.firstName || ""} ${person.lastName || ""}`.trim() || person.nickname || "Unknown Person";
  };

  const renderPerson = (person: any) => (
    <>
      <div className="font-medium">
        {getPersonDisplayName({
          firstName: person.firstName,
          lastName: person.lastName,
          nickname: person.nickname,
        })}
      </div>
      {person.role && <div className="text-muted-foreground">{person.role}</div>}
    </>
  );

  const handleAddPerson = () => {
    setAddError("");
    setSearchResetKey((s) => s + 1);
    setSelectedPersonId("");
    // opening dialog handled by RelationshipCard_new
  };

  const handleSaveAdd = (): boolean => {
    setAddError("");

    if (!selectedPersonId) {
      setAddError("Please select a person.");
      return false;
    }

    if (!addRole.trim()) {
      setAddError("Role is required.");
      return false;
    }

    const role = normalizeString(addRole) || "autor";

    // Prevent adding duplicate relation: same person + same normalized role
    const alreadyExists = entry.persons.some((p: any) => {
      const existingRole = normalizeString(p.role) || "autor";
      return p.personId === selectedPersonId && existingRole === role;
    });

    if (alreadyExists) {
      // Show warning and keep dialog open
      setAddError("Vazba na tuto osobu se stejnou rolí již existuje.");
      return false;
    }

    addPersonMut.mutate({ personId: selectedPersonId, role });
    return true;
  };

  const handleCancelAdd = () => {
    setSelectedPersonId("");
    setAddRole("");
    setSearchResetKey((s) => s + 1);
    setAddError("");
  };

  const handleEditPerson = (person: any) => {
    setEditError("");
    setEditingPerson(person);
    setEditRole(person.role || "");
  };

  const handleSaveEdit = (): boolean => {
    setEditError("");

    if (!editRole.trim()) {
      setEditError("Role is required.");
      return false;
    }

    if (editingPerson) {
      const oldRole = editingPerson.role || "autor";
      const newRole = normalizeString(editRole) || "autor";
      // Don't update if role hasn't changed
      if (oldRole === newRole) {
        setEditingPerson(null);
        setEditRole("");
        return true;
      }

      updateRoleMut.mutate({ personId: editingPerson.personId, oldRole, newRole });
      return true;
    }

    return false;
  };

  const handleCancelEdit = () => {
    setEditingPerson(null);
    setEditRole("");
    setEditError("");
  };

  const handleRemovePerson = (person: any) => {
    removePersonMut.mutate({ personId: person.personId, role: person.role });
  };


  const existingSet = new Set(entry.persons.map((p: any) => `${p.personId}::${normalizeString(p.role) || "autor"}`));

  const addContent = (
    <div className="space-y-4">
      <SearchSelect
        items={personsQuery.data || []}
        loading={personsQuery.isLoading}
        existingIds={existingSet}
        getItemId={(p: any) => p.id}
        getItemLabel={(p: any) => getPersonDisplayName({ firstName: p.firstName, lastName: p.lastName, nickname: p.nickname })}
        filterFn={(p: any, q: string) => getPersonDisplayName({ firstName: p.firstName, lastName: p.lastName, nickname: p.nickname }).toLowerCase().includes(q.toLowerCase())}
        resource={ENTITIES.PERSON}
        selectedId={selectedPersonId}
        onSelect={(id: string) => {
          setSelectedPersonId(id);
          setAddError("");
        }}
        renderItem={(p: any) => <PersonListItem person={p} />}
        resetKey={searchResetKey}
      />



      <div>
        <label className="text-sm font-medium">Role</label>
        <Input
          value={addRole}
          onChange={(e) => {
            setAddRole(e.target.value);
            setAddError("");
          }}
          placeholder="Enter role (e.g., author, editor)"
        />
      </div>
      {addError && <div className="text-sm text-red-600">{addError}</div>}
    </div>
  );

  const editContent = editingPerson ? (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Role</label>
        <Input
          value={editRole}
          onChange={(e) => {
            setEditRole(e.target.value);
            setEditError("");
          }}
          placeholder="Enter role (e.g., author, editor)"
        />
      </div>
      {editError && <div className="text-sm text-red-600">{editError}</div>}
    </div>
  ) : null;

  return (
    <RelationshipCard_new
      resource={ENTITIES.PERSON}
      isEmpty={entry.persons.length === 0}
      items={entry.persons}
      renderItem={renderPerson}
      displayName={getPersonDisplayName}
      onAdd={handleAddPerson}
      onEdit={handleEditPerson}
      onRemove={handleRemovePerson}
      onSave={handleSaveEdit}
      onCancel={handleCancelEdit}
      onAddSave={handleSaveAdd}
      onAddCancel={handleCancelAdd}
      editContent={editContent}
      addContent={addContent}
      isSaving={updateRoleMut.isPending}
    />
  );
}

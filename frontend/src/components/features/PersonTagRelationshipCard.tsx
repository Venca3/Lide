import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getPersonRead } from "@/api/personRead";
import { listTags } from "@/api/tags";
import { addTagToPerson, removeTagFromPerson } from "@/api/personTags";
import { RelationshipCard_new } from "../layout/RelationshipCard_new";
import SearchSelect from "@/components/ui/SearchSelect";
import { ENTITIES } from "@/lib/constants";

interface Props {
  personId: string;
}

export function PersonTagRelationshipCard({ personId }: Props) {
  const qc = useQueryClient();

  const personQ = useQuery({
    queryKey: ["personread", personId],
    queryFn: () => getPersonRead(personId),
  });

  const tagsQ = useQuery({
    queryKey: ["tags"],
    queryFn: listTags,
  });

  const [selectedTagId, setSelectedTagId] = useState("");
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [addError, setAddError] = useState("");

  const addMut = useMutation({
    mutationFn: (tagId: string) => addTagToPerson(personId, tagId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["personread", personId] });
      setSelectedTagId("");
      setSearchResetKey((s) => s + 1);
      setAddError("");
    },
  });

  const removeMut = useMutation({
    mutationFn: (tagId: string) => removeTagFromPerson(personId, tagId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["personread", personId] });
    },
  });

  const items = personQ.data?.tags || [];
  const existingIds = new Set(items.map((t: any) => t.id));

  const handleAddSave = (): boolean => {
    if (!selectedTagId) {
      setAddError("Please select a tag.");
      return false;
    }
    addMut.mutate(selectedTagId);
    return true;
  };

  const handleAddCancel = () => {
    setSelectedTagId("");
    setSearchResetKey((s) => s + 1);
    setAddError("");
  };

  const handleAdd = () => {
    setAddError("");
    setSearchResetKey((s) => s + 1);
    setSelectedTagId("");
  };

  const addContent = (
    <div className="space-y-4">
      <SearchSelect
        items={tagsQ.data || []}
        loading={tagsQ.isLoading}
        existingIds={existingIds}
        getItemId={(t: any) => t.id}
        getItemLabel={(t: any) => t.name}
        filterFn={(t: any, q: string) => t.name.toLowerCase().includes(q.toLowerCase())}
        resource={ENTITIES.TAG}
        selectedId={selectedTagId}
        onSelect={(id) => {
          setSelectedTagId(id);
          setAddError("");
        }}
        resetKey={searchResetKey}
      />
      {addError && <div className="text-sm text-red-600">{addError}</div>}
    </div>
  );

  return (
    <RelationshipCard_new
      resource={ENTITIES.TAG}
      isEmpty={items.length === 0}
      items={items}
      renderItem={(t: any) => t.name}
      displayName={(t: any) => t.name}
      onAdd={handleAdd}
      onRemove={(t: any) => removeMut.mutate(t.id)}
      onAddSave={handleAddSave}
      onAddCancel={handleAddCancel}
      addContent={addContent}
      isSaving={addMut.isPending || removeMut.isPending}
      itemVariant="chip"
    />
  );
}

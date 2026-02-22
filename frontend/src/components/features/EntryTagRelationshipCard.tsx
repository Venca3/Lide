import { useMutation, useQueryClient, useQuery as useRQ } from "@tanstack/react-query";
import { useState } from "react";
import { listTags } from "@/api/tags";
import { addTagToEntry, removeTagFromEntry } from "@/api/entryTag";
import type { EntryDetailView } from "@/api/entryRead";
import { RelationshipCard_new } from "../layout/RelationshipCard_new";
import SearchSelect from "@/components/ui/SearchSelect";
import { ENTITIES } from "@/lib/constants";

type Props = {
  entry: EntryDetailView;
};

export function EntryTagRelationshipCard({ entry }: Props) {
  const qc = useQueryClient();
  const tagsQuery = useRQ({ queryKey: ["tags"], queryFn: listTags });

  const [selectedTagId, setSelectedTagId] = useState("");
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [addError, setAddError] = useState("");


  const addMut = useMutation({
    mutationFn: (tagId: string) => addTagToEntry(entry.id, tagId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entry", entry.id] });
      setSelectedTagId("");
      setSearchResetKey((s) => s + 1);
      setAddError("");
    },
  });

  const removeMut = useMutation({
    mutationFn: (tagId: string) => removeTagFromEntry(entry.id, tagId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entry", entry.id] });
    },
  });

  const handleAdd = () => {
    setAddError("");
    setSearchResetKey((s) => s + 1);
    setSelectedTagId("");
  };

  const handleSaveAdd = (): boolean => {
    setAddError("");
    if (!selectedTagId) {
      setAddError("Please select a tag.");
      return false;
    }
    addMut.mutate(selectedTagId);
    return true;
  };

  const handleCancelAdd = () => {
    setSelectedTagId("");
    setSearchResetKey((s) => s + 1);
    setAddError("");
  };

  const renderTag = (t: any) => t.name;

  const existingIds = new Set(entry.tags.map((t: any) => t.id));


  const addContent = (
    <div className="space-y-4">
      <SearchSelect
        items={tagsQuery.data || []}
        loading={tagsQuery.isLoading}
        existingIds={existingIds}
        getItemId={(t: any) => t.id}
        getItemLabel={(t: any) => t.name}
        resource={ENTITIES.TAG}
        selectedId={selectedTagId}
        onSelect={(id: string) => {
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
      isEmpty={entry.tags.length === 0}
      items={entry.tags}
      renderItem={renderTag}
      displayName={(t: any) => t.name}
      onAdd={handleAdd}
      addContent={addContent}
      onAddSave={handleSaveAdd}
      onAddCancel={handleCancelAdd}
      isSaving={addMut.isPending || removeMut.isPending}
      itemVariant="chip"
      onRemove={(t: any) => removeMut.mutate(t.id)}
    />
  );
}

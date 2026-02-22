import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listEntries } from "@/api/entries";
import { listEntriesForMedia, addMediaToEntry, updateMediaEntryLink, removeMediaFromEntry } from "@/api/mediaEntry";
import { RelationshipCard_new } from "../layout/RelationshipCard_new";
import { Input } from "@/components/ui/input";
import SearchSelect from "@/components/ui/SearchSelect";
import { ENTITIES } from "@/lib/constants";

interface Props {
  mediaId: string;
}

export function MediaEntryRelationshipCard({ mediaId }: Props) {
  const qc = useQueryClient();

  const entriesQ = useQuery({
    queryKey: ["mediaentry", "entries-for-media", mediaId],
    queryFn: () => listEntriesForMedia(mediaId),
  });

  const allEntriesQ = useQuery({
    queryKey: ["entries"],
    queryFn: listEntries,
  });

  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [addCaption, setAddCaption] = useState("");
  const [addError, setAddError] = useState("");

  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editSortOrder, setEditSortOrder] = useState<string | null>(null);
  const [editError, setEditError] = useState("");

  const removeMut = useMutation({
    mutationFn: (x: { entryId: string }) => removeMediaFromEntry(x.entryId, mediaId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["mediaentry", "entries-for-media", mediaId] });
    },
  });

  const updateMut = useMutation({
    mutationFn: (x: { entryId: string; caption?: string | null; sortOrder?: number | null }) =>
      updateMediaEntryLink(x.entryId, mediaId, { caption: x.caption ?? null, sortOrder: x.sortOrder ?? null }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["mediaentry", "entries-for-media", mediaId] });
      setEditingEntry(null);
      setEditCaption("");
      setEditSortOrder(null);
      setEditError("");
    },
  });

  const addMut = useMutation({
    mutationFn: (x: { entryId: string; caption?: string | null }) => addMediaToEntry(x.entryId, mediaId, { caption: x.caption ?? null }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["mediaentry", "entries-for-media", mediaId] });
      setSelectedEntryId("");
      setSearchResetKey((s) => s + 1);
      setAddCaption("");
      setAddError("");
    },
  });

  const renderEntry = (e: any) => (
    <>
      <div className="font-medium">{e.title || e.content}</div>
      <div className="text-muted-foreground">
        {e.type}
        {e.caption && ` • Caption: ${e.caption}`}
        {e.sortOrder != null && ` • Order: ${e.sortOrder}`}
      </div>
    </>
  );

  const handleAdd = () => {
    setAddError("");
  };

  const handleSaveAdd = (): boolean => {
    setAddError("");
    if (!selectedEntryId) {
      setAddError("Please select an entry.");
      return false;
    }
    addMut.mutate({ entryId: selectedEntryId, caption: addCaption || undefined });
    return true;
  };

  const handleCancelAdd = () => {
    setSelectedEntryId("");
    setAddCaption("");
    setSearchResetKey((s) => s + 1);
    setAddError("");
  };

  const handleEdit = (e: any) => {
    setEditError("");
    setEditingEntry(e);
    setEditCaption(e.caption || "");
    setEditSortOrder(e.sortOrder != null ? String(e.sortOrder) : null);
  };

  const handleSaveEdit = (): boolean => {
    setEditError("");
    let sortOrderNum: number | null = null;
    if (editSortOrder !== null && editSortOrder !== "") {
      const n = Number(editSortOrder);
      if (!Number.isFinite(n) || !Number.isInteger(n)) {
        setEditError("Sort order must be an integer.");
        return false;
      }
      sortOrderNum = n;
    }

    if (editingEntry) {
      if ((editingEntry.caption || "") === (editCaption || "") && editingEntry.sortOrder === sortOrderNum) {
        setEditingEntry(null);
        setEditCaption("");
        setEditSortOrder(null);
        return true;
      }

      updateMut.mutate({ entryId: editingEntry.entryId, caption: editCaption || undefined, sortOrder: sortOrderNum });
      return true;
    }
    return false;
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditCaption("");
    setEditSortOrder(null);
    setEditError("");
  };

  const handleRemove = (e: any) => {
    removeMut.mutate({ entryId: e.entryId });
  };

  const existingIds = new Set((entriesQ.data || []).map((e: any) => e.entryId));

  const addContent = (
    <div className="space-y-4">
      <SearchSelect
        items={allEntriesQ.data || []}
        loading={allEntriesQ.isLoading}
        existingIds={existingIds}
        getItemId={(e: any) => e.id}
        getItemLabel={(e: any) => e.title || e.content}
        filterFn={(e: any, q: string) => ((e.title || e.content || "").toLowerCase().includes(q.toLowerCase()) || e.type.toLowerCase().includes(q.toLowerCase()))}
        resource={ENTITIES.ENTRY}
        selectedId={selectedEntryId}
        onSelect={(id: string) => {
          setSelectedEntryId(id);
          setAddError("");
        }}
        renderSecondary={(e: any) => e.type}
        resetKey={searchResetKey}
      />
      <div>
        <label className="text-sm font-medium">Caption</label>
        <Input value={addCaption} onChange={(e) => setAddCaption(e.target.value)} placeholder="Optional caption" />
      </div>
      {addError && <div className="text-sm text-red-600">{addError}</div>}
    </div>
  );

  const editContent = editingEntry ? (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Caption</label>
        <Input value={editCaption} onChange={(e) => setEditCaption(e.target.value)} placeholder="Caption" />
      </div>
      <div>
        <label className="text-sm font-medium">Sort order</label>
        <Input value={editSortOrder ?? ""} onChange={(e) => setEditSortOrder(e.target.value)} placeholder="Integer order" />
      </div>
      {editError && <div className="text-sm text-red-600">{editError}</div>}
    </div>
  ) : null;

  const items = entriesQ.data || [];

  return (
    <RelationshipCard_new
      resource={ENTITIES.ENTRY}
      isEmpty={items.length === 0}
      items={items}
      renderItem={renderEntry}
      displayName={(e: any) => e.title || e.content}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onRemove={handleRemove}
      onSave={handleSaveEdit}
      onCancel={handleCancelEdit}
      onAddSave={handleSaveAdd}
      onAddCancel={handleCancelAdd}
      editContent={editContent}
      addContent={addContent}
      isSaving={updateMut.isPending}
    />
  );
}
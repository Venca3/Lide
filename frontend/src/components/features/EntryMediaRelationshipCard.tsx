import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listMedia } from "@/api/media";
import { addMediaToEntry, updateMediaEntryLink, removeMediaFromEntry } from "@/api/mediaEntry";
import type { EntryDetailView } from "@/api/entryRead";
import { RelationshipCard_new } from "../layout/RelationshipCard_new";
import { Input } from "@/components/ui/input";
import SearchSelect from "@/components/ui/SearchSelect";
import { ENTITIES } from "@/lib/constants";

type Props = {
  entry: EntryDetailView;
};

export function EntryMediaRelationshipCard({ entry }: Props) {
  const qc = useQueryClient();

  const mediaQuery = useQuery({
    queryKey: ["media"],
    queryFn: listMedia,
  });

  const [selectedMediaId, setSelectedMediaId] = useState("");
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [addCaption, setAddCaption] = useState("");
  const [addError, setAddError] = useState("");

  const [editingMedia, setEditingMedia] = useState<any>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editSortOrder, setEditSortOrder] = useState<string | null>(null);
  const [editError, setEditError] = useState("");

  const removeMut = useMutation({
    mutationFn: (x: { mediaId: string }) => removeMediaFromEntry(entry.id, x.mediaId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entry", entry.id] });
    },
  });

  const updateMut = useMutation({
    mutationFn: (x: { mediaId: string; caption?: string | null; sortOrder?: number | null }) =>
      updateMediaEntryLink(entry.id, x.mediaId, { caption: x.caption ?? null, sortOrder: x.sortOrder ?? null }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entry", entry.id] });
      setEditingMedia(null);
      setEditCaption("");
      setEditSortOrder(null);
      setEditError("");
    },
  });

  const addMut = useMutation({
    mutationFn: (x: { mediaId: string; caption?: string | null }) => addMediaToEntry(entry.id, x.mediaId, { caption: x.caption ?? null }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entry", entry.id] });
      setSelectedMediaId("");
      setSearchResetKey((s) => s + 1);
      setAddCaption("");
      setAddError("");
    },
  });

  const renderMedia = (m: any) => (
    <>
      <div className="font-medium">{m.title || m.uri}</div>
      <div className="text-muted-foreground">
        {m.mediaType}
        {m.caption && ` • Caption: ${m.caption}`}
        {m.sortOrder != null && ` • Order: ${m.sortOrder}`}
      </div>
    </>
  );

  const handleAdd = () => {
    setAddError("");
  };

  const handleSaveAdd = (): boolean => {
    setAddError("");
    if (!selectedMediaId) {
      setAddError("Please select media.");
      return false;
    }
    addMut.mutate({ mediaId: selectedMediaId, caption: addCaption || undefined });
    return true;
  };

  const handleCancelAdd = () => {
    setSelectedMediaId("");
    setAddCaption("");
    setSearchResetKey((s) => s + 1);
    setAddError("");
  };

  const handleEdit = (m: any) => {
    setEditError("");
    setEditingMedia(m);
    setEditCaption(m.caption || "");
    setEditSortOrder(m.sortOrder != null ? String(m.sortOrder) : null);
  };

  const handleSaveEdit = (): boolean => {
    setEditError("");
    // validate sortOrder if present
    let sortOrderNum: number | null = null;
    if (editSortOrder !== null && editSortOrder !== "") {
      const n = Number(editSortOrder);
      if (!Number.isFinite(n) || !Number.isInteger(n)) {
        setEditError("Sort order must be an integer.");
        return false;
      }
      sortOrderNum = n;
    }

    if (editingMedia) {
      // if nothing changed, close
      if ((editingMedia.caption || "") === (editCaption || "") && editingMedia.sortOrder === sortOrderNum) {
        setEditingMedia(null);
        setEditCaption("");
        setEditSortOrder(null);
        return true;
      }

      updateMut.mutate({ mediaId: editingMedia.mediaId, caption: editCaption || undefined, sortOrder: sortOrderNum });
      return true;
    }
    return false;
  };

  const handleCancelEdit = () => {
    setEditingMedia(null);
    setEditCaption("");
    setEditSortOrder(null);
    setEditError("");
  };

  const handleRemove = (m: any) => {
    removeMut.mutate({ mediaId: m.mediaId });
  };

  const existingIds = new Set(entry.media.map((m: any) => m.mediaId));


  const addContent = (
    <div className="space-y-4">
      <SearchSelect
        items={mediaQuery.data || []}
        loading={mediaQuery.isLoading}
        existingIds={existingIds}
        getItemId={(m: any) => m.id}
        getItemLabel={(m: any) => m.title || m.uri}
        filterFn={(m: any, q: string) => ((m.title || m.uri || "").toLowerCase().includes(q.toLowerCase()) || m.mediaType.toLowerCase().includes(q.toLowerCase()))}
        resource={ENTITIES.MEDIA}
        selectedId={selectedMediaId}
        onSelect={(id: string) => {
          setSelectedMediaId(id);
          setAddError("");
        }}
        renderSecondary={(m: any) => m.mediaType}
        resetKey={searchResetKey}
      />



      <div>
        <label className="text-sm font-medium">Caption</label>
        <Input value={addCaption} onChange={(e) => setAddCaption(e.target.value)} placeholder="Optional caption" />
      </div>
      {addError && <div className="text-sm text-red-600">{addError}</div>}
    </div>
  );

  const editContent = editingMedia ? (
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

  return (
    <RelationshipCard_new
      resource={ENTITIES.MEDIA}
      isEmpty={entry.media.length === 0}
      items={entry.media}
      renderItem={renderMedia}
      displayName={(m: any) => m.title || m.uri}
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

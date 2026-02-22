import { useEffect, useState } from "react";
import type { PagedResult } from "../api/entries";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PagedListCard_new } from "@/components/layout/PagedListCard_new";
import { formatDateTime } from "@/lib/dateFormat";
import { ENTITIES, UI_LABELS } from "@/lib/constants";
import { ListRow_new } from "@/components/layout/ListRow_new";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { type MediaFormValue } from "@/features/media/MediaForm";
import { createMedia, deleteMedia, listMediaPaged, type MediaDto } from "@/api/media";
import { MediaForm_new } from "@/features/media/MediaForm_new";

export function MediaPage() {
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const size = 10;
  const navigate = useNavigate();
  const debounced = useDebouncedValue(filter, 250);
  const qc = useQueryClient();

  const [createForm, setCreateForm] = useState<MediaFormValue>({
    mediaType: "",
    mimeType: "",
    uri: "",
    title: "",
    note: "",
    takenAt: "",
  });

  useEffect(() => {
    setPage(0);
  }, [debounced]);

  const q = useQuery({
    queryKey: ["media", debounced, page, size],
    queryFn: () => listMediaPaged(debounced, page, size),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteMedia(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["media"] });
    },
  });

  const createMut = useMutation({
    mutationFn: (data: { mediaType: string; mimeType?: string; uri: string; title?: string; note?: string; takenAt?: string }) =>
      createMedia({
        mediaType: data.mediaType,
        mimeType: data.mimeType || null,
        uri: data.uri,
        title: data.title || null,
        note: data.note || null,
        takenAt: data.takenAt || null,
        mediaEntries: [],
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["media"] });
      setCreateForm({ mediaType: "", mimeType: "", uri: "", title: "", note: "", takenAt: "" });
    },
  });

  const handleCreateSubmit = () => {
    createMut.mutate(createForm);
  };

  const createFormContent = (
    <MediaForm_new
      value={createForm}
      onChange={setCreateForm}
      onSubmit={handleCreateSubmit}
      submitLabel={UI_LABELS.CREATE}
      disabled={createMut.isPending}
    />
  );

  const data = q.data as PagedResult<MediaDto> | undefined;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-4">
      <PagedListCard_new
        resources={ENTITIES.MEDIA}
        addDialogContent={createFormContent}
        filter={filter}
        onFilterChange={setFilter}
        itemsLength={items.length}
        total={total}
        page={page}
        size={size}
        onPageChange={setPage}
        showPagination={true}
        isLoading={q.isLoading}
        isError={q.isError}
      >
        {items.map((m: MediaDto) => {
          const titleOrUri = m.title || m.uri;
          const details = [m.mediaType, m.mimeType, formatDateTime(m.takenAt)].filter(Boolean).join(" • ");

          return (
            <ListRow_new
              resources={ENTITIES.MEDIA}
              key={m.id}
              onClick={() => navigate(`/media/${m.id}`)}
              onDelete={() => deleteMut.mutate(m.id)}
              deleteTitle={titleOrUri || UI_LABELS.NO_TITLE}
              isDeleting={deleteMut.isPending}
            >
              <div className="font-medium truncate">{titleOrUri || UI_LABELS.NO_TITLE}</div>
              {details && (
                <div className="text-xs text-muted-foreground">{details}</div>
              )}
            </ListRow_new>
          );
        })}
      </PagedListCard_new>
    </div>
  );
}
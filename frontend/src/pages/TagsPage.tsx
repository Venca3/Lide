import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { PagedListCard } from "@/components/layout/PagedListCard";
import { ListRow } from "@/components/layout/ListRow";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

import { createTag, deleteTag, listTagsPaged, updateTag, type PagedResult, type TagDto } from "@/api/tags";

export function TagsPage() {
  const qc = useQueryClient();

  const [filter, setFilter] = useState("");
  const debounced = useDebouncedValue(filter, 250);
  const [page, setPage] = useState(0);
  const size = 20;

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // reset page to 0 when debounced filter changes
  useEffect(() => {
    setPage(0);
  }, [debounced]);

  const tagsQ = useQuery({
    queryKey: ["tags", debounced, page, size],
    queryFn: () => listTagsPaged(debounced, page, size),
  });

  const createMut = useMutation({
    mutationFn: () => createTag(newName),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tags"] });
      setCreateOpen(false);
      setNewName("");
    },
  });

  const updateMut = useMutation({
    mutationFn: () => updateTag(editId!, editName),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tags"] });
      setEditId(null);
      setEditName("");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  const data = tagsQ.data as PagedResult<TagDto> | undefined;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-4">
      <PagedListCard
        pageTitle="Tags"
        pageAction={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>New tag</Button>
            </DialogTrigger>
            <DialogContent className="bg-background text-foreground">
              <DialogHeader>
                <DialogTitle>Create tag</DialogTitle>
                <DialogDescription>Add a new tag to organize and categorize entries.</DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <Input
                  placeholder="Tag name…"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />

                <Button
                  disabled={!newName.trim() || createMut.isPending}
                  onClick={() => createMut.mutate()}
                >
                  Create
                </Button>

                {createMut.isError && (
                  <div className="text-sm text-red-600">
                    Failed to create tag (may already exist).
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        }
        filter={filter}
        onFilterChange={setFilter}
        searchPlaceholder="Search tags..."
        isLoading={tagsQ.isLoading}
        isError={tagsQ.isError}
        errorText="Error loading tags."
        itemsLength={items.length}
        total={total}
        page={page}
        size={size}
        onPageChange={setPage}
        showPagination={Boolean(tagsQ.data)}
      >
        {items.map((t) => {
            const isEditing = editId === t.id;
            return (
              <ListRow
                key={t.id}
                deleteAction={
                  isEditing
                    ? undefined
                    : {
                        label: t.name,
                        onDelete: () => deleteMut.mutate(t.id),
                        isDeleting: deleteMut.isPending,
                        confirmTitle: "Delete tag",
                        confirmDescription: (
                          <>Are you sure you want to delete tag '{t.name}'?</>
                        ),
                      }
                }
                right={
                  isEditing ? (
                    <>
                      <Button
                        size="sm"
                        disabled={!editName.trim() || updateMut.isPending}
                        onClick={() => updateMut.mutate()}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditId(null);
                          setEditName("");
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditId(t.id);
                        setEditName(t.name);
                      }}
                    >
                      Rename
                    </Button>
                  )
                }
              >
                {isEditing ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                ) : (
                  <div className="font-medium truncate">{t.name}</div>
                )}
              </ListRow>
            );
          })}
      </PagedListCard>
    </div>
  );
}

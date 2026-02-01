import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PagedListCard } from "@/components/layout/PagedListCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ListRow } from "@/components/layout/ListRow";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

import { createPerson, deletePerson, listPersonsPaged, type PagedResult, type PersonDto } from "@/api/persons";
import { PersonForm, type PersonFormValue } from "@/featured/persons/PersonForm";
import { getPersonDisplayName } from "@/lib/person";
import { formatDate } from "@/lib/dateFormat";

const empty: PersonFormValue = {
  firstName: "",
  lastName: "",
  nickname: "",
  birthDate: "",
  phone: "",
  email: "",
  note: "",
};

export function PersonsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 300);

  const [page, setPage] = useState(0);
  const [size] = useState(20);

  const [createOpen, setCreateOpen] = useState(false);
  const [v, setV] = useState<PersonFormValue>(empty);

  const personsQuery = useQuery<PagedResult<PersonDto>, Error>({
    queryKey: ["persons", debouncedQ, page, size],
    queryFn: () => listPersonsPaged(debouncedQ, page, size),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deletePerson(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["persons"] });
    },
  });

  const createMut = useMutation({
    mutationFn: () =>
      createPerson({
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim() || null,
        nickname: v.nickname.trim() || null,
        birthDate: v.birthDate.trim() || null,
        phone: v.phone.trim() || null,
        email: v.email.trim() || null,
        note: v.note.trim() || null,
        personEntries: [],
        personTags: [],
        relationsOut: [],
        relationsIn: [],
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["persons"] });
      setCreateOpen(false);
      setV(empty);
    },
  });

  const items = personsQuery.data?.items ?? [];
  const total = personsQuery.data?.total ?? 0;

  const display = (p: PersonDto) => {
    const fullName = [p.firstName, p.lastName].filter(Boolean).join(" ").trim();
    const nickname = p.nickname?.trim();
    if (fullName && nickname) return `${fullName} (${nickname})`;
    if (fullName) return fullName;
    if (nickname) return nickname;
    return "Unnamed";
  };

  return (
    <div className="space-y-4">
      <PagedListCard
        pageTitle="Persons"
        pageAction={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>New person</Button>
            </DialogTrigger>
            <DialogContent className="bg-background text-foreground">
              <DialogHeader>
                <DialogTitle>Create person</DialogTitle>
                <DialogDescription>Add a new person to your database.</DialogDescription>
              </DialogHeader>
              <PersonForm
                value={v}
                onChange={setV}
                onSubmit={() => createMut.mutate()}
                submitLabel={createMut.isPending ? "Creating…" : "Create"}
                disabled={createMut.isPending}
                errorText={createMut.isError ? "Failed to create person." : null}
              />
            </DialogContent>
          </Dialog>
        }
        filter={q}
        onFilterChange={setQ}
        searchPlaceholder="Search..."
        isLoading={personsQuery.isLoading}
        isError={personsQuery.isError}
        errorText="Error loading persons."
        itemsLength={items.length}
        total={total}
        page={page}
        size={size}
        onPageChange={setPage}
        showPagination={Boolean(personsQuery.data)}
      >
        {items.map((p) => {
          const birthDate = formatDate(p.birthDate);
          const details = [
            p.phone,
            p.email,
            birthDate,
          ]
            .filter(Boolean)
            .join(" • ");

          return (
            <ListRow
              key={p.id}
              hoverHint="View details"
              onClick={() => {
                navigate(`/persons/${p.id}`);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(`/persons/${p.id}`);
                }
              }}
              deleteAction={{
                label: display(p),
                onDelete: () => deleteMut.mutate(p.id),
                isDeleting: deleteMut.isPending,
                confirmTitle: "Delete person",
                confirmDescription: <>Are you sure you want to delete person '{display(p)}'?</>,
              }}
            >
              <div className="font-medium group-hover:underline">{display(p)}</div>
              {details && (
                <div className="text-xs text-muted-foreground">{details}</div>
              )}
            </ListRow>
          );
        })}
      </PagedListCard>
    </div>
  );
}

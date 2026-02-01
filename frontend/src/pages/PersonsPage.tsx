import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PagedListCard } from "@/components/layout/PagedListCard";
import { Button } from "@/components/ui/button";
import { ListRow } from "@/components/layout/ListRow";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

import { deletePerson, listPersonsPaged, type PagedResult, type PersonDto } from "@/api/persons";

export function PersonsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 300);

  const [page, setPage] = useState(0);
  const [size] = useState(20);

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

  const formatBirthDate = (birthDate: string | null) => {
    if (!birthDate) return null;
    const parts = birthDate.split("-");
    if (parts.length !== 3) return birthDate;
    const [year, month, day] = parts;
    if (!year || !month || !day) return birthDate;
    return `${day}.${month}.${year}`;
  };

  return (
    <div className="space-y-4">
      <PagedListCard
        pageTitle="Persons"
        pageAction={
          <Button asChild>
            <Link to="/persons/new">New person</Link>
          </Button>
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
          const birthDate = formatBirthDate(p.birthDate);
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

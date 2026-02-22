import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PagedListCard_new } from "@/components/layout/PagedListCard_new";
import { ENTITIES, UI_LABELS } from "@/lib/constants";
import { ListRow_new } from "@/components/layout/ListRow_new";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { createPerson, deletePerson, listPersonsPaged, type PagedResult, type PersonDto } from "@/api/persons";
import { PersonForm_new } from "@/features/persons/PersonForm_new";
import type { PersonFormValue } from "@/features/persons/PersonForm";
import { formatDate } from "@/lib/dateFormat";
import { getPersonDisplayName } from "@/lib/person";

const empty: PersonFormValue = {
  firstName: "",
  lastName: "",
  nickname: "",
  birthDate: "",
  phone: "",
  email: "",
  note: "",
};

export function TestPage() {
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const size = 20;
  const navigate = useNavigate();
  const debounced = useDebouncedValue(filter, 300);
  const qc = useQueryClient();

  const [createForm, setCreateForm] = useState<PersonFormValue>(empty);

  useEffect(() => {
    setPage(0);
  }, [debounced]);

  const q = useQuery<PagedResult<PersonDto>, Error>({
    queryKey: ["persons", debounced, page, size],
    queryFn: () => listPersonsPaged(debounced, page, size),
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
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim() || null,
        nickname: createForm.nickname.trim() || null,
        birthDate: createForm.birthDate.trim() || null,
        phone: createForm.phone.trim() || null,
        email: createForm.email.trim() || null,
        note: createForm.note.trim() || null,
        personEntries: [],
        personTags: [],
        relationsOut: [],
        relationsIn: [],
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["persons"] });
      setCreateForm(empty);
    },
  });

  const handleCreateSubmit = () => {
    createMut.mutate();
  };

  const createFormContent = (
    <PersonForm_new
      value={createForm}
      onChange={setCreateForm}
      onSubmit={handleCreateSubmit}
      submitLabel={UI_LABELS.CREATE}
      disabled={createMut.isPending}
      errorText={createMut.isError ? "Failed to create person." : null}
    />
  );

  const data = q.data;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-4">
      <PagedListCard_new
        resources={ENTITIES.PERSON}
        addDialogContent={createFormContent}
        filter={filter}
        onFilterChange={setFilter}
        itemsLength={items.length}
        total={total}
        page={page}
        size={size}
        onPageChange={setPage}
        showPagination={Boolean(q.data)}
        isLoading={q.isLoading}
        isError={q.isError}
      >
        {items.map((p: PersonDto) => {
          const displayName = getPersonDisplayName(p);
          const birthDate = formatDate(p.birthDate);
          const details = [p.phone, p.email, birthDate].filter(Boolean).join(" • ");

          return (
            <ListRow_new
              resources={ENTITIES.PERSON}
              key={p.id}
              onClick={() => navigate(`/persons/${p.id}`)}
              onDelete={() => deleteMut.mutate(p.id)}
              deleteTitle={displayName || UI_LABELS.NO_TITLE}
              isDeleting={deleteMut.isPending}
            >
              <div className="font-medium truncate">{displayName || UI_LABELS.NO_TITLE}</div>
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
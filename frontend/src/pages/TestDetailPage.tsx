import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getPersonRead } from "@/api/personRead";
import { updatePerson, deletePerson } from "@/api/persons";
import { PersonForm_new } from "@/features/persons/PersonForm_new";
import { PersonView } from "@/features/persons/PersonView";
import type { PersonFormValue } from "@/features/persons/PersonForm";
import { DetailPageLayout_new } from "@/components/layout/DetailPageLayout_new";
import { PersonRelationships } from "@/components/features/PersonRelationships";
import { getPersonDisplayName } from "@/lib/person";
import { ENTITIES, UI_LABELS, ROUTES } from "@/lib/constants";

export function TestDetailPage() {
  const { id } = useParams();
  const personId = id ?? "";
  const nav = useNavigate();
  const qc = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [formValue, setFormValue] = useState<PersonFormValue>({
    firstName: "",
    lastName: "",
    nickname: "",
    birthDate: "",
    phone: "",
    email: "",
    note: "",
  });

  const q = useQuery({
    queryKey: ["personread", personId],
    queryFn: () => getPersonRead(personId),
    enabled: !!personId,
  });

  const updateMut = useMutation({
    mutationFn: () =>
      updatePerson(personId, {
        firstName: formValue.firstName.trim() || null,
        lastName: formValue.lastName.trim() || null,
        nickname: formValue.nickname.trim() || null,
        birthDate: formValue.birthDate.trim() || null,
        phone: formValue.phone.trim() || null,
        email: formValue.email.trim() || null,
        note: formValue.note.trim() || null,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["personread", personId] });
      await qc.invalidateQueries({ queryKey: ["persons"] });
      setIsEditing(false);
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => deletePerson(personId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["persons"] });
      nav(ROUTES.PERSONS);
    },
  });

  useEffect(() => {
    const person = q.data;
    if (!person) return;
    setFormValue({
      firstName: person.firstName ?? "",
      lastName: person.lastName ?? "",
      nickname: person.nickname ?? "",
      birthDate: person.birthDate ?? "",
      phone: person.phone ?? "",
      email: person.email ?? "",
      note: person.note ?? "",
    });
  }, [q.data]);

  const handleDelete = () => {
    deleteMut.mutate();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMut.mutate();
  };

  const handleCancel = () => {
    setIsEditing(false);
    const person = q.data;
    if (person) {
      setFormValue({
        firstName: person.firstName ?? "",
        lastName: person.lastName ?? "",
        nickname: person.nickname ?? "",
        birthDate: person.birthDate ?? "",
        phone: person.phone ?? "",
        email: person.email ?? "",
        note: person.note ?? "",
      });
    }
  };

  const p = q.data;

  const viewContent = p ? <PersonView person={p} /> : null;

  const editContent = p ? (
    <PersonForm_new
      value={formValue}
      onChange={setFormValue}
      onSubmit={handleSave}
      submitLabel={UI_LABELS.SAVE}
      disabled={updateMut.isPending}
      errorText={updateMut.isError ? `${UI_LABELS.ERROR_UPDATING} ${ENTITIES.PERSON.singular.toLowerCase()}` : null}
      showSubmitButton={false }
    />
  ) : null;

  const relationshipContent = p ? (
    <PersonRelationships personId={personId} />
  ) : null;

  return (
    <DetailPageLayout_new
      isLoading={q.isLoading}
      isError={q.isError}
      errorMessage={`${UI_LABELS.ERROR_LOADING} ${ENTITIES.PERSON.plural.toLowerCase()}`}
      title={getPersonDisplayName(p || {})}
      id={p?.id}
      backLink={ROUTES.PERSONS}
      viewContent={viewContent}
      editContent={editContent}
      relationshipContent={relationshipContent}
      onDelete={handleDelete}
      onEdit={handleEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={updateMut.isPending}
      isEditing={isEditing}
      onEditingChange={setIsEditing}
    />
  );
}
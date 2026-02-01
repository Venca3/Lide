import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { getPerson, updatePerson, deletePerson } from "@/api/persons";
import { PersonForm, type PersonFormValue } from "@/featured/persons/PersonForm";
import { DetailPageLayout } from "@/components/layout/DetailPageLayout";
import { getPersonDisplayName } from "@/lib/person";

export function PersonEditPage() {
  const { id } = useParams();
  const personId = id ?? "";
  const qc = useQueryClient();
  const nav = useNavigate();

  const q = useQuery({
    queryKey: ["person", personId],
    queryFn: () => getPerson(personId),
    enabled: !!personId,
  });

  const [v, setV] = useState<PersonFormValue>({
    firstName: "",
    lastName: "",
    nickname: "",
    birthDate: "",
    phone: "",
    email: "",
    note: "",
  });

  useMemo(() => {
    if (!q.data) return;
    setV({
      firstName: q.data.firstName ?? "",
      lastName: q.data.lastName ?? "",
      nickname: q.data.nickname ?? "",
      birthDate: q.data.birthDate ?? "",
      phone: q.data.phone ?? "",
      email: q.data.email ?? "",
      note: q.data.note ?? "",
    });
  }, [q.data]);

  const saveMut = useMutation({
    mutationFn: () =>
      updatePerson(personId, {
        firstName: v.firstName.trim() || null,
        lastName: v.lastName.trim() || null,
        nickname: v.nickname.trim() || null,
        birthDate: v.birthDate.trim() || null,
        phone: v.phone.trim() || null,
        email: v.email.trim() || null,
        note: v.note.trim() || null,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["persons"] });
      await qc.invalidateQueries({ queryKey: ["person", personId] });
      await qc.invalidateQueries({ queryKey: ["personread", personId] });
      nav(`/persons/${personId}`);
    },
  });

  const delMut = useMutation({
    mutationFn: () => deletePerson(personId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["persons"] });
      nav("/persons");
    },
  });

  if (!personId) return <div>Missing ID in URL.</div>;

  const person = q.data;
  const displayName = person ? getPersonDisplayName(person) : "Edit person";

  const [delConfirmOpen, setDelConfirmOpen] = useState(false);

  return (
    <DetailPageLayout
      isLoading={q.isLoading}
      isError={q.isError}
      errorMessage="This person may have been deleted or is no longer available."
      title={`Edit ${displayName}`}
      subtitle={person?.id}
      backLink={`/persons/${personId}`}
      backLabel="Back"
      onDelete={() => delMut.mutate()}
      isDeletingPending={delMut.isPending}
      deleteConfirmOpen={delConfirmOpen}
      onDeleteConfirmOpenChange={setDelConfirmOpen}
      deleteConfirmTitle="Delete person"
      deleteConfirmDescription={<>Are you sure you want to delete person '{displayName}'? This action cannot be undone.</>}
    >
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PersonForm
            value={v}
            onChange={setV}
            onSubmit={() => saveMut.mutate()}
            submitLabel="Save"
            disabled={saveMut.isPending}
            errorText={saveMut.isError ? "Failed to save." : null}
          />
          {delMut.isError ? <div className="mt-2 text-sm text-red-600">Failed to delete.</div> : null}
        </CardContent>
      </Card>
    </DetailPageLayout>
  );
}

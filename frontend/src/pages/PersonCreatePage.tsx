import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailPageLayout } from "@/components/layout/DetailPageLayout";

import { createPerson } from "@/api/persons";
import { PersonForm, type PersonFormValue } from "@/featured/persons/PersonForm";

const empty: PersonFormValue = {
  firstName: "",
  lastName: "",
  nickname: "",
  birthDate: "",
  phone: "",
  email: "",
  note: "",
};

export function PersonCreatePage() {
  const [v, setV] = useState<PersonFormValue>(empty);
  const qc = useQueryClient();
  const nav = useNavigate();

  const mut = useMutation({
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
    onSuccess: async (created) => {
      await qc.invalidateQueries({ queryKey: ["persons"] });
      nav(`/persons/${created.id}`);
    },
  });

  return (
    <DetailPageLayout
      title="New person"
      backLink="/persons"
      backLabel="Back"
    >
      <Card>
        <CardHeader>
          <CardTitle>Create</CardTitle>
        </CardHeader>
        <CardContent>
          <PersonForm
            value={v}
            onChange={setV}
            onSubmit={() => mut.mutate()}
            submitLabel="Create"
            disabled={mut.isPending}
            errorText={mut.isError ? "Failed to create person." : null}
          />
        </CardContent>
      </Card>
    </DetailPageLayout>
  );
}

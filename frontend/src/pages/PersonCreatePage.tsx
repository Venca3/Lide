import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      }),
    onSuccess: async (created) => {
      await qc.invalidateQueries({ queryKey: ["persons"] });
      nav(`/persons/${created.id}`);
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">New person</h1>
        <Button variant="outline" asChild>
          <Link to="/persons">Zpět</Link>
        </Button>
      </div>

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
            errorText={mut.isError ? "Nepodařilo se vytvořit osobu." : null}
          />
        </CardContent>
      </Card>
    </div>
  );
}

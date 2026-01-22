import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { getPersons } from "@/api/persons";

export function PersonsPage() {
  const [q, setQ] = useState("");

  // malý debounce bez knihovny (krátký krok)
  const [debouncedQ, setDebouncedQ] = useState("");
  useMemo(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const personsQuery = useQuery({
    queryKey: ["persons", debouncedQ],
    queryFn: () => getPersons(debouncedQ),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Persons</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Hledej (q)..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          {personsQuery.isLoading && <div>Načítám…</div>}
          {personsQuery.isError && (
            <div className="text-sm text-red-600">
              Chyba při načítání persons.
            </div>
          )}

          {personsQuery.data && (
            <div className="space-y-2">
              {personsQuery.data.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div>{p.nickname}</div>
                  <Link className="text-sm underline" to={`/persons/${p.id}`}>
                    Detail
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

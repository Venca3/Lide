import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { listPersonsPaged, type PagedResult, type PersonDto } from "@/api/persons";

export function PersonsPage() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useMemo(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const [page, setPage] = useState(0);
  const [size] = useState(20);

  const personsQuery = useQuery<PagedResult<PersonDto>, Error>({
    queryKey: ["persons", debouncedQ, page, size],
    queryFn: () => listPersonsPaged(debouncedQ, page, size),
  });

  const items = personsQuery.data?.items ?? [];
  const total = personsQuery.data?.total ?? 0;

  const display = (p: PersonDto) =>
    p.nickname ?? ([p.firstName, p.lastName].filter(Boolean).join(" ") || "Person");

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
              {items.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div>{display(p)}</div>
                  <Link className="text-sm underline" to={`/persons/${p.id}`}>
                    Detail
                  </Link>
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-sm text-muted-foreground">Nic nenalezeno</div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="text-sm">Celkem: {total}</div>
                <div className="space-x-2">
                  <button
                    className="btn"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    Prev
                  </button>
                  <span className="text-sm">Stránka {page + 1}</span>
                  <button
                    className="btn"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={(page + 1) * size >= total}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { getPersonRead } from "@/api/personRead";
import { removeTagFromPerson } from "@/api/personTags";
import { AddTagDialog } from "@/featured/tags/AddTagDialog";

import { removeEntryFromPerson } from "@/api/personEntries";
import { AddEntryDialog } from "@/featured/entries/AddEntryDialog";


function displayName(p: {
  nickname?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}) {
  return (
    p.nickname ||
    [p.firstName, p.lastName].filter(Boolean).join(" ") ||
    "Person"
  );
}

export function PersonDetailPage() {
  const { id } = useParams();
  const personId = id ?? "";

  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["personread", personId],
    queryFn: () => getPersonRead(personId),
    enabled: !!personId,
  });

  const removeTagMut = useMutation({
    mutationFn: (tagId: string) => removeTagFromPerson(personId, tagId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["personread", personId] });
    },
  });

  const removeEntryMut = useMutation({
    mutationFn: (x: { entryId: string; role: string | null | undefined }) =>
      removeEntryFromPerson(personId, x.entryId, x.role),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["personread", personId] });
    },
  });


  if (!personId) return <div>Chybí ID v URL.</div>;
  if (q.isLoading) return <div>Načítám detail…</div>;
  if (q.isError) return <div className="text-red-600">Chyba při načítání detailu.</div>;

  const p = q.data!;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{displayName(p)}</h1>
          <div className="text-sm text-muted-foreground font-mono">{p.id}</div>
        </div>

        <Button variant="outline" asChild>
          <Link to="/persons">Zpět</Link>
        </Button>
      </div>

      {/* TAGS - jediná sekce */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Tags</CardTitle>
          <AddTagDialog personId={personId} existingTagIds={p.tags.map(t => t.id)} disabled={q.isLoading} />

        </CardHeader>

        <CardContent className="flex flex-wrap gap-2">
          {p.tags.length === 0 && (
            <div className="text-sm text-muted-foreground">Žádné tagy</div>
          )}

          {p.tags.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
            >
              {t.name}
              <button
                className="opacity-70 hover:opacity-100"
                title="Remove"
                onClick={() => removeTagMut.mutate(t.id)}
                disabled={removeTagMut.isPending}
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Entries</CardTitle>
          <AddEntryDialog
            personId={personId}
            existingPairs={p.entries.map(e => ({ entryId: e.id, role: e.role }))}
            disabled={q.isLoading}
          />
        </CardHeader>

        <CardContent className="space-y-2 text-sm">
          {p.entries.length === 0 && (
            <div className="text-muted-foreground">Žádné entries</div>
          )}

          {p.entries.map((e, idx) => (
            <div key={`${e.id}::${e.role ?? ""}::${idx}`} className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium truncate">{e.title}</div>
                <div className="text-muted-foreground">
                  {e.type}
                  {e.role ? ` • role: ${e.role}` : ""}
                  {e.occurredAt ? ` • ${e.occurredAt}` : ""}
                </div>
                {e.content ? <div className="mt-1 whitespace-pre-wrap">{e.content}</div> : null}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={removeEntryMut.isPending}
                  onClick={() => removeEntryMut.mutate({ entryId: e.id, role: e.role })}
                >
                  Remove
                </Button>


                <div className="font-mono text-xs text-muted-foreground">
                  {e.id.slice(0, 8)}…
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Relations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-2">
            <div className="font-medium">Outgoing</div>
            {p.relationsOut.length === 0 && (
              <div className="text-muted-foreground">Žádné</div>
            )}
            {p.relationsOut.map((r) => (
              <div key={r.id} className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">
                    {r.type} → {r.otherPersonDisplayName ?? r.toPersonId}
                  </div>
                  <div className="text-muted-foreground">
                    {r.validFrom ?? "?"}
                    {r.validTo ? ` – ${r.validTo}` : ""}
                    {r.note ? ` • ${r.note}` : ""}
                  </div>
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  {r.id.slice(0, 8)}…
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="font-medium">Incoming</div>
            {p.relationsIn.length === 0 && (
              <div className="text-muted-foreground">Žádné</div>
            )}
            {p.relationsIn.map((r) => (
              <div key={r.id} className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">
                    {r.type} ← {r.otherPersonDisplayName ?? r.fromPersonId}
                  </div>
                  <div className="text-muted-foreground">
                    {r.validFrom ?? "?"}
                    {r.validTo ? ` – ${r.validTo}` : ""}
                    {r.note ? ` • ${r.note}` : ""}
                  </div>
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  {r.id.slice(0, 8)}…
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

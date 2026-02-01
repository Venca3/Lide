import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { listPersonsPaged, type PersonDto } from "@/api/persons";
import { getPersonDisplayName } from "@/lib/person";

interface AddPersonRelationDialogProps {
  buttonLabel?: string;
  onAdd: (personId: string, type: string, validFrom: string | null, validTo: string | null, note: string | null) => void | Promise<void>;
  disabled?: boolean;
  isPending?: boolean;
  errorMessage?: string;
  currentPersonId: string;
}

export function AddPersonRelationDialog({
  buttonLabel = "Add relation",
  onAdd,
  disabled,
  isPending,
  errorMessage,
  currentPersonId,
}: AddPersonRelationDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [relationType, setRelationType] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [note, setNote] = useState("");

  const { data: personsData, isLoading } = useQuery({
    queryKey: ["persons"],
    queryFn: () => listPersonsPaged(undefined, 0, 200),
    enabled: open,
  });

  const lowerQuery = searchQuery.toLowerCase();
  const filteredPersons = (personsData?.items || [])
    .filter((p: PersonDto) => {
      if (p.id === currentPersonId) return false;
      if (!searchQuery) return true;
      
      const displayName = getPersonDisplayName(p).toLowerCase();
      const firstName = (p.firstName || "").toLowerCase();
      const lastName = (p.lastName || "").toLowerCase();
      const nickname = (p.nickname || "").toLowerCase();
      
      return displayName.includes(lowerQuery) || 
             firstName.includes(lowerQuery) || 
             lastName.includes(lowerQuery) || 
             nickname.includes(lowerQuery);
    });

  const handleAdd = async () => {
    if (!selectedPersonId || !relationType.trim()) return;
    await onAdd(
      selectedPersonId,
      relationType.trim(),
      validFrom.trim() || null,
      validTo.trim() || null,
      note.trim() || null
    );
    setOpen(false);
    setSearchQuery("");
    setSelectedPersonId(null);
    setRelationType("");
    setValidFrom("");
    setValidTo("");
    setNote("");
  };

  const selectedPerson = filteredPersons.find((p: PersonDto) => p.id === selectedPersonId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled}>
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Relation</DialogTitle>
          <DialogDescription>
            Search for a person and define the relationship.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Person selection */}
          <div>
            <label className="text-sm font-medium">Search Person *</label>
            <Input
              placeholder="Search by name or nickname..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isPending}
            />
            {isLoading && (
              <div className="mt-2 text-sm text-muted-foreground">Loading...</div>
            )}
            {!isLoading && filteredPersons.length === 0 && (
              <div className="mt-2 text-sm text-muted-foreground">No persons found</div>
            )}
            {filteredPersons.length > 0 && (
              <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded border p-2">
                {filteredPersons.map((person: PersonDto) => (
                  <button
                    key={person.id}
                    type="button"
                    className={`w-full rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted ${
                      selectedPersonId === person.id ? "bg-muted font-medium" : ""
                    }`}
                    onClick={() => setSelectedPersonId(person.id)}
                    disabled={isPending}
                  >
                    <div>
                      {person.firstName || ""} {person.lastName || ""}
                    </div>
                    {(person.birthDate || person.nickname) && (
                      <div className="text-xs text-muted-foreground">
                        {person.birthDate && person.birthDate.split("-")[0]}
                        {person.birthDate && person.nickname && " • "}
                        {person.nickname && person.nickname}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected person confirmation */}
          {selectedPerson && (
            <div className="rounded border bg-muted/50 p-3">
              <div className="text-sm font-medium">Selected:</div>
              <div>
                {selectedPerson.firstName || ""} {selectedPerson.lastName || ""}
              </div>
              {(selectedPerson.birthDate || selectedPerson.nickname) && (
                <div className="text-xs text-muted-foreground">
                  {selectedPerson.birthDate && selectedPerson.birthDate.split("-")[0]}
                  {selectedPerson.birthDate && selectedPerson.nickname && " • "}
                  {selectedPerson.nickname && selectedPerson.nickname}
                </div>
              )}
            </div>
          )}

          {/* Relation details */}
          <div>
            <label className="text-sm font-medium">Relation Type *</label>
            <Input
              placeholder="e.g., parent, child, spouse, sibling..."
              value={relationType}
              onChange={(e) => setRelationType(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Valid From</label>
            <Input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Valid To</label>
            <Input
              type="date"
              value={validTo}
              onChange={(e) => setValidTo(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Note</label>
            <Input
              placeholder="Optional note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isPending}
            />
          </div>

          <Button
            onClick={handleAdd}
            disabled={!selectedPersonId || !relationType.trim() || isPending}
          >
            {isPending ? "Creating..." : "Create Relation"}
          </Button>

          {errorMessage && (
            <div className="text-sm text-red-600">{errorMessage}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

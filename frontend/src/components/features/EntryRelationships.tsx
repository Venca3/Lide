import type { EntryDetailView } from "@/api/entryRead";
import { EntryPersonRelationshipCard } from "./EntryPersonRelationshipCard";
import { EntryMediaRelationshipCard } from "./EntryMediaRelationshipCard";
import { EntryTagRelationshipCard } from "./EntryTagRelationshipCard";

interface EntryRelationshipsProps {
  entry: EntryDetailView;
}

export function EntryRelationships({ entry }: EntryRelationshipsProps) {
  return (
    <div className="space-y-4">
      <EntryTagRelationshipCard entry={entry} /> 
      <EntryPersonRelationshipCard entry={entry} />
      <EntryMediaRelationshipCard entry={entry} />
    </div>
  );
}
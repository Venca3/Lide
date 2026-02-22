import { PersonTagRelationshipCard } from "./PersonTagRelationshipCard";
import { PersonEntryRelationshipCard } from "./PersonEntryRelationshipCard";
import { PersonRelationRelationshipCard } from "./PersonRelationRelationshipCard";

interface Props {
  personId: string;
}

export function PersonRelationships({ personId }: Props) {
  return (
    <div className="space-y-6">
      <PersonTagRelationshipCard personId={personId} />
      <PersonEntryRelationshipCard personId={personId} />
      <PersonRelationRelationshipCard personId={personId} direction="out" />
      <PersonRelationRelationshipCard personId={personId} direction="in" />
    </div>
  );
}

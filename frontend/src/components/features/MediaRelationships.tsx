import { MediaEntryRelationshipCard } from "./MediaEntryRelationshipCard";

interface MediaRelationshipsProps {
  mediaId: string;
}

export function MediaRelationships({ mediaId }: MediaRelationshipsProps) {
  return (
    <div className="space-y-4">
      <MediaEntryRelationshipCard mediaId={mediaId} />
    </div>
  );
}
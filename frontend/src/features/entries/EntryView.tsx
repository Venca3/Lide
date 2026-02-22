import type { EntryDto } from "@/api/entries";
import { formatDateTime } from "@/lib/dateFormat";
import { UI_LABELS } from "@/lib/constants";

type EntryViewProps = {
  entry: EntryDto;
};

export function EntryView({ entry }: EntryViewProps) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-muted-foreground">{UI_LABELS.TYPE}</div>
        <div>{entry.type || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{UI_LABELS.TITLE}</div>
        <div>{entry.title || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{UI_LABELS.OCCURRED_AT}</div>
        <div>{formatDateTime(entry.occurredAt) || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{UI_LABELS.CONTENT}</div>
        <div className="whitespace-pre-wrap">{entry.content || "-"}</div>
      </div>
    </div>
  );
}
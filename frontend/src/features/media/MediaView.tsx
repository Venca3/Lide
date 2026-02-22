import type { MediaDto } from "@/api/media";
import { formatDateTime } from "@/lib/dateFormat";
import { UI_LABELS } from "@/lib/constants";

type MediaViewProps = {
  media: MediaDto;
};

export function MediaView({ media }: MediaViewProps) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-muted-foreground">{UI_LABELS.MEDIA_TYPE}</div>
        <div>{media.mediaType || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">URI</div>
        <div className="break-all">{media.uri || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{UI_LABELS.MIME_TYPE}</div>
        <div>{media.mimeType || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{UI_LABELS.TITLE}</div>
        <div>{media.title || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{UI_LABELS.TAKEN_AT}</div>
        <div>{formatDateTime(media.takenAt) || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{UI_LABELS.NOTE}</div>
        <div className="whitespace-pre-wrap">{media.note || "-"}</div>
      </div>
    </div>
  );
}
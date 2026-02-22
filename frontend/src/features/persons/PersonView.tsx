import { formatDate } from "@/lib/dateFormat";
import type { PersonRead } from "@/api/personRead";

type PersonViewProps = {
  person: PersonRead;
};

export function PersonView({ person }: PersonViewProps) {
  return (
    <>
      <div>
        <div className="text-sm text-muted-foreground">First name</div>
        <div>{person.firstName || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Last name</div>
        <div>{person.lastName || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Nickname</div>
        <div>{person.nickname || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Birth date</div>
        <div>{formatDate(person.birthDate) || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Phone</div>
        <div>{person.phone || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Email</div>
        <div>{person.email || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Note</div>
        <div className="whitespace-pre-wrap">{person.note || "-"}</div>
      </div>
    </>
  );
}

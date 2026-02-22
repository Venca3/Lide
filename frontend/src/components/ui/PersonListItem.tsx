import { getPersonDisplayName } from "@/lib/person";

type PersonProps = {
  person: any;
};

export function PersonListItem({ person }: PersonProps) {
  const name = getPersonDisplayName({ firstName: person.firstName, lastName: person.lastName, nickname: person.nickname });
  const birth = person.birthDate ? person.birthDate.split("-")[0] : null;

  return (
    <>
      <div className="font-medium">{name}</div>
      {(birth || person.nickname) && (
        <div className="text-xs text-muted-foreground">
          {birth}
          {birth && person.nickname && " • "}
          {person.nickname && person.nickname}
        </div>
      )}
    </>
  );
}

export default PersonListItem;

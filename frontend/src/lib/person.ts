export function getPersonDisplayName(p: {
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

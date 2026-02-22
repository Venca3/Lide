export function getPersonDisplayName(p: {
  nickname?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}) {
  const fullName = [p.firstName, p.lastName].filter(Boolean).join(" ").trim();
  const nickname = p.nickname?.trim();
  if (fullName && nickname) return `${fullName} (${nickname})`;
  if (fullName) return fullName;
  if (nickname) return nickname;
  return "Unnamed";
}

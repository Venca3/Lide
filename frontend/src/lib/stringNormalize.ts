/**
 * Normalize string: trim, lowercase, replace multiple spaces with single space
 * @param str - String to normalize
 * @returns Normalized string, empty string if null/undefined
 */
export function normalizeString(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

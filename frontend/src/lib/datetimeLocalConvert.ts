/**
 * Convert ISO 8601 datetime string (e.g., "2023-07-15T10:30:00Z" or "2023-07-15T10:30:00")
 * to datetime-local format (e.g., "2023-07-15T10:30")
 * 
 * @param isoDateTime - DateTime in ISO 8601 format
 * @returns Datetime string suitable for datetime-local input, or empty string if invalid
 */
export function isoToDatetimeLocal(isoDateTime: string | null | undefined): string {
  if (!isoDateTime) return "";

  try {
    // Remove timezone indicator (Z or ±HH:mm)
    let normalized = isoDateTime.replace(/Z$/, "").replace(/[+-]\d{2}:\d{2}$/, "");
    
    // Extract date and time part (YYYY-MM-DDTHH:mm:ss or similar)
    const match = normalized.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
    if (!match) return "";
    
    return match[1]; // Returns YYYY-MM-DDTHH:mm
  } catch {
    return "";
  }
}

/**
 * Convert datetime-local format (e.g., "2023-07-15T10:30")
 * to ISO 8601 format with Z suffix (e.g., "2023-07-15T10:30:00Z")
 * 
 * @param datetimeLocalValue - Datetime from datetime-local input
 * @returns ISO 8601 datetime string with Z suffix
 */
export function datetimeLocalToIso(datetimeLocalValue: string | null | undefined): string | null {
  if (!datetimeLocalValue || !datetimeLocalValue.trim()) return null;

  try {
    // Parse the datetime-local value as UTC (browser interprets it as local)
    // But we want to treat it as UTC, so we append Z
    return datetimeLocalValue + ":00Z";
  } catch {
    return null;
  }
}

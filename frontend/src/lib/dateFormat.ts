/**
 * Formats a date string (YYYY-MM-DD) to Czech format (dd. mm. rrrr)
 * @param dateString - Date in ISO format (YYYY-MM-DD)
 * @returns Formatted date string or null if invalid
 */
export function formatDate(dateString: string | null | undefined): string | null {
  if (!dateString) return null;
  
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;
  
  const [year, month, day] = parts;
  return `${day}. ${month}. ${year}`;
}

/**
 * Formats a datetime string (ISO 8601) to Czech format (dd. mm. rrrr hh:mm or dd. mm. rrrr hh:mm:ss)
 * @param datetimeString - DateTime in ISO format
 * @returns Formatted datetime string or null if invalid
 */
export function formatDateTime(datetimeString: string | null | undefined): string | null {
  if (!datetimeString) return null;
  
  try {
    const date = new Date(datetimeString);
    if (isNaN(date.getTime())) return datetimeString;
    
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    
    // If seconds are not zero, include them
    if (seconds !== "00") {
      return `${day}. ${month}. ${year} ${hours}:${minutes}:${seconds}`;
    }
    
    return `${day}. ${month}. ${year} ${hours}:${minutes}`;
  } catch {
    return datetimeString;
  }
}

/**
 * Formats a date or datetime string intelligently based on content
 * @param dateString - Date or DateTime string
 * @returns Formatted string or null if invalid
 */
export function formatDateOrDateTime(dateString: string | null | undefined): string | null {
  if (!dateString) return null;
  
  // If contains time component (T or space with time), use datetime format
  if (dateString.includes("T") || /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(dateString)) {
    return formatDateTime(dateString);
  }
  
  // Otherwise use date format
  return formatDate(dateString);
}

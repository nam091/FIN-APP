/**
 * Utility to get current date string in YYYY-MM-DD format based on local time.
 * Avoiding toISOString() which returns UTC.
 */
export function getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Safely parse a YYYY-MM-DD string into a Date object at local midnight.
 */
export function parseLocalDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Format date string for display (DD/MM/YYYY)
 */
export function formatDisplayDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    return `${day}/${month}/${year}`;
}

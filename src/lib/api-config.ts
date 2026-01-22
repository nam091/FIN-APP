/**
 * API Configuration for Capacitor Mobile App
 * 
 * When running as a native app, API calls need to go to the deployed backend
 * instead of relative paths.
 */

// Check if running in Capacitor native environment
const isCapacitor = typeof window !== 'undefined' &&
    (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();

// Base URL for API calls
// In development: use relative paths (Vercel handles this)
// In Capacitor: use the deployed Vercel URL
export const API_BASE_URL = isCapacitor
    ? (process.env.NEXT_PUBLIC_API_URL || 'https://fin-app-hazel.vercel.app')
    : '';

/**
 * Helper function to construct API URLs
 * @param path - API path starting with /api/
 * @returns Full URL for the API endpoint
 */
export function getApiUrl(path: string): string {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
}

/**
 * Wrapper for fetch that handles the API base URL
 */
export async function apiFetch(
    path: string,
    options?: RequestInit
): Promise<Response> {
    const url = getApiUrl(path);

    // Add credentials for cross-origin requests in Capacitor
    const fetchOptions: RequestInit = {
        ...options,
        credentials: isCapacitor ? 'include' : 'same-origin',
    };

    return fetch(url, fetchOptions);
}

export { isCapacitor };

/**
 * Get the base URL for the application
 * This handles different deployment environments (localhost, Vercel, custom domain)
 */
export function getBaseUrl(): string {
  // Client-side: use window.location.origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Server-side environment variable checks
  // 1. Check for Vercel production environment first
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 2. Check for custom domain in Vercel
  if (
    process.env.VERCEL_ENV === "production" &&
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  // 3. Check for explicitly set public URL (but only if not localhost in production)
  if (
    process.env.NEXT_PUBLIC_BASE_URL &&
    (!process.env.VERCEL ||
      !process.env.NEXT_PUBLIC_BASE_URL.includes("localhost"))
  ) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // 4. Check for any Vercel URL (preview or development)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 5. Default to localhost for local development
  return "http://localhost:3000";
}

/**
 * Generate a full URL for a file served from GridFS
 */
export function getFileUrl(
  fileId: string,
  fileType: "photos" | "melodies"
): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/api/files/${fileType}/${fileId}`;
}

/**
 * Extract file ID from a full URL
 */
export function extractFileId(url: string): string | null {
  const match = url.match(/\/api\/files\/(?:photos|melodies)\/([a-f0-9]{24})$/);
  return match ? match[1] : null;
}

/**
 * Smart URL handler - converts either file ID or full URL to proper file URL
 * Handles legacy data that might contain full URLs
 */
export function getPhotoUrl(urlOrId: string): string {
  // If it's already a full URL, extract the file ID first
  if (urlOrId.includes("/api/files/")) {
    const fileId = extractFileId(urlOrId);
    if (fileId) {
      return getFileUrl(fileId, "photos");
    }
    // If we can't extract ID, return as-is (fallback)
    return urlOrId;
  }

  // If it's just a file ID (24 character hex string)
  if (/^[a-f0-9]{24}$/i.test(urlOrId)) {
    return getFileUrl(urlOrId, "photos");
  }

  // Fallback: return as-is if we can't determine the format
  return urlOrId;
}

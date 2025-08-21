/**
 * Get the base URL for the application
 * This handles different deployment environments (localhost, Vercel, custom domain)
 */
export function getBaseUrl(): string {
  // 1. Check for explicitly set public URL (highest priority)
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // 2. Check for Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. Check for custom domain in Vercel
  if (
    process.env.VERCEL_ENV === "production" &&
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  // 4. Default to localhost for development
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

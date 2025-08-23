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

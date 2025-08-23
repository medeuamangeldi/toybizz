import { heicTo } from "heic-to/csp";

export interface ConvertedFile {
  uid: string;
  name: string;
  type: string;
  size: number;
  originFileObj: File;
}

/**
 * Process and convert files similar to the working HEIC approach
 * Handles HEIC conversion and file validation
 */
export async function processUploadFiles(
  fileList: File[]
): Promise<ConvertedFile[]> {
  const convertedList = await Promise.all(
    fileList.map(async (file, index): Promise<ConvertedFile | null> => {
      const mimeType = file.type;
      const fileName = file.name.toLowerCase();

      const isHEIC = mimeType === "image/heic" || fileName.endsWith(".heic");
      const isJPEG = mimeType === "image/jpeg" || mimeType === "image/jpg";
      const isPNG = mimeType === "image/png";
      const isWebP = mimeType === "image/webp";
      const isGIF = mimeType === "image/gif";
      const isAVIF = mimeType === "image/avif" || fileName.endsWith(".avif");
      const isUnder50MB = file.size / 1024 / 1024 <= 50;

      if (!isUnder50MB) {
        throw new Error(`${file.name} превышает лимит 50MB.`);
      }

      // Handle fake HEIC files (actually JPEG with .heic extension)
      if (fileName.endsWith(".heic") && mimeType === "image/jpeg") {
        return {
          uid: `${Date.now()}-${index}`,
          name: file.name,
          type: file.type,
          size: file.size,
          originFileObj: file,
        };
      }

      if (isHEIC) {
        try {
          const convertedBlob = await heicTo({
            blob: file,
            type: "image/jpeg",
            quality: 0.9,
          });

          const convertedFile = new File(
            [convertedBlob],
            file.name.replace(/\.heic$/i, ".jpeg"),
            {
              type: "image/jpeg",
              lastModified: file.lastModified,
            }
          );

          return {
            uid: `${Date.now()}-${index}`,
            name: convertedFile.name,
            type: convertedFile.type,
            size: convertedFile.size,
            originFileObj: convertedFile,
          };
        } catch (err: unknown) {
          console.error("heic-to conversion failed:", err);
          const errorMessage = err instanceof Error ? err.message : String(err);
          if (errorMessage.includes("HEIF image not found")) {
            // Treat as regular file if not actually HEIC
            return {
              uid: `${Date.now()}-${index}`,
              name: file.name,
              type: file.type,
              size: file.size,
              originFileObj: file,
            };
          }
          throw new Error(`Не удалось конвертировать ${file.name}`);
        }
      }

      if (isJPEG || isPNG || isWebP || isGIF || isAVIF) {
        return {
          uid: `${Date.now()}-${index}`,
          name: file.name,
          type: file.type,
          size: file.size,
          originFileObj: file,
        };
      }

      throw new Error(
        `${file.name} не является поддерживаемым форматом изображения.`
      );
    })
  );

  return convertedList.filter(Boolean) as ConvertedFile[];
}

/**
 * Validate file types before upload
 */
export function validateFileTypes(files: File[]): {
  valid: File[];
  invalid: File[];
  warnings: string[];
} {
  const valid: File[] = [];
  const invalid: File[] = [];
  const warnings: string[] = [];

  const supportedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
    "image/avif",
  ];

  files.forEach((file) => {
    const isSupported =
      supportedTypes.includes(file.type.toLowerCase()) ||
      file.name.toLowerCase().endsWith(".heic") ||
      file.name.toLowerCase().endsWith(".heif") ||
      file.name.toLowerCase().endsWith(".avif");

    if (isSupported) {
      valid.push(file);

      // Add warnings for modern formats
      if (
        file.type.toLowerCase().includes("heic") ||
        file.name.toLowerCase().endsWith(".heic")
      ) {
        warnings.push(`HEIC файл "${file.name}" будет конвертирован в JPEG`);
      }
      if (
        file.type.toLowerCase().includes("avif") ||
        file.name.toLowerCase().endsWith(".avif")
      ) {
        warnings.push(
          `AVIF файл "${file.name}" поддерживается современными браузерами`
        );
      }
    } else {
      invalid.push(file);
    }
  });

  return { valid, invalid, warnings };
}

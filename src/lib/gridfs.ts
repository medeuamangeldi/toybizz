import { GridFSBucket, ObjectId, Db } from "mongodb";
import { connectToDatabase } from "./database";
import { Readable } from "stream";

export interface GridFSFileDocument {
  _id: ObjectId;
  filename: string;
  contentType: string;
  length: number;
  chunkSize: number;
  uploadDate: Date;
  metadata: {
    eventId: string;
    fileType: "photo" | "melody";
    originalName: string;
    uploadDate: Date;
    fileSize: number;
    uploadedBy: string;
    version: string;
  };
}

export interface FileUploadOptions {
  eventId: string;
  fileType: "photo" | "melody";
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

export interface FileMetadata {
  fileId: ObjectId;
  url: string;
  filename: string;
  contentType: string;
  fileSize: number;
  uploadDate: Date;
  eventId: string;
  fileType: "photo" | "melody";
}

export interface FileUploadResult {
  success: boolean;
  file?: FileMetadata;
  error?: string;
}

export class GridFSFileManager {
  private db: Db | null = null;
  private photosBucket: GridFSBucket | null = null;
  private melodiesBucket: GridFSBucket | null = null;

  // Initialize connection and buckets
  async init() {
    if (!this.db) {
      const { db } = await connectToDatabase();
      this.db = db;
      this.photosBucket = new GridFSBucket(db, { bucketName: "photos" });
      this.melodiesBucket = new GridFSBucket(db, { bucketName: "melodies" });
    }
  }

  // Convert File to Buffer
  private async fileToBuffer(file: File): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  // Validate file before upload
  private validateFile(
    file: File,
    options: FileUploadOptions
  ): { valid: boolean; error?: string } {
    // Check file size
    const maxSize =
      options.maxSize ||
      (options.fileType === "photo" ? 5 * 1024 * 1024 : 10 * 1024 * 1024);
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File ${file.name} is too large. Maximum size is ${Math.round(
          maxSize / (1024 * 1024)
        )}MB.`,
      };
    }

    // Check file type
    const allowedTypes =
      options.allowedTypes ||
      (options.fileType === "photo"
        ? ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        : ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"]);

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not supported for ${options.fileType}s.`,
      };
    }

    return { valid: true };
  }

  // Upload single file to GridFS
  async uploadFile(
    file: File,
    options: FileUploadOptions
  ): Promise<FileUploadResult> {
    try {
      await this.init();

      // Validate file
      const validation = this.validateFile(file, options);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      const bucket =
        options.fileType === "photo"
          ? this.photosBucket!
          : this.melodiesBucket!;
      const buffer = await this.fileToBuffer(file);

      console.log(
        `📤 Uploading ${options.fileType}: ${file.name} (${file.size} bytes)`
      );

      const result = await new Promise<{ fileId: ObjectId; url: string }>(
        (resolve, reject) => {
          const filename = `${options.eventId}_${
            options.fileType
          }_${Date.now()}_${file.name}`;

          const uploadStream = bucket.openUploadStream(filename, {
            contentType: file.type,
            metadata: {
              eventId: options.eventId,
              fileType: options.fileType,
              originalName: file.name,
              uploadDate: new Date(),
              fileSize: file.size,
              // Additional metadata for better organization
              uploadedBy: "web-interface",
              version: "1.0",
            },
          });

          uploadStream.on("finish", () => {
            const fileId = uploadStream.id as ObjectId;
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
            const url = `${baseUrl}/api/files/${
              options.fileType === "photo" ? "photos" : "melodies"
            }/${fileId}`;
            resolve({ fileId, url });
          });

          uploadStream.on("error", (error) => {
            console.error(`❌ Error uploading ${options.fileType}:`, error);
            reject(error);
          });

          const readable = new Readable();
          readable.push(buffer);
          readable.push(null);
          readable.pipe(uploadStream);
        }
      );

      const fileMetadata: FileMetadata = {
        fileId: result.fileId,
        url: result.url,
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
        uploadDate: new Date(),
        eventId: options.eventId,
        fileType: options.fileType,
      };

      console.log(
        `✅ ${options.fileType} uploaded successfully: ${result.fileId}`
      );

      return {
        success: true,
        file: fileMetadata,
      };
    } catch (error) {
      console.error(`❌ Failed to upload ${options.fileType}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  // Upload multiple photos
  async uploadPhotos(photos: File[], eventId: string): Promise<FileMetadata[]> {
    const results: FileMetadata[] = [];

    for (let i = 0; i < photos.length; i++) {
      const result = await this.uploadFile(photos[i], {
        eventId,
        fileType: "photo",
      });

      if (result.success && result.file) {
        results.push(result.file);
      } else {
        throw new Error(result.error || `Failed to upload photo ${i + 1}`);
      }
    }

    return results;
  }

  // Upload melody
  async uploadMelody(melody: File, eventId: string): Promise<FileMetadata> {
    const result = await this.uploadFile(melody, {
      eventId,
      fileType: "melody",
    });

    if (result.success && result.file) {
      return result.file;
    } else {
      throw new Error(result.error || "Failed to upload melody");
    }
  }

  // Get file metadata by ID
  async getFileMetadata(
    fileId: string,
    fileType: "photo" | "melody"
  ): Promise<GridFSFileDocument | null> {
    await this.init();

    const collectionName =
      fileType === "photo" ? "photos.files" : "melodies.files";
    return (await this.db!.collection(collectionName).findOne({
      _id: new ObjectId(fileId),
    })) as GridFSFileDocument | null;
  }

  // Delete file from GridFS
  async deleteFile(
    fileId: string,
    fileType: "photo" | "melody"
  ): Promise<boolean> {
    try {
      await this.init();

      const bucket =
        fileType === "photo" ? this.photosBucket! : this.melodiesBucket!;
      await bucket.delete(new ObjectId(fileId));

      console.log(`🗑️  Deleted ${fileType}: ${fileId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to delete ${fileType}:`, error);
      return false;
    }
  }

  // Get all files for an event
  async getEventFiles(
    eventId: string
  ): Promise<{ photos: GridFSFileDocument[]; melodies: GridFSFileDocument[] }> {
    await this.init();

    const photos = (await this.db!.collection("photos.files")
      .find({
        "metadata.eventId": eventId,
      })
      .toArray()) as GridFSFileDocument[];

    const melodies = (await this.db!.collection("melodies.files")
      .find({
        "metadata.eventId": eventId,
      })
      .toArray()) as GridFSFileDocument[];

    return { photos, melodies };
  }

  // Clean up orphaned files (files without associated events)
  async cleanupOrphanedFiles(): Promise<{
    deletedPhotos: number;
    deletedMelodies: number;
  }> {
    await this.init();

    // This would typically run as a scheduled job
    // For now, just return a placeholder
    return { deletedPhotos: 0, deletedMelodies: 0 };
  }
}

// Export singleton instance
export const fileManager = new GridFSFileManager();

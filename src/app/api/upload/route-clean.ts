import { NextRequest, NextResponse } from "next/server";
import { GridFSBucket } from "mongodb";
import { connectToDatabase } from "@/lib/database";
import { Readable } from "stream";
import { heicTo } from "heic-to/csp";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/heic",
      "image/heif",
      "image/avif",
    ];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return new NextResponse(
        `Invalid file type: ${file.type}. Only images are allowed (JPEG, PNG, WebP, GIF, HEIC, AVIF).`,
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return new NextResponse("File too large. Maximum size is 5MB.", {
        status: 400,
      });
    }

    let db;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const connection = await connectToDatabase();
        db = connection.db;
        if (db) break;
      } catch {
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    if (!db) {
      return new NextResponse("Database connection failed", { status: 500 });
    }

    const bucket = new GridFSBucket(db, { bucketName: "photos" });
    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);
    let finalContentType = file.type;
    let fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";

    const isHeic =
      file.type.toLowerCase().includes("heic") ||
      file.type.toLowerCase().includes("heif") ||
      fileExtension === "heic" ||
      fileExtension === "heif";

    if (isHeic) {
      try {
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith(".heic") && file.type === "image/jpeg") {
          // Keep as is for fake HEIC files
        } else {
          const blob = new Blob([buffer], { type: file.type });
          const convertedBlob = await heicTo({
            blob: blob,
            type: "image/jpeg",
            quality: 0.9,
          });

          buffer = Buffer.from(await convertedBlob.arrayBuffer());
          finalContentType = "image/jpeg";
          fileExtension = "jpg";
        }
      } catch (conversionError: unknown) {
        const errorMessage =
          conversionError instanceof Error
            ? conversionError.message
            : String(conversionError);
        if (errorMessage.includes("HEIF image not found")) {
          // Keep original format
        } else {
          return new NextResponse(
            `Failed to convert HEIC file: ${errorMessage}`,
            { status: 400 }
          );
        }
      }
    }

    const stream = Readable.from(buffer);
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    const filename = `${timestamp}_${randomSuffix}.${fileExtension}`;

    const uploadStream = bucket.openUploadStream(filename, {
      contentType: finalContentType,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date(),
        size: buffer.length,
        converted: isHeic,
      },
    });

    uploadStream.on("error", (error) => {
      console.error("Error uploading photo to GridFS:", error);
    });

    stream.pipe(uploadStream);

    await new Promise((resolve, reject) => {
      uploadStream.on("finish", resolve);
      uploadStream.on("error", reject);
    });

    return NextResponse.json({
      success: true,
      url: uploadStream.id.toString(),
      filename,
      id: uploadStream.id.toString(),
    });
  } catch (error) {
    console.error("Error uploading photo:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

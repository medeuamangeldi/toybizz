import { NextRequest, NextResponse } from "next/server";
import { GridFSBucket } from "mongodb";
import { connectToDatabase } from "@/lib/database";
import { Readable } from "stream";

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return new NextResponse("Invalid file type. Only images are allowed.", {
        status: 400,
      });
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return new NextResponse("File too large. Maximum size is 5MB.", {
        status: 400,
      });
    }

    console.log("🔍 Connecting to database for photo upload...");
    const { db } = await connectToDatabase();

    if (!db) {
      console.error("❌ Database connection failed - db is undefined");
      return new NextResponse("Database connection failed", { status: 500 });
    }

    console.log("✅ Database connected, creating GridFS bucket...");
    const bucket = new GridFSBucket(db, { bucketName: "photos" });

    // Convert File to stream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop() || "jpg";
    const filename = `${timestamp}_${randomSuffix}.${extension}`;

    console.log(`📸 Uploading photo: ${filename} (${file.size} bytes)`);

    // Upload to GridFS
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date(),
        size: file.size,
      },
    });

    // Handle upload errors
    uploadStream.on("error", (error) => {
      console.error("Error uploading photo to GridFS:", error);
    });

    // Pipe the stream
    stream.pipe(uploadStream);

    // Wait for upload completion
    await new Promise((resolve, reject) => {
      uploadStream.on("finish", resolve);
      uploadStream.on("error", reject);
    });

    console.log(`✅ Photo uploaded successfully: ${filename}`);

    // Return the URL
    const photoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/files/photos/${uploadStream.id}`;

    return NextResponse.json({
      success: true,
      url: photoUrl,
      filename,
      id: uploadStream.id.toString(),
    });
  } catch (error) {
    console.error("Error uploading photo:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { GridFSBucket, ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return new NextResponse("Invalid file ID", { status: 400 });
    }

    console.log("🔍 Connecting to database for photo serving...");
    const { db } = await connectToDatabase();

    if (!db) {
      console.error("❌ Database connection failed - db is undefined");
      return new NextResponse("Database connection failed", { status: 500 });
    }

    console.log("✅ Database connected, creating GridFS bucket...");
    const bucket = new GridFSBucket(db, { bucketName: "photos" });

    // Get file metadata first
    const fileMetadata = await db
      .collection("photos.files")
      .findOne({ _id: new ObjectId(id) });

    if (!fileMetadata) {
      return new NextResponse("Photo not found", { status: 404 });
    }

    console.log(
      `📸 Serving photo: ${fileMetadata.filename} (${fileMetadata.length} bytes)`
    );

    // Create download stream
    const downloadStream = bucket.openDownloadStream(new ObjectId(id));

    // Handle stream errors
    downloadStream.on("error", (error) => {
      console.error("Error downloading photo from GridFS:", error);
    });

    // Convert stream to buffer for response
    const chunks: Buffer[] = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Create response with optimized headers
    const response = new NextResponse(buffer);

    // Content headers
    response.headers.set(
      "Content-Type",
      fileMetadata.contentType || "image/jpeg"
    );
    response.headers.set("Content-Length", buffer.length.toString());

    // Caching headers (1 year for photos) and optimize for concurrent requests
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
    response.headers.set("ETag", `"${fileMetadata._id}"`);

    // Add headers for better concurrent loading
    response.headers.set("Connection", "keep-alive");
    response.headers.set("Accept-Ranges", "bytes");

    // CORS headers for cross-origin requests
    response.headers.set("Access-Control-Allow-Origin", "*");

    // Optional: Content disposition for download
    if (request.nextUrl.searchParams.get("download") === "true") {
      response.headers.set(
        "Content-Disposition",
        `attachment; filename="${fileMetadata.filename}"`
      );
    }

    console.log(`✅ Photo served successfully: ${fileMetadata.filename}`);
    return response;
  } catch (error) {
    console.error("Error serving photo:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

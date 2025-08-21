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

    console.log("🔍 Connecting to database for melody serving...");
    const { db } = await connectToDatabase();

    if (!db) {
      console.error("❌ Database connection failed - db is undefined");
      return new NextResponse("Database connection failed", { status: 500 });
    }

    console.log("✅ Database connected, creating GridFS bucket...");
    const bucket = new GridFSBucket(db, { bucketName: "melodies" });

    // Get file metadata first
    const fileMetadata = await db
      .collection("melodies.files")
      .findOne({ _id: new ObjectId(id) });

    if (!fileMetadata) {
      return new NextResponse("Melody not found", { status: 404 });
    }

    console.log(
      `🎵 Serving melody: ${fileMetadata.filename} (${fileMetadata.length} bytes)`
    );

    // Create download stream
    const downloadStream = bucket.openDownloadStream(new ObjectId(id));

    // Handle stream errors
    downloadStream.on("error", (error) => {
      console.error("Error downloading melody from GridFS:", error);
    });

    // Convert stream to buffer for response
    const chunks: Buffer[] = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Create response with optimized headers for audio
    const response = new NextResponse(buffer);

    // Content headers
    response.headers.set(
      "Content-Type",
      fileMetadata.contentType || "audio/mpeg"
    );
    response.headers.set("Content-Length", buffer.length.toString());

    // Audio-specific headers
    response.headers.set("Accept-Ranges", "bytes");

    // Caching headers (1 year for audio files)
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
    response.headers.set("ETag", `"${fileMetadata._id}"`);

    // CORS headers for cross-origin requests
    response.headers.set("Access-Control-Allow-Origin", "*");

    // Optional: Content disposition for download
    if (request.nextUrl.searchParams.get("download") === "true") {
      response.headers.set(
        "Content-Disposition",
        `attachment; filename="${fileMetadata.filename}"`
      );
    }

    console.log(`✅ Melody served successfully: ${fileMetadata.filename}`);
    return response;
  } catch (error) {
    console.error("Error serving melody:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

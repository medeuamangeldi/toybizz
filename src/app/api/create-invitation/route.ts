import { NextRequest, NextResponse } from "next/server";
import { GridFSBucket, ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/database";
import { verifyAuth } from "@/lib/auth";
import { Readable } from "stream";
import { generateInvitation } from "@/lib/invitation-generator";

interface EventData {
  type: string;
  name: string;
  language: string;
  date: string;
  time: string;
  location: string;
  style: string;
  customStyle?: string;
  photoUrls?: string[];
  melodyUrl?: string | null;
  schedule?: { time: string; event: string }[];
}

// Helper to convert File to Buffer
async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Upload file to GridFS with enhanced metadata
async function uploadToGridFS(
  bucket: GridFSBucket,
  filename: string,
  buffer: Buffer,
  contentType: string,
  eventId: string,
  fileType: "photo" | "melody"
): Promise<{ fileId: ObjectId; url: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType,
      metadata: {
        eventId,
        fileType,
        originalName: filename,
        uploadDate: new Date(),
        fileSize: buffer.length,
      },
    });

    uploadStream.on("finish", () => {
      const fileId = uploadStream.id as ObjectId;
      // Store relative URL for flexibility
      const url = `/api/files/${
        fileType === "photo" ? "photos" : "melodies"
      }/${fileId}`;
      resolve({ fileId, url });
    });

    uploadStream.on("error", (error) => {
      console.error(`Error uploading ${fileType} to GridFS:`, error);
      reject(error);
    });

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log(`📨 Create invitation request received`);

    // Verify authentication
    const authUser = await verifyAuth(request);
    if (!authUser || !authUser.userId) {
      console.log(`❌ Authentication failed`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(
      `✅ User authenticated: ${authUser.email} (${authUser.userId})`
    );

    // Parse form data
    const formData = await request.formData();
    console.log(`📋 Form data parsed`);

    // Extract event data
    const eventData: EventData = {
      type: formData.get("type") as string,
      name: formData.get("name") as string,
      language: formData.get("language") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      location: formData.get("location") as string,
      style: formData.get("style") as string,
      customStyle: formData.get("customStyle") as string | undefined,
    };

    // Parse schedule if provided
    const scheduleData = formData.get("schedule") as string;
    if (scheduleData) {
      try {
        eventData.schedule = JSON.parse(scheduleData);
      } catch (error) {
        console.error("Error parsing schedule:", error);
        eventData.schedule = [];
      }
    }

    console.log(`📝 Event data:`, {
      type: eventData.type,
      name: eventData.name,
      language: eventData.language,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      style: eventData.style,
      hasCustomStyle: !!eventData.customStyle,
    });

    // Validate required fields
    if (
      !eventData.type ||
      !eventData.name ||
      !eventData.date ||
      !eventData.time ||
      !eventData.location
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });

    // Generate unique eventId
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    const eventId = `event_${timestamp}_${randomSuffix}`;

    console.log(`🔢 Generated eventId: ${eventId}`);

    // Process photos - they can be either uploaded URLs or files
    let photoUrls: string[] = [];

    // First check if photos are already uploaded URLs (JSON string with file IDs)
    const photosJsonString = formData.get("photos") as string | null;
    if (photosJsonString) {
      try {
        photoUrls = JSON.parse(photosJsonString);
        console.log(`📸 Using ${photoUrls.length} pre-uploaded photo IDs`);
      } catch (error) {
        console.error("Error parsing photos JSON:", error);
      }
    }

    // If no pre-uploaded photos, check for file uploads (backward compatibility)
    if (photoUrls.length === 0) {
      const photos = formData.getAll("photos") as File[];
      if (photos.length > 0) {
        console.log(`📸 Processing ${photos.length} photo files...`);
        for (const [index, photo] of photos.entries()) {
          if (photo.size > 0) {
            try {
              const buffer = await fileToBuffer(photo);
              const { fileId } = await uploadToGridFS(
                bucket,
                `photo_${index + 1}_${photo.name}`,
                buffer,
                photo.type,
                eventId,
                "photo"
              );
              photoUrls.push(fileId.toString()); // Store only the file ID
              console.log(`✅ Photo ${index + 1} uploaded with ID: ${fileId}`);
            } catch (error) {
              console.error(`❌ Error uploading photo ${index + 1}:`, error);
            }
          }
        }
      }
    }

    // Process uploaded melody
    let melodyUrl: string | null = null;
    const melody = formData.get("melody") as File | null;

    if (melody && melody.size > 0) {
      console.log(`🎵 Processing melody: ${melody.name}`);
      try {
        const buffer = await fileToBuffer(melody);
        const { url } = await uploadToGridFS(
          bucket,
          `melody_${melody.name}`,
          buffer,
          melody.type,
          eventId,
          "melody"
        );
        melodyUrl = url;
        console.log(`✅ Melody uploaded: ${url}`);
      } catch (error) {
        console.error(`❌ Error uploading melody:`, error);
      }
    }

    // Update event data with uploaded files
    eventData.photoUrls = photoUrls;
    eventData.melodyUrl = melodyUrl;

    // Generate invitation JSON content using OpenAI
    console.log(`🤖 Generating invitation content...`);
    const jsonContent = await generateInvitation(eventData, eventId);

    // Validate JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error(`❌ Invalid JSON generated:`, parseError);
      return NextResponse.json(
        { error: "Failed to generate valid invitation content" },
        { status: 500 }
      );
    }

    // Save invitation to database
    const eventsCollection = db.collection("events");

    const invitationDoc = {
      eventId: eventId,
      userId: new ObjectId(authUser.userId),
      title: eventData.name,
      name: eventData.name, // For backward compatibility
      eventType: eventData.type,
      type: eventData.type, // For backward compatibility
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      description: parsedContent.description || "",
      language: eventData.language,
      style: eventData.style,
      theme: eventData.style, // Store theme for template system
      customStyle: eventData.customStyle,
      schedule: parsedContent.schedule || eventData.schedule || [], // Add schedule to document
      rsvpText: parsedContent.rsvpText || "Подтвердить участие",
      photoUrls: photoUrls, // Photos stored separately from content
      melodyUrl: melodyUrl,
      htmlContent: jsonContent, // Keep for backward compatibility, but don't duplicate photos
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log(`💾 Saving invitation to database...`);
    const result = await eventsCollection.insertOne(invitationDoc);

    console.log(`✅ Invitation created successfully: ${result.insertedId}`);

    return NextResponse.json({
      success: true,
      eventId: eventId,
      invitationId: result.insertedId,
      photoCount: photoUrls.length,
      hasMusic: !!melodyUrl,
    });
  } catch (error) {
    console.error(`❌ Error creating invitation:`, error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

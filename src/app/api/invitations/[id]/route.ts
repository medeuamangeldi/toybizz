import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { verifyAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";

interface PageProps {
  params: Promise<{ id: string }>;
}

// GET - Fetch single invitation
export async function GET(request: NextRequest, props: PageProps) {
  try {
    const params = await props.params;
    const eventId = params.id;

    // Verify authentication
    const authUser = await verifyAuth(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const eventsCollection = db.collection("events");

    // Find invitation by eventId and user
    let invitation = await eventsCollection.findOne({
      eventId,
      userId: new ObjectId(authUser.userId),
    });

    if (!invitation) {
      // Try by _id as fallback
      try {
        invitation = await eventsCollection.findOne({
          _id: new ObjectId(eventId),
          userId: new ObjectId(authUser.userId),
        });
      } catch (err) {
        console.error("Invalid ObjectId:", err);
      }
    }

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(invitation);
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update invitation
export async function PUT(request: NextRequest, props: PageProps) {
  try {
    const params = await props.params;
    const eventId = params.id;

    // Verify authentication
    const authUser = await verifyAuth(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { contentData, theme } = body;

    if (!contentData) {
      return NextResponse.json(
        { error: "Content data is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const eventsCollection = db.collection("events");

    // Prepare update data
    const updateData = {
      htmlContent: JSON.stringify(contentData, null, 2),
      contentData: contentData,
      theme: theme || "elegant",
      title: contentData.title,
      name: contentData.title, // For backward compatibility
      date: contentData.date,
      location: contentData.location,
      updatedAt: new Date().toISOString(),
    };

    // Update invitation
    const result = await eventsCollection.updateOne(
      {
        eventId,
        userId: new ObjectId(authUser.userId),
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: result.modifiedCount > 0,
    });
  } catch (error) {
    console.error("Error updating invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

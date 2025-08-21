import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { ObjectId } from "mongodb";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export async function GET(request: NextRequest, props: PageProps) {
  try {
    const params = await props.params;
    const eventId = params.eventId;

    const { db } = await connectToDatabase();
    const eventsCollection = db.collection("events");

    // Try to find by eventId first, then by _id
    let invitation = await eventsCollection.findOne({ eventId });

    if (!invitation) {
      // If not found by eventId, try by ObjectId
      try {
        invitation = await eventsCollection.findOne({
          _id: new ObjectId(eventId),
        });
      } catch (err) {
        // Invalid ObjectId format
        console.error("Invalid ObjectId:", err);
      }
    }

    if (!invitation) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Return the HTML content directly
    return new NextResponse(invitation.htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error serving event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

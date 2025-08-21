import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { verifyAuth, createAuthResponse } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await verifyAuth(request);
    if (!authUser) {
      return NextResponse.json(createAuthResponse(), { status: 401 });
    }

    const { db } = await connectToDatabase();
    const eventsCollection = db.collection("events");
    const registrationsCollection = db.collection("registrations");

    // Find all events for this user
    const invitations = await eventsCollection
      .find({ userId: new ObjectId(authUser.userId) })
      .sort({ createdAt: -1 })
      .toArray();

    // Get registration counts for each invitation
    const invitationsWithStats = await Promise.all(
      invitations.map(async (invitation) => {
        const registrationCount = await registrationsCollection.countDocuments({
          eventId: invitation.eventId, // Use custom eventId instead of _id
        });

        return {
          _id: invitation._id.toString(),
          eventId: invitation.eventId, // Include custom eventId in response
          title: invitation.title,
          eventType: invitation.eventType,
          date: invitation.date,
          language: invitation.language,
          style: invitation.style,
          createdAt: invitation.createdAt,
          registrations: registrationCount,
        };
      })
    );

    return NextResponse.json({
      invitations: invitationsWithStats,
    });
  } catch (error) {
    console.error("Fetch invitations history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

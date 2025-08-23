import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { verifyAuth, createAuthResponse } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authUser = await verifyAuth(request);
    if (!authUser) {
      return NextResponse.json(createAuthResponse(), { status: 401 });
    }

    const resolvedParams = await params;
    const invitationId = resolvedParams.id;

    if (!invitationId) {
      return NextResponse.json(
        { error: "Invitation ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const eventsCollection = db.collection("events");
    const registrationsCollection = db.collection("registrations");

    // Find the invitation by custom eventId and verify ownership
    const invitation = await eventsCollection.findOne({
      eventId: invitationId, // Use custom eventId instead of _id
      userId: new ObjectId(authUser.userId),
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Get all registrations for this invitation using custom eventId
    const registrations = await registrationsCollection
      .find({ eventId: invitationId }) // Use custom eventId instead of invitationId ObjectId
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate total attendees
    const totalAttendees = registrations.reduce((sum, reg) => {
      return sum + (reg.attendees || 1);
    }, 0);

    // Format registrations
    const formattedRegistrations = registrations.map((reg) => ({
      _id: reg._id.toString(),
      name: reg.name,
      email: reg.email,
      phone: reg.phone,
      attendees: reg.attendees || 1,
      message: reg.message,
      createdAt: reg.createdAt,
    }));

    return NextResponse.json({
      _id: invitation._id.toString(),
      eventId: invitation.eventId, // Return the custom eventId
      title: invitation.title,
      eventType: invitation.eventType,
      date: invitation.date,
      language: invitation.language,
      style: invitation.style,
      createdAt: invitation.createdAt,
      registrations: formattedRegistrations,
      views: invitation.analytics?.views || 0,
      totalAttendees,
      analytics: {
        registrations:
          invitation.analytics?.registrations || registrations.length,
        totalAttendees: invitation.analytics?.totalAttendees || totalAttendees,
        views: invitation.analytics?.views || 0,
      },
    });
  } catch (error) {
    console.error("Fetch invitation stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitation stats" },
      { status: 500 }
    );
  }
}

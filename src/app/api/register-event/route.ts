import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, phone, peopleCount, message, eventId } =
      await request.json();

    if (!fullName || !eventId) {
      return NextResponse.json(
        { error: "Full name and event ID are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const registrationsCollection = db.collection("registrations");

    // Create registration record
    const registration = {
      eventId: eventId, // Use custom eventId instead of ObjectId
      name: fullName,
      email: email || null,
      phone: phone || null,
      attendees: parseInt(peopleCount) || 1,
      message: message || null,
      registeredAt: new Date(),
    };

    const result = await registrationsCollection.insertOne(registration);

    // Update event analytics with proper counts
    const eventsCollection = db.collection("events");
    await eventsCollection.updateOne(
      { eventId: eventId }, // Use custom eventId instead of _id
      {
        $inc: {
          "analytics.registrations": 1, // Count of registered users
          "analytics.totalAttendees": parseInt(peopleCount) || 1, // Total people coming
        },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({
      success: true,
      registrationId: result.insertedId,
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}

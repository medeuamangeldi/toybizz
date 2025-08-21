import { connectToDatabase } from "@/lib/database";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";

interface InvitationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InvitationViewPage({
  params,
}: InvitationPageProps) {
  try {
    const { id } = await params;

    const { db } = await connectToDatabase();
    const eventsCollection = db.collection("events");

    // Try to find by eventId first, then by _id
    let invitation = await eventsCollection.findOne({ eventId: id });

    if (!invitation) {
      // If not found by eventId, try by ObjectId
      try {
        invitation = await eventsCollection.findOne({ _id: new ObjectId(id) });
      } catch (err) {
        // Invalid ObjectId format
        console.error("Invalid ObjectId:", err);
      }
    }

    if (!invitation) {
      notFound();
    }

    // Return the HTML content directly
    return (
      <div
        dangerouslySetInnerHTML={{ __html: invitation.htmlContent }}
        style={{ minHeight: "100vh" }}
      />
    );
  } catch (error) {
    console.error("Error loading invitation:", error);
    notFound();
  }
}

import { connectToDatabase } from "@/lib/database";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import { InvitationData } from "@/components/InvitationTemplate";
import ClientInvitationWrapper from "@/components/ClientInvitationWrapper";

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

    // Parse the JSON content from htmlContent field
    let invitationData: InvitationData;
    try {
      // If htmlContent is JSON, parse it
      if (invitation.htmlContent && invitation.htmlContent.startsWith("{")) {
        invitationData = JSON.parse(invitation.htmlContent);
      } else {
        // Fallback: create data from existing fields for backward compatibility
        invitationData = {
          title: invitation.title || invitation.name || "Приглашение",
          date: invitation.date || "Дата не указана",
          location: invitation.location || "Место не указано",
          description:
            invitation.description || "Присоединяйтесь к нашему празднику!",
          schedule: invitation.schedule || [],
          photos: invitation.photoUrls || [],
          rsvpText: "Подтвердить участие",
          eventId: invitation.eventId || id,
        };
      }
    } catch (error) {
      console.error("Error parsing invitation data:", error);
      // Fallback data
      invitationData = {
        title: invitation.title || "Приглашение",
        date: invitation.date || "Дата не указана",
        location: invitation.location || "Место не указано",
        description: "Присоединяйтесь к нашему празднику!",
        schedule: [],
        photos: [],
        rsvpText: "Подтвердить участие",
        eventId: invitation.eventId || id,
      };
    }

    const theme = invitation.theme || "elegant";

    // Return the template with the data
    return (
      <ClientInvitationWrapper
        data={invitationData}
        themeName={theme}
        ownerId={invitation.userId?.toString() || null}
      />
    );
  } catch (error) {
    console.error("Error loading invitation:", error);
    notFound();
  }
}

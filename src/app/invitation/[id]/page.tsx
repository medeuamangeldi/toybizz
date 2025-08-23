import { connectToDatabase } from "@/lib/database";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import { InvitationData } from "@/components/InvitationTemplate";
import ClientInvitationWrapper from "@/components/ClientInvitationWrapper";
import { getFileUrl } from "@/lib/url-utils";

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
        // Map photo IDs to URLs
        if (invitation.photoUrls && invitation.photoUrls.length > 0) {
          invitationData.photos = invitation.photoUrls.map((photoId: string) =>
            getFileUrl(photoId, "photos")
          );
        }
        // Handle melody URL
        if (invitation.melodyUrl) {
          invitationData.melody = invitation.melodyUrl.startsWith("/")
            ? invitation.melodyUrl
            : `/api/files/melodies/${invitation.melodyUrl}`;
        }
      } else {
        // Fallback: create data from existing fields for backward compatibility
        invitationData = {
          title: invitation.title || invitation.name || "Приглашение",
          type: invitation.eventType || invitation.type || "событие",
          date: invitation.date || "Дата не указана",
          time: invitation.time || "00:00",
          location: invitation.location || "Место не указано",
          theme: invitation.theme || "elegant",
          description:
            invitation.description || "Присоединяйтесь к нашему празднику!",
          schedule: invitation.schedule || [],
          photos:
            invitation.photoUrls?.map((photoId: string) =>
              getFileUrl(photoId, "photos")
            ) || [],
          melody: invitation.melodyUrl
            ? invitation.melodyUrl.startsWith("/")
              ? invitation.melodyUrl
              : `/api/files/melodies/${invitation.melodyUrl}`
            : undefined,
          rsvpText: "Подтвердить участие",
          eventId: invitation.eventId || id,
          eventType: invitation.eventType || invitation.type || "",
        };
      }
    } catch (error) {
      console.error("Error parsing invitation data:", error);
      // Fallback data
      invitationData = {
        title: invitation.title || "Приглашение",
        type: invitation.eventType || invitation.type || "событие",
        date: invitation.date || "Дата не указана",
        time: invitation.time || "00:00",
        location: invitation.location || "Место не указано",
        theme: invitation.theme || "elegant",
        description: "Присоединяйтесь к нашему празднику!",
        schedule: [],
        photos:
          invitation.photoUrls?.map((photoId: string) =>
            getFileUrl(photoId, "photos")
          ) || [],
        melody: invitation.melodyUrl
          ? invitation.melodyUrl.startsWith("/")
            ? invitation.melodyUrl
            : `/api/files/melodies/${invitation.melodyUrl}`
          : undefined,
        rsvpText: "Подтвердить участие",
        eventId: invitation.eventId || id,
        eventType: invitation.eventType || invitation.type || "",
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

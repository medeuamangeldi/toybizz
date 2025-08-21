import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";

interface InvitationPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  try {
    const { eventId } = await params;
    const invitationPath = path.join(
      process.cwd(),
      "public",
      "invitations",
      `${eventId}.html`
    );

    // Read the HTML file
    const htmlContent = await fs.readFile(invitationPath, "utf-8");

    // Return the HTML directly
    return (
      <div
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        style={{ minHeight: "100vh" }}
      />
    );
  } catch (error) {
    console.error("Error loading invitation:", error);
    notFound();
  }
}

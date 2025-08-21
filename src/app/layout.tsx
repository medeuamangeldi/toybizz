import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toybiz - Event Invitation Generator",
  description: "Create beautiful event invitations with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="next-app">{children}</body>
    </html>
  );
}

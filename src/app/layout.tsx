import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Toybiz - Генератор приглашений на события",
  description: "Создавайте красивые приглашения на события с помощью ИИ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="next-app">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function InvitationContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get("data");

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка</h1>
          <p className="text-gray-600">Данные приглашения не найдены</p>
        </div>
      </div>
    );
  }

  try {
    // Decode the base64 HTML content
    const decodedData = decodeURIComponent(data);
    const htmlContent = Buffer.from(decodedData, "base64").toString("utf-8");

    return (
      <div
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        style={{ minHeight: "100vh" }}
      />
    );
  } catch (error) {
    console.error("Error decoding invitation data:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка</h1>
          <p className="text-gray-600">Не удалось загрузить приглашение</p>
        </div>
      </div>
    );
  }
}

export default function InvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600">Загружаем приглашение...</p>
          </div>
        </div>
      }
    >
      <InvitationContent />
    </Suspense>
  );
}

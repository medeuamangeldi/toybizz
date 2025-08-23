"use client";

import {
  InvitationTemplate,
  InvitationData,
} from "@/components/InvitationTemplate";
import Link from "next/link";

export default function DemoPage() {
  const demoData: InvitationData = {
    title: "Свадьба Анны и Максима",
    date: "15 сентября 2024",
    location: 'Ресторан "Золотой лев", ул. Абая 10, Алматы',
    description:
      "Дорогие друзья! Приглашаем вас разделить с нами радость нашего особенного дня. Ваше присутствие сделает этот момент еще более значимым для нас.",
    schedule: [
      { time: "16:00", event: "Регистрация гостей и welcome-коктейль" },
      { time: "17:00", event: "Торжественная церемония" },
      { time: "18:00", event: "Фотосессия и поздравления" },
      { time: "19:00", event: "Праздничный ужин" },
      { time: "21:00", event: "Первый танец молодоженов" },
      { time: "22:00", event: "Танцы до утра" },
    ],
    photos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",
    ],
    rsvpText: "Подтвердить участие",
    eventId: "demo-wedding-123",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back link */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Вернуться на главную
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Пример приглашения
            </h1>
            <p className="text-sm text-gray-500">Тема: Элегантная</p>
          </div>
          <Link
            href="/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Создать своё
          </Link>
        </div>
      </div>

      {/* Demo invitation */}
      <div className="py-8">
        <InvitationTemplate
          data={demoData}
          themeName="elegant"
          isOwner={true}
        />
      </div>

      {/* Call to action */}
      <div className="bg-white border-t py-8">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Готовы создать своё приглашение?
          </h2>
          <p className="text-gray-600 mb-6">
            Начните бесплатно и создайте до 3 приглашений без ограничений
          </p>
          <div className="space-x-4">
            <Link
              href="/register"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Зарегистрироваться
            </Link>
            <Link
              href="/create"
              className="inline-block border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              Создать приглашение
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  InvitationTemplate,
  InvitationData,
} from "@/components/InvitationTemplate";
import Link from "next/link";

export default function DemoPage() {
  // Enhanced demo data showcasing all new engagement features:
  // - Real-time countdown timer with proper Russian pluralization
  // - Interactive location with Google Maps integration
  // - Music player with audio controls
  // - Extended photo gallery with hover effects
  // - QR code and social sharing capabilities
  // - Contact information and dress code details
  // - Special instructions with emojis and formatting
  // - Complete gift registry (loaded via API with demo data)
  const demoData: InvitationData = {
    _id: "demo-wedding-123",
    title: "Свадьба Анны и Максима",
    type: "свадьба",
    eventType: "свадьба",
    date: "2024-12-15", // Future date for countdown
    time: "16:00",
    location: 'Ресторан "Золотой лев", ул. Абая 150, Алматы 050000',
    description:
      "Дорогие друзья! Приглашаем вас разделить с нами радость нашего особенного дня. Ваше присутствие сделает этот момент еще более значимым для нас. Мы с нетерпением ждем встречи с каждым из вас в этот волшебный день!",
    theme: "elegant",
    hosts: "Анна Петрова и Максим Иванов",
    schedule: [
      { time: "15:30", activity: "Прибытие гостей и регистрация" },
      { time: "16:00", activity: "Welcome-коктейль и знакомство" },
      { time: "17:00", activity: "Торжественная церемония бракосочетания" },
      { time: "17:30", activity: "Поздравления и фотосессия с молодоженами" },
      { time: "18:30", activity: "Коктейльный час с живой музыкой" },
      { time: "19:30", activity: "Праздничный ужин и тосты" },
      { time: "21:00", activity: "Первый танец и торт" },
      { time: "21:30", activity: "Танцы до утра с диджеем" },
      { time: "23:00", activity: "Midnight surprise и фейерверк" },
    ],
    photos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&q=80",
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    ],
    rsvpRequired: true,
    rsvpText: "Подтвердить участие до 1 декабря",
    eventId: "demo-wedding-123",
    melody:
      "https://file-examples.com/storage/fe68c3bb7bb4c043ccf22d8/2017/11/file_example_MP3_700KB.mp3", // Demo melody URL - working MP3
    contactInfo: {
      organizer: "Анна Петрова",
      phone: "+7 (777) 123-45-67",
      email: "anna.maksim.wedding@gmail.com",
    },
    dressCode:
      "Элегантный стиль: коктейльные платья для дам, костюмы для мужчин. Желательно избегать белого, кремового и айвори цветов.",
    specialInstructions:
      "🌟 Церемония будет проходить на открытом воздухе в красивом саду ресторана. В случае дождя мероприятие переносится в банкетный зал.\n\n🚗 Бесплатная парковка доступна для гостей.\n\n📸 Будет работать профессиональный фотограф, но мы также приветствуем ваши фотографии с хештегом #АнаМаксим2024\n\n🎁 Вместо подарков мы будем рады вашему присутствию, но если вы хотите что-то подарить, посмотрите наш список пожеланий ниже.",
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
              Пример приглашения - Полная версия
            </h1>
            <p className="text-sm text-gray-500">
              Все возможности: счетчик времени, музыка, галерея, подарки
            </p>
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
      <div className="bg-white border-t py-12">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Впечатлены возможностями?
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Этот пример показывает все функции: живой счетчик времени,
            интерактивные карты, музыкальное сопровождение, галереи фотографий,
            реестр подарков и многое другое!
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-3xl mb-2">⏰</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Живой счетчик
              </h3>
              <p className="text-sm text-gray-600">
                Обратный отсчет до вашего события
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="text-3xl mb-2">🎵</div>
              <h3 className="font-semibold text-gray-900 mb-2">Музыка</h3>
              <p className="text-sm text-gray-600">Добавьте особую мелодию</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="text-3xl mb-2">🎁</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Реестр подарков
              </h3>
              <p className="text-sm text-gray-600">
                Управляйте списком пожеланий
              </p>
            </div>
            <div className="bg-rose-50 p-6 rounded-lg">
              <div className="text-3xl mb-2">🗺️</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Интерактивные карты
              </h3>
              <p className="text-sm text-gray-600">
                Легкий поиск места проведения
              </p>
            </div>
            <div className="bg-amber-50 p-6 rounded-lg">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-semibold text-gray-900 mb-2">Легкий обмен</h3>
              <p className="text-sm text-gray-600">QR-коды и кнопки соцсетей</p>
            </div>
            <div className="bg-cyan-50 p-6 rounded-lg">
              <div className="text-3xl mb-2">📸</div>
              <h3 className="font-semibold text-gray-900 mb-2">Галерея</h3>
              <p className="text-sm text-gray-600">Красивые фото с эффектами</p>
            </div>
          </div>

          <p className="text-gray-600 mb-8 text-lg">
            Создайте до{" "}
            <span className="font-bold text-blue-600">
              3 приглашений бесплатно
            </span>{" "}
            и откройте все функции!
          </p>

          <div className="space-x-4">
            <Link
              href="/register"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Начать бесплатно
            </Link>
            <Link
              href="/create"
              className="inline-block border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg"
            >
              Создать приглашение
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
